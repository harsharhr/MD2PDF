"use client";

import { useState } from "react";

export default function HtmlToPdf() {
  const [htmlContent, setHtmlContent] = useState("");
  const [processing, setProcessing] = useState(false);

  const printPdf = () => {
    if (!htmlContent) return;
    setProcessing(true);
    
    // Create hidden iframe
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);
    
    // Write HTML to iframe
    const doc = iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(htmlContent);
      doc.close();
      
      // Wait for resources to load then print
      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        
        // Cleanup after print dialog opens
        setTimeout(() => {
          document.body.removeChild(iframe);
          setProcessing(false);
        }, 1000);
      }, 500);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setHtmlContent(event.target?.result as string);
      };
      reader.readAsText(file);
    }
    // reset input
    e.target.value = '';
  };

  return (
    <div className="rounded-2xl border border-border bg-surface p-3 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-12px_rgba(0,0,0,0.12)] sm:p-4">
      <div className="space-y-4">
        
        <div className="flex justify-between items-end">
           <label className="block text-sm font-medium text-ink">Paste HTML Code</label>
           
           <div className="relative">
             <input type="file" accept=".html,.htm" id="html-upload" className="hidden" onChange={handleFileUpload} />
             <label htmlFor="html-upload" className="cursor-pointer text-xs font-medium text-accent hover:underline flex items-center gap-1">
               <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
               Upload .html file instead
             </label>
           </div>
        </div>
        
        <textarea
          value={htmlContent}
          onChange={(e) => setHtmlContent(e.target.value)}
          placeholder="<h1>Hello World</h1>\n<p>This is a paragraph.</p>"
          className="w-full h-64 rounded-xl border border-border bg-surface-2/50 p-4 text-sm font-mono text-ink outline-none focus:border-accent resize-y"
        />

        <div className="flex items-center gap-3 rounded-lg bg-surface-2 px-3 py-2 text-xs text-ink-3">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
             <circle cx="12" cy="12" r="10"/>
             <line x1="12" y1="16" x2="12" y2="12"/>
             <line x1="12" y1="8" x2="12.01" y2="8"/>
          </svg>
          <p>This uses your browser's native printing engine for highest accuracy. When the print dialog opens, select "Save as PDF".</p>
        </div>

        <div className="flex justify-end pt-2 border-t border-border mt-4">
          <button
            type="button"
            onClick={printPdf}
            disabled={processing || !htmlContent.trim()}
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-accent-ink transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {processing ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-accent-ink/40 border-t-accent-ink" />
                Preparing…
              </>
            ) : (
              <>Generate PDF</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
