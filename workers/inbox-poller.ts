import './polyfill';
import * as cron from 'node-cron';
import { createClient } from '@supabase/supabase-js';
import { pollInbox } from '../lib/gmail/poller';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const INTERVAL = process.env.INBOX_POLL_INTERVAL_SECONDS ?? '60';

console.log(`Inbox poller starting — interval: ${INTERVAL}s`);

cron.schedule(`*/${INTERVAL} * * * * *`, async () => {
  console.log(`[${new Date().toISOString()}] Polling inboxes...`);

  // Get all recruiter user IDs that have a Gmail session
  const { data: sessions } = await supabase
    .from('sessions')
    .select('user_id')
    .eq('provider', 'google');

  if (!sessions || sessions.length === 0) {
    console.log('No authenticated recruiters found. Skipping poll.');
    return;
  }

  for (const { user_id } of sessions) {
    try {
      await pollInbox(user_id);
      console.log(`Polled inbox for user ${user_id}`);
    } catch (err) {
      // Log but do not crash the poller — other users still get polled
      console.error(`Poll failed for user ${user_id}:`, err);
    }
  }
});
