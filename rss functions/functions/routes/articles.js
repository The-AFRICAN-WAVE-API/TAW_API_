// routes/articles.js
import { Router } from 'express';
import { db } from '../configuration/firebase.js';

// eslint-disable-next-line new-cap
const router = Router();

// Test endpoint
router.get('/articles/test', (req, res) => {
  res.json({ message: 'Articles route is working' });
});

// GET /articles - Retrieve all articles with pagination
router.get('/articles', async (req, res) => {
  try {
    const pageSize = Math.max(1, Math.min(100, parseInt(req.query.pageSize, 10) || 10));
    const snapshot = await db.collectionGroup('articles')
      .orderBy('createdAt', 'desc')
      .limit(pageSize)
      .get();

    const articles = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.set('Cache-Control', 'public, max-age=30');
    res.json({ articles });
  } catch (error) {
    console.error('Error retrieving articles:', error);
    res.status(500).json({ error: 'Failed to retrieve articles' });
  }
});

// GET /articles/:category - Retrieve articles by category
router.get('/articles/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const formattedCategory = category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();

    const snapshot = await db.collection('rss_articles')
      .doc(formattedCategory)
      .collection('articles')
      .orderBy('createdAt', 'desc')
      .limit(10)
      .get();

    const articles = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.set('Cache-Control', 'public, max-age=30');
    res.json({ articles });
  } catch (error) {
    console.error(`Error retrieving articles for category ${req.params.category}:`, error);
    res.status(500).json({ error: 'Failed to retrieve articles by category' });
  }
});

export default router;
