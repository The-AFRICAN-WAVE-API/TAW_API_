// index.js
const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");
const compression = require("compression");

// Import route modules
const articlesRoutes = require("./routes/articles");
const socialRoutes = require("./routes/social");

const app = express();
app.use(cors({origin: "*"}));
app.use(compression());

// Mount routes (all endpoints are prefixed with '/')
app.use("/", articlesRoutes);
app.use("/", socialRoutes);

exports.api = functions.https.onRequest(app);
