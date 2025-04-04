const admin = require("firebase-admin");
const db = admin.firestore();
const queueTranslation = require("../utils/languages/translationQueue").queueTranslation;


const DEFAULT_LIMIT = 10;
/**
 * Translates RSS articles from the database into French.
 * @param {number} [LIMIT=DEFAULT_LIMIT] - Maximum number of articles to retrieve and translate.
 * @returns {Promise<Array<Object>|{message: string, count: number}>} Array of translated articles or error message object.
 * @throws {Error} When translation fails.
 * 
 * @example
 * // Translate 10 articles
 * const frenchArticles = await translateArticleInFrench(10);
 * 
 * // Each article in the returned array contains:
 * // {
 * //   id: string,
 * //   translatedContent: Object,
 * //   ...originalArticleData
 * // }
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
 * Translates RSS articles from the database into Spanish.
 * @param {number} [LIMIT=DEFAULT_LIMIT] - Maximum number of articles to retrieve and translate.
 * @returns {Promise<Array<Object>|{message: string, count: number}>} Array of translated articles or error message object.
 * @throws {Error} When translation fails.
 * 
 * @example
 * // Translate 10 articles
 * const spanishArticles = await translateArticleInSpanish(10);
 * 
 * // Each article in the returned array contains:
 * // {
 * //   id: string,
 * //   translatedContent: Object,
 * //   ...originalArticleData
 * // }
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
 * Translates RSS articles from the database into German.
 * @param {number} [LIMIT=DEFAULT_LIMIT] - Maximum number of articles to retrieve and translate.
 * @returns {Promise<Array<Object>|{message: string, count: number}>} Array of translated articles or error message object.
 * @throws {Error} When translation fails.
 * 
 * @example
 * // Translate 10 articles
 * const germanArticles = await translateArticleInGerman(10);
 * 
 * // Each article in the returned array contains:
 * // {
 * //   id: string,
 * //   translatedContent: Object,
 * //   ...originalArticleData
 * // }
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

module.exports = {
  translateArticleInFrench,
  translateArticleInSpanish,
  translateArticleInGerman,
};
