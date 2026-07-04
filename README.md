# PDFtoolsmd.com

File conversion infrastructure. This MVP ships a **real** Markdown → PDF converter
(actual file in, real downloadable PDF out) inside a reusable SaaS shell.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind v4 · markdown-it +
highlight.js + Puppeteer (Chromium) for the conversion engine.

## Run

```bash
npm install        # installs deps + downloads Chromium for Puppeteer
npm run dev        # http://localhost:3000
```

## Routes

| Route                | Purpose                                                        |
| -------------------- | -------------------------------------------------------------- |
| `/`                  | Markdown → PDF converter landing (renders `DEFAULT_PAIR`)      |
| `/tools/[slug]`      | Config-driven converter page for any format pair               |
| `/pricing`           | Pricing (lightweight stub — full page is "later" scope)        |
| `/security`          | Security & trust (lightweight stub)                            |
| `POST /api/convert`  | Upload a file → returns a `ConversionTask` JSON                |
| `GET  /api/download/[id]` | Streams the finished PDF for a task                       |

## Component tree

```
app/layout.tsx            → Header + <main> + Footer (shared shell, dark-mode guard)
components/
  Header.tsx              → logo, nav (Tools/API/Pricing), auth actions, ThemeToggle
  Footer.tsx              → 4-column footer (Company/Resources/Legal/Contact)
  Logo.tsx                → PDFtoolsmd.com wordmark + glyph
  ThemeToggle.tsx         → class-based dark mode, persisted to localStorage
  ConverterPage.tsx       → reusable landing template (hero + widget + steps + API)
  ConverterWidget.tsx     → the converter: queue, drag/drop, all 6 states
  StatusBadge.tsx         → Ready / Queued / Processing / Finished / Failed
lib/
  formats.ts              → FormatPair config (add new converter pages here)
  markdown.ts             → markdown-it render + print-CSS HTML document
  pdf.ts                  → Puppeteer HTML → PDF (singleton browser)
  tasks.ts                → in-memory ConversionTask store (10-min TTL)
  format.ts               → byte formatter
```

## Conversion flow

1. Widget POSTs the file to `/api/convert` (multipart).
2. Server validates (type/size/empty), creates a `ConversionTask`, renders the
   Markdown to a styled HTML document, and prints it to PDF with Puppeteer.
3. Response is the public task view including a `downloadUrl`.
4. Widget renders the finished row with a Download button → `GET /api/download/[id]`.

Outputs live in memory for 10 minutes, then are swept. Swap `lib/tasks.ts` for a
DB + object store and `lib/pdf.ts` for a queue/worker to productionize.

## File size limits & upload flow

Uploads are capped at **25 MB**. Large files work because the source never passes
through the serverless function (which has a hard **4.5 MB** request-body limit):

1. The browser calls `upload()` (`@vercel/blob/client`) → `/api/upload` mints a
   short-lived client token → the file uploads **directly to Vercel Blob**.
2. The client POSTs `/api/convert` with just the blob URL (a tiny JSON body).
3. `/api/convert` fetches the file from Blob, renders the PDF, writes the PDF back
   to Blob, records the URLs + metadata in Neon, and deletes the source blob.
4. `/api/download/[id]` looks up the output URL in Neon and **redirects** to the
   public Blob URL — so even large PDFs never stream back through the function.

Storage: **Vercel Blob** for file bytes (source + output), **Neon** for task
metadata and the blob URLs. Raise `MAX_UPLOAD_BYTES` in `lib/limits.ts` to go
higher (Vercel Blob itself supports multi-GB objects).

## Converters

Every converter is config-driven (`lib/formats.ts`) and dispatched by target in
`lib/convert.ts`. Live tools:

| Route | Output | Engine |
|-------|--------|--------|
| `/` and `/tools/md-to-pdf` | PDF | Chromium (puppeteer / @sparticuz) |
| `/tools/md-to-word` | Word `.docx` | @turbodocx/html-to-docx |
| `/tools/md-to-excel` | Excel `.xlsx` | SheetJS (one sheet per Markdown table) |
| `/tools/md-to-powerpoint` | PowerPoint `.pptx` | pptxgenjs (one slide per heading) |
| `/tools/md-to-html` | HTML | markdown-it |
| `/tools/md-to-text` | Plain text | markdown-it strip |

The office formats are pure JS (no Chromium), so they render fast and handle
large files without the PDF path's memory/time constraints.

## Upgrading to Vercel Pro (bigger PDFs)

The PDF engine is bounded by the Hobby plan (60s / 2048 MB). Once on Pro, two edits
unlock much larger PDF conversions — no code changes elsewhere:

1. `vercel.json` → `functions["app/api/convert/route.ts"].memory`: `2048` → `3009`
   and `maxDuration`: `60` → `300`.
2. `app/api/convert/route.ts` → `export const maxDuration = 300`.

Then redeploy. (DOCX/XLSX/PPTX/HTML/TXT already handle large files on any plan.)

## Widget states

Empty (dropzone) · Uploaded/Ready (file row + chips) · Processing (spinner) ·
Finished (result row + download) · Failed (error + retry). Multiple files queue
and convert together via "Add more files".

## Adding a new format pair

Add an entry to `FORMAT_PAIRS` in `lib/formats.ts`. Set `enabled: false` to show a
"coming soon" state, or wire an engine and flip it on. The page renders itself at
`/tools/<slug>` — no new component needed.
