import { createAdminClient } from '@/lib/supabase/server';
import { google } from 'googleapis';

interface TokenSet {
  access_token: string;
  refresh_token?: string | null;
  token_expires_at?: number | null;
}

/**
 * Fetches new unread emails from Gmail and upserts them into the emails table.
 *
 * Accepts token directly (from NextAuth JWT) so it works even if the Supabase
 * sessions table has not been populated yet.
 */
export async function pollInbox(
  userId: string,
  tokenSet?: TokenSet
): Promise<{ inserted: number; skipped: number }> {
  const supabase = createAdminClient();

  // ── 1. Resolve credentials ──────────────────────────────────────────────────
  let credentials: TokenSet | null = tokenSet ?? null;

  if (!credentials) {
    // Fall back to the sessions table (works after user has signed in at least once
    // with the correct service role key in place)
    const { data: storedSession } = await supabase
      .from('sessions')
      .select('access_token, refresh_token, token_expires_at')
      .eq('user_id', userId)
      .eq('provider', 'google')
      .maybeSingle();

    if (storedSession) {
      credentials = storedSession;
    }
  }

  if (!credentials?.access_token) {
    throw new Error(
      'No Gmail credentials found. Please sign out and sign back in so the ' +
      'system can store your OAuth tokens.'
    );
  }

  // ── 2. Build OAuth2 client ──────────────────────────────────────────────────
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );

  oauth2Client.setCredentials({
    access_token:  credentials.access_token,
    refresh_token: credentials.refresh_token ?? undefined,
    expiry_date:   credentials.token_expires_at ?? undefined,
  });

  // Persist refreshed tokens when they rotate
  oauth2Client.on('tokens', async (tokens) => {
    if (tokens.access_token) {
      await supabase
        .from('sessions')
        .upsert(
          {
            user_id:          userId,
            provider:         'google',
            access_token:     tokens.access_token,
            refresh_token:    tokens.refresh_token ?? credentials!.refresh_token ?? null,
            token_expires_at: tokens.expiry_date   ?? credentials!.token_expires_at ?? null,
          },
          { onConflict: 'user_id,provider' }
        );
    }
  });

  // ── 3. List Gmail messages ──────────────────────────────────────────────────
  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

  const listRes = await gmail.users.messages.list({
    userId:     'me',
    maxResults: 200,
    q:          'in:inbox',
  });

  const messages = listRes.data.messages ?? [];

  let inserted = 0;
  let skipped  = 0;

  for (const msg of messages) {
    if (!msg.id) continue;

    // Skip duplicates
    const { data: existing } = await supabase
      .from('emails')
      .select('id')
      .eq('gmail_message_id', msg.id)
      .maybeSingle();

    if (existing) { skipped++; continue; }

    // Fetch full message
    const fullMsg = await gmail.users.messages.get({
      userId: 'me',
      id:     msg.id,
      format: 'full',
    });

    const headers  = fullMsg.data.payload?.headers ?? [];
    const getH     = (name: string) =>
      headers.find((h) => h.name?.toLowerCase() === name.toLowerCase())?.value ?? null;

    const fromHeader = getH('From') ?? '';
    const subject    = getH('Subject');
    const dateHeader = getH('Date');

    // Parse "Name <email>" or bare "email"
    const fromMatch   = fromHeader.match(/^(?:"?([^"<]+)"?\s+)?<?([^>]+)>?$/);
    const senderName  = fromMatch?.[1]?.trim() ?? null;
    const senderEmail = (fromMatch?.[2]?.trim() ?? fromHeader).toLowerCase();

    const parts           = fullMsg.data.payload?.parts ?? [];
    const hasAttachment   = parts.some((p) => p.filename && p.filename.length > 0);
    const attachmentFile  = parts.find((p) => p.filename && p.filename.length > 0)?.filename ?? null;

    const receivedAt = dateHeader
      ? new Date(dateHeader).toISOString()
      : new Date(Number(fullMsg.data.internalDate ?? Date.now())).toISOString();

    const snippet = fullMsg.data.snippet ?? '';

    const { error: insertError } = await supabase.from('emails').insert({
      gmail_message_id:    msg.id,
      sender_name:         senderName,
      sender_email:        senderEmail,
      subject,
      body_text:           snippet,
      body_snippet:        snippet,
      has_attachment:      hasAttachment,
      attachment_filename: attachmentFile,
      received_at:         receivedAt,
      processed:           false,
    });

    if (insertError) {
      console.error('[poller] insert error for', msg.id, insertError.message);
    } else {
      inserted++;
    }
  }

  return { inserted, skipped };
}
