/**
 * OVHL Local Development Scheduler
 *
 * This script periodically calls the bidding scheduler endpoint to handle expired bids.
 * Run this alongside your Next.js development server for local testing.
 */

// Load environment variables from .env file
require('dotenv').config();
const fetch = require('node-fetch');

const schedulerApiKey = process.env.SCHEDULER_API_KEY;
const apiUrl = process.env.NEXT_PUBLIC_API_URL_DEV || 'http://localhost:3000';
const interval = 1 * 60 * 1000; // Run every 1 minute (adjust as needed)

if (!schedulerApiKey) {
  console.error('Error: SCHEDULER_API_KEY environment variable is not set');
  process.exit(1);
}

async function runScheduler() {
  try {
    const url = `${apiUrl}/api/bidding/scheduler?key=${schedulerApiKey}`;
    console.log(`[${new Date().toISOString()}] Calling scheduler endpoint...`);

    const response = await fetch(url);
    const data = await response.json();

    if (response.ok) {
      console.log(`[${new Date().toISOString()}] Scheduler ran successfully:`, data.message);
    } else {
      console.error(`[${new Date().toISOString()}] Scheduler error:`, data.error);
    }
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Failed to call scheduler:`, error.message);
  }
}

// Run immediately on startup
runScheduler();

// Then run on the specified interval
setInterval(runScheduler, interval);

console.log(
  `[${new Date().toISOString()}] Local scheduler started. Running every ${interval / 1000} seconds.`
);
console.log('Press Ctrl+C to stop.');
