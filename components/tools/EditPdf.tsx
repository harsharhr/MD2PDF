"use client";

import { useCallback, useRef, useState } from "react";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { formatBytes } from "@/lib/format";

type FontChoice = keyof typeof StandardFonts;

const FONT_OPTIONS: { value: FontChoice; label: string }[] = [
  { value: "Helvetica", label: "Helvetica" },
  { value: "HelveticaBold", label: "Helvetica Bold" },
  { value: "TimesRoman", label: "Times Roman" },
  { value: "TimesRomanBold", label: "Times Roman Bold" },
  { value: "Courier", label: "Courier" },
  { value: "CourierBold", label: "Courier Bold" },
];

export default function EditPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [pdfBytes, setPdfBytes] = useState<ArrayBuffer | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [pageCount, setPageCount] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Text editing state
  const [text, setText] = useState("");
  const [fontSize, setFontSize] = useState(14);
  const [fontName, setFontName] = useState<FontChoice>("Helvetica");
  const [posX, setPosX] = useState(50);
  const [posY, setPosY] = useState(700);
  const [page, setPage] = useState(1);
  const [colorHex, setColorHex] = useState("#000000");

  const handleFile = useCallback(async (f: File) => {
    setError(null);
    setSuccess(null);
    setFile(f);
    setProcessing(true);
    try {
      const buffer = await f.arrayBuffer();
      const pdf = await PDFDocument.load(buffer, { ignoreEncryption: true });
      setPageCount(pdf.getPageCount());
      setPdfBytes(buffer);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to read PDF.");
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

  const hexToRgb = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    return rgb(r, g, b);
  };

  const addText = async () => {
    if (!pdfBytes || !text.trim()) {
      setError("Please enter some text to add.");
      return;
    }
    setProcessing(true);
    setError(null);
    setSuccess(null);

    try {
      const pdf = await PDFDocument.load(pdfBytes);
      const font = await pdf.embedFont(StandardFonts[fontName]);
      const pageIndex = Math.max(0, Math.min(page - 1, pdf.getPageCount() - 1));
      const pdfPage = pdf.getPage(pageIndex);

      pdfPage.drawText(text, {
        x: posX,
        y: posY,
        size: fontSize,
        font,
        color: hexToRgb(colorHex),
      });

      const resultBytes = await pdf.save();
      setPdfBytes(resultBytes.buffer as ArrayBuffer);
      setSuccess(`Text added to page ${pageIndex + 1}. You can add more or download.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add text.");
    } finally {
      setProcessing(false);
    }
  };

  const download = async () => {
    if (!pdfBytes) return;
    const blob = new Blob([pdfBytes as BlobPart], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = file ? `edited_${file.name}` : "edited.pdf";
    a.click();
    URL.revokeObjectURL(url);
  };

  const reset = () => {
    setFile(null);
    setPdfBytes(null);
    setPageCount(0);
    setError(null);
    setSuccess(null);
    setText("");
  };

  const inputClasses =
    "w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-3 focus:border-accent focus:outline-none";

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
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </div>
          <p className="text-[15px] font-medium text-ink">Drop your PDF file here</p>
          <p className="mt-1 text-sm text-ink-2">to add text annotations</p>
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

          {/* Success */}
          {success && (
            <div className="flex items-start gap-3 rounded-lg bg-ok-soft px-3 py-2.5">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mt-0.5 shrink-0 text-ok">
                <circle cx="12" cy="12" r="10" />
                <path d="M9 12l2 2 4-4" />
              </svg>
              <p className="text-xs text-ok">{success}</p>
            </div>
          )}

          {/* Text editing controls */}
          <div className="rounded-xl border border-border bg-surface-2/50 p-4 space-y-3">
            <p className="text-sm font-medium text-ink">Add Text</p>

            <div>
              <label className="block text-xs font-medium text-ink-2 mb-1">Text content</label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type your text here..."
                rows={3}
                className={inputClasses + " resize-y"}
              />
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div>
                <label className="block text-xs font-medium text-ink-2 mb-1">Page</label>
                <input
                  type="number"
                  min={1}
                  max={pageCount}
                  value={page}
                  onChange={(e) => setPage(Number(e.target.value))}
                  className={inputClasses}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-ink-2 mb-1">Font size</label>
                <input
                  type="number"
                  min={4}
                  max={144}
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className={inputClasses}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-ink-2 mb-1">X position (pt)</label>
                <input
                  type="number"
                  min={0}
                  value={posX}
                  onChange={(e) => setPosX(Number(e.target.value))}
                  className={inputClasses}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-ink-2 mb-1">Y position (pt)</label>
                <input
                  type="number"
                  min={0}
                  value={posY}
                  onChange={(e) => setPosY(Number(e.target.value))}
                  className={inputClasses}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-ink-2 mb-1">Font</label>
                <select
                  value={fontName}
                  onChange={(e) => setFontName(e.target.value as FontChoice)}
                  className={inputClasses}
                >
                  {FONT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-ink-2 mb-1">Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={colorHex}
                    onChange={(e) => setColorHex(e.target.value)}
                    className="h-9 w-9 cursor-pointer rounded-lg border border-border bg-surface p-0.5"
                  />
                  <input
                    type="text"
                    value={colorHex}
                    onChange={(e) => setColorHex(e.target.value)}
                    className={inputClasses}
                  />
                </div>
              </div>
            </div>

            <p className="text-xs text-ink-3">
              Coordinates use PDF points (1 point = 1/72 inch). Origin (0, 0) is bottom-left. A standard letter page is 612 × 792 pt.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={reset}
              className="rounded-lg px-3 py-2 text-sm font-medium text-ink-3 transition-colors hover:text-ink"
            >
              Start over
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={addText}
                disabled={processing || !text.trim()}
                className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
              >
                {processing ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-border-strong border-t-accent" />
                    Adding…
                  </>
                ) : (
                  "Add Text"
                )}
              </button>
              <button
                type="button"
                onClick={download}
                disabled={processing}
                className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-accent-ink transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 4v12M7 11l5 5 5-5" />
                  <path d="M4 20h16" />
                </svg>
                Download PDF
              </button>
            </div>
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
