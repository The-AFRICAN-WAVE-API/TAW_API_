// scheduled.js
import { pubsub } from 'firebase-functions';
import fetch from 'node-fetch';

export const scheduledFeedIngestion = pubsub
  .schedule('every 15 minutes')
  .onRun(async (context) => {
    console.log('Running scheduled feed ingestion...');

    try {
      // Call your endpoints or your direct service logic
      await fetch('https://api-djrx553f4q-uc.a.run.app/rss');
      await fetch('https://api-djrx553f4q-uc.a.run.app/social');

      console.log('Finished scheduled feed ingestion!');
    } catch (err) {
      console.error('Error in scheduled feed ingestion:', err);
    }

    return null;
  });
