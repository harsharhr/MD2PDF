"use client";

import { useCallback, useRef, useState, useEffect } from "react";
import { PDFDocument, rgb } from "pdf-lib";
import { formatBytes } from "@/lib/format";

export default function SignPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  
  const [posX, setPosX] = useState(50);
  const [posY, setPosY] = useState(50);
  const [scale, setScale] = useState(0.5);

  const addFile = useCallback((incoming: FileList | File[]) => {
    const pdfs = Array.from(incoming).filter(
      (f) => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf")
    );
    if (pdfs.length > 0) {
      setFile(pdfs[0]);
      setError(null);
      setDone(false);
    }
  }, []);

  const clearAll = () => {
    setFile(null);
    setError(null);
    setDone(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files?.length) addFile(e.dataTransfer.files);
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault(); // Prevent scrolling on touch
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    let x, y;
    if ('touches' in e) {
      const rect = canvas.getBoundingClientRect();
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.nativeEvent.offsetX;
      y = e.nativeEvent.offsetY;
    }
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault(); // Prevent scrolling on touch
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    let x, y;
    if ('touches' in e) {
      const rect = canvas.getBoundingClientRect();
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.nativeEvent.offsetX;
      y = e.nativeEvent.offsetY;
    }
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const endDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#000000";
  }, [file]);

  const processFile = async () => {
    if (!file || !canvasRef.current) return;
    
    // Check if canvas is empty
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const pixelBuffer = new Uint32Array(
      ctx!.getImageData(0, 0, canvas.width, canvas.height).data.buffer
    );
    const hasPixels = pixelBuffer.some(color => color !== 0);
    
    if (!hasPixels) {
      setError("Please draw your signature before applying.");
      return;
    }

    setProcessing(true);
    setError(null);
    setDone(false);
    
    try {
      const bytes = await file.arrayBuffer();
      const pdf = await PDFDocument.load(bytes);
      
      const sigDataUrl = canvas.toDataURL('image/png');
      const sigImageBytes = await fetch(sigDataUrl).then(res => res.arrayBuffer());
      const sigImage = await pdf.embedPng(sigImageBytes);
      
      const pages = pdf.getPages();
      const lastPage = pages[pages.length - 1];
      
      const { width, height } = lastPage.getSize();
      const sigDims = sigImage.scale(scale);
      
      // Calculate Y from bottom to match user expectation (where bottom is 0 in pdf-lib)
      const pdfY = height - posY - sigDims.height;
      
      lastPage.drawImage(sigImage, {
        x: posX,
        y: pdfY < 0 ? 0 : pdfY,
        width: sigDims.width,
        height: sigDims.height,
      });
      
      const pdfBytes = await pdf.save();
      const blob = new Blob([pdfBytes as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `signed_${file.name}`;
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
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
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

          <div className="rounded-xl border border-border p-4 space-y-4">
            <div>
               <label className="block text-sm font-medium text-ink mb-2">Draw Your Signature</label>
               <div className="border border-dashed border-border-strong rounded-lg bg-surface flex justify-center py-4 touch-none">
                  <canvas 
                    ref={canvasRef}
                    width={400}
                    height={150}
                    className="border border-border bg-white cursor-crosshair max-w-full touch-none"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={endDrawing}
                    onMouseOut={endDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={endDrawing}
                    onTouchCancel={endDrawing}
                  />
               </div>
               <div className="mt-2 flex justify-end">
                 <button onClick={clearCanvas} className="text-sm text-ink-3 hover:text-ink">Clear Signature</button>
               </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 border-t border-border pt-4 mt-2">
               <div>
                  <label className="block text-xs font-medium text-ink-2 mb-1">X Position (points)</label>
                  <input type="number" value={posX} onChange={(e) => setPosX(Number(e.target.value))} className="w-full rounded-md border border-border bg-surface px-2 py-1 text-sm outline-none focus:border-accent" />
               </div>
               <div>
                  <label className="block text-xs font-medium text-ink-2 mb-1">Y Position (points down)</label>
                  <input type="number" value={posY} onChange={(e) => setPosY(Number(e.target.value))} className="w-full rounded-md border border-border bg-surface px-2 py-1 text-sm outline-none focus:border-accent" />
               </div>
               <div>
                  <label className="block text-xs font-medium text-ink-2 mb-1">Scale</label>
                  <input type="number" step="0.1" value={scale} onChange={(e) => setScale(Number(e.target.value))} className="w-full rounded-md border border-border bg-surface px-2 py-1 text-sm outline-none focus:border-accent" />
               </div>
            </div>
            <p className="text-xs text-ink-3 mt-2">Signature will be appended to the last page of the document.</p>
          </div>

          {error && (
            <div className={`flex items-center gap-3 rounded-lg px-3 py-2 bg-err-soft text-err`}>
              <p className="text-xs">{error}</p>
            </div>
          )}

          {done && (
            <div className="flex items-center gap-3 rounded-lg bg-ok-soft px-3 py-2 text-ok">
              <p className="text-xs font-medium">Signed PDF downloaded successfully!</p>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={processFile}
              disabled={processing}
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-accent-ink transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {processing ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-accent-ink/40 border-t-accent-ink" />
                  Applying…
                </>
              ) : (
                <>Apply Signature</>
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
