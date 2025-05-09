// services/rssService.js
import { throttleRequests } from "../utils/throttle.js";
import feedUrls from "../feedUrls.js";
import {
  analyzeSentiment,
  analyzeEntities,
  categorizeArticleML,
} from "../utils/analysis.js";
import { getUniqueKey } from "../utils/helpers.js";
import admin from "../configuration/firebase.js";
import { detectLanguage } from "../utils/languages/languageDetection.js";
import chromium from "chrome-aws-lambda";
import puppeteer from "puppeteer-core";
const db = admin.firestore();

// Cache for storing browser instance
let browserInstance = null;

/**
 * Gets or creates a browser instance
 * @return {Promise<Browser>} Puppeteer browser instance
 */
async function getBrowser() {
  if (browserInstance) {
    return browserInstance;
  }

  browserInstance = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath,
    headless: chromium.headless,
    ignoreHTTPSErrors: true,
  });

  return browserInstance;
}

/**
 * Attempts to extract an image URL from a webpage using Puppeteer
 * @param {string} url - The webpage URL to scrape
 * @return {Promise<string|null>} - Image URL or null
 */
async function scrapeImageWithPuppeteer(url) {
  const browser = await getBrowser();
  let page;
  try {
    page = await browser.newPage();
    await page.setDefaultNavigationTimeout(30000); // Increased timeout

    // Enable console logging from the page
    page.on("console", (msg) => console.log("PAGE LOG:", msg.text()));

    // Go to the page
    await page.goto(url, {
      waitUntil: ["networkidle0", "domcontentloaded"],
      timeout: 30000,
    });

    // Wait a bit for dynamic content
    await page.waitForTimeout(2000);

    // Try multiple strategies to find the main image
    const image = await page.evaluate(() => {
      console.log("Starting image search...");

      // Strategy 1: Look for Open Graph image
      const ogImage = document.querySelector('meta[property="og:image"]');
      if (ogImage?.content) {
        console.log("Found OG image:", ogImage.content);
        return ogImage.content;
      }

      // Strategy 2: Look for Twitter image
      const twitterImage = document.querySelector('meta[name="twitter:image"]');
      if (twitterImage?.content) {
        console.log("Found Twitter image:", twitterImage.content);
        return twitterImage.content;
      }

      // Strategy 3: Look for article's main image with broader selectors
      const articleImage = document.querySelector(
        "article img, .article-content img, .post-content img, .entry-content img, main img, .content img"
      );
      if (articleImage?.src) {
        console.log("Found article image:", articleImage.src);
        return articleImage.src;
      }

      // Strategy 4: Look for any large images
      const images = Array.from(document.getElementsByTagName("img"));
      console.log("Found", images.length, "total images");

      const largeImages = images.filter((img) => {
        if (!img.src) return false;
        // Check natural dimensions first
        if (img.naturalWidth >= 300 && img.naturalHeight >= 200) return true;
        // Fallback to getBoundingClientRect
        const rect = img.getBoundingClientRect();
        return rect.width >= 300 && rect.height >= 200;
      });

      console.log("Found", largeImages.length, "large images");
      if (largeImages[0]?.src) {
        console.log("Selected large image:", largeImages[0].src);
        return largeImages[0].src;
      }

      // Strategy 5: Look for images in JSON-LD
      const jsonLd = document.querySelector(
        'script[type="application/ld+json"]'
      );
      if (jsonLd) {
        try {
          const data = JSON.parse(jsonLd.textContent);
          const image = data.image || data.thumbnailUrl;
          if (image) {
            console.log("Found JSON-LD image:", image);
            return image;
          }
        } catch (e) {
          console.log("Error parsing JSON-LD:", e);
        }
      }

      console.log("No suitable images found");
      return null;
    });

    if (!image) {
      console.log(`No image found for URL: ${url}`);
    }
    return image;
  } catch (error) {
    console.error(`Error scraping image from ${url}:`, error);
    return null;
  } finally {
    if (page) await page.close();
  }
}

