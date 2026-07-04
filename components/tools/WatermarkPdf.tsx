"use client";

import { useCallback, useRef, useState } from "react";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

type Position = "center" | "top" | "bottom";

export default function WatermarkPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Watermark options
  const [text, setText] = useState("CONFIDENTIAL");
  const [fontSize, setFontSize] = useState(48);
  const [opacity, setOpacity] = useState(30);
  const [color, setColor] = useState<"gray" | "red" | "blue">("gray");
  const [position, setPosition] = useState<Position>("center");

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

  const colorMap: Record<string, [number, number, number]> = {
    gray: [0.5, 0.5, 0.5],
    red: [0.8, 0.1, 0.1],
    blue: [0.1, 0.1, 0.8],
  };

  async function process() {
    if (!file || !text.trim()) return;
    setProcessing(true);
    setError(null);
    setDone(false);
    try {
      const bytes = await file.arrayBuffer();
      const pdf = await PDFDocument.load(bytes);
      const font = await pdf.embedFont(StandardFonts.Helvetica);
      const [r, g, b] = colorMap[color];
      const alpha = opacity / 100;

      const pages = pdf.getPages();
      for (const page of pages) {
        const { width, height } = page.getSize();
        const textWidth = font.widthOfTextAtSize(text, fontSize);
        const textHeight = fontSize;

        let x = (width - textWidth) / 2;
        let y: number;
        if (position === "center") {
          y = (height - textHeight) / 2;
        } else if (position === "top") {
          y = height - textHeight - 40;
        } else {
          y = 40;
        }

        page.drawText(text, {
          x,
          y,
          size: fontSize,
          font,
          color: rgb(r, g, b),
          opacity: alpha,
        });
      }

      const pdfBytes = await pdf.save();
      const blob = new Blob([pdfBytes as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name.replace(/\.pdf$/i, "") + "_watermarked.pdf";
      a.click();
      URL.revokeObjectURL(url);
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add watermark.");
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
          <p className="mt-1 text-sm text-ink-2">or choose a file to add a watermark</p>
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
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-ink-2">Watermark Text</label>
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-ink placeholder:text-ink-3 focus:border-accent focus:outline-none"
                placeholder="Enter watermark text"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-ink-2">Font Size</label>
              <input
                type="number"
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                min={8}
                max={200}
                className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-ink-2">Color</label>
              <select
                value={color}
                onChange={(e) => setColor(e.target.value as "gray" | "red" | "blue")}
                className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none"
              >
                <option value="gray">Gray</option>
                <option value="red">Red</option>
                <option value="blue">Blue</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-ink-2">Opacity: {opacity}%</label>
              <input
                type="range"
                min={5}
                max={100}
                value={opacity}
                onChange={(e) => setOpacity(Number(e.target.value))}
                className="w-full accent-accent"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-ink-2">Position</label>
              <select
                value={position}
                onChange={(e) => setPosition(e.target.value as Position)}
                className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none"
              >
                <option value="center">Center</option>
                <option value="top">Top</option>
                <option value="bottom">Bottom</option>
              </select>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-err-soft px-3 py-2">
              <p className="text-xs text-err">{error}</p>
            </div>
          )}

          {/* Success */}
          {done && (
            <div className="flex items-center gap-2 rounded-lg bg-ok-soft px-3 py-2">
              <p className="text-xs text-ok">Watermark added — download started!</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={process}
              disabled={processing || !text.trim()}
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-accent-ink transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {processing ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-accent-ink/40 border-t-accent-ink" />
                  Processing…
                </>
              ) : (
                "Add Watermark & Download"
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
