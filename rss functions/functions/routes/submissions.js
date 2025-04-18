const express = require('express');
const router = express.Router();
const {
  createSubmission,
  listPending,
  approveSubmission,
} = require('../services/submissionService');

// Route: Submit a new article for approval
// POST /submissions
router.post('/submissions', async (req, res) => {
  try {
    const { title, content, author } = req.body;
    if (!title || !content || !author) {
      return res.status(400).json({ error: 'Missing required fields: title, content, author' });
    }
    const result = await createSubmission({ title, content, author });
    res.status(201).json({ message: 'Submission created', id: result.id });
  } catch (err) {
    console.error('Error creating submission:', err);
    res.status(500).json({ error: 'Failed to create submission' });
  }
});

// Route: List all pending submissions (admin)
// GET /submissions/pending
router.get('/submissions/pending', async (req, res) => {
  try {
    const pending = await listPending();
    res.json(pending);
  } catch (err) {
    console.error('Error listing pending submissions:', err);
    res.status(500).json({ error: 'Failed to list pending submissions' });
  }
});

// Route: Approve a pending submission
// POST /submissions/:id/approve
router.post('/submissions/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;
    await approveSubmission(id);
    res.json({ message: 'Submission approved', id });
  } catch (err) {
    console.error('Error approving submission:', err);
    res.status(500).json({ error: 'Failed to approve submission' });
  }
});

module.exports = router;