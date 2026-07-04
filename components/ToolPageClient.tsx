"use client";

import dynamic from "next/dynamic";
import type { ToolDef } from "@/lib/tools";

// Lazy-load each tool component so only the needed one is bundled per page
const MergePdf = dynamic(() => import("./tools/MergePdf"));
const SplitPdf = dynamic(() => import("./tools/SplitPdf"));
const RotatePdf = dynamic(() => import("./tools/RotatePdf"));
const CompressPdf = dynamic(() => import("./tools/CompressPdf"));
const ProtectPdf = dynamic(() => import("./tools/ProtectPdf"));
const UnlockPdf = dynamic(() => import("./tools/UnlockPdf"));
const OrganizePdf = dynamic(() => import("./tools/OrganizePdf"));
const WatermarkPdf = dynamic(() => import("./tools/WatermarkPdf"));
const PageNumbers = dynamic(() => import("./tools/PageNumbers"));
const CropPdf = dynamic(() => import("./tools/CropPdf"));
const RepairPdf = dynamic(() => import("./tools/RepairPdf"));
const JpgToPdf = dynamic(() => import("./tools/JpgToPdf"));
const PdfToJpg = dynamic(() => import("./tools/PdfToJpg"));
const EditPdf = dynamic(() => import("./tools/EditPdf"));
const SignPdf = dynamic(() => import("./tools/SignPdf"));
const RedactPdf = dynamic(() => import("./tools/RedactPdf"));
const ComparePdf = dynamic(() => import("./tools/ComparePdf"));
const OcrPdf = dynamic(() => import("./tools/OcrPdf"));
const HtmlToPdf = dynamic(() => import("./tools/HtmlToPdf"));

const TOOL_COMPONENTS: Record<string, React.ComponentType> = {
  "merge-pdf": MergePdf,
  "split-pdf": SplitPdf,
  "rotate-pdf": RotatePdf,
  "compress-pdf": CompressPdf,
  "protect-pdf": ProtectPdf,
  "unlock-pdf": UnlockPdf,
  "organize-pdf": OrganizePdf,
  "watermark-pdf": WatermarkPdf,
  "page-numbers": PageNumbers,
  "crop-pdf": CropPdf,
  "repair-pdf": RepairPdf,
  "jpg-to-pdf": JpgToPdf,
  "pdf-to-jpg": PdfToJpg,
  "edit-pdf": EditPdf,
  "sign-pdf": SignPdf,
  "redact-pdf": RedactPdf,
  "compare-pdf": ComparePdf,
  "ocr-pdf": OcrPdf,
  "html-to-pdf": HtmlToPdf,
};

export default function ToolPageClient({ tool }: { tool: ToolDef }) {
  const Component = TOOL_COMPONENTS[tool.slug];

  return (
    <div className="mx-auto max-w-[1180px] px-5">
      {/* Hero */}
      <section className="pt-14 pb-8 text-center sm:pt-20">
        <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-surface-2 text-2xl">
          {tool.icon}
        </div>
        <h1 className="mx-auto max-w-2xl text-balance text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          {tool.name}
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-pretty text-[15px] leading-relaxed text-ink-2">
          {tool.tagline}
        </p>
      </section>

      {/* Tool widget */}
      <section className="mx-auto max-w-3xl pb-8">
        {Component ? (
          <Component />
        ) : (
          <div className="rounded-2xl border border-border bg-surface p-10 text-center">
            <p className="text-ink-2">This tool is coming soon!</p>
          </div>
        )}
      </section>

      {/* Trust strip */}
      <section className="mx-auto flex max-w-2xl flex-wrap items-center justify-center gap-x-6 gap-y-2 pb-10 pt-4 text-xs text-ink-3">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-1 w-1 rounded-full bg-ink-3" /> Processed in your browser
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-1 w-1 rounded-full bg-ink-3" /> Files never uploaded
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-1 w-1 rounded-full bg-ink-3" /> No account required
        </span>
      </section>
    </div>
  );
}
