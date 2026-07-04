import type { FormatPair } from "@/lib/formats";
import ConverterWidget from "./ConverterWidget";

// Reusable landing template. Every format-pair page renders through this — only
// the `pair` config changes, so new pages (PDF→DOCX, etc.) are near-free.
export default function ConverterPage({ pair }: { pair: FormatPair }) {
  return (
    <div className="mx-auto max-w-[1180px] px-5">
      {/* Hero */}
      <section className="pt-14 pb-8 text-center sm:pt-20">
        <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-ink-2">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          {pair.source.name} → {pair.target.name}
        </div>
        <h1 className="mx-auto max-w-2xl text-balance text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
          {pair.title}
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-pretty text-[15px] leading-relaxed text-ink-2 sm:text-base">
          {pair.description}
        </p>
        <p className="mx-auto mt-1.5 max-w-xl text-pretty text-sm text-ink-3">
          {pair.benefit}
        </p>
      </section>

      {/* Converter widget */}
      <section className="mx-auto max-w-2xl pb-4">
        <ConverterWidget pair={pair} />
      </section>

      {/* Trust strip */}
      <section className="mx-auto flex max-w-2xl flex-wrap items-center justify-center gap-x-6 gap-y-2 pb-10 pt-4 text-xs text-ink-3">
        <span className="inline-flex items-center gap-1.5">
          <Dot /> Files deleted after conversion
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Dot /> Encrypted transfer
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Dot /> No account required
        </span>
      </section>

      {/* How it works */}
      <section className="border-t border-border pt-14">
        <div className="grid gap-8 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <div key={s.title}>
              <div className="mb-3 grid h-8 w-8 place-items-center rounded-lg bg-surface-2 text-sm font-semibold text-accent">
                {i + 1}
              </div>
              <h3 className="text-[15px] font-semibold text-ink">{s.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-2">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* API note anchor */}
      <section id="api" className="mt-16 rounded-2xl border border-border bg-surface p-8 sm:p-10">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div className="max-w-lg">
            <h2 className="text-xl font-semibold tracking-tight text-ink">Convert at scale via API</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-2">
              The same conversion engine is available as a REST endpoint. Submit a file, poll the
              task, and download the result — built for pipelines and batch jobs.
            </p>
          </div>
          <pre className="w-full max-w-sm overflow-x-auto rounded-lg border border-border bg-bg p-4 text-xs leading-relaxed text-ink-2">
            <code>{`POST /api/convert
  file: report.md

→ { "status": "finished",
    "downloadUrl": "/api/download/…" }`}</code>
          </pre>
        </div>
      </section>
    </div>
  );
}

const STEPS = [
  {
    title: "Upload your file",
    body: "Drag and drop or select a Markdown file. Nothing leaves your browser until you convert.",
  },
  {
    title: "We render and typeset",
    body: "Tables, code blocks, and headings are laid out with print-quality margins and page breaks.",
  },
  {
    title: "Download the PDF",
    body: "Grab a polished, self-contained PDF. The source and output are deleted shortly after.",
  },
];

function Dot() {
  return <span className="h-1 w-1 rounded-full bg-ink-3" />;
}
