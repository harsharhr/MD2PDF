// Tool definitions for PDF manipulation tools.
// Unlike format conversion pairs (lib/formats.ts), these tools operate ON a PDF
// (or produce one from images). They run client-side via pdf-lib — no server round-trip.

export type ToolCategory =
  | "organize"
  | "optimize"
  | "convert-to-pdf"
  | "convert-from-pdf"
  | "security"
  | "edit";

export interface ToolDef {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  icon: string; // emoji for now, can be swapped for SVG later
  category: ToolCategory;
  accept: string; // file input accept attribute
  multiple: boolean; // whether the tool accepts multiple files
  enabled: boolean;
  /** If true, this tool uses the existing server-side conversion pipeline */
  usesServerConversion?: boolean;
  /** If server-side, the source extension for the conversion */
  sourceExt?: string;
  /** If server-side, the target extension for the conversion */
  targetExt?: string;
}

export const TOOL_CATEGORIES: Record<ToolCategory, { label: string; color: string }> = {
  organize: { label: "Organize", color: "#4f46e5" },
  optimize: { label: "Optimize", color: "#0891b2" },
  "convert-to-pdf": { label: "Convert to PDF", color: "#c2185b" },
  "convert-from-pdf": { label: "Convert from PDF", color: "#e65100" },
  security: { label: "Security", color: "#6d28d9" },
  edit: { label: "Edit & Annotate", color: "#0d9488" },
};

