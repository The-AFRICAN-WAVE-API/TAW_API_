import admin from "../config/firebase.js";
import { queueRewriting } from "../utils/article-rewriting/queueRewriting.js";

const db = admin.firestore();

const DEFAULT_LIMIT = 5;
const DELAY_MS = 2000; // 1 second delay between rewrites
const DelayNode = () => new Promise(resolve => setTimeout(resolve, DELAY_MS));

const TARGET_LANGUAGES = ["en", "sw"];

export async function rewriteAndStoreArticles() {
    try {
        // Fetch articles from Firestore
        const articlesRef = db.collectionGroup("articles");
        const snapshot = await articlesRef.limit(DEFAULT_LIMIT).get();

        if (snapshot.empty) {
            console.log("No articles found to rewrite");
            return;
        }

        for (const doc of snapshot.docs) {
            const article = doc.data();
            const articleId = doc.id;

            // Process each target language
            for (const targetLang of TARGET_LANGUAGES) {
                await DelayNode()
                // Check if rewriting already exists in the rewrites collection
                const rewriteID = `${articleId}-${targetLang}`;
                const rewritingRef = db.collection('rewrites').doc(rewriteID);
                const rewritingDoc = await rewritingRef.get();

                if (!rewritingDoc.exists) {
                    // Queue rewriting for title and content
                    const rewrittenArticle = await queueRewriting(
                        article,
                        targetLang
                    )
                    .catch((error) => {
                        if (error.status === 401 || error.status === 403) {
                            console.log(`Skipping article ${articleId}`);
                            return null;
                        }
                    });
                    if (!rewrittenArticle) {
                        console.error(`Failed to rewrite article ${articleId} to ${targetLang}`);
                        continue; // Skip to the next language
                    }
                    // Store rewritten version in language subcollection
                    await rewritingRef.set({
                        ...rewrittenArticle,
                        originalArticleId: articleId,
                        originalCollectionPath: doc.ref.path,
                        language: targetLang,
                        rewrittenAt: admin.firestore.FieldValue.serverTimestamp(),
                        source: article.source || null,
                    });
                    console.log(`Article ${articleId} rewritten to ${targetLang}`);
                }
            }
        }
    } catch (error) {
        console.error("Error in rewriteAndStoreArticles:", error);
    }
    console.log("Rewriting process completed successfully.");
}