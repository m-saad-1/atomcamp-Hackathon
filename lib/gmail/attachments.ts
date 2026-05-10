import { getValidAccessToken } from './auth';

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
  parts: any[],
  result: Array<{ partId: string; filename: string; mimeType: string; attachmentId: string; size: number }>
): void {
  for (const part of parts) {
    if (part.filename && part.body?.attachmentId) {
      result.push({
        partId: part.partId,
        filename: part.filename,
        mimeType: part.mimeType,
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
 * Download the first PDF attachment from a Gmail message.
 * Returns null if no PDF attachment is found.
 */
export async function downloadFirstPdfAttachment(
  userId: string,
  messageId: string,
  messageParts: any[]
): Promise<AttachmentResult | null> {
  const parts: Array<{
    partId: string; filename: string; mimeType: string;
    attachmentId: string; size: number;
  }> = [];

  findAttachmentParts(messageParts, parts);

  const pdfPart = parts.find(
    (p) =>
      p.mimeType === 'application/pdf' ||
      p.filename.toLowerCase().endsWith('.pdf')
  );

  if (!pdfPart) return null;

  return downloadAttachment(
    userId,
    messageId,
    pdfPart.attachmentId,
    pdfPart.filename,
    pdfPart.mimeType,
    pdfPart.size
  );
}
