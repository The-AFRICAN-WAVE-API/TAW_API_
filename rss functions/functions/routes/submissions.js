// functions/routes/submissions.js
import express from 'express';
import {
  createSubmission,
  listPending,
  approveSubmission,
} from '../services/submissionService.js';
import checkApiKey from '../utils/auth.js';

const router = express.Router();


router.use('/submissions', checkApiKey);
router.use('/submissions/pending', checkApiKey);
router.use('/submissions/:id/approve', checkApiKey);


// POST /submissions
router.post('/submissions', async (req, res) => {
  const { title, content, author } = req.body;
  if (!title || !content || !author) {
    return res.status(400).json({
      error: 'Missing required fields: title, content, author'
    });
  }
  try {
    const { id } = await createSubmission({ title, content, author });
    res.status(201).json({ message: 'Submission created', id });
  } catch (err) {
    console.error('Error creating submission:', err);
    res.status(500).json({ error: 'Failed to create submission' });
  }
});

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

export default router;
