git add.import { onRequest } from 'firebase-functions/v2/https';
import express from 'express';
import cors from 'cors';
import compression from 'compression';
import articlesRoutes from './routes/articles.js';

const app = express();

// Middleware
app.use(cors({ origin: '*' }));
app.use(compression());

// Root route
app.get('/', (req, res) => {
    res.json({
        status: 'ok',
        message: 'Welcome to the RSS & Social Feed API',
        endpoints: {
            health: '/health',
            articles: '/articles',
            articlesByCategory: '/articles/:category',
            test: '/articles/test'
        }
    });
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Mount articles routes
app.use('/', articlesRoutes);

// Error handling middleware
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Export the Express app as a Firebase Cloud Function
export const api = onRequest({
    memory: '256MiB',
    maxInstances: 10,
    timeoutSeconds: 60,
    minInstances: 0
}, app);

