// index.js
import { https } from 'firebase-functions';
import express from 'express';
import cors from 'cors';
import compression from 'compression';

// Import route modules
import articlesRoutes from './routes/articles.js';
import socialRoutes from './routes/social.js';
import submissionsRoutes from './routes/submissions.js';


const app = express();
app.use(cors({origin: '*'}));
app.use(compression());

// Mount routes (all endpoints are prefixed with '/')
app.use('/', articlesRoutes);
app.use('/', socialRoutes);
app.use('/', submissionsRoutes);


export const api = https.onRequest(app);

