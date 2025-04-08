import PQueue from "p-queue";
import { translateArticle } from "./translation";

const queue = new PQueue({
  concurrency: 2, // Number of concurrent translations
  interval: 1000, // Time in ms
  intervalCap: 2, // Number of translations per interval
});

// Add event listeners for queue monitoring
queue.on("active", () => {
  console.log(`Working on translation. Queue size: ${queue.size}`);
});

queue.on("error", (error) => {
  console.error("Queue error:", error);
});

const COOLDOWN_PERIOD = 60000; // 1 minute
let lastRateLimitHit = 0;

/**
 * Queues an article for translation while handling rate limiting
 * @param {Object} article - The article object to be translated
 * @param {string} targetLanguage - The target language code for translation
 * @return {Promise<Object|null>} Translated article object or null if rate limited/error occurs
 * @throws {Error} Translation service errors are caught and handled internally
 * @async
 */
async function queueTranslation(article, targetLanguage) {
  return queue.add(async () => {
    try {
      if (Date.now() - lastRateLimitHit < COOLDOWN_PERIOD) {
        console.warn("Rate limit hit. Waiting for cooldown...");
        return null;
      }

      return await translateArticle(article, targetLanguage);
    } catch (error) {
      if (error.status === 429) {
        console.warn("Rate limit hit. Waiting for cooldown...");
        lastRateLimitHit = Date.now();
        return null;
      }
      console.error("Translation error:", error);
      return null;
    }
  });
}

export default {queueTranslation};
