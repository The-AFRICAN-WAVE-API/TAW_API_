import { getGrokResponse } from "./grok-rewritor.js";


export async function rewriteArticle(article, targetLanguage='en') {
    
    const textToAnalyze = (article.link || article.title || '').toString();
    
    if (!textToAnalyze) {
        console.warn('No content to analyze for language detection');
        return article;
    }

    try {
        const rewrittenArticle = await getGrokResponse(article.title, article.link);
        return rewrittenArticle;
    } catch (error) {
        console.error('Error during article rewriting:', error);
        throw error; // Rethrow the error to be handled by the caller
    }
}