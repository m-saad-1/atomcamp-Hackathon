import { NextRequest, NextResponse } from 'next/server';
import { pollInbox } from '@/lib/gmail/poller';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  // Gap 6: Gmail Pub/Sub webhook implementation
  // Google sends the message via Pub/Sub to this webhook.
  
  const body = await request.json();
  const message = body?.message;

  if (!message || !message.data) {
    return NextResponse.json({ error: 'INVALID_PAYLOAD' }, { status: 400 });
  }

  try {
    const dataString = Buffer.from(message.data, 'base64').toString('utf-8');
    const { emailAddress, historyId } = JSON.parse(dataString);

    if (emailAddress) {
      // Find the user with this email address
      const { data: user } = await supabase
        .from('users')
        .select('id')
        .eq('email', emailAddress)
        .single();

      if (user) {
        // Trigger the poller for this specific user
        // We don't await so the webhook can return 200 immediately
        pollInbox(user.id).catch(err => {
          console.error(`Webhook poll failed for ${emailAddress}:`, err);
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Webhook processing failed:', err);
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
