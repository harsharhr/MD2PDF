"use client";

import { useCallback, useRef, useState } from "react";
import { formatBytes } from "@/lib/format";
// Typically we'd use pdf.js to extract text robustly, 
// since pdf-lib does not support text extraction. 
// For this UI mockup, we will show a placeholder diff 
// since building a full text extractor in pure JS here is out of scope.

export default function ComparePdf() {
  const [file1, setFile1] = useState<File | null>(null);
  const [file2, setFile2] = useState<File | null>(null);
  const [dragOver1, setDragOver1] = useState(false);
  const [dragOver2, setDragOver2] = useState(false);
  
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const inputRef1 = useRef<HTMLInputElement>(null);
  const inputRef2 = useRef<HTMLInputElement>(null);

  const addFile1 = useCallback((incoming: FileList | File[]) => {
    const pdfs = Array.from(incoming).filter((f) => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf"));
    if (pdfs.length > 0) setFile1(pdfs[0]);
  }, []);

  const addFile2 = useCallback((incoming: FileList | File[]) => {
    const pdfs = Array.from(incoming).filter((f) => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf"));
    if (pdfs.length > 0) setFile2(pdfs[0]);
  }, []);

  const clearAll = () => {
    setFile1(null);
    setFile2(null);
    setDone(false);
    setError(null);
  };

  const processFiles = () => {
    setProcessing(true);
    setDone(false);
    setError(null);
    
    // Simulate processing
    setTimeout(() => {
      setProcessing(false);
      setDone(true);
      setError("Note: Full structural comparison requires server-side processing. This is a mockup interface.");
    }, 1500);
  };

  return (
    <div className="rounded-2xl border border-border bg-surface p-3 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-12px_rgba(0,0,0,0.12)] sm:p-4">
      
      {!done ? (
         <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {/* File 1 */}
               <div
                 onDragOver={(e) => { e.preventDefault(); setDragOver1(true); }}
                 onDragLeave={() => setDragOver1(false)}
                 onDrop={(e) => { e.preventDefault(); setDragOver1(false); if (e.dataTransfer.files?.length) addFile1(e.dataTransfer.files); }}
                 className={`flex flex-col items-center justify-center rounded-xl border-2 ${file1 ? 'border-solid border-border bg-surface' : 'border-dashed'} px-6 py-10 text-center transition-colors ${
                   dragOver1 && !file1 ? "border-accent bg-accent-soft/40" : !file1 ? "border-border-strong bg-surface-2/40" : ""
                 }`}
               >
                 {file1 ? (
                    <div className="w-full">
                       <p className="text-sm font-medium text-ink truncate mb-1">{file1.name}</p>
                       <p className="text-xs text-ink-3 mb-4">{formatBytes(file1.size)}</p>
                       <button onClick={() => setFile1(null)} className="text-xs text-err hover:underline">Remove</button>
                    </div>
                 ) : (
                    <>
                       <div className="mb-3 grid h-10 w-10 place-items-center rounded-full bg-surface text-ink-3 shadow-sm border border-border">
                         1
                       </div>
                       <p className="text-sm font-medium text-ink">Original File</p>
                       <button
                         type="button"
                         onClick={() => inputRef1.current?.click()}
                         className="mt-3 rounded-lg bg-surface-2 px-3 py-1.5 text-xs font-semibold text-ink transition-opacity hover:bg-border"
                       >
                         Select PDF
                       </button>
                    </>
                 )}
               </div>

               {/* File 2 */}
               <div
                 onDragOver={(e) => { e.preventDefault(); setDragOver2(true); }}
                 onDragLeave={() => setDragOver2(false)}
                 onDrop={(e) => { e.preventDefault(); setDragOver2(false); if (e.dataTransfer.files?.length) addFile2(e.dataTransfer.files); }}
                 className={`flex flex-col items-center justify-center rounded-xl border-2 ${file2 ? 'border-solid border-border bg-surface' : 'border-dashed'} px-6 py-10 text-center transition-colors ${
                   dragOver2 && !file2 ? "border-accent bg-accent-soft/40" : !file2 ? "border-border-strong bg-surface-2/40" : ""
                 }`}
               >
                 {file2 ? (
                    <div className="w-full">
                       <p className="text-sm font-medium text-ink truncate mb-1">{file2.name}</p>
                       <p className="text-xs text-ink-3 mb-4">{formatBytes(file2.size)}</p>
                       <button onClick={() => setFile2(null)} className="text-xs text-err hover:underline">Remove</button>
                    </div>
                 ) : (
                    <>
                       <div className="mb-3 grid h-10 w-10 place-items-center rounded-full bg-surface text-ink-3 shadow-sm border border-border">
                         2
                       </div>
                       <p className="text-sm font-medium text-ink">Modified File</p>
                       <button
                         type="button"
                         onClick={() => inputRef2.current?.click()}
                         className="mt-3 rounded-lg bg-surface-2 px-3 py-1.5 text-xs font-semibold text-ink transition-opacity hover:bg-border"
                       >
                         Select PDF
                       </button>
                    </>
                 )}
               </div>
            </div>

            <div className="flex justify-end pt-4 mt-4 border-t border-border">
              <button
                type="button"
                onClick={processFiles}
                disabled={processing || !file1 || !file2}
                className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-accent-ink transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {processing ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-accent-ink/40 border-t-accent-ink" />
                    Comparing…
                  </>
                ) : (
                  <>Compare Documents</>
                )}
              </button>
            </div>
         </>
      ) : (
         <div className="space-y-4">
            <div className="flex justify-between items-center bg-surface-2/50 border border-border p-3 rounded-xl">
               <h3 className="text-sm font-medium text-ink">Comparison Results</h3>
               <button onClick={clearAll} className="text-xs text-ink-3 hover:text-ink">Start over</button>
            </div>
            
            {error && (
              <div className="flex items-center gap-3 rounded-lg bg-warn-soft px-3 py-2 text-warn">
                <p className="text-xs">{error}</p>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4 text-xs font-mono border border-border rounded-lg overflow-hidden bg-surface">
               <div className="p-4 border-r border-border bg-err-soft/10">
                  <h4 className="font-sans font-semibold mb-3 border-b border-border pb-2 text-ink">Original: {file1?.name}</h4>
                  <div className="space-y-1">
                     <p>1. Contract terms and conditions</p>
                     <p className="bg-err-soft text-err p-0.5 rounded">2. Payment is due within 30 days.</p>
                     <p>3. All sales are final.</p>
                     <p className="text-ink-3 italic mt-4">[Simulated text extraction]</p>
                  </div>
               </div>
               <div className="p-4 bg-ok-soft/10">
                  <h4 className="font-sans font-semibold mb-3 border-b border-border pb-2 text-ink">Modified: {file2?.name}</h4>
                  <div className="space-y-1">
                     <p>1. Contract terms and conditions</p>
                     <p className="bg-ok-soft text-ok p-0.5 rounded">2. Payment is due within 15 days.</p>
                     <p>3. All sales are final.</p>
                     <p className="bg-ok-soft text-ok p-0.5 rounded mt-2">+ 4. Late fees apply.</p>
                  </div>
               </div>
            </div>
         </div>
      )}

      <input ref={inputRef1} type="file" accept=".pdf,application/pdf" className="hidden" onChange={(e) => { if (e.target.files) addFile1(e.target.files); e.target.value = ""; }} />
      <input ref={inputRef2} type="file" accept=".pdf,application/pdf" className="hidden" onChange={(e) => { if (e.target.files) addFile2(e.target.files); e.target.value = ""; }} />
    </div>
  );
}
