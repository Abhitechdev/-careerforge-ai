"use node";

export async function extractTextFromPDF(buffer: Buffer): Promise<{ text: string; pageCount: number; processingTimeMs: number }> {
  const startTime = Date.now();
  
  // Validate it's actually a PDF
  if (buffer.length < 5 || buffer.toString('utf8', 0, 5) !== '%PDF-') {
    const preview = buffer.toString('utf8', 0, 50).replace(/\n/g, '\\n');
    throw new Error(`Downloaded file is NOT a valid PDF. (Preview: "${preview}...")`);
  }

  let attempts = 0;
  const maxAttempts = 3;
  let lastError: any;

  while (attempts < maxAttempts) {
    try {
      attempts++;
      const pdfParse = require("pdf-parse");
      const data = await pdfParse(buffer);
      
      const extractedText = data.text;
      const numPages = data.numpages;

      if (!extractedText || extractedText.trim().length === 0) {
        throw new Error("Extracted text is empty.");
      }

      const processingTimeMs = Date.now() - startTime;
      return { text: extractedText, pageCount: numPages, processingTimeMs };
    } catch (error: any) {
      lastError = error;
      console.warn(`[PDF Extraction] Attempt ${attempts} failed: ${error.message}`);
      if (attempts >= maxAttempts) {
        break;
      }
      // wait a bit before retrying
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  throw new Error(`PDF Extraction failed after ${maxAttempts} attempts. Original Error: ${lastError?.stack || lastError?.message}`);
}
