// functions/services/submissionService.js
import admin from 'firebase-admin';
const db = admin.firestore();

const PENDING = 'pending_submissions';
const PUBLISHED_ROOT = 'rss_articles';

/**
 * Save a new submission into pending_submissions
 */
export async function createSubmission({ title, content, author }) {
  const now = admin.firestore.FieldValue.serverTimestamp();
  const docRef = db.collection(PENDING).doc();
  await docRef.set({ title, content, author, createdAt: now });
  return { id: docRef.id };
}

/**
 * List all pending submissions (admin only)
 */
export async function listPending() {
  const snap = await db.collection(PENDING).orderBy('createdAt', 'desc').get();
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/**
 * Approve a submission: move it into rss_articles and delete from pending
 */
export async function approveSubmission(id, category = 'Other') {
  const pendingRef  = db.collection(PENDING).doc(id);
  const pendingSnap = await pendingRef.get();
  if (!pendingSnap.exists) throw new Error('Submission not found');

  const data = pendingSnap.data();
  const pubRef = db
    .collection(PUBLISHED_ROOT)
    .doc(category)
    .collection('articles')
    .doc(pendingRef.id);

  await db.runTransaction(async tx => {
    tx.set(pubRef, {
      title:   data.title,
      content: data.content,
      author:  data.author,
      pubDate: admin.firestore.FieldValue.serverTimestamp(),
    });
    tx.delete(pendingRef);
  });

  return { success: true };
}