export const TOOLS: ToolDef[] = [
  // --- Organize ---
  {
    slug: "merge-pdf",
    name: "Merge PDF",
    tagline: "Combine PDFs in the order you want with the easiest PDF merger available.",
    description: "Select multiple PDF files and combine them into a single document. Drag to reorder before merging.",
    icon: "📑",
    category: "organize",
    accept: ".pdf,application/pdf",
    multiple: true,
    enabled: true,
  },
  {
    slug: "split-pdf",
    name: "Split PDF",
    tagline: "Separate one page or a whole set for easy conversion into independent PDF files.",
    description: "Extract specific pages or split a PDF into individual page files.",
    icon: "✂️",
    category: "organize",
    accept: ".pdf,application/pdf",
    multiple: false,
    enabled: true,
  },
  {
    slug: "rotate-pdf",
    name: "Rotate PDF",
    tagline: "Rotate your PDFs the way you need them. You can even rotate multiple PDFs at once!",
    description: "Rotate pages 90°, 180° or 270° clockwise. Apply to single pages or the whole document.",
    icon: "🔄",
    category: "organize",
    accept: ".pdf,application/pdf",
    multiple: false,
    enabled: true,
  },
  {
    slug: "organize-pdf",
    name: "Organize PDF",
    tagline: "Sort pages of your PDF file however you like. Delete or add pages at your convenience.",
    description: "Reorder, delete, or duplicate pages in your PDF by dragging thumbnails.",
    icon: "📋",
    category: "organize",
    accept: ".pdf,application/pdf",
    multiple: false,
    enabled: true,
  },
  {
    slug: "crop-pdf",
    name: "Crop PDF",
    tagline: "Crop margins or select specific areas, then apply changes to one page or the whole document.",
    description: "Adjust the visible area of PDF pages by modifying crop boxes.",
    icon: "✏️",
    category: "organize",
    accept: ".pdf,application/pdf",
    multiple: false,
    enabled: true,
  },
  {
    slug: "page-numbers",
    name: "Page Numbers",
    tagline: "Add page numbers into PDFs with ease. Choose position, dimensions, and typography.",
    description: "Stamp page numbers on every page with customizable position, font size, and format.",
    icon: "🔢",
    category: "organize",
    accept: ".pdf,application/pdf",
    multiple: false,
    enabled: true,
  },

  // --- Optimize ---
  {
    slug: "compress-pdf",
    name: "Compress PDF",
    tagline: "Reduce file size while optimizing for maximal PDF quality.",
    description: "Strip metadata, remove duplicate objects, and optimize the PDF structure to reduce file size.",
    icon: "📦",
    category: "optimize",
    accept: ".pdf,application/pdf",
    multiple: false,
    enabled: true,
  },
  {
    slug: "repair-pdf",
    name: "Repair PDF",
    tagline: "Repair a damaged PDF and recover data from corrupt PDF.",
    description: "Re-parse and re-serialize the PDF to fix common structural corruption issues.",
    icon: "🔧",
    category: "optimize",
    accept: ".pdf,application/pdf",
    multiple: false,
    enabled: true,
  },

  // --- Convert to PDF ---
  {
    slug: "word-to-pdf",
    name: "Word to PDF",
    tagline: "Make DOC and DOCX files easy to read by converting them to PDF.",
    description: "Convert Word documents to clean, print-ready PDF files.",
    icon: "📝",
    category: "convert-to-pdf",
    accept: ".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    multiple: false,
    enabled: true,
    usesServerConversion: true,
    sourceExt: "docx",
    targetExt: "pdf",
  },
  {
    slug: "powerpoint-to-pdf",
    name: "PowerPoint to PDF",
    tagline: "Make PPT and PPTX slideshows easy to view by converting them to PDF.",
    description: "Convert PowerPoint presentations to PDF format.",
    icon: "📊",
    category: "convert-to-pdf",
    accept: ".pptx,application/vnd.openxmlformats-officedocument.presentationml.presentation",
    multiple: false,
    enabled: true,
    usesServerConversion: true,
    sourceExt: "pptx",
    targetExt: "pdf",
  },
  {
    slug: "excel-to-pdf",
    name: "Excel to PDF",
    tagline: "Make EXCEL spreadsheets easy to read by converting them to PDF.",
    description: "Convert Excel spreadsheets to PDF documents.",
    icon: "📊",
    category: "convert-to-pdf",
    accept: ".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    multiple: false,
    enabled: true,
    usesServerConversion: true,
    sourceExt: "xlsx",
    targetExt: "pdf",
  },
  {
    slug: "jpg-to-pdf",
    name: "JPG to PDF",
    tagline: "Convert JPG images to PDF in seconds. Easily adjust orientation and margins.",
    description: "Embed one or more JPG/PNG images into a PDF document.",
    icon: "🖼️",
    category: "convert-to-pdf",
    accept: ".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp",
    multiple: true,
    enabled: true,
  },
  {
    slug: "html-to-pdf",
    name: "HTML to PDF",
    tagline: "Convert webpages in HTML to PDF. Copy and paste the URL of the page you want.",
    description: "Render HTML content as a PDF document.",
    icon: "🌐",
    category: "convert-to-pdf",
    accept: ".html,.htm,text/html",
    multiple: false,
    enabled: true,
  },
  {
    slug: "md-to-pdf",
    name: "Markdown to PDF",
    tagline: "Turn Markdown files into clean, print-ready PDF documents.",
    description: "Convert Markdown with full support for tables, code blocks, and headings.",
    icon: "📄",
    category: "convert-to-pdf",
    accept: ".md,.markdown,.mdown,.mkd,text/markdown",
    multiple: false,
    enabled: true,
    usesServerConversion: true,
    sourceExt: "md",
    targetExt: "pdf",
  },

  // --- Convert from PDF ---
  {
    slug: "pdf-to-word",
    name: "PDF to Word",
    tagline: "Easily convert your PDF files into easy to edit DOC and DOCX documents.",
    description: "Extract text from PDFs into editable Word documents.",
    icon: "📝",
    category: "convert-from-pdf",
    accept: ".pdf,application/pdf",
    multiple: false,
    enabled: true,
    usesServerConversion: true,
    sourceExt: "pdf",
    targetExt: "docx",
  },
  {
    slug: "pdf-to-powerpoint",
    name: "PDF to PowerPoint",
    tagline: "Turn your PDF files into easy to edit PPT and PPTX slideshows.",
    description: "Convert PDF content into PowerPoint presentations.",
    icon: "📊",
    category: "convert-from-pdf",
    accept: ".pdf,application/pdf",
    multiple: false,
    enabled: true,
    usesServerConversion: true,
    sourceExt: "pdf",
    targetExt: "pptx",
  },
  {
    slug: "pdf-to-excel",
    name: "PDF to Excel",
    tagline: "Pull data straight from PDFs into Excel spreadsheets in a few short seconds.",
    description: "Extract text and tables from PDF into Excel spreadsheets.",
    icon: "📊",
    category: "convert-from-pdf",
    accept: ".pdf,application/pdf",
    multiple: false,
    enabled: true,
    usesServerConversion: true,
    sourceExt: "pdf",
    targetExt: "xlsx",
  },
  {
    slug: "pdf-to-jpg",
    name: "PDF to JPG",
    tagline: "Convert each PDF page into a JPG or extract all images contained in a PDF.",
    description: "Render each page of a PDF as a high-quality JPG image.",
    icon: "🖼️",
    category: "convert-from-pdf",
    accept: ".pdf,application/pdf",
    multiple: false,
    enabled: true,
  },

  // --- Security ---
  {
    slug: "protect-pdf",
    name: "Protect PDF",
    tagline: "Protect PDF files with a password. Encrypt PDF documents to prevent unauthorized access.",
    description: "Add password encryption to your PDF files for security.",
    icon: "🔒",
    category: "security",
    accept: ".pdf,application/pdf",
    multiple: false,
    enabled: true,
  },
  {
    slug: "unlock-pdf",
    name: "Unlock PDF",
    tagline: "Remove PDF password security, giving you the freedom to use your PDFs as you want.",
    description: "Remove password protection from PDF files.",
    icon: "🔓",
    category: "security",
    accept: ".pdf,application/pdf",
    multiple: false,
    enabled: true,
  },
  {
    slug: "sign-pdf",
    name: "Sign PDF",
    tagline: "Sign yourself or request electronic signatures from others.",
    description: "Draw, type, or upload your signature and place it on any page.",
    icon: "✍️",
    category: "security",
    accept: ".pdf,application/pdf",
    multiple: false,
    enabled: true,
  },
  {
    slug: "redact-pdf",
    name: "Redact PDF",
    tagline: "Redact text and graphics to permanently remove sensitive information from a PDF.",
    description: "Black out sensitive content permanently so it cannot be recovered.",
    icon: "🖤",
    category: "security",
    accept: ".pdf,application/pdf",
    multiple: false,
    enabled: true,
  },

  // --- Edit & Annotate ---
  {
    slug: "edit-pdf",
    name: "Edit PDF",
    tagline: "Add text, images, shapes or freehand annotations to a PDF document.",
    description: "Add text, images, and shapes to your PDF. Change font size, color, and position.",
    icon: "✏️",
    category: "edit",
    accept: ".pdf,application/pdf",
    multiple: false,
    enabled: true,
  },
  {
    slug: "watermark-pdf",
    name: "Watermark",
    tagline: "Stamp an image or text over your PDF in seconds.",
    description: "Add a text or image watermark to every page with customizable transparency and position.",
    icon: "💧",
    category: "edit",
    accept: ".pdf,application/pdf",
    multiple: false,
    enabled: true,
  },
  {
    slug: "compare-pdf",
    name: "Compare PDF",
    tagline: "Show a side-by-side document comparison and easily spot changes between file versions.",
    description: "Upload two PDFs and see a text-diff highlighting additions, deletions, and changes.",
    icon: "🔍",
    category: "edit",
    accept: ".pdf,application/pdf",
    multiple: true,
    enabled: true,
  },
  {
    slug: "ocr-pdf",
    name: "OCR PDF",
    tagline: "Easily convert scanned PDF into searchable and selectable documents.",
    description: "Run optical character recognition to make scanned PDFs searchable.",
    icon: "👁️",
    category: "edit",
    accept: ".pdf,application/pdf",
    multiple: false,
    enabled: true,
  },
];

export function getToolDef(slug: string): ToolDef | undefined {
  return TOOLS.find((t) => t.slug === slug);
}

export function getToolsByCategory(category: ToolCategory): ToolDef[] {
  return TOOLS.filter((t) => t.category === category && t.enabled);
}

export function getAllEnabledTools(): ToolDef[] {
  return TOOLS.filter((t) => t.enabled);
}
