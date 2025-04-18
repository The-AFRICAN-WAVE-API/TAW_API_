// services/submissionService.js
const admin = require('../config/firebase');
const db = admin.firestore();

const PENDING = 'pending_submissions';
const APPROVED = 'approved_submissions';

/**
 * Save a new submission into pending_submissions
 * @param {{title: string, content: string, author: string}} submission
 * @returns {Promise<{id: string}>}
 */
async function createSubmission({ title, content, author }) {
  const now = admin.firestore.FieldValue.serverTimestamp();
  const docRef = db.collection(PENDING).doc();
  await docRef.set({ title, content, author, createdAt: now });
  return { id: docRef.id };
}

/**
 * List all pending submissions (admin only)
 * @returns {Promise<Array>}
 */
async function listPending() {
  const snap = await db.collection(PENDING).orderBy('createdAt', 'desc').get();
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/**
 * Approve a submission: move it into approved_submissions and delete from pending
 * @param {string} id - The submission document ID
 * @returns {Promise<{success: boolean}>}
 */
async function approveSubmission(id) {
  const pendingRef = db.collection(PENDING).doc(id);
  const pendingSnap = await pendingRef.get();
  if (!pendingSnap.exists) {
    throw new Error('Submission not found');
  }
  const data = pendingSnap.data();

  // Move to approved_submissions
  const approvedRef = db.collection(APPROVED).doc(id);

  await db.runTransaction(async tx => {
    tx.set(approvedRef, {
      title: data.title,
      content: data.content,
      author: data.author,
      approvedAt: admin.firestore.FieldValue.serverTimestamp(),
      // add any other fields you need...
    });
    tx.delete(pendingRef);
  });

  return { success: true };
}

module.exports = {
  createSubmission,
  listPending,
  approveSubmission,
};
