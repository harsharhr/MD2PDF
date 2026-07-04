import { NextRequest, NextResponse } from "next/server";
import { put, del } from "@vercel/blob";
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
import { MAX_UPLOAD_BYTES, MAX_UPLOAD_LABEL } from "@/lib/limits";

export const runtime = "nodejs";
export const maxDuration = 60;

// Only accept blob URLs from Vercel Blob storage — never fetch arbitrary URLs.
function isVercelBlobUrl(u: string): boolean {
  try {
    const { protocol, hostname } = new URL(u);
    return protocol === "https:" && hostname.endsWith(".blob.vercel-storage.com");
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  let payload: { blobUrl?: string; filename?: string; size?: number };
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Expected a JSON body." }, { status: 400 });
  }

  const { blobUrl, filename, size } = payload;
  if (!blobUrl || !isVercelBlobUrl(blobUrl)) {
    return NextResponse.json({ error: "Missing or invalid upload reference." }, { status: 400 });
  }
  if (typeof size === "number" && size > MAX_UPLOAD_BYTES) {
    return NextResponse.json(
      { error: `File exceeds the ${MAX_UPLOAD_LABEL} limit.` },
      { status: 413 }
    );
  }

  const sourceName = filename || "document.md";
  const outputFilename = sourceName.replace(/\.[^.]+$/, "") + ".pdf";

  let id: string;
  try {
    id = await createTask({
      sourceFilename: sourceName,
      sourceFormat: DEFAULT_PAIR.source.label,
      targetFormat: DEFAULT_PAIR.target.label,
      inputSizeBytes: typeof size === "number" ? size : 0,
      outputFilename,
      sourceUrl: blobUrl,
    });
  } catch {
    return NextResponse.json(
      { error: "Storage is unavailable. Please try again shortly." },
      { status: 503 }
    );
  }

  try {
    const srcRes = await fetch(blobUrl);
    if (!srcRes.ok) throw new Error("Could not read the uploaded file.");
    const markdown = await srcRes.text();
    if (!markdown.trim()) throw new Error("The file contains no readable text.");

    const bodyHtml = renderMarkdown(markdown);
    const html = buildHtmlDocument(bodyHtml, outputFilename.replace(/\.pdf$/, ""));
    const pdf = await htmlToPdf(html);

    // Store the result in Blob; the id-prefixed path guarantees the download is
    // named correctly and can't collide with another task's output.
    const { url } = await put(`converted/${id}/${outputFilename}`, pdf, {
      access: "public",
      contentType: "application/pdf",
      addRandomSuffix: false,
    });
    await completeTask(id, url, pdf.byteLength);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Conversion failed.";
    await failTask(id, message);
  } finally {
    // The source upload is transient — remove it regardless of outcome.
    try {
      await del(blobUrl);
    } catch {
      /* best-effort cleanup */
    }
  }

  const row = await getTaskMeta(id);
  if (!row) {
    return NextResponse.json({ error: "Task disappeared unexpectedly." }, { status: 500 });
  }
  return NextResponse.json(publicTask(row));
}
