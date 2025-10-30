import 'dotenv/config';
import { syncDataJob } from '../jobs/syncData.js';

// Parse command line arguments
// Usage: node syncData.js [states] [finYears]
// Examples:
//   node syncData.js - sync all states for years defined in .env
//   node syncData.js "MAHARASHTRA,KARNATAKA" - sync specific states
//   node syncData.js "MAHARASHTRA" "2024-2025,2023-2024" - sync specific state and years

const statesArg = process.argv[2];
const finYearsArg = process.argv[3];

const states = statesArg ? statesArg.split(',').map(s => s.trim()) : null;
const finYears = finYearsArg ? finYearsArg.split(',').map(y => y.trim()) : null;

if (states) {
  console.log(`Starting manual sync for states: ${states.join(', ')}`);
} else {
  console.log('Starting manual sync for ALL states');
}

if (finYears) {
  console.log(`Financial years: ${finYears.join(', ')}`);
}

syncDataJob(states, finYears)
  .then(() => {
    console.log('\n✓ Sync completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n✗ Sync failed:', error);
    process.exit(1);
  });
