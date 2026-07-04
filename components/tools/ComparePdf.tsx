"use client";

import { useCallback, useRef, useState } from "react";
import { formatBytes } from "@/lib/format";

export default function ComparePdf() {
  const [file1, setFile1] = useState<File | null>(null);
  const [file2, setFile2] = useState<File | null>(null);
  const [dragOver1, setDragOver1] = useState(false);
  const [dragOver2, setDragOver2] = useState(false);
  
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

  const [processing, setProcessing] = useState(false);
  const [diffResult, setDiffResult] = useState<any[] | null>(null);

  const processFiles = async () => {
    if (!file1 || !file2) return;
    setProcessing(true);
    setError(null);
    setDiffResult(null);
    try {
      const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

      const extractText = async (file: File) => {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
        let fullText = "";
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          const strings = content.items.map((item: any) => item.str);
          fullText += strings.join(" ") + "\n";
        }
        return fullText;
      };

      const [text1, text2] = await Promise.all([extractText(file1), extractText(file2)]);
      
      const Diff = await import("diff");
      const differences = Diff.diffWordsWithSpace(text1, text2);
      
      setDiffResult(differences);
    } catch (err) {
      console.error(err);
      setError("Failed to compare the documents. They might be corrupted or secured.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-surface p-3 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-12px_rgba(0,0,0,0.12)] sm:p-4">
      <>
            {error && (
              <div className="mb-4 flex items-center gap-3 rounded-lg bg-err-soft px-3 py-2 text-err">
                <p className="text-xs">{error}</p>
              </div>
            )}
            
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

            {diffResult && (
              <div className="mt-4 rounded-xl border border-border bg-surface p-4 shadow-sm">
                <p className="text-sm font-semibold text-ink mb-3">Comparison Results</p>
                <div className="flex gap-4 mb-3 text-xs">
                  <span className="flex items-center gap-1"><div className="w-3 h-3 bg-[#e6ffed] border border-[#a3ebb1] rounded-sm"></div> Added</span>
                  <span className="flex items-center gap-1"><div className="w-3 h-3 bg-[#ffeef0] border border-[#f4a9b4] rounded-sm"></div> Removed</span>
                </div>
                <div className="max-h-96 overflow-y-auto whitespace-pre-wrap text-sm text-ink-2 bg-surface-2 p-3 rounded-lg border border-border font-mono leading-relaxed">
                  {diffResult.map((part, index) => (
                    <span 
                      key={index}
                      className={
                        part.added ? "bg-[#e6ffed] text-[#22863a] py-0.5 rounded-sm" :
                        part.removed ? "bg-[#ffeef0] text-[#cb2431] line-through py-0.5 rounded-sm" :
                        ""
                      }
                    >
                      {part.value}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-4 mt-4 border-t border-border">
              <button
                type="button"
                onClick={processFiles}
                disabled={!file1 || !file2 || processing}
                className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-accent-ink transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {processing ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-accent-ink/40 border-t-accent-ink" />
                    Comparing...
                  </>
                ) : (
                  <>Compare Documents</>
                )}
              </button>
            </div>
         </>

      <input ref={inputRef1} type="file" accept=".pdf,application/pdf" className="hidden" onChange={(e) => { if (e.target.files) addFile1(e.target.files); e.target.value = ""; }} />
      <input ref={inputRef2} type="file" accept=".pdf,application/pdf" className="hidden" onChange={(e) => { if (e.target.files) addFile2(e.target.files); e.target.value = ""; }} />
    </div>
  );
}
