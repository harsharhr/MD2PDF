// Config-driven format pairs. Each converter landing page is rendered from one
// of these entries. `target.extension` doubles as the engine key in lib/convert.ts,
// so adding a pair here (with a matching engine) lights up a whole new page.

export type FormatPair = {
  slug: string; // route: /tools/<slug>
  source: {
    label: string;
    name: string;
    accept: string;
    extensions: string[];
  };
  target: {
    label: string; // chip label
    name: string; // full name
    mime: string;
    extension: string; // ALSO the engine key: pdf | docx | xlsx | pptx | html | txt
  };
  title: string;
  metaTitle: string;
  description: string;
  benefit: string;
  enabled: boolean;
};

const MD_SOURCE = {
  label: "MD",
  name: "Markdown",
  accept: ".md,.markdown,.mdown,.mkd,text/markdown",
  extensions: ["md", "markdown", "mdown", "mkd", "txt"],
};

export const FORMAT_PAIRS: FormatPair[] = [
  {
    slug: "md-to-pdf",
    source: MD_SOURCE,
    target: { label: "PDF", name: "PDF", mime: "application/pdf", extension: "pdf" },
    title: "Markdown to PDF Converter",
    metaTitle: "Markdown to PDF Converter — MarkPress",
    description:
      "Turn Markdown files into clean, print-ready PDF documents with full support for tables, code blocks, and headings.",
    benefit:
      "Keep your formatting intact and hand off a polished PDF without opening a single editor.",
    enabled: true,
  },
  {
    slug: "md-to-word",
    source: MD_SOURCE,
    target: {
      label: "DOCX",
      name: "Word",
      mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      extension: "docx",
    },
    title: "Markdown to Word Converter",
    metaTitle: "Markdown to Word (DOCX) Converter — MarkPress",
    description:
      "Convert Markdown into an editable Word document with headings, lists, tables, and formatting preserved.",
    benefit: "Hand a teammate a .docx they can edit in Word or Google Docs — no copy-paste cleanup.",
    enabled: true,
  },
  {
    slug: "md-to-excel",
    source: MD_SOURCE,
    target: {
      label: "XLSX",
      name: "Excel",
      mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      extension: "xlsx",
    },
    title: "Markdown to Excel Converter",
    metaTitle: "Markdown to Excel (XLSX) Converter — MarkPress",
    description:
      "Extract every table in your Markdown into an Excel workbook — one worksheet per table, ready to sort and filter.",
    benefit: "Get your Markdown tables into spreadsheets without retyping a single cell.",
    enabled: true,
  },
  {
    slug: "md-to-powerpoint",
    source: MD_SOURCE,
    target: {
      label: "PPTX",
      name: "PowerPoint",
      mime: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      extension: "pptx",
    },
    title: "Markdown to PowerPoint Converter",
    metaTitle: "Markdown to PowerPoint (PPTX) Converter — MarkPress",
    description:
      "Turn a Markdown outline into a slide deck — each top-level heading becomes a slide, with bullet points below.",
    benefit: "Draft a deck in plain text and get an editable .pptx to polish in PowerPoint or Keynote.",
    enabled: true,
  },
  {
    slug: "md-to-html",
    source: MD_SOURCE,
    target: { label: "HTML", name: "HTML", mime: "text/html", extension: "html" },
    title: "Markdown to HTML Converter",
    metaTitle: "Markdown to HTML Converter — MarkPress",
    description:
      "Render Markdown into a clean, self-contained HTML document with styled headings, code, and tables.",
    benefit: "Publish or embed your content anywhere with ready-to-use, styled HTML.",
    enabled: true,
  },
  {
    slug: "md-to-text",
    source: MD_SOURCE,
    target: { label: "TXT", name: "Text", mime: "text/plain", extension: "txt" },
    title: "Markdown to Text Converter",
    metaTitle: "Markdown to Plain Text Converter — MarkPress",
    description: "Strip Markdown syntax and get clean, readable plain text.",
    benefit: "Drop your content into places that don't understand Markdown, with formatting sensibly flattened.",
    enabled: true,
  },
  // --- Roadmap (UI-ready, engine not yet wired) ---
  {
    slug: "pdf-to-md",
    source: {
      label: "PDF",
      name: "PDF",
      accept: ".pdf,application/pdf",
      extensions: ["pdf"],
    },
    target: { label: "MD", name: "Markdown", mime: "text/markdown", extension: "md" },
    title: "PDF to Markdown Converter",
    metaTitle: "PDF to Markdown Converter — MarkPress",
    description: "Extract structured Markdown from PDF documents while preserving headings and lists.",
    benefit: "Get editable, version-controllable text back out of static PDF files.",
    enabled: false,
  },
];

export function getFormatPair(slug: string): FormatPair | undefined {
  return FORMAT_PAIRS.find((p) => p.slug === slug);
}

export const DEFAULT_PAIR = FORMAT_PAIRS[0];

// Enabled pairs other than the given slug — used for cross-linking converters.
export function otherEnabledPairs(slug: string): FormatPair[] {
  return FORMAT_PAIRS.filter((p) => p.enabled && p.slug !== slug);
}
