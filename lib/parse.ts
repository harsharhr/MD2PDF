// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require("pdf-parse");
import mammoth from "mammoth";
import TurndownService from "turndown";
import * as XLSX from "xlsx";
import officeParser from "officeparser";

// Helper to clean up strings
function cleanMarkdown(md: string): string {
  return md
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * Extracts text from a PDF buffer and formats it as basic Markdown.
 */
async function pdfToMd(buffer: Buffer): Promise<string> {
  const data = await pdfParse(buffer);
  // pdf-parse gives raw text. We'll treat paragraphs as lines.
  const text: string = data.text;
  
  // Basic heuristic: if a line is short and has no trailing punctuation, maybe it's a heading.
  const lines = text.split("\n");
  const mdLines = lines.map((line) => {
    const trimmed = line.trim();
    if (!trimmed) return "";
    // If it's short and uppercase, treat as heading
    if (trimmed.length > 2 && trimmed.length < 60 && trimmed === trimmed.toUpperCase()) {
      return `\n## ${trimmed}\n`;
    }
    return trimmed;
  });

  return cleanMarkdown(mdLines.join("\n"));
}

/**
 * Extracts content from a DOCX buffer using mammoth and converts to Markdown using turndown.
 */
async function docxToMd(buffer: Buffer): Promise<string> {
  const result = await mammoth.convertToHtml({ buffer });
  const html = result.value;
  
  const turndownService = new TurndownService({
    headingStyle: "atx",
    hr: "---",
    bulletListMarker: "-",
    codeBlockStyle: "fenced",
  });
  
  const md = turndownService.turndown(html);
  return cleanMarkdown(md);
}

/**
 * Extracts all sheets from an XLSX buffer and formats them as Markdown tables.
 */
function xlsxToMd(buffer: Buffer): string {
  const wb = XLSX.read(buffer, { type: "buffer" });
  let md = "";

  for (const sheetName of wb.SheetNames) {
    const ws = wb.Sheets[sheetName];
    // Convert sheet to an array of arrays
    const rows = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];
    
    if (rows.length === 0) continue;
    
    md += `## ${sheetName}\n\n`;
    
    // Build Markdown table
    const headerRow = rows[0] || [];
    md += "| " + headerRow.map((c) => String(c || "").trim()).join(" | ") + " |\n";
    md += "| " + headerRow.map(() => "---").join(" | ") + " |\n";
    
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i] || [];
      // Pad row to match header length
      const paddedRow = Array.from({ length: headerRow.length }).map((_, colIdx) => {
        return String(row[colIdx] || "").trim().replace(/\n/g, " ");
      });
      md += "| " + paddedRow.join(" | ") + " |\n";
    }
    md += "\n\n";
  }

  return cleanMarkdown(md);
}

/**
 * Extracts text from a PPTX buffer using officeparser.
 */
async function pptxToMd(buffer: Buffer): Promise<string> {
  const ast = await officeParser.parseOffice(buffer);
  const text: string = ast.toText();
  
  const lines = text.split("\n");
  const mdLines = lines.map((line) => {
    const trimmed = line.trim();
    if (!trimmed) return "";
    return `- ${trimmed}`;
  });
  
  return cleanMarkdown(mdLines.join("\n"));
}

/**
 * Main parser entry point: Routes an incoming buffer to the appropriate Markdown parser based on its extension.
 */
export async function parseToMarkdown(buffer: Buffer, ext: string): Promise<string> {
  switch (ext.toLowerCase()) {
    case "pdf":
      return await pdfToMd(buffer);
    case "docx":
      return await docxToMd(buffer);
    case "xlsx":
      return xlsxToMd(buffer);
    case "pptx":
      return await pptxToMd(buffer);
    case "txt":
    case "md":
    case "markdown":
      return buffer.toString("utf-8");
    default:
      throw new Error(`Unsupported source format: ${ext}`);
  }
}
