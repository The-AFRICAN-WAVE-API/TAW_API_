// services/socialService.js
const fetch = require("node-fetch");
const {categorizeArticleRuleBased, analyzeSentiment, analyzeEntities} = require("../utils/analysis");
const {getUniqueKey} = require("../utils/helpers");
const detectLanguage = require("../utils/languages/languageDetection");
const admin = require("../config/firebase");
const db = admin.firestore();
const config = require("../config/config");

/**
 * Fetches popular social media posts (Twitter example),
 * excludes retweets, requests media expansions, and extracts image URLs.
 * @return {Promise<Object[]>} Array of social media post objects.
 */
async function fetchPopularSocialPosts() {
  const celebrityUsernames = [
    "elonmusk",
    "barackobama",
    "kimkardashian",
    "cristiano",
    "beyonce",
  ];

  // For each celebrity, fetch tweets separately
  const tweetsByUser = await Promise.all(
      celebrityUsernames.map(async (username) => {
        const url = `https://api.twitter.com/2/tweets/search/recent?query=from:${username} -is:retweet&tweet.fields=public_metrics,entities,attachments&expansions=attachments.media_keys&media.fields=url`;
        const options = {
          headers: {
            "Authorization": `Bearer ${config.TWITTER_BEARER_TOKEN}`,
          },
        };

        try {
          const response = await fetch(url, options);
          const data = await response.json();
          console.log(`Twitter API response for ${username}:`, data);

          // Check if usage cap is exceeded for this user
          if (data.title === "UsageCapExceeded") {
            console.error(`Usage cap exceeded for ${username}`);
            return [];
          }

          // Build a media map for tweets with media
          const mediaMap = {};
          if (data.includes && data.includes.media) {
            for (const media of data.includes.media) {
              mediaMap[media.media_key] = media.url;
            }
          }

          if (data && Array.isArray(data.data)) {
            const tweets = data.data
                .map((tweet) => {
                  if (tweet.attachments && tweet.attachments.media_keys && tweet.attachments.media_keys.length > 0) {
                    tweet.imageUrl = mediaMap[tweet.attachments.media_keys[0]] || null;
                  } else {
                    tweet.imageUrl = null;
                  }
                  return tweet;
                })
                .filter((tweet) => {
                  const metrics = tweet.public_metrics || {};
                  const popularByRetweets = metrics.retweet_count && metrics.retweet_count > 5;
                  const popularByLikes = metrics.like_count && metrics.like_count > 50;
                  const hasEntities = tweet.entities && Object.keys(tweet.entities).length > 0;
                  return popularByRetweets || popularByLikes || hasEntities;
                });
            return tweets;
          } else {
            console.error(`Unexpected response format for ${username}:`, data);
            return [];
          }
        } catch (err) {
          console.error(`Error fetching tweets for ${username}:`, err.message);
          return [];
        }
      }),
  );

  // Flatten the results from each user into a single array
  const aggregatedTweets = tweetsByUser.flat();
  console.log("Total aggregated tweets:", aggregatedTweets.length);
  return aggregatedTweets;
}


/**
 * Processes and stores fetched social posts in Firestore.
 * @return {Promise<Object>} Result with message and count.
 */
async function processAndStoreSocialPosts() {
  const posts = await fetchPopularSocialPosts();
  console.log("Number of social posts to ingest:", posts.length);
  let batch = db.batch();
  const MAX_BATCH_SIZE = 500;
  let operationCount = 0;
  for (const post of posts) {
    const contentForAnalysis = post.text || "";
    const category = categorizeArticleRuleBased(contentForAnalysis);
    const sentiment = analyzeSentiment(contentForAnalysis);
    let entities = {};
    try {
      entities = await analyzeEntities(contentForAnalysis);
    } catch (e) {
      console.error("Entity analysis failed for social post:", e);
    }
    let geoLocation = null;
    if (post.geo && post.geo.coordinates) {
      geoLocation = {
        lat: post.geo.coordinates.latitude,
        lng: post.geo.coordinates.longitude,
      };
    } else if (entities.places && entities.places.length > 0) {
      geoLocation = entities.places[0];
    }

    // Detect the original language of the the tweet
    const sourceLanguage = detectLanguage(contentForAnalysis);

    const uniqueKey = getUniqueKey(post.id, post.text);
    console.log("Generated unique key for post:", uniqueKey);
    const docData = {
      title: "",
      link: `https://twitter.com/i/web/status/${post.id}`,
      pubDate: new Date().toISOString(),
      source: "Twitter",
      category,
      sentiment,
      entities,
      location: geoLocation,
      description: contentForAnalysis,
      language: sourceLanguage,
      imageUrl: post.imageUrl,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      publicMetrics: post.public_metrics,
    };
    const docRef = db.collection("social_posts").doc(uniqueKey);
    batch.set(docRef, docData, {merge: true});
    operationCount++;
    if (operationCount >= MAX_BATCH_SIZE) {
      await batch.commit();
      console.log("Committed a batch of social posts, count:", operationCount);
      batch = db.batch();
      operationCount = 0;
    }
  }
  if (operationCount > 0) {
    await batch.commit();
    console.log("Final batch commit executed for social posts, remaining count:", operationCount);
  }
  return {message: "Social media posts ingested successfully", count: posts.length};
}

module.exports = {fetchPopularSocialPosts, processAndStoreSocialPosts};
