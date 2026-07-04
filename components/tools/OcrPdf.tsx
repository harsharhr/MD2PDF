"use client";

import { useCallback, useRef, useState } from "react";
import { formatBytes } from "@/lib/format";

export default function OcrPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFile = useCallback((incoming: FileList | File[]) => {
    const pdfs = Array.from(incoming).filter(
      (f) => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf")
    );
    if (pdfs.length > 0) {
      setFile(pdfs[0]);
      setDone(false);
    }
  }, []);

  const clearAll = () => {
    setFile(null);
    setDone(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files?.length) addFile(e.dataTransfer.files);
  };

  const [progress, setProgress] = useState(0);
  const [ocrText, setOcrText] = useState("");

  const processFile = async () => {
    if (!file) return;
    setProcessing(true);
    setProgress(0);
    setOcrText("");

    try {
      // Dynamically import to avoid Next.js SSR DOMMatrix errors
      const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
      const page = await pdf.getPage(1); // OCR first page for now

      const viewport = page.getViewport({ scale: 2.0 }); // high res for OCR
      const canvas = document.createElement("canvas");
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      await page.render({ canvasContext: ctx, viewport } as any).promise;

      // Now run Tesseract
      const Tesseract = await import("tesseract.js");
      const result = await Tesseract.recognize(canvas, "eng", {
        logger: (m) => {
          if (m.status === "recognizing text") {
            setProgress(Math.round(m.progress * 100));
          }
        },
      });

      setOcrText(result.data.text);
      setDone(true);
    } catch (err) {
      console.error(err);
      alert("Failed to OCR the document.");
    } finally {
      setProcessing(false);
    }
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
              <path d="M4 7V4h16v3" />
              <path d="M9 20h6" />
              <path d="M12 4v16" />
            </svg>
          </div>
          <p className="text-[15px] font-medium text-ink">Drop your scanned PDF here</p>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="mt-5 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-accent-ink transition-opacity hover:opacity-90"
          >
            Select PDF
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-surface-2/50 p-3 sm:p-3.5">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-surface text-ink-3">
                 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                   <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                   <polyline points="14 2 14 8 20 8" />
                 </svg>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink">{file.name}</p>
                <p className="mt-0.5 text-xs text-ink-3">{formatBytes(file.size)}</p>
              </div>
              <button
                type="button"
                onClick={clearAll}
                className="grid h-8 w-8 place-items-center rounded-lg text-ink-3 transition-colors hover:bg-surface hover:text-err"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-border p-4 bg-surface-2/30">
            <p className="text-sm text-ink mb-2 font-medium">OCR processing settings</p>
            <p className="text-xs text-ink-2 mb-4 leading-relaxed">
              OCR processing uses Tesseract.js which will be downloaded on first use (~2MB). Processing may take a few minutes for large documents as everything happens locally in your browser.
            </p>
          </div>

          {processing && (
            <div className="flex flex-col gap-2 rounded-lg bg-accent-soft px-3 py-3 border border-accent/20">
              <p className="text-sm font-medium text-accent">Extracting text... {progress}%</p>
              <div className="h-1.5 w-full bg-accent/20 rounded-full overflow-hidden">
                <div className="h-full bg-accent transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}

          {done && ocrText && (
            <div className="flex flex-col gap-2 rounded-lg bg-surface px-4 py-4 border border-border shadow-sm">
              <p className="text-sm font-semibold text-ink">Extraction Complete (Page 1)</p>
              <textarea 
                className="w-full h-48 rounded-md border border-border p-3 text-sm text-ink bg-surface-2 focus:outline-none focus:border-accent"
                readOnly
                value={ocrText}
              />
            </div>
          )}

          <div className="flex justify-end pt-2 border-t border-border mt-4">
            <button
              type="button"
              onClick={processFile}
              disabled={processing}
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-accent-ink transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {processing ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-accent-ink/40 border-t-accent-ink" />
                  Processing...
                </>
              ) : (
                <>{done ? "Rerun OCR" : "Start OCR"}</>
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
          if (e.target.files) addFile(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
}
