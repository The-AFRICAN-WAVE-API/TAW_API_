// utils/throttle.js
import Parser from 'rss-parser';
const parser = new Parser();
import { config } from '../configuration/config.js';

// In-memory cache for feeds
const feedCache = {};

/**
 * Fetches an RSS feed from the given URL with retry attempts,
 * exponential backoff, and caching.
 * @param {string} url - The RSS feed URL.
 * @param {number} [retries=3] - Number of retry attempts.
 * @param {number} [initialDelay=1000] - Initial delay in ms.
 * @param {number} requestTimeout - Request timeout in ms (default 10000).
 * @return {Promise<Object|null>} Parsed feed or null if failed.
 */
async function fetchFeedWithRetry(url, retries = 3, initialDelay = 1000, requestTimeout = 10000) {
  // Check cache
  const cached = feedCache[url];
  if (cached && (Date.now() - cached.timestamp) < config.CACHE_TTL) {
    console.log(`Cache hit for ${url}`);
    return cached.feed;
  }

  let delay = initialDelay;
  for (let i = 0; i < retries; i++) {
    try {
      const feed = await Promise.race([
        parser.parseURL(url),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error(`Request timed out after ${requestTimeout} ms for ${url}`)), requestTimeout),
        ),
      ]);
      feedCache[url] = { feed, timestamp: Date.now() };
      return feed;
    } catch (err) {
      console.error(`Attempt ${i + 1} for ${url} failed: ${err.message}`);
      if (i === retries - 1) {
        console.error(`Failed to fetch ${url} after ${retries} attempts`);
        return null;
      }
      await new Promise((resolve) => setTimeout(resolve, delay));
      delay *= 2;
    }
  }
}

/**
 * Throttles multiple RSS feed requests concurrently.
 * @param {string[]} urls - Array of RSS feed URLs.
 * @param {number} [concurrency=10] - Maximum concurrent requests.
 * @return {Promise<Object[]>} Array of parsed feeds.
 */
async function throttleRequests(urls, concurrency = 10) {
  const results = [];
  const executing = new Set();
  for (const url of urls) {
    const promise = fetchFeedWithRetry(url)
      .then((result) => {
        executing.delete(promise);
        return result;
      })
      .catch((err) => {
        console.error(`Error fetching ${url}:`, err.message);
        executing.delete(promise);
        return null;
      });
    executing.add(promise);
    results.push(promise);
    if (executing.size >= concurrency) await Promise.race(executing);
  }
  return (await Promise.all(results)).filter(Boolean);
}

export { fetchFeedWithRetry, throttleRequests };
