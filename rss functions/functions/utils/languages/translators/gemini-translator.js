import { GoogleGenAI } from '@google/genai';
import { config } from '../../../configuration/config.js';

const genai = new GoogleGenAI({
  apiKey: config.GEMINI_API_KEY,
});

const modelFeatures = {
  model: 'gemini-2.0-flash-lite',
  temperature: 0.2,
  maxOutputTokens: 8192,
  topP: 0.95,
  topK: 40,
  responseMimeType: 'text',
};

const RATE_LIMIT = {
  MAX_RETRIES: 3,
  INITIAL_DELAY: 1000,
  MAX_DELAY: 60000,
  BACKOFF_FACTOR: 2,
};


/**
 * Translates a JSON string to a specified target language while maintaining the JSON structure using Gemini API.
 * Implements exponential backoff for rate limiting.
 *
 * @async
 * @param {string} text - The JSON string to translate
 * @param {string} targetLanguage - The target language to translate to
 * @return {Promise<string>} The translated JSON string
 * @throws {Error} If the translation response contains invalid JSON
 * @throws {Error} If rate limit is exceeded after maximum retries
 *
 * @example
 * const jsonText = '{"greeting": "Hello world"}';
 * const translated = await translate(jsonText, 'Spanish');
 * // Returns: '{"greeting": "Hola mundo"}'
 */
export async function translate(text, targetLanguage) {
  let delay = RATE_LIMIT.INITIAL_DELAY;

  for (let attempt = 1; attempt <= RATE_LIMIT.MAX_RETRIES; attempt++) {
    try {
      if (!text || typeof text !== 'string') {
        console.warn('Invalid text input for translation:', text);
        return text;
      }

      const parts = [{
        text: `Translate this JSON to ${targetLanguage}. 
                Maintain the exact JSON structure and only translate the values.
                Return valid JSON format:
                ${text}`,
      }];

      const result = await genai.models.generateContent({
        contents: [{ parts }],
        ...modelFeatures,
      });

      const response = result.text;
      try {
        const cleanResponse = response.replace(/^[`'"]+|[`'"]+$/g, '');
        const parsedResponse = JSON.parse(cleanResponse);
        return JSON.stringify(parsedResponse);
      } catch (jsonError) {
        const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
          try {
            const extractedJson = jsonMatch[1].trim();
            const parsedJson = JSON.parse(extractedJson);
            return JSON.stringify(parsedJson);
          } catch (error) {
            console.warn('Invalid JSON response:', response);
            throw new Error('Invalid JSON in translation response');
          }
        }
      }
    } catch (error) {
      if (error.status === 429) {
        console.log(`Rate limit hit, attempt ${attempt}/${RATE_LIMIT.MAX_RETRIES}`);
        if (attempt === RATE_LIMIT.MAX_RETRIES) {
          throw error;
        }
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay = Math.min(delay * RATE_LIMIT.BACKOFF_FACTOR, RATE_LIMIT.MAX_DELAY);
        continue;
      }
      throw error;
    }
  }
}

