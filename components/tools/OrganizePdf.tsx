"use client";

import { useCallback, useRef, useState } from "react";
import { PDFDocument } from "pdf-lib";
import { formatBytes } from "@/lib/format";

type PageItem = {
  id: string;
  originalIndex: number; // 0-based
};

let pageCounter = 0;
const nextId = () => `page-${(pageCounter += 1)}`;

export default function OrganizePdf() {
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<PageItem[]>([]);
  const [pdfDoc, setPdfDoc] = useState<PDFDocument | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  const addFile = useCallback(async (incoming: FileList | File[]) => {
    const pdfs = Array.from(incoming).filter(
      (f) => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf")
    );
    if (pdfs.length > 0) {
      const f = pdfs[0];
      setFile(f);
      setError(null);
      setDone(false);
      
      try {
        const bytes = await f.arrayBuffer();
        const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
        setPdfDoc(doc);
        const count = doc.getPageCount();
        const initialPages = Array.from({ length: count }).map((_, i) => ({
          id: nextId(),
          originalIndex: i,
        }));
        setPages(initialPages);
      } catch (err) {
        setError("Failed to load PDF.");
      }
    }
  }, []);

  const clearAll = () => {
    setFile(null);
    setPdfDoc(null);
    setPages([]);
    setError(null);
    setDone(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files?.length) addFile(e.dataTransfer.files);
  };

  /* ── drag-to-reorder ── */
  const handleDragStart = (index: number) => {
    dragItem.current = index;
  };
  const handleDragEnter = (index: number) => {
    dragOverItem.current = index;
  };
  const handleDragEnd = () => {
    if (dragItem.current === null || dragOverItem.current === null) return;
    const updated = [...pages];
    const [moved] = updated.splice(dragItem.current, 1);
    updated.splice(dragOverItem.current, 0, moved);
    dragItem.current = null;
    dragOverItem.current = null;
    setPages(updated);
  };

  const removePage = (index: number) => {
    setPages(prev => {
      const updated = [...prev];
      updated.splice(index, 1);
      return updated;
    });
  };

  const processFile = async () => {
    if (!file || !pdfDoc || pages.length === 0) return;
    setProcessing(true);
    setError(null);
    setDone(false);
    
    try {
      const newDoc = await PDFDocument.create();
      const pageIndicesToCopy = pages.map(p => p.originalIndex);
      const copiedPages = await newDoc.copyPages(pdfDoc, pageIndicesToCopy);
      
      copiedPages.forEach((p) => newDoc.addPage(p));
      
      const pdfBytes = await newDoc.save();
      const blob = new Blob([pdfBytes as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `organized_${file.name}`;
      a.click();
      URL.revokeObjectURL(url);
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Processing failed.");
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
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
          </div>
          <p className="text-[15px] font-medium text-ink">Drop your PDF file here</p>
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
          <div className="flex items-center justify-between rounded-xl border border-border bg-surface-2/50 p-3">
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
            </div>
            <button type="button" onClick={clearAll} className="text-sm font-medium text-err hover:underline">
               Start over
            </button>
          </div>

          <p className="text-sm font-medium text-ink">Drag to reorder, click X to remove pages.</p>
          
          <div className="grid grid-cols-4 gap-3 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10">
             {pages.map((p, idx) => (
                <div 
                  key={p.id}
                  draggable
                  onDragStart={() => handleDragStart(idx)}
                  onDragEnter={() => handleDragEnter(idx)}
                  onDragEnd={handleDragEnd}
                  onDragOver={(e) => e.preventDefault()}
                  className="group relative aspect-[3/4] cursor-grab rounded border border-border bg-surface-2/50 active:cursor-grabbing hover:border-accent flex items-center justify-center transition-all"
                >
                   <span className="text-lg font-semibold text-ink-3 group-hover:text-ink">{p.originalIndex + 1}</span>
                   <button 
                     onClick={() => removePage(idx)}
                     className="absolute -right-2 -top-2 grid h-5 w-5 place-items-center rounded-full bg-err text-white opacity-0 transition-opacity group-hover:opacity-100"
                   >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M6 6l12 12M18 6L6 18" />
                      </svg>
                   </button>
                </div>
             ))}
          </div>

          {error && (
            <div className={`flex items-center gap-3 rounded-lg px-3 py-2 bg-err-soft text-err`}>
              <p className="text-xs">{error}</p>
            </div>
          )}

          {done && (
            <div className="flex items-center gap-3 rounded-lg bg-ok-soft px-3 py-2 text-ok">
              <p className="text-xs font-medium">Organized PDF downloaded successfully!</p>
            </div>
          )}

          <div className="flex justify-end pt-2 border-t border-border mt-4">
            <button
              type="button"
              onClick={processFile}
              disabled={processing || pages.length === 0}
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-accent-ink transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {processing ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-accent-ink/40 border-t-accent-ink" />
                  Saving…
                </>
              ) : (
                <>Save Changes</>
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
