import { rewrite } from "./gemini-rewritor.js";
import { extract } from "@extractus/article-extractor";
import { detectLanguage } from "../languages/languageDetection.js";


export async function rewriteArticle(article, targetLanguage='en') {

    const url = article.url || article.link || article.sourceUrl || article.sourceLink;
    const articleObject = await extract(url)
        .catch((error) => {
            console.error('Error extracting article:', error);
            return null;
        });
    
    const content = articleObject?.content || "";
    
    const sourceLanguage = detectLanguage(content);
    if (sourceLanguage === targetLanguage) {
        return article;
    }

    const category = article.category || article.sourceCategory || article.sourceType || "other";
    
    const rewrittenContent = await rewrite(content, category,targetLanguage)
        .catch((error) => {
            console.error('Error rewriting article:', error);
            return null;
        });

    return rewrittenContent
}