// Add cleanup function to be called when the Firebase Function instance is recycled
export async function cleanup() {
  if (browserInstance) {
    try {
      await browserInstance.close();
    } catch (error) {
      console.error("Error closing browser instance:", error);
    }
    browserInstance = null;
  }
}

/**
 * Attempts to extract an image URL from an RSS item using multiple strategies.
 * @param {Object} item - RSS item
 * @return {Promise<string|null>} - Image URL or null
 */
async function extractImageUrl(item) {
  // Try RSS enclosure first
  if (item.enclosure?.url) return item.enclosure.url;

  // Try content image tags
  const imgMatch = item.content?.match(/<img[^>]+src=['"]([^'">]+)['"]/i);
  if (imgMatch?.[1]) return imgMatch[1];

  // Try media:content
  if (item["media:content"]?.["$"]?.url) return item["media:content"]["$"].url;

  // If no image found and we have a link, try scraping the page
  if (item.link) {
    try {
      const scrapedImage = await scrapeImageWithPuppeteer(item.link);
      if (scrapedImage) return scrapedImage;
    } catch (error) {
      console.error(`Failed to scrape image from ${item.link}:`, error);
    }
  }

  return null;
}

/**
 * Processes RSS feeds: fetches feeds, processes items, and stores them in Firestore.
 * Duplicate checking is handled by using a unique key (generated by getUniqueKey) as the document ID.
 * Firestore's upsert behavior (using {merge: true}) ensures that if a document already exists,
 * it will be updated rather than creating a duplicate.
 * @return {Promise<Object>} Result message and count.
 */
export async function fetchAndStoreRssFeeds() {
  const feeds = await throttleRequests(feedUrls);
  let batch = db.batch();
  const MAX_BATCH_SIZE = 500;
  let operationCount = 0;

  for (const feed of feeds) {
    if (!feed || !feed.items) continue;
    const processedItems = await Promise.all(
      feed.items.map(async (item) => {
        const contentForAnalysis =
          item["content:encoded"] ||
          item.content ||
          item.description ||
          item.contentSnippet ||
          "";
        const categoryML = categorizeArticleML(contentForAnalysis);

        const sentiment = analyzeSentiment(contentForAnalysis);
        let entities = {};
        try {
          entities = await analyzeEntities(contentForAnalysis);
        } catch (e) {
          console.error("Entity analysis failed for article:", item.title, e);
        }
        let geoLocation = null;
        if (item["geo:lat"] && item["geo:long"]) {
          geoLocation = {
            lat: parseFloat(item["geo:lat"]),
            lng: parseFloat(item["geo:long"]),
          };
        } else if (entities.places && entities.places.length > 0) {
          geoLocation = entities.places[0];
        }

        const imageUrl = await extractImageUrl(item); // <-- updated image logic here
        // Language detection and translation (if needed)
        const detectedLanguage = detectLanguage(contentForAnalysis);
        // Duplicate checking: using the unique key as the Firestore doc ID prevents duplicate entries.
        const uniqueKey = getUniqueKey(item.title, item.link);
        return {
          uniqueKey,
          data: {
            title: item.title,
            link: item.link,
            pubDate: item.pubDate || null,
            source: feed.title,
            categoryML,
            sentiment,
            entities,
            location: geoLocation,
            description: contentForAnalysis,
            language: detectedLanguage,
            imageUrl,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
          },
        };
      })
    );
    for (const { uniqueKey, data } of processedItems) {
      const collectionRef = db
        .collection("rss_articles")
        .doc(data.category)
        .collection("articles");
      const docRef = collectionRef.doc(uniqueKey);

      // Upsert operation: If a document with uniqueKey already exists, this will update it (preventing duplicates)
      batch.set(docRef, data, { merge: true });
      operationCount++;
      if (operationCount >= MAX_BATCH_SIZE) {
        await batch.commit();
        console.log(
          "Committed a batch of RSS articles, count:",
          operationCount
        );
        batch = db.batch();
        operationCount = 0;
      }
    }
  }
  if (operationCount > 0) {
    await batch.commit();
    console.log(
      "Final batch commit executed for RSS articles, remaining count:",
      operationCount
    );
  }
  return { message: "RSS feeds stored successfully", count: feeds.length };
}
