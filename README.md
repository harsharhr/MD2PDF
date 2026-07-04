# MarkPress

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
  Logo.tsx                → MarkPress wordmark + glyph
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

## Widget states

Empty (dropzone) · Uploaded/Ready (file row + chips) · Processing (spinner) ·
Finished (result row + download) · Failed (error + retry). Multiple files queue
and convert together via "Add more files".

## Adding a new format pair

Add an entry to `FORMAT_PAIRS` in `lib/formats.ts`. Set `enabled: false` to show a
"coming soon" state, or wire an engine and flip it on. The page renders itself at
`/tools/<slug>` — no new component needed.
