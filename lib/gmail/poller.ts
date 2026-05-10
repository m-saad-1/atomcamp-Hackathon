import { createAdminClient } from '@/lib/supabase/server';
import { google } from 'googleapis';

/**
 * Fetches new emails from Gmail for the given user and stores them in Supabase.
 * Only processes messages received after the most recent email already in the DB.
 */
export async function pollInbox(userId: string): Promise<void> {
  const supabase = createAdminClient();

  // Retrieve the stored OAuth tokens for this user
  const { data: session, error: sessionError } = await supabase
    .from('sessions')
    .select('access_token, refresh_token, token_expires_at')
    .eq('user_id', userId)
    .eq('provider', 'google')
    .single();

  if (sessionError || !session) {
    throw new Error('No Google OAuth session found. Please sign out and sign back in.');
  }

  // Set up the OAuth2 client
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );

  oauth2Client.setCredentials({
    access_token:  session.access_token,
    refresh_token: session.refresh_token,
    expiry_date:   session.token_expires_at,
  });

  // Auto-refresh the token and persist the new one if it changed
  oauth2Client.on('tokens', async (tokens) => {
    await supabase
      .from('sessions')
      .update({
        access_token:     tokens.access_token ?? session.access_token,
        token_expires_at: tokens.expiry_date  ?? session.token_expires_at,
      })
      .eq('user_id', userId)
      .eq('provider', 'google');
  });

  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

  // Fetch the 20 most recent inbox messages
  const listRes = await gmail.users.messages.list({
    userId: 'me',
    maxResults: 20,
    labelIds: ['INBOX'],
    q: 'is:unread',
  });

  const messages = listRes.data.messages ?? [];
  if (messages.length === 0) return;

  for (const msg of messages) {
    if (!msg.id) continue;

    // Skip if already stored
    const { data: existing } = await supabase
      .from('emails')
      .select('id')
      .eq('gmail_message_id', msg.id)
      .maybeSingle();

    if (existing) continue;

    // Fetch full message
    const fullMsg = await gmail.users.messages.get({
      userId: 'me',
      id: msg.id,
      format: 'full',
    });

    const headers = fullMsg.data.payload?.headers ?? [];
    const get = (name: string) =>
      headers.find((h) => h.name?.toLowerCase() === name.toLowerCase())?.value ?? null;

    const fromHeader  = get('From') ?? '';
    const subject     = get('Subject');
    const dateHeader  = get('Date');

    // Parse "Name <email>" or bare "email"
    const fromMatch   = fromHeader.match(/^(?:"?([^"<]+)"?\s+)?<?([^>]+)>?$/);
    const senderName  = fromMatch?.[1]?.trim() ?? null;
    const senderEmail = (fromMatch?.[2]?.trim() ?? fromHeader).toLowerCase();

    const hasAttachment = (fullMsg.data.payload?.parts ?? [])
      .some((p) => p.filename && p.filename.length > 0);

    const attachmentFilename = (fullMsg.data.payload?.parts ?? [])
      .find((p) => p.filename && p.filename.length > 0)?.filename ?? null;

    const receivedAt = dateHeader
      ? new Date(dateHeader).toISOString()
      : new Date().toISOString();

    const snippet = fullMsg.data.snippet ?? '';

    // Store in Supabase
    await supabase.from('emails').insert({
      gmail_message_id:   msg.id,
      sender_name:        senderName,
      sender_email:       senderEmail,
      subject,
      body_text:          snippet, // Required by DB
      body_snippet:       snippet, // Used for AI
      has_attachment:     hasAttachment,
      attachment_filename: attachmentFilename,
      received_at:        receivedAt,
      processed:          false,
    });
  }
}
