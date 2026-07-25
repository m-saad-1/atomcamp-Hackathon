import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import WordExtractor from 'word-extractor';

/**
 * Extracts raw text from a document buffer based on its MIME type.
 * Supports PDF, DOCX, DOC, RTF, and raw text.
 */
export async function extractText(buffer: Buffer, mimeType: string): Promise<string> {
  try {
    if (mimeType === 'application/pdf') {
      const data = await pdfParse(buffer);
      return data.text;
    }

    if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const data = await mammoth.extractRawText({ buffer });
      return data.value;
    }

    if (mimeType === 'application/msword') {
      const extractor = new WordExtractor();
      const extracted = await extractor.extract(buffer);
      return extracted.getBody();
    }

    if (mimeType === 'application/rtf' || mimeType === 'text/rtf') {
      const text = buffer.toString('utf-8');
      // Basic RTF stripping
      return text.replace(/\\([a-z]+)[0-9]* ?/ig, '').replace(/[{}]/g, '');
    }

    if (mimeType.startsWith('text/')) {
      return buffer.toString('utf-8');
    }

    throw new Error(`UNSUPPORTED_TYPE: Unsupported mime type for text extraction: ${mimeType}`);
  } catch (error) {
    console.error('Error extracting text:', error);
    throw error;
  }
}

/**
 * Checks if the extracted text is likely from a scanned document (requires OCR).
 */
export function isLikelyScanned(text: string, bufferSize: number): boolean {
  const cleanText = text.replace(/\s+/g, '');
  if (cleanText.length < 100 && bufferSize > 10240) {
    return true;
  }
  return false;
}
