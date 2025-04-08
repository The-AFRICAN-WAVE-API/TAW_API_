import { translate as geminiTranslate } from './translators/gemini-translator.js';
import i18next from './translators/i18n.js';

/**
 * A utility class for handling text translations.
 */
class TranslationProvider {
  /**
     * Translates text to a target language using Gemini API with i18next fallback.
     * @async
     * @param {string} text - The text to be translated.
     * @param {string} targetLanguage - The target language code (e.g., 'en', 'fr', 'es').
     * @return {Promise<string>} The translated text. Returns original text if translation fails.
     * @throws {Error} If both translation methods fail.
     * @example
     * const translated = await TranslationProvider.translate('Hello', 'fr');
     */
  static async translate(text, targetLanguage) {
    try {
      // Try Gemini first
      const geminiResult = await geminiTranslate(text, targetLanguage);
      if (geminiResult) return geminiResult;

      // Fallback to i18next if Gemini fails
      console.log('Falling back to i18next translation');
      return i18next.t(text, {
        lng: targetLanguage,
        defaultValue: text,
        fallbackLng: 'en',
      });
    } catch (error) {
      console.error('Translation error:', error);
      return text; // Return original text if both methods fail
    }
  }
}

export default TranslationProvider;
