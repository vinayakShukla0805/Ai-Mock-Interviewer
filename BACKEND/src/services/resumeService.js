import fs from "node:fs/promises";
import { PDFParse } from "pdf-parse";

export async function extractResumeData(filePath) {
  const buffer = await fs.readFile(filePath);

  // Validate that the uploaded file looks like a PDF.
  if (buffer.subarray(0, 5).toString("ascii") !== "%PDF-") {
    throw new Error("Invalid PDF file");
  }

  const parser = new PDFParse({ data: buffer });

  try {
    const result = await parser.getText();

    const extractedText = result.text
      .replace(/\r/g, "\n")
      .replace(/[ \t]+/g, " ")
      .trim();

    if (!extractedText) {
      throw new Error(
        "No readable text found. The PDF may be scanned."
      );
    }

    return {
      extractedText,
      pageCount: result.pages.length,
    };
  } finally {
    await parser.destroy();
  }
}
