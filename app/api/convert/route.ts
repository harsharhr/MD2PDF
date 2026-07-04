import { NextRequest, NextResponse } from "next/server";
import { put, del } from "@vercel/blob";
import { convertMarkdown, isTarget, TARGETS, type TargetKey } from "@/lib/convert";
import {
  createTask,
  completeTask,
  failTask,
  getTaskMeta,
  publicTask,
} from "@/lib/tasks";
import { MAX_UPLOAD_BYTES, MAX_UPLOAD_LABEL } from "@/lib/limits";

export const runtime = "nodejs";
// Hobby plan caps this at 60s. On Vercel Pro, raise to 300 here AND bump
// `memory` to 3009 in vercel.json to convert much larger PDFs. See README.
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
  let payload: { blobUrl?: string; filename?: string; size?: number; target?: string };
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Expected a JSON body." }, { status: 400 });
  }

  const { blobUrl, filename, size, target } = payload;
  if (!blobUrl || !isVercelBlobUrl(blobUrl)) {
    return NextResponse.json({ error: "Missing or invalid upload reference." }, { status: 400 });
  }
  
  // If target is "md" (e.g. from pdf-to-md), handle it gracefully
  const targetKey: TargetKey | "md" = typeof target === "string" && (isTarget(target) || target === "md") ? (target as any) : "pdf";
  if (typeof size === "number" && size > MAX_UPLOAD_BYTES) {
    return NextResponse.json(
      { error: `File exceeds the ${MAX_UPLOAD_LABEL} limit.` },
      { status: 413 }
    );
  }

  const sourceName = filename || "document.md";
  const baseName = sourceName.replace(/\.[^.]+$/, "");
  const outputFilename = `${baseName}.${targetKey}`;

  let id: string;
  try {
    id = await createTask({
      sourceFilename: sourceName,
      // Pass original extension or name
      sourceFormat: sourceName.split('.').pop()?.toUpperCase() || "MD",
      targetFormat: targetKey === "md" ? "Markdown" : TARGETS[targetKey as TargetKey].label,
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
    const buffer = Buffer.from(await srcRes.arrayBuffer());

    let markdown: string;
    const extMatch = sourceName.match(/\.([^.]+)$/);
    const ext = extMatch ? extMatch[1].toLowerCase() : "md";

    if (["md", "markdown", "mdown", "mkd", "txt"].includes(ext)) {
      markdown = buffer.toString("utf-8");
    } else {
      // Pass to parser
      const { parseToMarkdown } = await import("@/lib/parse");
      markdown = await parseToMarkdown(buffer, ext);
    }

    if (!markdown.trim()) throw new Error("The file contains no readable text.");

    let finalBuffer: Buffer;
    let contentType: string;

    if (targetKey === "md") {
      finalBuffer = Buffer.from(markdown, "utf-8");
      contentType = "text/markdown";
    } else {
      const result = await convertMarkdown(markdown, targetKey as TargetKey, baseName);
      finalBuffer = result.buffer;
      contentType = result.contentType;
    }

    // Store the result in Blob; the id-prefixed path guarantees the download is
    // named correctly and can't collide with another task's output.
    const { url } = await put(`converted/${id}/${outputFilename}`, finalBuffer, {
      access: "public",
      contentType,
      addRandomSuffix: false,
    });
    await completeTask(id, url, finalBuffer.byteLength);
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
