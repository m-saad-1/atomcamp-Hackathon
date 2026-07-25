import { NextRequest } from 'next/server';
import { jsonResponse, errorResponse } from '@/lib/api-response';
import { auth } from '@/auth';
import { createAdminClient } from '@/lib/supabase/server';
import { rateLimit } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';
import { logAuditEvent } from '@/lib/audit';
import { google } from 'googleapis';
import { processSupportedAttachments } from '@/lib/gmail/attachments';
import { processResumeAttachment } from '@/lib/candidates/processor';
export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return errorResponse('UNAUTHORIZED', undefined, 401);
  }

  // Rate limiting
  if (!rateLimit(`process-email:${session.user.id}`, 20, 60000)) {
    return errorResponse('RATE_LIMIT_EXCEEDED', 'Too many requests.', 429);
  }

  const supabase   = createAdminClient();
  const emailId    = params.id;
  const organizationId = session.user.organization_id;

  if (!organizationId) {
    return errorResponse('UNAUTHORIZED', 'No organization found.', 401);
  }

  // 1. Fetch the email record
  const { data: email, error: fetchError } = await supabase
    .from('emails')
    .select('id, lifecycle_status, gmail_message_id')
    .eq('id', emailId)
    .eq('organization_id', organizationId)
    .single();

  if (fetchError || !email) {
    return errorResponse('EMAIL_NOT_FOUND', 'Email not found.', 404);
  }

  if (email.lifecycle_status === 'archived') {
    return errorResponse('ALREADY_PROCESSED', 'This email is already archived.', 409);
  }

  try {
    // If it's queued for AI, process the resume immediately
    if (email.lifecycle_status === 'queued_for_ai') {
      const { data: attachments, error: attachErr } = await supabase
        .from('email_attachments')
        .select('id')
        .eq('email_id', emailId);

      if (attachErr || !attachments || attachments.length === 0) {
        throw new Error('No attachments found to process for this candidate.');
      }

      // Process the first attachment for now
      const result = await processResumeAttachment(emailId, attachments[0].id, organizationId);
      
      return jsonResponse({
        data: {
          success: true,
          message: 'Resume processed successfully.',
          candidateId: result.candidateId,
          matchConfidence: result.matchConfidence
        }
      });
    }

    // Otherwise, we assume it's in a failed state and we need to retry fetching from Gmail
    // 2. Fetch tokens
    const { data: sessionData, error: sessionError } = await supabase
      .from('sessions')
      .select('access_token, refresh_token, token_expires_at')
      .eq('user_id', session.user.id)
      .eq('provider', 'google')
      .single();

    if (sessionError || !sessionData) {
      throw new Error('No Google OAuth session found. Please sign in again.');
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );
    oauth2Client.setCredentials({
      access_token: sessionData.access_token,
      refresh_token: sessionData.refresh_token,
      expiry_date: sessionData.token_expires_at,
    });
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    // 3. Re-fetch full message to get parts
    const fullMsg = await gmail.users.messages.get({
      userId: 'me',
      id: email.gmail_message_id,
      format: 'full',
    });
    
    const parts = fullMsg.data.payload?.parts ?? [];
    
    // 4. Re-run attachment downloader
    const attachmentResults = await processSupportedAttachments(session.user.id, email.gmail_message_id, parts, organizationId);
    let hasFailedAttachments = false;
    
    if (attachmentResults.length > 0) {
      // First, delete existing failed attachment records for this email
      await supabase.from('email_attachments').delete().eq('email_id', emailId);

      const attachmentsToInsert = attachmentResults.map(a => ({
        ...a,
        email_id: emailId
      }));

      hasFailedAttachments = attachmentResults.some(a => a.status === 'failed');

      const { error: attachError } = await supabase.from('email_attachments').insert(attachmentsToInsert);
      
      if (attachError) {
        logger.error('Failed to insert attachments record during retry', { error: attachError });
        hasFailedAttachments = true;
      }
    }

    const nextStatus = hasFailedAttachments ? 'failed' : 'queued_for_ai';

    const { error: updateError } = await supabase
      .from('emails')
      .update({
        lifecycle_status: nextStatus,
        processed: true,
        processing_error: hasFailedAttachments ? 'Retry still failed on some attachments' : null,
      })
      .eq('id', emailId)
      .eq('organization_id', organizationId);

    if (updateError) throw updateError;

    if (nextStatus === 'queued_for_ai') {
      await logAuditEvent(organizationId, 'email', emailId, 'Manual Retry: Queued for AI');
    } else {
      await logAuditEvent(organizationId, 'email', emailId, 'Manual Retry Failed on Attachments');
      throw new Error('Some attachments still failed to download.');
    }

    return jsonResponse({
      data: {
        success: true,
        message: 'Email queued successfully.',
      }
    });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    logger.error('Email queue push failed', { error: message });

    // Record the error
    await supabase
      .from('emails')
      .update({ processing_error: message, lifecycle_status: 'failed' })
      .eq('id', emailId);

    await logAuditEvent(organizationId, 'email', emailId, 'Manual Retry Failed', { error: message });

    return errorResponse('PROCESSING_FAILED', message, 500);
  }
}
