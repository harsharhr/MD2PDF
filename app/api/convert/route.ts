import { NextRequest, NextResponse } from "next/server";
import { renderMarkdown, buildHtmlDocument } from "@/lib/markdown";
import { htmlToPdf } from "@/lib/pdf";
import {
  createTask,
  completeTask,
  failTask,
  getTaskMeta,
  publicTask,
} from "@/lib/tasks";
import { DEFAULT_PAIR } from "@/lib/formats";

export const runtime = "nodejs";
export const maxDuration = 60;

// Vercel serverless functions hard-cap the request body at 4.5 MB, so uploads
// larger than this can't reach us through a direct multipart POST — we reject
// them with a clear message rather than letting the platform return an opaque
// 413. Supporting bigger files requires client-direct-to-blob uploads (see README).
const MAX_BYTES = 4 * 1024 * 1024;

export async function POST(req: NextRequest) {
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Expected multipart/form-data upload." }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }
  if (file.size === 0) {
    return NextResponse.json({ error: "The uploaded file is empty." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: `File exceeds the ${MAX_BYTES / 1024 / 1024} MB limit for this plan.` },
      { status: 413 }
    );
  }

  const sourceName = file.name || "document.md";
  const outputFilename = sourceName.replace(/\.[^.]+$/, "") + ".pdf";

  let id: string;
  try {
    id = await createTask({
      sourceFilename: sourceName,
      sourceFormat: DEFAULT_PAIR.source.label,
      targetFormat: DEFAULT_PAIR.target.label,
      inputSizeBytes: file.size,
      outputFilename,
    });
  } catch {
    return NextResponse.json(
      { error: "Storage is unavailable. Please try again shortly." },
      { status: 503 }
    );
  }

  try {
    const markdown = await file.text();
    if (!markdown.trim()) throw new Error("The file contains no readable text.");
    const bodyHtml = renderMarkdown(markdown);
    const html = buildHtmlDocument(bodyHtml, outputFilename.replace(/\.pdf$/, ""));
    const pdf = await htmlToPdf(html);
    await completeTask(id, pdf);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Conversion failed.";
    await failTask(id, message);
  }

  const row = await getTaskMeta(id);
  if (!row) {
    return NextResponse.json({ error: "Task disappeared unexpectedly." }, { status: 500 });
  }
  // 200 even on a failed task lets the client render the error state uniformly.
  return NextResponse.json(publicTask(row));
}
