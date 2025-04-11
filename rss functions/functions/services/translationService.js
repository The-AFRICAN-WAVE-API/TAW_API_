import admin from 'firebase-admin';
const db = admin.firestore();
import { queueTranslation } from '../utils/languages/translationQueue.js';

const DEFAULT_LIMIT = 10;

const TARGET_LANGUAGES = ['fr', 'de', 'es'];

async function translateAndStoreArticles() {
    try {
        // Fetch articles from Firestore
        const articlesRef = db.collectionGroup('articles');
        const snapshot = await articlesRef.limit(DEFAULT_LIMIT).get();
        
        if (snapshot.empty) {
            console.log('No articles found to translate');
            return;
        }

        for (const doc of snapshot.docs) {
            const article = doc.data();
            const articleId = doc.id;

            // Process each target language
            for (const targetLang of TARGET_LANGUAGES) {
                // Check if translation already exists
                const translationRef = doc.ref.collection(targetLang).doc(articleId);
                const translationDoc = await translationRef.get();

                if (!translationDoc.exists) {
                    // Queue translation for title and content
                    const translatedArticle = await queueTranslation(
                        article,
                        targetLang
                    );
                    // Store translated version in language subcollection
                    await translationRef.set({
                        ...article,
                        title: translatedArticle.title,
                        description: translatedArticle.description,
                        originalId: articleId,
                        language: targetLang,
                        translatedAt: admin.firestore.FieldValue.serverTimestamp()
                    });

                    console.log(`Article ${articleId} translated to ${targetLang}`);
                }
            }
        }
    } catch (error) {
        console.error('Error in translation process:', error);
        throw error;
    }
}

export { translateAndStoreArticles };