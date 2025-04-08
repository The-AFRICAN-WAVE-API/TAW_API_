import franc from "franc";

/**
 * Detects the language of the provided text using the franc library.
 * Supports English (en), French (fr), German (de), and Spanish (es).
 *
 * @param {string} text - The text to analyze for language detection
 * @return {string} The ISO 639-1 language code ('en', 'fr', 'de', 'es').
 *                   Returns 'en' as default if:
 *                   - Input is invalid/empty
 *                   - Language detection fails
 *                   - Detected language is not supported
 * @throws {Error} Logs error to console if language detection fails
 *
 * @example
 * detectLanguage('Hello world'); // returns 'en'
 * detectLanguage('Bonjour le monde'); // returns 'fr'
 */
function detectLanguage(text) {
  if (!text || typeof text !== "string") {
    return "en";
  }

  const supportedLanguages = {
    "eng": "en",
    "fra": "fr",
    "deu": "de",
    "spa": "es",
  };

  try {
    const detected = franc(text);
    return supportedLanguages[detected] || "en";
  } catch (error) {
    console.error("Language detection error:", error);
    return "en";
  }
}

module.exports = {
  detectLanguage,
};
