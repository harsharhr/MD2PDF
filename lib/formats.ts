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

const PDF_SOURCE = {
  label: "PDF",
  name: "PDF",
  accept: ".pdf,application/pdf",
  extensions: ["pdf"],
};

const DOCX_SOURCE = {
  label: "DOCX",
  name: "Word",
  accept: ".docx,.doc,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword",
  extensions: ["docx", "doc"],
};

const XLSX_SOURCE = {
  label: "XLSX",
  name: "Excel",
  accept: ".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel",
  extensions: ["xlsx", "xls"],
};

const PPTX_SOURCE = {
  label: "PPTX",
  name: "PowerPoint",
  accept: ".pptx,.ppt,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/vnd.ms-powerpoint",
  extensions: ["pptx", "ppt"],
};

export const FORMAT_PAIRS: FormatPair[] = [
  // --- Original Markdown Inbound ---
  {
    slug: "md-to-pdf",
    source: MD_SOURCE,
    target: { label: "PDF", name: "PDF", mime: "application/pdf", extension: "pdf" },
    title: "Markdown to PDF Converter",
    metaTitle: "Markdown to PDF Converter — PDFtoolsmd.com",
    description: "Turn Markdown files into clean, print-ready PDF documents.",
    benefit: "Keep your formatting intact and hand off a polished PDF.",
    enabled: true,
  },
  {
    slug: "md-to-word",
    source: MD_SOURCE,
    target: { label: "DOCX", name: "Word", mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", extension: "docx" },
    title: "Markdown to Word Converter",
    metaTitle: "Markdown to Word (DOCX) Converter — PDFtoolsmd.com",
    description: "Convert Markdown into an editable Word document with headings, lists, tables, and formatting preserved.",
    benefit: "Hand a teammate a .docx they can edit in Word or Google Docs.",
    enabled: true,
  },
  {
    slug: "md-to-excel",
    source: MD_SOURCE,
    target: { label: "XLSX", name: "Excel", mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", extension: "xlsx" },
    title: "Markdown to Excel Converter",
    metaTitle: "Markdown to Excel (XLSX) Converter — PDFtoolsmd.com",
    description: "Extract every table in your Markdown into an Excel workbook.",
    benefit: "Get your Markdown tables into spreadsheets without retyping a single cell.",
    enabled: true,
  },
  {
    slug: "md-to-powerpoint",
    source: MD_SOURCE,
    target: { label: "PPTX", name: "PowerPoint", mime: "application/vnd.openxmlformats-officedocument.presentationml.presentation", extension: "pptx" },
    title: "Markdown to PowerPoint Converter",
    metaTitle: "Markdown to PowerPoint (PPTX) Converter — PDFtoolsmd.com",
    description: "Turn a Markdown outline into a slide deck.",
    benefit: "Draft a deck in plain text and get an editable .pptx to polish in PowerPoint or Keynote.",
    enabled: true,
  },
  {
    slug: "md-to-html",
    source: MD_SOURCE,
    target: { label: "HTML", name: "HTML", mime: "text/html", extension: "html" },
    title: "Markdown to HTML Converter",
    metaTitle: "Markdown to HTML Converter — PDFtoolsmd.com",
    description: "Render Markdown into a clean, self-contained HTML document.",
    benefit: "Publish or embed your content anywhere with ready-to-use, styled HTML.",
    enabled: true,
  },
  {
    slug: "md-to-text",
    source: MD_SOURCE,
    target: { label: "TXT", name: "Text", mime: "text/plain", extension: "txt" },
    title: "Markdown to Text Converter",
    metaTitle: "Markdown to Plain Text Converter — PDFtoolsmd.com",
    description: "Strip Markdown syntax and get clean, readable plain text.",
    benefit: "Drop your content into places that don't understand Markdown.",
    enabled: true,
  },

  // --- PDF Inbound ---
  {
    slug: "pdf-to-md",
    source: PDF_SOURCE,
    target: { label: "MD", name: "Markdown", mime: "text/markdown", extension: "md" },
    title: "PDF to Markdown Converter",
    metaTitle: "PDF to Markdown Converter — PDFtoolsmd.com",
    description: "Extract structured Markdown from PDF documents.",
    benefit: "Get editable, version-controllable text back out of static PDF files.",
    enabled: true,
  },
  {
    slug: "pdf-to-word",
    source: PDF_SOURCE,
    target: { label: "DOCX", name: "Word", mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", extension: "docx" },
    title: "PDF to Word Converter",
    metaTitle: "PDF to Word (DOCX) Converter — PDFtoolsmd.com",
    description: "Convert PDF documents into editable Word files instantly.",
    benefit: "Quickly extract text from PDFs to edit in Word or Google Docs.",
    enabled: true,
  },
  {
    slug: "pdf-to-excel",
    source: PDF_SOURCE,
    target: { label: "XLSX", name: "Excel", mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", extension: "xlsx" },
    title: "PDF to Excel Converter",
    metaTitle: "PDF to Excel (XLSX) Converter — PDFtoolsmd.com",
    description: "Extract text and tables from your PDF directly into Excel.",
    benefit: "Move PDF data into spreadsheets.",
    enabled: true,
  },
  {
    slug: "pdf-to-powerpoint",
    source: PDF_SOURCE,
    target: { label: "PPTX", name: "PowerPoint", mime: "application/vnd.openxmlformats-officedocument.presentationml.presentation", extension: "pptx" },
    title: "PDF to PowerPoint Converter",
    metaTitle: "PDF to PowerPoint (PPTX) Converter — PDFtoolsmd.com",
    description: "Turn your PDF content into a PowerPoint presentation.",
    benefit: "Get text out of PDFs directly into slides.",
    enabled: true,
  },

  // --- Word Inbound ---
  {
    slug: "word-to-pdf",
    source: DOCX_SOURCE,
    target: { label: "PDF", name: "PDF", mime: "application/pdf", extension: "pdf" },
    title: "Word to PDF Converter",
    metaTitle: "Word to PDF Converter — PDFtoolsmd.com",
    description: "Convert Word documents to clean, print-ready PDFs.",
    benefit: "Lock your Word document formatting into a standard PDF.",
    enabled: true,
  },
  {
    slug: "word-to-md",
    source: DOCX_SOURCE,
    target: { label: "MD", name: "Markdown", mime: "text/markdown", extension: "md" },
    title: "Word to Markdown Converter",
    metaTitle: "Word to Markdown Converter — PDFtoolsmd.com",
    description: "Extract clean Markdown from Word documents.",
    benefit: "Move content from Word processors directly to Markdown systems.",
    enabled: true,
  },

  // --- Excel Inbound ---
  {
    slug: "excel-to-pdf",
    source: XLSX_SOURCE,
    target: { label: "PDF", name: "PDF", mime: "application/pdf", extension: "pdf" },
    title: "Excel to PDF Converter",
    metaTitle: "Excel to PDF Converter — PDFtoolsmd.com",
    description: "Convert Excel spreadsheets to PDF documents.",
    benefit: "Share spreadsheets securely as un-editable PDF files.",
    enabled: true,
  },

  // --- PowerPoint Inbound ---
  {
    slug: "powerpoint-to-pdf",
    source: PPTX_SOURCE,
    target: { label: "PDF", name: "PDF", mime: "application/pdf", extension: "pdf" },
    title: "PowerPoint to PDF Converter",
    metaTitle: "PowerPoint to PDF Converter — PDFtoolsmd.com",
    description: "Convert PowerPoint presentations to PDF format.",
    benefit: "Share slides easily without needing PowerPoint installed.",
    enabled: true,
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
