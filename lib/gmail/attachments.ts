import { getValidAccessToken } from './auth';
import { createAdminClient } from '@/lib/supabase/server';
import { gmail_v1 } from 'googleapis';

const GMAIL_BASE = 'https://gmail.googleapis.com/gmail/v1/users/me';

export interface AttachmentResult {
  filename: string;
  mimeType: string;
  sizeKb: number;
  buffer: Buffer;
}

/**
 * Extract attachment metadata from Gmail message parts
 */
export function findAttachmentParts(
  parts: gmail_v1.Schema$MessagePart[],
  result: Array<{ partId: string; filename: string; mimeType: string; attachmentId: string; size: number }>
): void {
  for (const part of parts) {
    if (part.filename && part.body?.attachmentId) {
      result.push({
        partId: part.partId ?? '',
        filename: part.filename,
        mimeType: part.mimeType ?? '',
        attachmentId: part.body.attachmentId,
        size: part.body.size ?? 0,
      });
    }
    if (part.parts) {
      findAttachmentParts(part.parts, result);
    }
  }
}

/**
 * Download a single attachment by its Gmail attachment ID.
 * Returns a Buffer of the raw file bytes.
 */
export async function downloadAttachment(
  userId: string,
  messageId: string,
  attachmentId: string,
  filename: string,
  mimeType: string,
  sizeBytes: number
): Promise<AttachmentResult> {
  const token = await getValidAccessToken(userId);

  const response = await fetch(
    `${GMAIL_BASE}/messages/${messageId}/attachments/${attachmentId}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  if (!response.ok) {
    throw new Error(`ATTACHMENT_FETCH_FAILED: ${response.status} for ${filename}`);
  }

  const { data } = await response.json();

  // Gmail returns base64url encoding — convert to standard base64 then Buffer
  const base64 = (data as string)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const buffer = Buffer.from(base64, 'base64');

  return {
    filename,
    mimeType,
    sizeKb: Math.round(sizeBytes / 1024),
    buffer,
  };
}

/**
 * Download all supported attachments from a Gmail message and upload them to Supabase Storage.
 * Returns an array of attachment metadata to be saved in the database.
 */
export async function processSupportedAttachments(
  userId: string,
  messageId: string,
  messageParts: gmail_v1.Schema$MessagePart[],
  organizationId: string
) {
  const parts: Array<{
    partId: string; filename: string; mimeType: string;
    attachmentId: string; size: number;
  }> = [];

  findAttachmentParts(messageParts, parts);

  const supportedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'application/rtf'
  ];

  const supportedParts = parts.filter(
    (p) =>
      supportedTypes.includes(p.mimeType) ||
      p.filename.toLowerCase().match(/\.(pdf|doc|docx|txt|rtf)$/)
  );

  const results = [];
  const supabase = createAdminClient();

  for (const part of supportedParts) {
    try {
      const { buffer, sizeKb, filename, mimeType } = await downloadAttachment(
        userId,
        messageId,
        part.attachmentId,
        part.filename,
        part.mimeType,
        part.size
      );

      // Upload to Supabase Storage
      const safeFilename = `${Date.now()}-${filename.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const storagePath = `${organizationId}/${messageId}/${safeFilename}`;

      const { error: uploadError } = await supabase.storage
        .from('attachments')
        .upload(storagePath, buffer, {
          contentType: mimeType,
          upsert: true,
        });

      if (uploadError) {
        throw uploadError;
      }

      results.push({
        filename,
        mimeType,
        size_bytes: sizeKb * 1024,
        storage_path: storagePath,
        status: 'downloaded'
      });
    } catch (err) {
      console.error(`Failed to process attachment ${part.filename}:`, err);
      // We push a failed status to track it
      results.push({
        filename: part.filename,
        mimeType: part.mimeType,
        size_bytes: part.size,
        storage_path: '',
        status: 'failed'
      });
    }
  }

  return results;
}
