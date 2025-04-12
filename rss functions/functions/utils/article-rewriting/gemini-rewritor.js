import { GoogleGenAI } from "@google/genai";
import config from "../../config/config.js";

const ai = new GoogleGenAI({
  apiKey: config.GEMINI_API_KEY,
});

const modelFeatures = {
    model: 'gemini-2.0-flash-lite',
    temperature: 0.5,
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

export async function rewrite(text, category, targetLanguage) {
    const prompt = `
---

> **Act like an experienced editorial assistant and content rewriter. You have worked for over 20 years across different content categories (such as business, health, technology, opinion pieces, blogs, and lifestyle). You specialize in rewriting text to improve clarity, flow, and readability while preserving the original tone and intent of the content.**
>
> **Your task is to rewrite the provided article with the following guidelines:**
>
> 1. Maintain the original tone and voice of the article (e.g., formal, informal, persuasive, journalistic, narrative, etc.).
> 2. Keep the main message, intent, and perspective unchanged.
> 3. Improve grammar, sentence structure, and organization where appropriate.
> 4. Do not add, remove, or alter factual information unless instructed to do so.
> 5. Ensure the rewritten version is easy to read, well-organized, and stylistically consistent with the original.
>
> **Step-by-step instructions:**
>
> - Step 1: Review the original article to determine its tone, intent, and purpose.
> - Step 2: Rewrite the article in ${targetLanguage}, improving clarity and structure while preserving the tone and meaning.
> - Step 3: Re-check the rewritten version to confirm alignment with the original tone and message.
> - Step 4: Output only the revised article. Do not include commentary or comparisons unless requested.
> - Step 5: If a content category is provided (e.g., news, blog, opinion), use language and formatting appropriate to that style.
>
> Use this format when input is provided:
>
> **Original Article (delimited by triple quotes):**\
> """\
> ${text}\
> """
>
> **Category:** ${category}
>
> Take a deep breath and work on this problem step-by-step.

---
`

    const parts = [{
        text: `${prompt}`,
    }];

    let delay = RATE_LIMIT.INITIAL_DELAY;

    for (let attempt = 1; attempt <= RATE_LIMIT.MAX_RETRIES; attempt++) {
        try {
            if (!text || typeof text !== 'string') {
                console.warn('Invalid text input for rewriting:', text);
                return text;
            }

            const result = await ai.models.generateContent({
                contents: [{parts}],
                ...modelFeatures,
            });

            const rewrittenText = result.contents[0].parts[0].text.trim();
            return rewrittenText;
        } catch (error) {
            if (attempt === RATE_LIMIT.MAX_RETRIES) {
                throw new Error(`Rate limit exceeded after ${attempt} attempts: ${error.message}`);
            }
            await new Promise(resolve => setTimeout(resolve, delay));
            delay = Math.min(delay * RATE_LIMIT.BACKOFF_FACTOR, RATE_LIMIT.MAX_DELAY);
        }
    }
}