"use client";

import { useCallback, useRef, useState } from "react";
import { PDFDocument, rgb } from "pdf-lib";
import { formatBytes } from "@/lib/format";

type Redaction = {
  id: string;
  pageIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
};

let redactionCounter = 0;
const nextId = () => `redact-${(redactionCounter += 1)}`;

export default function RedactPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [pageCount, setPageCount] = useState(1);
  
  const [redactions, setRedactions] = useState<Redaction[]>([]);

  const addFile = useCallback(async (incoming: FileList | File[]) => {
    const pdfs = Array.from(incoming).filter(
      (f) => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf")
    );
    if (pdfs.length > 0) {
      const f = pdfs[0];
      setFile(f);
      setError(null);
      setDone(false);
      setRedactions([]);
      
      try {
        const bytes = await f.arrayBuffer();
        const doc = await PDFDocument.load(bytes);
        setPageCount(doc.getPageCount());
      } catch {
        // ignore for now
      }
    }
  }, []);

  const clearAll = () => {
    setFile(null);
    setError(null);
    setDone(false);
    setRedactions([]);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files?.length) addFile(e.dataTransfer.files);
  };

  const addRedaction = () => {
    setRedactions(prev => [
      ...prev, 
      { id: nextId(), pageIndex: 1, x: 50, y: 50, width: 200, height: 20 }
    ]);
  };
  
  const updateRedaction = (id: string, field: keyof Redaction, value: number) => {
    setRedactions(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
  };
  
  const removeRedaction = (id: string) => {
    setRedactions(prev => prev.filter(r => r.id !== id));
  };

  const processFile = async () => {
    if (!file) return;
    
    setProcessing(true);
    setError(null);
    setDone(false);
    
    try {
      const bytes = await file.arrayBuffer();
      const pdf = await PDFDocument.load(bytes);
      const pages = pdf.getPages();
      
      for (const red of redactions) {
         const pIdx = red.pageIndex - 1;
         if (pIdx >= 0 && pIdx < pages.length) {
            const page = pages[pIdx];
            const { height: pageHeight } = page.getSize();
            // pdf-lib y-axis is bottom-up, user expects top-down
            const pdfY = pageHeight - red.y - red.height;
            
            page.drawRectangle({
               x: red.x,
               y: pdfY,
               width: red.width,
               height: red.height,
               color: rgb(0, 0, 0),
               // We could also do real redaction by removing text, but pdf-lib doesn't support that easily.
               // It only covers the text visually. We must state this limitation.
            });
         }
      }
      
      const pdfBytes = await pdf.save();
      const blob = new Blob([pdfBytes as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `redacted_${file.name}`;
      a.click();
      URL.revokeObjectURL(url);
      setDone(true);
      setError("Note: Redaction applied visually (black box). Hidden text layers may still remain underneath with this tool.");
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
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <line x1="9" y1="12" x2="15" y2="12" strokeWidth="3" />
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
                <p className="mt-0.5 text-xs text-ink-3">{formatBytes(file.size)} &bull; {pageCount} pages</p>
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

          <div className="rounded-xl border border-border p-4 space-y-4 bg-surface-2/30">
            <div className="flex items-center justify-between">
               <h3 className="text-sm font-medium text-ink">Redaction Regions</h3>
               <button onClick={addRedaction} className="text-xs bg-surface border border-border px-2 py-1 rounded text-ink hover:border-accent">
                 + Add Region
               </button>
            </div>
            
            {redactions.length === 0 ? (
               <p className="text-sm text-ink-3 py-4 text-center">No regions added yet.</p>
            ) : (
               <div className="space-y-3">
                  {redactions.map((r, i) => (
                     <div key={r.id} className="grid grid-cols-6 gap-2 items-center bg-surface p-2 border border-border rounded-md text-sm">
                        <div className="col-span-1">
                           <label className="block text-[10px] text-ink-3 uppercase mb-0.5">Page</label>
                           <input type="number" min="1" max={pageCount} value={r.pageIndex} onChange={e => updateRedaction(r.id, 'pageIndex', Number(e.target.value))} className="w-full bg-transparent border-b border-border outline-none px-1 py-0.5" />
                        </div>
                        <div className="col-span-1">
                           <label className="block text-[10px] text-ink-3 uppercase mb-0.5">X pos</label>
                           <input type="number" value={r.x} onChange={e => updateRedaction(r.id, 'x', Number(e.target.value))} className="w-full bg-transparent border-b border-border outline-none px-1 py-0.5" />
                        </div>
                        <div className="col-span-1">
                           <label className="block text-[10px] text-ink-3 uppercase mb-0.5">Y pos</label>
                           <input type="number" value={r.y} onChange={e => updateRedaction(r.id, 'y', Number(e.target.value))} className="w-full bg-transparent border-b border-border outline-none px-1 py-0.5" />
                        </div>
                        <div className="col-span-1">
                           <label className="block text-[10px] text-ink-3 uppercase mb-0.5">Width</label>
                           <input type="number" value={r.width} onChange={e => updateRedaction(r.id, 'width', Number(e.target.value))} className="w-full bg-transparent border-b border-border outline-none px-1 py-0.5" />
                        </div>
                        <div className="col-span-1">
                           <label className="block text-[10px] text-ink-3 uppercase mb-0.5">Height</label>
                           <input type="number" value={r.height} onChange={e => updateRedaction(r.id, 'height', Number(e.target.value))} className="w-full bg-transparent border-b border-border outline-none px-1 py-0.5" />
                        </div>
                        <div className="col-span-1 flex justify-end">
                           <button onClick={() => removeRedaction(r.id)} className="text-err hover:bg-err-soft p-1 rounded"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 6l12 12M18 6L6 18" /></svg></button>
                        </div>
                     </div>
                  ))}
               </div>
            )}
          </div>

          {error && (
            <div className={`flex items-center gap-3 rounded-lg px-3 py-2 ${error.startsWith('Note') ? 'bg-warn-soft text-warn' : 'bg-err-soft text-err'}`}>
              <p className="text-xs">{error}</p>
            </div>
          )}

          {done && (
            <div className="flex items-center gap-3 rounded-lg bg-ok-soft px-3 py-2 text-ok">
              <p className="text-xs font-medium">Redacted PDF downloaded successfully!</p>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={processFile}
              disabled={processing || redactions.length === 0}
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-accent-ink transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {processing ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-accent-ink/40 border-t-accent-ink" />
                  Applying…
                </>
              ) : (
                <>Apply Redactions</>
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
