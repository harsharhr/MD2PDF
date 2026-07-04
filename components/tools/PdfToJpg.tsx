"use client";

import { useCallback, useRef, useState } from "react";
import { PDFDocument } from "pdf-lib";
import { formatBytes } from "@/lib/format";

type ExtractedImage = {
  name: string;
  bytes: Uint8Array;
  mime: string;
  width: number;
  height: number;
};

export default function PdfToJpg() {
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [pageCount, setPageCount] = useState(0);
  const [images, setImages] = useState<ExtractedImage[]>([]);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [noImages, setNoImages] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (f: File) => {
    setError(null);
    setImages([]);
    setNoImages(false);
    setFile(f);
    setProcessing(true);

    try {
      const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

      const buffer = await f.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(buffer) }).promise;
      const pages = pdf.numPages;
      setPageCount(pages);

      const extracted: ExtractedImage[] = [];

      for (let i = 1; i <= pages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2.0 }); // 2x scale for better quality
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d")!;
        
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        await page.render({ canvasContext: ctx, viewport } as any).promise;

        const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.9));
        if (blob) {
          const arrayBuffer = await blob.arrayBuffer();
          extracted.push({
            name: `page_${i}.jpg`,
            bytes: new Uint8Array(arrayBuffer),
            mime: "image/jpeg",
            width: canvas.width,
            height: canvas.height,
          });
        }
      }

      setImages(extracted);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to rasterize PDF.");
    } finally {
      setProcessing(false);
    }
  }, []);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f && f.type === "application/pdf") handleFile(f);
    else setError("Please drop a PDF file.");
  };

  const downloadImage = (img: ExtractedImage) => {
    const blob = new Blob([img.bytes as BlobPart], { type: img.mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = img.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadAllAsZip = async () => {
    try {
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();
      for (const img of images) {
        zip.file(img.name, img.bytes);
      }
      const zipBlob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${file?.name.replace(".pdf", "")}_images.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Failed to create ZIP file.");
    }
  };

  const reset = () => {
    setFile(null);
    setPageCount(0);
    setImages([]);
    setError(null);
    setNoImages(false);
  };

  return (
    <div className="rounded-2xl border border-border bg-surface p-3 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-12px_rgba(0,0,0,0.12)] sm:p-4">
      {!file ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-14 text-center transition-colors ${
            dragOver
              ? "border-accent bg-accent-soft/40"
              : "border-border-strong bg-surface-2/40"
          }`}
        >
          <div className="mb-4 grid h-12 w-12 place-items-center rounded-full bg-surface text-accent shadow-sm">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
          </div>
          <p className="text-[15px] font-medium text-ink">
            Drop your PDF file here
          </p>
          <p className="mt-1 text-sm text-ink-2">to extract images from your PDF</p>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="mt-5 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-accent-ink transition-opacity hover:opacity-90"
          >
            Select PDF
          </button>
          <p className="mt-4 text-xs text-ink-3">Accepts .pdf files</p>
        </div>
      ) : (
        <div className="space-y-4">
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
              {processing && (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-border-strong border-t-accent" />
              )}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-3 rounded-lg bg-err-soft px-3 py-2.5">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mt-0.5 shrink-0 text-err">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4M12 16h.01" />
              </svg>
              <p className="text-xs text-err">{error}</p>
            </div>
          )}

          {/* No images message */}
          {noImages && !processing && (
            <div className="rounded-xl border border-border bg-surface-2/50 p-5 text-center">
              <div className="mx-auto mb-3 grid h-10 w-10 place-items-center rounded-full bg-warn-soft text-warn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v4M12 16h.01" />
                </svg>
              </div>
              <p className="text-sm font-medium text-ink">No embedded images found</p>
              <p className="mt-1.5 text-xs text-ink-2 leading-relaxed max-w-md mx-auto">
                This PDF doesn&apos;t contain extractable embedded images. For full page-to-image
                conversion, use your browser&apos;s print dialog (Ctrl+P / ⌘+P) and select
                &ldquo;Save as PDF&rdquo; or use a screenshot tool.
              </p>
            </div>
          )}

          {/* Extracted images */}
          {images.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-ink">
                Found {images.length} embedded image{images.length !== 1 ? "s" : ""}
              </p>
              {images.map((img, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-lg border border-border bg-surface-2/50 px-3 py-2"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-ink">{img.name}</p>
                    <p className="text-xs text-ink-3">{formatBytes(img.bytes.length)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => downloadImage(img)}
                    className="shrink-0 rounded-lg bg-ink px-3 py-1.5 text-xs font-semibold text-bg transition-opacity hover:opacity-90"
                  >
                    Download
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={reset}
              className="rounded-lg px-3 py-2 text-sm font-medium text-ink-3 transition-colors hover:text-ink"
            >
              Start over
            </button>
            {images.length > 1 && (
              <button
                type="button"
                onClick={downloadAllAsZip}
                className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-accent-ink transition-opacity hover:opacity-90"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 4v12M7 11l5 5 5-5" />
                  <path d="M4 20h16" />
                </svg>
                Download All
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
          if (f) handleFile(f);
          e.target.value = "";
        }}
      />
    </div>
  );
}
