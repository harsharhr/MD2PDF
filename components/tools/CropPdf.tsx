"use client";

import { useCallback, useRef, useState } from "react";
import { PDFDocument } from "pdf-lib";

type ApplyMode = "all" | "specific";

export default function CropPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const [top, setTop] = useState(0);
  const [bottom, setBottom] = useState(0);
  const [left, setLeft] = useState(0);
  const [right, setRight] = useState(0);
  const [mode, setMode] = useState<ApplyMode>("all");
  const [pageRange, setPageRange] = useState(""); // e.g. "1,3,5-7"

  const addFile = useCallback(async (f: File) => {
    setFile(f);
    setError(null);
    setDone(false);
    try {
      const bytes = await f.arrayBuffer();
      const pdf = await PDFDocument.load(bytes);
      setTotalPages(pdf.getPageCount());
    } catch {
      setTotalPages(0);
    }
  }, []);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f && f.type === "application/pdf") addFile(f);
    else setError("Please drop a PDF file.");
  };

  function parsePageRange(range: string, total: number): Set<number> {
    const indices = new Set<number>();
    const parts = range.split(",").map((s) => s.trim()).filter(Boolean);
    for (const part of parts) {
      if (part.includes("-")) {
        const [a, b] = part.split("-").map(Number);
        if (!isNaN(a) && !isNaN(b)) {
          for (let i = Math.max(1, a); i <= Math.min(total, b); i++) {
            indices.add(i - 1); // zero-based
          }
        }
      } else {
        const n = Number(part);
        if (!isNaN(n) && n >= 1 && n <= total) indices.add(n - 1);
      }
    }
    return indices;
  }

  async function process() {
    if (!file) return;
    setProcessing(true);
    setError(null);
    setDone(false);
    try {
      const bytes = await file.arrayBuffer();
      const pdf = await PDFDocument.load(bytes);
      const pages = pdf.getPages();

      let targetPages: Set<number>;
      if (mode === "all") {
        targetPages = new Set(pages.map((_, i) => i));
      } else {
        if (!pageRange.trim()) {
          setError("Please specify which pages to crop (e.g. 1,3,5-7).");
          setProcessing(false);
          return;
        }
        targetPages = parsePageRange(pageRange, pages.length);
        if (targetPages.size === 0) {
          setError("No valid pages found in the specified range.");
          setProcessing(false);
          return;
        }
      }

      for (const idx of targetPages) {
        const page = pages[idx];
        const { width, height } = page.getSize();
        page.setCropBox(
          left,
          bottom,
          width - left - right,
          height - top - bottom
        );
      }

      const pdfBytes = await pdf.save();
      const blob = new Blob([pdfBytes as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name.replace(/\.pdf$/i, "") + "_cropped.pdf";
      a.click();
      URL.revokeObjectURL(url);
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to crop PDF.");
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-3 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-12px_rgba(0,0,0,0.12)] sm:p-4">
      {!file ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-14 text-center transition-colors ${
            dragOver ? "border-accent bg-accent-soft/40" : "border-border-strong bg-surface-2/40"
          }`}
        >
          <div className="mb-4 grid h-12 w-12 place-items-center rounded-full bg-surface text-accent shadow-sm">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 16V4M7 9l5-5 5 5" />
              <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
            </svg>
          </div>
          <p className="text-[15px] font-medium text-ink">Drop your PDF file here</p>
          <p className="mt-1 text-sm text-ink-2">or choose a file to crop pages</p>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="mt-5 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-accent-ink transition-opacity hover:opacity-90"
          >
            Select PDF
          </button>
          <p className="mt-4 text-xs text-ink-3">Accepts .pdf · processed entirely in your browser</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* File row */}
          <div className="rounded-xl border border-border bg-surface-2/50 p-3 sm:p-3.5">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-surface text-ink-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 3.5h8l4 4V20a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1z" />
                  <path d="M13.5 3.5V8h4" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink">{file.name}</p>
                <p className="mt-0.5 text-xs text-ink-3">
                  {(file.size / 1024).toFixed(1)} KB · {totalPages} page{totalPages !== 1 ? "s" : ""}
                </p>
              </div>
              <button
                type="button"
                onClick={() => { setFile(null); setDone(false); setError(null); setTotalPages(0); }}
                aria-label="Remove file"
                className="grid h-8 w-8 place-items-center rounded-lg text-ink-3 transition-colors hover:bg-surface hover:text-err"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>
          </div>

          {/* Crop margins */}
          <div>
            <p className="mb-2 text-sm font-medium text-ink">Crop Margins (points)</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {([
                ["Top", top, setTop],
                ["Bottom", bottom, setBottom],
                ["Left", left, setLeft],
                ["Right", right, setRight],
              ] as const).map(([label, val, setter]) => (
                <div key={label}>
                  <label className="mb-1 block text-xs text-ink-3">{label}</label>
                  <input
                    type="number"
                    min={0}
                    value={val}
                    onChange={(e) => setter(Number(e.target.value))}
                    className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Apply mode */}
          <div>
            <p className="mb-2 text-sm font-medium text-ink">Apply To</p>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm text-ink-2 cursor-pointer">
                <input
                  type="radio"
                  name="cropMode"
                  checked={mode === "all"}
                  onChange={() => setMode("all")}
                  className="accent-accent"
                />
                All pages
              </label>
              <label className="flex items-center gap-2 text-sm text-ink-2 cursor-pointer">
                <input
                  type="radio"
                  name="cropMode"
                  checked={mode === "specific"}
                  onChange={() => setMode("specific")}
                  className="accent-accent"
                />
                Specific pages
              </label>
            </div>
            {mode === "specific" && (
              <input
                type="text"
                value={pageRange}
                onChange={(e) => setPageRange(e.target.value)}
                placeholder="e.g. 1,3,5-7"
                className="mt-2 w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-ink placeholder:text-ink-3 focus:border-accent focus:outline-none sm:w-60"
              />
            )}
          </div>

          {error && (
            <div className="rounded-lg bg-err-soft px-3 py-2">
              <p className="text-xs text-err">{error}</p>
            </div>
          )}
          {done && (
            <div className="rounded-lg bg-ok-soft px-3 py-2">
              <p className="text-xs text-ok">PDF cropped — download started!</p>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={process}
              disabled={processing || (top === 0 && bottom === 0 && left === 0 && right === 0)}
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-accent-ink transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {processing ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-accent-ink/40 border-t-accent-ink" />
                  Cropping…
                </>
              ) : (
                "Crop & Download"
              )}
            </button>
          </div>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept=".pdf,application/pdf"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) addFile(f);
          e.target.value = "";
        }}
      />
    </div>
  );
}
