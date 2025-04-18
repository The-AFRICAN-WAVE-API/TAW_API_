import { rewriteArticle } from './rewrite.js';
import PQueue from 'p-queue';

const queue = new PQueue({
  concurrency: 2, // Number of concurrent rewrites
  interval: 1000, // Time in ms
  intervalCap: 2, // Number of rewrites per interval
});

// Add event listeners for queue monitoring
queue.on('active', () => {
  console.log(`Working on rewriting. Queue size: ${queue.size}`);
});

queue.on('error', (error) => {
  console.error('Queue error:', error);
});

const COOLDOWN_PERIOD = 60000; // 1 minute
let lastRateLimitHit = 0;
const MAX_RETRIES = 3; // Maximum number of retries for rate-limited requests
const RETRY_DELAY = 2000; // Initial delay in ms

export async function queueRewriting(article, targetLanguage) {
  return queue.add(async () => {
    let retries = 0;

    while (retries < MAX_RETRIES) {
      try {
        // Check cooldown period
        if (Date.now() - lastRateLimitHit < COOLDOWN_PERIOD) {
          const waitTime = COOLDOWN_PERIOD - (Date.now() - lastRateLimitHit);
          console.warn(`Rate limit cooldown active. Waiting ${waitTime}ms...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }

        const result = await rewriteArticle(article, targetLanguage);
        if (!result) {
          throw new Error('Rewriting returned null result');
        }
        return result;

      } catch (error) {
        retries++;
        
        // Handle different error types
        switch (error.status) {
        case 429: // Rate limit
          lastRateLimitHit = Date.now();
          console.warn(`Rate limit hit (attempt ${retries}/${MAX_RETRIES}). Waiting...`);
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * retries));
          break;
            
        case 401:
        case 403:
          console.error('Authorization error:', error.message);
          return { error: 'AUTH_ERROR', message: error.message };
            
        case 404:
          console.error('Article not found:', error.message);
          return { error: 'NOT_FOUND', message: error.message };
            
        default:
          console.error('Rewriting error:', {
            status: error.status,
            message: error.message,
            attempt: retries,
            article: article.id
          });
            
          // Only retry on potentially temporary errors
          if (!isTemporaryError(error)) {
            return { error: 'PERMANENT_ERROR', message: error.message };
          }
        }

        // If we've exhausted retries
        if (retries === MAX_RETRIES) {
          console.error(`Failed after ${MAX_RETRIES} attempts:`, error);
          return { error: 'MAX_RETRIES_EXCEEDED', message: error.message };
        }
      }
    }
  });
}

function isTemporaryError(error) {
  return error.status === 429 || // Rate limit
         error.status === 500 || // Server error
         error.status === 503 || // Service unavailable
         error.message.includes('timeout') ||
         error.message.includes('network');
}