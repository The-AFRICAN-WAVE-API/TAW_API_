const { GoogleGenAI } = require('google-genai');
const { GEMINI_API_KEY } = require('../../config/config.js');

const genai = new GoogleGenAI({
    apiKey: GEMINI_API_KEY,
})

const model_features = {
    model: "gemini-2.0-flash-lite",
    temperature: 0.2,
    maxOutputTokens: 8192,
    topP: 0.95,
    topK: 40,
    responseMimeType: "text",
}

const RATE_LIMIT = {
    MAX_RETRIES: 3,
    INITIAL_DELAY: 1000,
    MAX_DELAY: 60000,
    BACKOFF_FACTOR: 2
};

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
                ${text}`
            }];

            const result = await genai.models.generateContent({
                contents: [{parts}],
                ...model_features,
             });

            const response = result.text;
            try {
                JSON.parse(response);
                return response;
            } catch (jsonError) {
                console.warn('Invalid JSON response:', response);
                throw new Error('Invalid JSON in translation response');
            }

        } catch (error) {
            if (error.status === 429) {
                console.log(`Rate limit hit, attempt ${attempt}/${RATE_LIMIT.MAX_RETRIES}`);
                if (attempt === RATE_LIMIT.MAX_RETRIES) {
                    throw error;
                }
                await new Promise(resolve => setTimeout(resolve, delay));
                delay = Math.min(delay * RATE_LIMIT.BACKOFF_FACTOR, RATE_LIMIT.MAX_DELAY);
                continue;
            }
            throw error;
        }
    }
}