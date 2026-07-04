"use client";

import { useCallback, useRef, useState } from "react";
import { PDFDocument, degrees } from "pdf-lib";
import { formatBytes } from "@/lib/format";

const ANGLES = [90, 180, 270] as const;
type Angle = (typeof ANGLES)[number];

export default function RotatePdf() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [angle, setAngle] = useState<Angle>(90);
  const [applyTo, setApplyTo] = useState<"all" | "specific">("all");
  const [pageInput, setPageInput] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const loadFile = useCallback(async (f: File) => {
    setError(null);
    setDone(false);
    try {
      const bytes = await f.arrayBuffer();
      const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
      setPageCount(doc.getPageCount());
      setFile(f);
      setPageInput("");
    } catch {
      setError("Could not read this PDF. It may be corrupted.");
    }
  }, []);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) loadFile(f);
  };

  /** Parse page-range string into zero-based indices */
  function parsePages(input: string, total: number): number[] {
    const indices = new Set<number>();
    const parts = input.split(",").map((s) => s.trim()).filter(Boolean);
    for (const part of parts) {
      const rangeMatch = part.match(/^(\d+)\s*-\s*(\d+)$/);
      if (rangeMatch) {
        const s = parseInt(rangeMatch[1], 10);
        const e = parseInt(rangeMatch[2], 10);
        if (s < 1 || e > total || s > e) throw new Error(`Invalid range "${part}".`);
        for (let i = s; i <= e; i++) indices.add(i - 1);
      } else {
        const n = parseInt(part, 10);
        if (isNaN(n) || n < 1 || n > total) throw new Error(`Invalid page "${part}".`);
        indices.add(n - 1);
      }
    }
    return Array.from(indices);
  }

  const rotate = async () => {
    if (!file) return;
    setProcessing(true);
    setError(null);
    setDone(false);
    try {
      const bytes = await file.arrayBuffer();
      const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
      const pages = doc.getPages();
      let targetIndices: number[];

      if (applyTo === "all") {
        targetIndices = pages.map((_, i) => i);
      } else {
        if (!pageInput.trim()) throw new Error("Enter pages to rotate.");
        targetIndices = parsePages(pageInput, pageCount);
        if (targetIndices.length === 0) throw new Error("No valid pages selected.");
      }

      for (const idx of targetIndices) {
        const page = pages[idx];
        const current = page.getRotation().angle;
        page.setRotation(degrees((current + angle) % 360));
      }

      const pdfBytes = await doc.save();
      const blob = new Blob([pdfBytes as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const baseName = file.name.replace(/\.pdf$/i, "");
      a.download = `${baseName}_rotated.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Rotation failed.");
    } finally {
      setProcessing(false);
    }
  };

  const reset = () => {
    setFile(null);
    setPageCount(0);
    setPageInput("");
    setError(null);
    setDone(false);
  };

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
          <p className="mt-1 text-sm text-ink-2">or choose a file to rotate</p>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="mt-5 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-accent-ink transition-opacity hover:opacity-90"
          >
            Select PDF
          </button>
          <p className="mt-4 text-xs text-ink-3">Accepts .pdf</p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* File info */}
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
                  {formatBytes(file.size)} · {pageCount} page{pageCount !== 1 ? "s" : ""}
                </p>
              </div>
              <button type="button" onClick={reset} aria-label="Remove file" className="grid h-8 w-8 place-items-center rounded-lg text-ink-3 transition-colors hover:bg-surface hover:text-err">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>
          </div>

          {/* Angle selector */}
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Rotation angle</label>
            <div className="flex gap-2">
              {ANGLES.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setAngle(a)}
                  className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                    angle === a
                      ? "border-accent bg-accent-soft text-accent"
                      : "border-border bg-surface text-ink-2 hover:bg-surface-2"
                  }`}
                >
                  {a}°
                </button>
              ))}
            </div>
          </div>

          {/* Apply-to selector */}
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Apply to</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setApplyTo("all")}
                className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                  applyTo === "all"
                    ? "border-accent bg-accent-soft text-accent"
                    : "border-border bg-surface text-ink-2 hover:bg-surface-2"
                }`}
              >
                All pages
              </button>
              <button
                type="button"
                onClick={() => setApplyTo("specific")}
                className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                  applyTo === "specific"
                    ? "border-accent bg-accent-soft text-accent"
                    : "border-border bg-surface text-ink-2 hover:bg-surface-2"
                }`}
              >
                Specific pages
              </button>
            </div>
          </div>

          {/* Specific pages input */}
          {applyTo === "specific" && (
            <div>
              <input
                type="text"
                value={pageInput}
                onChange={(e) => setPageInput(e.target.value)}
                placeholder={`e.g. 1,3,5-${pageCount}`}
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-3 focus:border-accent focus:outline-none"
              />
              <p className="mt-1.5 text-xs text-ink-3">Use commas and ranges. Example: 1,3,5-8</p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-center gap-3 rounded-lg bg-err-soft px-3 py-2">
              <p className="text-xs text-err">{error}</p>
            </div>
          )}

          {/* Success */}
          {done && (
            <div className="flex items-center gap-3 rounded-lg bg-ok-soft px-3 py-2">
              <p className="text-xs text-ok">Rotated PDF downloaded successfully!</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap items-center justify-end gap-3 pt-1">
            <button type="button" onClick={reset} className="rounded-lg px-3 py-2 text-sm font-medium text-ink-3 transition-colors hover:text-ink">
              Start over
            </button>
            <button
              type="button"
              onClick={rotate}
              disabled={processing || (applyTo === "specific" && !pageInput.trim())}
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-accent-ink transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {processing ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-accent-ink/40 border-t-accent-ink" />
                  Rotating…
                </>
              ) : (
                <>Rotate PDF</>
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
          if (f) loadFile(f);
          e.target.value = "";
        }}
      />
    </div>
  );
}
