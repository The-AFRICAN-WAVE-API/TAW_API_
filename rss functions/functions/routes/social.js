// routes/social.js
const express = require("express");
// eslint-disable-next-line new-cap
const router = express.Router();

const {processAndStoreSocialPosts} = require("../services/socialService");

// GET /social - Process and store social media posts
router.get("/social", async (req, res) => {
  try {
    const result = await processAndStoreSocialPosts();
    res.set("Cache-Control", "public, max-age=30");
    res.json(result);
  } catch (error) {
    console.error("Error in /social endpoint:", error);
    res.status(500).json({error: "Failed to fetch and store social media posts"});
  }
});

// GET /socialpost - Retrieve all stored social posts
router.get("/socialpost", async (req, res) => {
  const admin = require("firebase-admin");
  const db = admin.firestore();
  try {
    const snapshot = await db.collection("social_posts").orderBy("createdAt", "desc").get();
    const posts = snapshot.docs.map((doc) => ({id: doc.id, ...doc.data()}));
    res.json(posts);
  } catch (error) {
    console.error("Error retrieving social posts:", error);
    res.status(500).json({error: "Failed to retrieve social posts"});
  }
});

module.exports = router;
