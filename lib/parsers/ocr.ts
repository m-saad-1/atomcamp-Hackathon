import Tesseract from 'tesseract.js';

/**
 * Extracts text from an image buffer using Tesseract OCR.
 * For PDFs, ideally you would convert them to images first (e.g. via Ghostscript or pdf2pic),
 * but for this implementation we assume the buffer is a direct image (png, jpg).
 */
export async function performOCR(buffer: Buffer, mimeType: string): Promise<string> {
  try {
    // If it's a PDF, we would need to convert to images first. 
    // This requires system-level dependencies (Ghostscript) which are beyond the scope
    // of a simple Node script without external binaries.
    if (mimeType === 'application/pdf') {
      console.warn('Direct OCR on PDFs requires image conversion first. Returning empty string or throwing.');
      throw new Error('PDF to Image conversion for OCR is not supported natively without Ghostscript.');
    }

    // Tesseract.js recognizes Buffer inputs natively
    const { data: { text } } = await Tesseract.recognize(buffer, 'eng', {
      logger: m => console.log('OCR Progress:', m.status, Math.round(m.progress * 100) + '%'),
    });
    
    return text;
  } catch (error) {
    console.error('Error during OCR:', error);
    throw error;
  }
}
