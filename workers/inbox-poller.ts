import './polyfill';
import * as cron from 'node-cron';
import { createClient } from '@supabase/supabase-js';
import { logger } from '../lib/logger';
import { pollInbox } from '../lib/gmail/poller';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const INTERVAL = process.env.INBOX_POLL_INTERVAL_SECONDS ?? '60';

let isPolling = false;
let isShuttingDown = false;

console.log(`Inbox poller starting — interval: ${INTERVAL}s`);

const task = cron.schedule(`*/${INTERVAL} * * * * *`, async () => {
  if (isShuttingDown) return;
  if (isPolling) {
    logger.warn('Previous poll still running. Skipping this cycle.');
    return;
  }
  
  isPolling = true;
  logger.info(`[${new Date().toISOString()}] Polling inboxes...`);

  // Get all recruiter user IDs that have a Gmail session
  const { data: sessions } = await supabase
    .from('sessions')
    .select('user_id')
    .eq('provider', 'google');

  if (!sessions || sessions.length === 0) {
    logger.info('No authenticated recruiters found. Skipping poll.');
    isPolling = false;
    return;
  }

  for (const { user_id } of sessions) {
    if (isShuttingDown) break;
    try {
      await pollInbox(user_id);
      logger.info(`Polled inbox for user ${user_id}`);
    } catch (err: unknown) {
      // Log but do not crash the poller — other users still get polled
      logger.error(`Poll failed for user ${user_id}`, { error: err instanceof Error ? err.message : String(err) });
    }
  }
  
  isPolling = false;
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down poller gracefully...');
  isShuttingDown = true;
  task.stop();
});

process.on('SIGINT', () => {
  logger.info('SIGINT received. Shutting down poller gracefully...');
  isShuttingDown = true;
  task.stop();
});
