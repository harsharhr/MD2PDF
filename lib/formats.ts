// Config-driven format pairs. Each converter landing page is rendered from one
// of these entries, so adding "PDF to DOCX" etc. later is just a new object.

export type FormatPair = {
  slug: string; // e.g. "md-to-pdf" — used for the route
  source: {
    label: string; // chip label, e.g. "MD"
    name: string; // full name, e.g. "Markdown"
    accept: string; // input accept attribute
    extensions: string[];
  };
  target: {
    label: string; // chip label, e.g. "PDF"
    name: string; // full name, e.g. "PDF"
    mime: string;
    extension: string;
  };
  title: string; // H1
  metaTitle: string; // <title>
  description: string; // one concise sentence
  benefit: string; // one practical benefit sentence
  enabled: boolean; // only md-to-pdf has a real engine wired today
};

export const FORMAT_PAIRS: FormatPair[] = [
  {
    slug: "md-to-pdf",
    source: {
      label: "MD",
      name: "Markdown",
      accept: ".md,.markdown,.mdown,.mkd,text/markdown",
      extensions: ["md", "markdown", "mdown", "mkd", "txt"],
    },
    target: {
      label: "PDF",
      name: "PDF",
      mime: "application/pdf",
      extension: "pdf",
    },
    title: "Markdown to PDF Converter",
    metaTitle: "Markdown to PDF Converter — MarkPress",
    description:
      "Turn Markdown files into clean, print-ready PDF documents with full support for tables, code blocks, and headings.",
    benefit:
      "Keep your formatting intact and hand off a polished PDF without opening a single editor.",
    enabled: true,
  },
  // --- Future pairs (UI-ready, engine not yet wired) ---
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
  {
    slug: "docx-to-pdf",
    source: {
      label: "DOCX",
      name: "Word",
      accept: ".docx",
      extensions: ["docx"],
    },
    target: { label: "PDF", name: "PDF", mime: "application/pdf", extension: "pdf" },
    title: "Word to PDF Converter",
    metaTitle: "Word to PDF Converter — MarkPress",
    description: "Convert Word documents to PDF with layout and typography preserved.",
    benefit: "Share a fixed, tamper-resistant version of any Word document.",
    enabled: false,
  },
];

export function getFormatPair(slug: string): FormatPair | undefined {
  return FORMAT_PAIRS.find((p) => p.slug === slug);
}

export const DEFAULT_PAIR = FORMAT_PAIRS[0];
