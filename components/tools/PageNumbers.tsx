"use client";

import { useCallback, useRef, useState } from "react";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

type Pos = "bottom-center" | "bottom-right" | "bottom-left" | "top-center" | "top-right" | "top-left";
type Fmt = "page-x" | "x" | "x-of-y";

export default function PageNumbers() {
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const [position, setPosition] = useState<Pos>("bottom-center");
  const [fontSize, setFontSize] = useState(12);
  const [startNum, setStartNum] = useState(1);
  const [format, setFormat] = useState<Fmt>("x");

  const addFile = useCallback((f: File) => {
    setFile(f);
    setError(null);
    setDone(false);
  }, []);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f && f.type === "application/pdf") addFile(f);
    else setError("Please drop a PDF file.");
  };

  function formatText(pageIdx: number, totalPages: number): string {
    const num = startNum + pageIdx;
    if (format === "page-x") return `Page ${num}`;
    if (format === "x-of-y") return `${num} of ${totalPages + startNum - 1}`;
    return `${num}`;
  }

  async function process() {
    if (!file) return;
    setProcessing(true);
    setError(null);
    setDone(false);
    try {
      const bytes = await file.arrayBuffer();
      const pdf = await PDFDocument.load(bytes);
      const font = await pdf.embedFont(StandardFonts.Helvetica);
      const pages = pdf.getPages();
      const total = pages.length;

      for (let i = 0; i < total; i++) {
        const page = pages[i];
        const { width, height } = page.getSize();
        const label = formatText(i, total);
        const tw = font.widthOfTextAtSize(label, fontSize);
        const margin = 36;

        let x: number;
        let y: number;

        // Horizontal
        if (position.endsWith("center")) x = (width - tw) / 2;
        else if (position.endsWith("right")) x = width - tw - margin;
        else x = margin;

        // Vertical
        if (position.startsWith("bottom")) y = margin;
        else y = height - margin;

        page.drawText(label, {
          x,
          y,
          size: fontSize,
          font,
          color: rgb(0.3, 0.3, 0.3),
        });
      }

      const pdfBytes = await pdf.save();
      const blob = new Blob([pdfBytes as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name.replace(/\.pdf$/i, "") + "_numbered.pdf";
      a.click();
      URL.revokeObjectURL(url);
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add page numbers.");
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
          <p className="mt-1 text-sm text-ink-2">or choose a file to add page numbers</p>
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
                <p className="mt-0.5 text-xs text-ink-3">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
              <button
                type="button"
                onClick={() => { setFile(null); setDone(false); setError(null); }}
                aria-label="Remove file"
                className="grid h-8 w-8 place-items-center rounded-lg text-ink-3 transition-colors hover:bg-surface hover:text-err"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>
          </div>

          {/* Options */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-ink-2">Position</label>
              <select
                value={position}
                onChange={(e) => setPosition(e.target.value as Pos)}
                className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none"
              >
                <option value="bottom-center">Bottom Center</option>
                <option value="bottom-right">Bottom Right</option>
                <option value="bottom-left">Bottom Left</option>
                <option value="top-center">Top Center</option>
                <option value="top-right">Top Right</option>
                <option value="top-left">Top Left</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-ink-2">Format</label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value as Fmt)}
                className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none"
              >
                <option value="x">1, 2, 3…</option>
                <option value="page-x">Page 1, Page 2…</option>
                <option value="x-of-y">1 of N, 2 of N…</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-ink-2">Font Size</label>
              <input
                type="number"
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                min={6}
                max={72}
                className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-ink-2">Start Number</label>
              <input
                type="number"
                value={startNum}
                onChange={(e) => setStartNum(Number(e.target.value))}
                min={0}
                className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-err-soft px-3 py-2">
              <p className="text-xs text-err">{error}</p>
            </div>
          )}
          {done && (
            <div className="flex items-center gap-2 rounded-lg bg-ok-soft px-3 py-2">
              <p className="text-xs text-ok">Page numbers added — download started!</p>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={process}
              disabled={processing}
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-accent-ink transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {processing ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-accent-ink/40 border-t-accent-ink" />
                  Processing…
                </>
              ) : (
                "Add Numbers & Download"
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
