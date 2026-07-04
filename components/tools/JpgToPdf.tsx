"use client";

import { useCallback, useRef, useState } from "react";
import { PDFDocument } from "pdf-lib";
import { formatBytes } from "@/lib/format";

type FileItem = {
  id: string;
  file: File;
};

let counter = 0;
const nextId = () => `img-${(counter += 1)}`;

export default function JpgToPdf() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  const addFiles = useCallback((incoming: FileList | File[]) => {
    const images = Array.from(incoming)
      .filter((f) => f.type.startsWith("image/"))
      .map((file) => ({ id: nextId(), file }));
    if (images.length) {
      setFiles((prev) => [...prev, ...images]);
      setError(null);
      setDone(false);
    }
  }, []);

  const removeFile = (id: string) => setFiles((prev) => prev.filter((f) => f.id !== id));
  const clearAll = () => {
    setFiles([]);
    setError(null);
    setDone(false);
  };

  const handleDragStart = (index: number) => {
    dragItem.current = index;
  };
  const handleDragEnter = (index: number) => {
    dragOverItem.current = index;
  };
  const handleDragEnd = () => {
    if (dragItem.current === null || dragOverItem.current === null) return;
    const updated = [...files];
    const [moved] = updated.splice(dragItem.current, 1);
    updated.splice(dragOverItem.current, 0, moved);
    dragItem.current = null;
    dragOverItem.current = null;
    setFiles(updated);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
  };

  const processImages = async () => {
    if (files.length === 0) return;
    setProcessing(true);
    setError(null);
    setDone(false);
    
    try {
      const pdf = await PDFDocument.create();
      
      for (const item of files) {
        const bytes = await item.file.arrayBuffer();
        let image;
        if (item.file.type === 'image/jpeg' || item.file.type === 'image/jpg') {
           image = await pdf.embedJpg(bytes);
        } else if (item.file.type === 'image/png') {
           image = await pdf.embedPng(bytes);
        } else {
           continue; // Skip unsupported image types
        }
        
        const { width, height } = image.scale(1);
        const page = pdf.addPage([width, height]);
        page.drawImage(image, {
           x: 0,
           y: 0,
           width,
           height,
        });
      }
      
      const pdfBytes = await pdf.save();
      const blob = new Blob([pdfBytes as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `images_to_pdf.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Processing failed.");
    } finally {
      setProcessing(false);
    }
  };

  const isEmpty = files.length === 0;

  return (
    <div className="rounded-2xl border border-border bg-surface p-3 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-12px_rgba(0,0,0,0.12)] sm:p-4">
      {isEmpty ? (
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
               <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
               <circle cx="8.5" cy="8.5" r="1.5" />
               <polyline points="21 15 16 10 5 21" />
            </svg>
          </div>
          <p className="text-[15px] font-medium text-ink">Drop JPG/PNG images here</p>
          <p className="mt-1 text-sm text-ink-2">or choose files to convert to PDF</p>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="mt-5 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-accent-ink transition-opacity hover:opacity-90"
          >
            Select Images
          </button>
          <p className="mt-4 text-xs text-ink-3">Accepts .jpg, .png</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {files.map((item, index) => (
            <div
              key={item.id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragEnter={() => handleDragEnter(index)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => e.preventDefault()}
              className="rounded-xl border border-border bg-surface-2/50 p-3 sm:p-3.5 cursor-grab active:cursor-grabbing"
            >
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-surface text-ink-3">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M8 6h.01M8 12h.01M8 18h.01M16 6h.01M16 12h.01M16 18h.01" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">{item.file.name}</p>
                  <p className="mt-0.5 text-xs text-ink-3">{formatBytes(item.file.size)}</p>
                </div>
                <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-soft text-xs font-semibold text-accent">
                  {index + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeFile(item.id)}
                  aria-label="Remove file"
                  className="grid h-8 w-8 place-items-center rounded-lg text-ink-3 transition-colors hover:bg-surface hover:text-err"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 6l12 12M18 6L6 18" />
                  </svg>
                </button>
              </div>
            </div>
          ))}

          {error && (
            <div className="flex items-center gap-3 rounded-lg bg-err-soft px-3 py-2">
              <p className="text-xs text-err">{error}</p>
            </div>
          )}

          {done && (
            <div className="flex items-center gap-3 rounded-lg bg-ok-soft px-3 py-2">
              <p className="text-xs text-ok">PDF downloaded successfully!</p>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-medium text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                Add more
              </button>
              <button type="button" onClick={clearAll} className="rounded-lg px-3 py-2 text-sm font-medium text-ink-3 transition-colors hover:text-ink">
                Clear
              </button>
            </div>
            <button
              type="button"
              onClick={processImages}
              disabled={files.length === 0 || processing}
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-accent-ink transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {processing ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-accent-ink/40 border-t-accent-ink" />
                  Generating PDF…
                </>
              ) : (
                <>Convert to PDF</>
              )}
            </button>
          </div>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files) addFiles(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
}
