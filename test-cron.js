#!/usr/bin/env node

/**
 * Local Cron Simulator for Development
 *
 * This script simulates the Vercel cron job locally by calling the
 * process-pending endpoint every 10 seconds.
 *
 * Usage:
 *   node test-cron.js
 *
 * Make sure INTERNAL_JOB_SECRET is set in your .env.local file.
 */

require('dotenv').config({ path: '.env.local' });

const secret = process.env.INTERNAL_JOB_SECRET;
const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const url = `${baseUrl}/api/inbound/process-pending?secret=${secret}`;

if (!secret) {
  console.error('❌ INTERNAL_JOB_SECRET not found in .env.local');
  process.exit(1);
}

console.log('🚀 Cron simulator started');
console.log(`📍 Endpoint: ${baseUrl}/api/inbound/process-pending`);
console.log('⏰ Running every 10 seconds');
console.log('🛑 Press Ctrl+C to stop\n');

let runCount = 0;

async function runJob() {
  runCount++;
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] Run #${runCount} - Triggering process-pending...`);

  try {
    const response = await fetch(url, { method: 'POST' });
    const data = await response.json();

    if (response.ok) {
      console.log(`✅ Success: Processed ${data.processed} target(s)`);
    } else {
      console.error(`❌ Error: ${data.error || 'Unknown error'}`);
    }
  } catch (error) {
    console.error(`❌ Request failed: ${error.message}`);
  }

  console.log(''); // Empty line for readability
}

// Run immediately on start
runJob();

// Then run every 10 seconds
setInterval(runJob, 10000);

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n👋 Cron simulator stopped');
  console.log(`📊 Total runs: ${runCount}`);
  process.exit(0);
});
