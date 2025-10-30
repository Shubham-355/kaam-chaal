import 'dotenv/config';
import { syncDataJob } from '../jobs/syncData.js';

const state = process.argv[2] || 'MAHARASHTRA';

console.log(`Starting manual sync for ${state}...`);

syncDataJob(state)
  .then(() => {
    console.log('Sync completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Sync failed:', error);
    process.exit(1);
  });
