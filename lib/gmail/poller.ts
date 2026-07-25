import { createAdminClient } from '@/lib/supabase/server';
import { google } from 'googleapis';
import { processSupportedAttachments } from './attachments';
import { logAuditEvent } from '../audit';
import { logger } from '../logger';

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

  // Retrieve user's organization
  const { data: orgMember } = await supabase
    .from('organization_members')
    .select('organization_id')
    .eq('user_id', userId)
    .single();
  
  const organizationId = orgMember?.organization_id;
  if (!organizationId) {
    throw new Error('User does not belong to an organization.');
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
    const threadId    = fullMsg.data.threadId ?? null;
    const labels      = fullMsg.data.labelIds ?? [];

    // Parse "Name <email>" or bare "email"
    const fromMatch   = fromHeader.match(/^(?:"?([^"<]+)"?\s+)?<?([^>]+)>?$/);
    const senderName  = fromMatch?.[1]?.trim() ?? null;
    const senderEmail = (fromMatch?.[2]?.trim() ?? fromHeader).toLowerCase();

    // Extract Body
    let bodyText = '';
    let bodyHtml = '';

    const parts = fullMsg.data.payload?.parts ?? [];
    if (parts.length === 0 && fullMsg.data.payload?.body?.data) {
      // Single part email
      const data = Buffer.from(fullMsg.data.payload.body.data, 'base64').toString('utf8');
      if (fullMsg.data.payload.mimeType === 'text/html') bodyHtml = data;
      else bodyText = data;
    } else {
      // Multipart email
      const extractBody = (partsList: { mimeType: string, body?: { data?: string }, parts?: any[] }[]) => {
        for (const part of partsList) {
          if (part.mimeType === 'text/plain' && part.body?.data) {
            bodyText = Buffer.from(part.body.data, 'base64').toString('utf8');
          } else if (part.mimeType === 'text/html' && part.body?.data) {
            bodyHtml = Buffer.from(part.body.data, 'base64').toString('utf8');
          }
          if (part.parts) {
            extractBody(part.parts);
          }
        }
      };
      extractBody(parts);
    }

    const receivedAt = dateHeader
      ? new Date(dateHeader).toISOString()
      : new Date().toISOString();

    // Store in Supabase as 'new' (or 'normalized' since we parsed it)
    const { data: emailRecord, error: insertError } = await supabase.from('emails').insert({
      gmail_message_id:   msg.id,
      organization_id:    organizationId,
      thread_id:          threadId,
      labels:             labels,
      sender_name:        senderName,
      sender_email:       senderEmail,
      subject,
      body_text:          bodyText,
      body_html:          bodyHtml,
      received_at:        receivedAt,
      lifecycle_status:   'normalized',
      processed:          false,
    }).select('id').single();

    if (insertError || !emailRecord) {
      logger.error('Failed to insert normalized email', { error: insertError });
      continue;
    }

    await logAuditEvent(organizationId, 'email', emailRecord.id, 'Email Discovered and Normalized');

    // Process attachments
    const attachmentResults = await processSupportedAttachments(userId, msg.id, parts, organizationId);
    let hasFailedAttachments = false;
    
    if (attachmentResults.length > 0) {
      const attachmentsToInsert = attachmentResults.map(a => ({
        ...a,
        email_id: emailRecord.id
      }));

      hasFailedAttachments = attachmentResults.some(a => a.status === 'failed');

      const { error: attachError } = await supabase.from('email_attachments').insert(attachmentsToInsert);
      
      if (attachError) {
        logger.error('Failed to insert attachments record', { error: attachError });
        hasFailedAttachments = true;
      } else {
        await logAuditEvent(organizationId, 'email', emailRecord.id, 'Attachments Downloaded', { count: attachmentResults.length });
      }
      
      await supabase.from('emails')
        .update({ has_attachment: true, lifecycle_status: hasFailedAttachments ? 'failed' : 'attachments_ready' })
        .eq('id', emailRecord.id);
    }

    const finalStatus = hasFailedAttachments ? 'failed' : 'queued_for_ai';

    // Finally, set status
    if (finalStatus === 'queued_for_ai') {
      await supabase.from('emails')
        .update({ lifecycle_status: 'queued_for_ai' })
        .eq('id', emailRecord.id);
        
      await logAuditEvent(organizationId, 'email', emailRecord.id, 'Queued for AI Processing');
    } else {
      await logAuditEvent(organizationId, 'email', emailRecord.id, 'Ingestion Failed due to Attachments');
    }

    // Remove UNREAD label to prevent infinite polling loop
    try {
      await gmail.users.messages.modify({
        userId: 'me',
        id: msg.id,
        requestBody: {
          removeLabelIds: ['UNREAD']
        }
      });
    } catch (err) {
      logger.error('Failed to remove UNREAD label', { error: err });
    }
  }
}
