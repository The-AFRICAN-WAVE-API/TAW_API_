const admin = require("firebase-admin");
const db = admin.firestore();
const queueTranslation = require("../utils/languages/translationQueue").queueTranslation;

const DEFAULT_LIMIT = 10;

/**
 * Translates articles in French.
 *
 * @param {number} [LIMIT=DEFAULT_LIMIT] - The number of articles to translate.
 * @return {Promise<Array>} A promise that resolves to an array of translated articles.
 */
async function translateArticleInFrench(LIMIT = DEFAULT_LIMIT) {
  try {
    const snapshot = await db.collection("rss_articles").limit(LIMIT).get();
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
 * Translates articles in Spanish.
 *
 * @param {number} [LIMIT=DEFAULT_LIMIT] - The number of articles to translate.
 * @return {Promise<Array>} A promise that resolves to an array of translated articles.
 */
async function translateArticleInSpanish(LIMIT = DEFAULT_LIMIT) {
  try {
    const snapshot = await db.collection("rss_articles").limit(LIMIT).get();
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
 * Translates articles in German.
 *
 * @param {number} [LIMIT=DEFAULT_LIMIT] - The number of articles to translate.
 * @return {Promise<Array>} A promise that resolves to an array of translated articles.
 */
async function translateArticleInGerman(LIMIT = DEFAULT_LIMIT) {
  try {
    const snapshot = await db.collection("rss_articles").limit(LIMIT).get();
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
