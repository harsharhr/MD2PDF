import MarkdownIt from "markdown-it";
import { renderMarkdown, buildHtmlDocument } from "./markdown";

// One dispatcher for every Markdown → X conversion. The office formats (docx,
// xlsx, pptx) are pure JS — no Chromium — so they render fast and handle much
// larger inputs than the PDF path. Engines are imported lazily so a request only
// pays to load the library it actually needs.

export type TargetKey = "pdf" | "docx" | "xlsx" | "pptx" | "html" | "txt";

export type EngineResult = { buffer: Buffer; contentType: string };

export const TARGETS: Record<TargetKey, { label: string; contentType: string }> = {
  pdf: { label: "PDF", contentType: "application/pdf" },
  docx: {
    label: "Word",
    contentType:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  },
  xlsx: {
    label: "Excel",
    contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  },
  pptx: {
    label: "PowerPoint",
    contentType:
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  },
  html: { label: "HTML", contentType: "text/html; charset=utf-8" },
  txt: { label: "Text", contentType: "text/plain; charset=utf-8" },
};

export function isTarget(x: string): x is TargetKey {
  return Object.prototype.hasOwnProperty.call(TARGETS, x);
}

export async function convertMarkdown(
  markdown: string,
  target: TargetKey,
  baseName: string
): Promise<EngineResult> {
  const contentType = TARGETS[target].contentType;
  switch (target) {
    case "pdf": {
      const { htmlToPdf } = await import("./pdf");
      const html = buildHtmlDocument(renderMarkdown(markdown), baseName);
      return { buffer: await htmlToPdf(html), contentType };
    }
    case "html": {
      const html = buildHtmlDocument(renderMarkdown(markdown), baseName);
      return { buffer: Buffer.from(html, "utf-8"), contentType };
    }
    case "txt":
      return { buffer: Buffer.from(markdownToText(markdown), "utf-8"), contentType };
    case "docx":
      return { buffer: await mdToDocx(markdown, baseName), contentType };
    case "xlsx":
      return { buffer: mdToXlsx(markdown), contentType };
    case "pptx":
      return { buffer: await mdToPptx(markdown), contentType };
  }
}

// --- DOCX: render Markdown to HTML, convert HTML to a Word document ----------
async function mdToDocx(markdown: string, baseName: string): Promise<Buffer> {
  const mod = await import("@turbodocx/html-to-docx");
  const HTMLtoDOCX = (mod.default ?? mod) as (
    html: string,
    header?: string | null,
    opts?: Record<string, unknown>,
    footer?: string | null
  ) => Promise<Buffer | ArrayBuffer | Blob>;
  const body = renderMarkdown(markdown);
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(
    baseName
  )}</title></head><body>${body}</body></html>`;
  const out = await HTMLtoDOCX(html, null, {
    table: { row: { cantSplit: true } },
    footer: false,
    pageNumber: false,
  });
  return toBuffer(out);
}

// --- XLSX: pull every Markdown table into its own sheet ----------------------
function mdToXlsx(markdown: string): Buffer {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const XLSX = require("xlsx") as typeof import("xlsx");
  const tables = extractTables(markdown);
  const wb = XLSX.utils.book_new();
  if (tables.length) {
    tables.forEach((rows, i) => {
      const ws = XLSX.utils.aoa_to_sheet(rows);
      XLSX.utils.book_append_sheet(wb, ws, `Table ${i + 1}`);
    });
  } else {
    // No tables — fall back to one line per row so nothing is lost.
    const ws = XLSX.utils.aoa_to_sheet(
      markdown.split(/\r?\n/).map((line) => [line])
    );
    XLSX.utils.book_append_sheet(wb, ws, "Document");
  }
  return XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer;
}

// --- PPTX: one slide per top-level heading -----------------------------------
async function mdToPptx(markdown: string): Promise<Buffer> {
  const PptxGen = (await import("pptxgenjs")).default;
  const pptx = new PptxGen();
  pptx.defineLayout({ name: "WIDE", width: 10, height: 5.63 });
  pptx.layout = "WIDE";

  for (const s of splitSlides(markdown)) {
    const slide = pptx.addSlide();
    slide.addText(s.title, {
      x: 0.5,
      y: 0.3,
      w: 9,
      h: 0.9,
      fontSize: 28,
      bold: true,
      color: "1A1A19",
    });
    if (s.bullets.length) {
      slide.addText(
        s.bullets.slice(0, 12).map((b) => ({
          text: b,
          options: { bullet: true, fontSize: 16, color: "333333", breakLine: true },
        })),
        { x: 0.6, y: 1.4, w: 8.8, h: 3.8, valign: "top" }
      );
    }
  }
  const out = await pptx.write({ outputType: "nodebuffer" });
  return toBuffer(out as Buffer | ArrayBuffer | Blob | string);
}

// --- helpers -----------------------------------------------------------------

async function toBuffer(x: Buffer | ArrayBuffer | Blob | string): Promise<Buffer> {
  if (Buffer.isBuffer(x)) return x;
  if (typeof x === "string") return Buffer.from(x, "binary");
  if (x instanceof ArrayBuffer) return Buffer.from(x);
  // Blob
  return Buffer.from(await (x as Blob).arrayBuffer());
}

// Extract pipe tables as arrays of string rows using markdown-it's tokenizer.
function extractTables(markdown: string): string[][][] {
  const mdi = new MarkdownIt();
  const tokens = mdi.parse(markdown, {});
  const tables: string[][][] = [];
  let table: string[][] | null = null;
  let row: string[] | null = null;
  let inCell = false;

  for (const t of tokens) {
    switch (t.type) {
      case "table_open":
        table = [];
        break;
      case "table_close":
        if (table) tables.push(table);
        table = null;
        break;
      case "tr_open":
        row = [];
        break;
      case "tr_close":
        if (table && row) table.push(row);
        row = null;
        break;
      case "th_open":
      case "td_open":
        inCell = true;
        break;
      case "th_close":
      case "td_close":
        inCell = false;
        break;
      case "inline":
        if (inCell && row) row.push(stripInline(t.content));
        break;
    }
  }
  return tables;
}

type Slide = { title: string; bullets: string[] };

function splitSlides(markdown: string): Slide[] {
  const slides: Slide[] = [];
  let cur: Slide | null = null;
  for (const raw of markdown.split(/\r?\n/)) {
    const line = raw.trim();
    const heading = line.match(/^(#{1,2})\s+(.*)$/);
    if (heading) {
      if (cur) slides.push(cur);
      cur = { title: stripInline(heading[2]) || "Slide", bullets: [] };
    } else if (line) {
      if (!cur) cur = { title: "Slide", bullets: [] };
      const bullet = line.replace(/^[-*+]\s+/, "").replace(/^#{3,6}\s+/, "");
      cur.bullets.push(stripInline(bullet));
    }
  }
  if (cur) slides.push(cur);
  return slides.length ? slides : [{ title: "Document", bullets: [] }];
}

// Strip inline Markdown emphasis/links/code to plain text.
function stripInline(s: string): string {
  return s
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1") // links / images → text
    .replace(/[*_~`]/g, "")
    .trim();
}

function markdownToText(markdown: string): string {
  return markdown
    .split(/\r?\n/)
    .map((line) =>
      line
        .replace(/^#{1,6}\s+/, "")
        .replace(/^[-*+]\s+/, "• ")
        .replace(/^>\s?/, "")
    )
    .map(stripInline)
    .join("\n");
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
