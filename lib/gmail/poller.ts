import { getValidAccessToken } from './auth';
import { downloadFirstPdfAttachment } from './attachments';
import { createClient } from '@supabase/supabase-js';

const GMAIL_BASE = 'https://gmail.googleapis.com/gmail/v1/users/me';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Fetch unread inbox messages since last poll.
 * Uses Gmail search query to find candidate-style emails.
 */
export async function pollInbox(userId: string): Promise<void> {
  console.log('Fetching token...');
  const token = await getValidAccessToken(userId);

  // Query: unread messages in inbox (not from yourself, not spam)
  const query = 'in:inbox is:unread -from:me';
  const listUrl = `${GMAIL_BASE}/messages?q=${encodeURIComponent(query)}&maxResults=20`;

  console.log('Gmail API connecting...');
  const listRes = await fetch(listUrl, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!listRes.ok) {
    console.error('GMAIL_LIST_FAILED', listRes.status);
    return;
  }

  const { messages = [] } = await listRes.json();
  console.log(`Found ${messages.length} emails...`);

  for (const { id: messageId } of messages as Array<{ id: string }>) {
    // Check dedup — skip if already processed
    const { data: existing } = await supabase
      .from('emails')
      .select('id')
      .eq('gmail_message_id', messageId)
      .maybeSingle();

    if (existing) continue;

    try {
      await processMessage(userId, messageId, token);
    } catch (err) {
      console.error(`Failed to process message ${messageId}:`, err);
      // Log error to DB but do not throw — continue processing other messages
      await supabase.from('emails').upsert(
        {
          gmail_message_id: messageId,
          sender_email: 'unknown@unknown.com',
          body_text: '',
          processed: false,
          processing_error: err instanceof Error ? err.message : String(err),
        },
        { onConflict: 'gmail_message_id' }
      );
    }
  }
}

async function processMessage(
  userId: string,
  messageId: string,
  token: string
): Promise<void> {
  // Fetch full message with payload
  const msgRes = await fetch(
    `${GMAIL_BASE}/messages/${messageId}?format=full`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  if (!msgRes.ok) throw new Error(`MESSAGE_FETCH_FAILED: ${msgRes.status}`);

  const msg = await msgRes.json();
  const headers: Array<{ name: string; value: string }> = msg.payload?.headers ?? [];

  const getHeader = (name: string) =>
    headers.find((h) => h.name.toLowerCase() === name)?.value ?? null;

  const subject = getHeader('subject') ?? '(no subject)';
  const from = getHeader('from') ?? '';
  const dateStr = getHeader('date');
  const receivedAt = dateStr ? new Date(dateStr).toISOString() : new Date().toISOString();

  // Extract sender name and email from "Name <email>" format
  const senderMatch = from.match(/^(.*?)\s*<(.+?)>$/);
  const senderName = senderMatch ? senderMatch[1].trim() : null;
  const senderEmail = senderMatch ? senderMatch[2] : from;

  // Extract plain text body
  const bodyText = extractBodyText(msg.payload);

  // Check for PDF attachment
  const attachment = await downloadFirstPdfAttachment(
    userId, messageId, msg.payload?.parts ?? []
  );

  // Store raw email
  console.log('Saving to Supabase...');
  const { data: emailRow, error } = await supabase
    .from('emails')
    .insert({
      gmail_message_id: messageId,
      sender_name: senderName,
      sender_email: senderEmail,
      subject,
      body_text: bodyText,
      has_attachment: !!attachment,
      attachment_filename: attachment?.filename ?? null,
      attachment_size_kb: attachment?.sizeKb ?? null,
      received_at: receivedAt,
      processed: false,
    })
    .select()
    .single();

  if (error || !emailRow) {
    console.error('EMAIL_INSERT_FAILED', error);
    throw new Error('EMAIL_INSERT_FAILED');
  }

  // The email is now stored with processed=false.
  // It will appear in the UI Inbox where the user can manually trigger processing.
}

/**
 * Recursively find and decode plain-text body from Gmail message payload
 */
function extractBodyText(payload: any): string {
  if (!payload) return '';

  if (payload.mimeType === 'text/plain' && payload.body?.data) {
    return Buffer.from(
      payload.body.data.replace(/-/g, '+').replace(/_/g, '/'),
      'base64'
    ).toString('utf-8');
  }

  for (const part of payload.parts ?? []) {
    const text = extractBodyText(part);
    if (text) return text;
  }

  return '';
}
