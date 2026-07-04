"use client";

import { useCallback, useRef, useState } from "react";
import { formatBytes } from "@/lib/format";

export default function ProtectPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [password, setPassword] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const addFile = useCallback((incoming: FileList | File[]) => {
    const pdfs = Array.from(incoming).filter(
      (f) => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf")
    );
    if (pdfs.length > 0) {
      setFile(pdfs[0]);
      setError(null);
      setDone(false);
      setPassword("");
    }
  }, []);

  const clearAll = () => {
    setFile(null);
    setError(null);
    setDone(false);
    setPassword("");
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files?.length) addFile(e.dataTransfer.files);
  };

  const processFile = () => {
    if (!file) return;
    if (!password) {
      setError("Please enter a password.");
      return;
    }
    // pdf-lib (the client-side library this tool would use) doesn't support
    // real PDF encryption. Rather than download a file that LOOKS protected
    // but isn't password-locked at all, say so honestly instead.
    setError("Real password protection isn't available yet — no file was downloaded. We didn't want to hand you a PDF that looks locked but isn't.");
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
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
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
               <label className="block text-sm font-medium text-ink mb-1">Set Password</label>
               <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter a strong password"
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-accent"
               />
            </div>
          </div>

          {error && (
            <div className={`flex items-center gap-3 rounded-lg px-3 py-2 ${error.startsWith('Note') ? 'bg-accent-soft text-accent' : 'bg-err-soft text-err'}`}>
              <p className="text-xs">{error}</p>
            </div>
          )}

          {done && (
            <div className="flex items-center gap-3 rounded-lg bg-ok-soft px-3 py-2 text-ok">
              <p className="text-xs font-medium">Protected PDF downloaded successfully!</p>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={processFile}
              disabled={processing || !password}
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-accent-ink transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {processing ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-accent-ink/40 border-t-accent-ink" />
                  Protecting…
                </>
              ) : (
                <>Protect PDF</>
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
