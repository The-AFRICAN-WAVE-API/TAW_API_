import { firestore } from "firebase-admin";
const db = firestore();
import { queueTranslation } from "../utils/languages/translationQueue";

const DEFAULT_LIMIT = 10;


/**
 * Translates articles from the database into French
 * @param {number} [LIMIT=DEFAULT_LIMIT] - Maximum number of articles to retrieve and translate
 * @returns {Promise<Array<Object>|{message: string, count: number}>} Array of translated articles or error message object
 * @throws {Error} When translation fails
 * 
 * @example
 * try {
 *   const translatedArticles = await translateArticleInFrench(10);
 *   console.log(translatedArticles);
 * } catch (error) {
 *   console.error(error);
 * }
 */
async function translateArticleInFrench(LIMIT=DEFAULT_LIMIT) {
  try {
    const snapshot = await db.collection("rss_articles").get(LIMIT);
    if (snapshot.empty) {
      console.log("No articles found.");
      return {message: "No articles found.", count: 0};
    }
    const articles = snapshot.docs.map((doc) => ({id: doc.id, ...doc.data()}));
    const translatedArticles = await Promise.all(
        articles.map(async (article) => {
          const translatedContent = await queueTranslation(article, "fr");
          return {...article, translatedContent};
        }),
    );
    return translatedArticles;
  } catch (error) {
    console.error("Error translating articles:", error);
    throw new Error("Failed to translate articles.");
  }
}

/**
 * Translates articles from the database into Spanish
 * @param {number} [LIMIT=DEFAULT_LIMIT] - Maximum number of articles to retrieve and translate
 * @returns {Promise<Array<Object>|{message: string, count: number}>} Array of translated articles or error message object
 * @throws {Error} When translation fails
 * 
 * @example
 * try {
 *   const translatedArticles = await translateArticleInSpanish(10);
 *   console.log(translatedArticles);
 * } catch (error) {
 *   console.error(error);
 * }
 */
async function translateArticleInSpanish(LIMIT=DEFAULT_LIMIT) {
  try {
    const snapshot = await db.collection("rss_articles").get(LIMIT);
    if (snapshot.empty) {
      console.log("No articles found.");
      return {message: "No articles found.", count: 0};
    }
    const articles = snapshot.docs.map((doc) => ({id: doc.id, ...doc.data()}));
    const translatedArticles = await Promise.all(
        articles.map(async (article) => {
          const translatedContent = await queueTranslation(article, "es");
          return {...article, translatedContent};
        }),
    );
    return translatedArticles;
  } catch (error) {
    console.error("Error translating articles:", error);
    throw new Error("Failed to translate articles.");
  }
}


/**
 * Translates articles from the database into German
 * @param {number} [LIMIT=DEFAULT_LIMIT] - Maximum number of articles to retrieve and translate
 * @returns {Promise<Array<Object>|{message: string, count: number}>} Array of translated articles or error message object
 * @throws {Error} When translation fails
 * 
 * @example
 * try {
 *   const translatedArticles = await translateArticleInGerman(10);
 *   console.log(translatedArticles);
 * } catch (error) {
 *   console.error(error);
 * }
 */
async function translateArticleInGerman(LIMIT=DEFAULT_LIMIT) {
  try {
    const snapshot = await db.collection("rss_articles").get(LIMIT);
    if (snapshot.empty) {
      console.log("No articles found.");
      return {message: "No articles found.", count: 0};
    }
    const articles = snapshot.docs.map((doc) => ({id: doc.id, ...doc.data()}));
    const translatedArticles = await Promise.all(
        articles.map(async (article) => {
          const translatedContent = await queueTranslation(article, "de");
          return {...article, translatedContent};
        }),
    );
    return translatedArticles;
  } catch (error) {
    console.error("Error translating articles:", error);
    throw new Error("Failed to translate articles.");
  }
}

export default {
  translateArticleInFrench,
  translateArticleInSpanish,
  translateArticleInGerman,
};
