"use client";

import { useCallback, useRef, useState } from "react";
import { PDFDocument } from "pdf-lib";

export default function RepairPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFile = useCallback((f: File) => {
    setFile(f);
    setError(null);
    setDone(false);
    setPageCount(null);
  }, []);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) addFile(f);
    else setError("Please drop a file.");
  };

  async function process() {
    if (!file) return;
    setProcessing(true);
    setError(null);
    setDone(false);
    setPageCount(null);
    try {
      const bytes = await file.arrayBuffer();

      let pdf: PDFDocument;
      try {
        pdf = await PDFDocument.load(bytes, { ignoreEncryption: true });
      } catch (loadErr) {
        const msg = loadErr instanceof Error ? loadErr.message : String(loadErr);
        setError(
          `This PDF could not be parsed and may be severely corrupted.\n\nDetails: ${msg}`
        );
        setProcessing(false);
        return;
      }

      setPageCount(pdf.getPageCount());
      const pdfBytes = await pdf.save();

      const blob = new Blob([pdfBytes as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name.replace(/\.pdf$/i, "") + "_repaired.pdf";
      a.click();
      URL.revokeObjectURL(url);
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Repair failed.");
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
          <p className="mt-1 text-sm text-ink-2">or choose a file to attempt repair</p>
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
                onClick={() => { setFile(null); setDone(false); setError(null); setPageCount(null); }}
                aria-label="Remove file"
                className="grid h-8 w-8 place-items-center rounded-lg text-ink-3 transition-colors hover:bg-surface hover:text-err"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>
          </div>

          {error && (
            <div className="rounded-lg bg-err-soft px-3 py-2">
              <p className="text-xs text-err whitespace-pre-wrap">{error}</p>
            </div>
          )}
          {done && (
            <div className="rounded-lg bg-ok-soft px-3 py-2">
              <p className="text-xs text-ok">
                PDF repaired successfully{pageCount !== null ? ` (${pageCount} pages)` : ""} — download started!
              </p>
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
                  Repairing…
                </>
              ) : (
                "Repair & Download"
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
