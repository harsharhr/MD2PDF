"use client";

import { useCallback, useRef, useState } from "react";
import { PDFDocument } from "pdf-lib";
import { formatBytes } from "@/lib/format";

export default function CompressPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ originalSize: number; compressedSize: number; bytes: Uint8Array } | null>(null);
  const [aggressive, setAggressive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const loadFile = useCallback((f: File) => {
    setError(null);
    setResult(null);
    setFile(f);
  }, []);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) loadFile(f);
  };

  const compress = async () => {
    if (!file) return;
    setProcessing(true);
    setError(null);
    setResult(null);
    try {
      const srcBytes = await file.arrayBuffer();
      
      let pdfBytes: Uint8Array;

      if (aggressive) {
        const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");
        pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
        
        const srcPdf = await pdfjsLib.getDocument({ data: new Uint8Array(srcBytes) }).promise;
        const newDoc = await PDFDocument.create();
        
        for (let i = 1; i <= srcPdf.numPages; i++) {
          const page = await srcPdf.getPage(i);
          const viewport = page.getViewport({ scale: 1.5 });
          const canvas = document.createElement("canvas");
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const ctx = canvas.getContext("2d")!;
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          await page.render({ canvasContext: ctx, viewport } as any).promise;
          
          const blob = await new Promise<Blob | null>(r => canvas.toBlob(r, "image/jpeg", 0.6));
          if (blob) {
            const imgBuf = await blob.arrayBuffer();
            const img = await newDoc.embedJpg(imgBuf);
            const newPage = newDoc.addPage([viewport.width, viewport.height]);
            newPage.drawImage(img, {
              x: 0,
              y: 0,
              width: viewport.width,
              height: viewport.height,
            });
          }
        }
        pdfBytes = await newDoc.save({ useObjectStreams: true });
      } else {
        const srcDoc = await PDFDocument.load(srcBytes, { ignoreEncryption: true });

        // Strip metadata
        srcDoc.setTitle("");
        srcDoc.setAuthor("");
        srcDoc.setSubject("");
        srcDoc.setKeywords([]);
        srcDoc.setProducer("");
        srcDoc.setCreator("");

        // Re-serialize: pdf-lib re-builds the xref table and deduplicates indirect objects
        const newDoc = await PDFDocument.create();
        const pages = await newDoc.copyPages(srcDoc, srcDoc.getPageIndices());
        for (const page of pages) newDoc.addPage(page);

        pdfBytes = await newDoc.save({ useObjectStreams: true });
      }

      setResult({
        originalSize: file.size,
        compressedSize: pdfBytes.length,
        bytes: pdfBytes,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Compression failed.");
    } finally {
      setProcessing(false);
    }
  };

  const download = () => {
    if (!result || !file) return;
    const blob = new Blob([result.bytes as BlobPart], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const baseName = file.name.replace(/\.pdf$/i, "");
    a.download = `${baseName}_compressed.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const reset = () => {
    setFile(null);
    setResult(null);
    setError(null);
  };

  const reductionPct = result
    ? Math.max(0, Math.round(((result.originalSize - result.compressedSize) / result.originalSize) * 100))
    : 0;

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
          <p className="mt-1 text-sm text-ink-2">or choose a file to compress</p>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="mt-5 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-accent-ink transition-opacity hover:opacity-90"
          >
            Select PDF
          </button>
          <p className="mt-4 text-xs text-ink-3">Accepts .pdf · Structural optimization only</p>
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
                <p className="mt-0.5 text-xs text-ink-3">{formatBytes(file.size)}</p>
              </div>
              <button type="button" onClick={reset} aria-label="Remove file" className="grid h-8 w-8 place-items-center rounded-lg text-ink-3 transition-colors hover:bg-surface hover:text-err">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>
          </div>

          {/* Result comparison */}
          {result && (
            <div className="rounded-xl border border-border bg-surface-2/50 p-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-xs text-ink-3">Original</p>
                  <p className="mt-1 text-lg font-semibold text-ink">{formatBytes(result.originalSize)}</p>
                </div>
                <div>
                  <p className="text-xs text-ink-3">Compressed</p>
                  <p className="mt-1 text-lg font-semibold text-ink">{formatBytes(result.compressedSize)}</p>
                </div>
                <div>
                  <p className="text-xs text-ink-3">Reduction</p>
                  <p className={`mt-1 text-lg font-semibold ${reductionPct > 0 ? "text-ok" : "text-ink-3"}`}>
                    {reductionPct > 0 ? `-${reductionPct}%` : "0%"}
                  </p>
                </div>
              </div>
              {reductionPct === 0 && (
                <p className="mt-3 text-center text-xs text-ink-3">
                  This PDF is already well-optimized. Structural re-serialization did not reduce the size.
                </p>
              )}
            </div>
          )}

          {/* Options */}
          {!result && !processing && (
            <div className="rounded-xl border border-border p-4 bg-surface-2/30">
              <label className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={aggressive}
                  onChange={(e) => setAggressive(e.target.checked)}
                  className="w-4 h-4 rounded border-border text-accent focus:ring-accent"
                />
                <div>
                  <p className="text-sm font-medium text-ink">Aggressive Compression</p>
                  <p className="text-xs text-ink-2 mt-0.5">Flattens the entire PDF into images. Drastically reduces size but removes text searchability.</p>
                </div>
              </label>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-center gap-3 rounded-lg bg-err-soft px-3 py-2">
              <p className="text-xs text-err">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap items-center justify-end gap-3 pt-1">
            <button type="button" onClick={reset} className="rounded-lg px-3 py-2 text-sm font-medium text-ink-3 transition-colors hover:text-ink">
              Start over
            </button>
            {result ? (
              <button
                type="button"
                onClick={download}
                className="inline-flex items-center gap-2 rounded-lg bg-ink px-5 py-2.5 text-sm font-semibold text-bg transition-opacity hover:opacity-90"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 4v12M7 11l5 5 5-5" />
                  <path d="M4 20h16" />
                </svg>
                Download
              </button>
            ) : (
              <button
                type="button"
                onClick={compress}
                disabled={processing}
                className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-accent-ink transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {processing ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-accent-ink/40 border-t-accent-ink" />
                    Compressing…
                  </>
                ) : (
                  <>Compress PDF</>
                )}
              </button>
            )}
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
