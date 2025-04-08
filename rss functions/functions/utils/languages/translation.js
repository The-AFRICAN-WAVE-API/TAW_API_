import { detectLanguage } from "./detectLanguage";
import { TranslationProvider } from "./translationProvider";

/**
 * Translates an article object's title and content to a target language.
 *
 * @async
 * @param {Object} article - The article object to translate
 * @param {string} [article.title] - The title of the article
 * @param {string} [article.content] - The main content of the article
 * @param {string} [article.description] - Fallback content if main content is missing
 * @param {string} [article.contentSnippet] - Alternative content if description is missing
 * @param {string} [targetLanguage="en"] - The ISO language code to translate to
 * @return {Promise<Object>} The translated article object with updated title, content and language
 * @throws {Error} Throws any errors that occur during translation or parsing
 *
 * @example
 * const article = {
 *   title: "Bonjour le monde",
 *   content: "C'est un exemple"
 * };
 * const translatedArticle = await translateArticle(article, "en");
 */
async function translateArticle(article, targetLanguage = "en") {
  // Ensure we have valid string content to analyze
  const textToAnalyze = (article.content || article.title || "").toString();

  if (!textToAnalyze) {
    console.warn("No content to analyze for language detection");
    return article;
  }

  // Use detectLanguage function to determine source language
  const sourceLanguage = await detectLanguage(textToAnalyze);

  // Skip translation if already in target language
  if (sourceLanguage === targetLanguage) {
    return {...article, language: targetLanguage};
  }

  const combinedText = JSON.stringify({
    title: article.title || "",
    content: article.content || article.description || article.contentSnippet,
  });

  try {
    const translatedJSON = await TranslationProvider.translate(combinedText, targetLanguage);

    const {title, content} = JSON.parse(translatedJSON);
    return {
      ...article,
      title,
      content,
      language: targetLanguage,
    };
  } catch (parseError) {
    console.error("Failed to parse translation JSON:", parseError);
    return article;
  }
}

export default {
  translateArticle,
};
