"use node";

export async function extractTextFromPDF(buffer: Buffer): Promise<{ text: string; pageCount: number; processingTimeMs: number }> {
  const startTime = Date.now();
  
  // Validate it's actually a PDF
  if (buffer.length < 5 || buffer.toString('utf8', 0, 5) !== '%PDF-') {
    const preview = buffer.toString('utf8', 0, 50).replace(/\n/g, '\\n');
    throw new Error(`Downloaded file is NOT a valid PDF. (Preview: "${preview}...")`);
  }

  if (typeof globalThis.DOMMatrix === "undefined") {
    globalThis.DOMMatrix = require("dommatrix");
  }

  // @ts-expect-error missing type definitions
  const pdfjsWorker = await import("pdfjs-dist/legacy/build/pdf.worker.mjs");
  (globalThis as any).pdfjsWorker = pdfjsWorker;
  const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");

  let attempts = 0;
  const maxAttempts = 3;
  let lastError: any;

  while (attempts < maxAttempts) {
    try {
      attempts++;
      const loadingTask = pdfjsLib.getDocument({
        data: new Uint8Array(buffer),
        useSystemFonts: true,
        disableFontFace: true,
      });

      const pdfDocument = await loadingTask.promise;
      const numPages = pdfDocument.numPages;
      let extractedText = "";

      for (let i = 1; i <= numPages; i++) {
        const page = await pdfDocument.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(" ");
        extractedText += pageText + "\n";
      }

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
