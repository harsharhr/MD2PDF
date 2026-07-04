import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { ALLOWED_CONTENT_TYPES, MAX_UPLOAD_BYTES } from "@/lib/limits";

export const runtime = "nodejs";

// Issues short-lived client tokens so the browser can upload the source file
// straight to Vercel Blob, bypassing the serverless request-body limit. The
// large file never passes through this function — only the token handshake does.
export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;
  try {
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: ALLOWED_CONTENT_TYPES,
        maximumSizeInBytes: MAX_UPLOAD_BYTES,
        addRandomSuffix: true,
        // Source uploads are transient; expire them so orphans don't accumulate.
        validUntil: Date.now() + 10 * 60 * 1000,
      }),
      onUploadCompleted: async () => {
        // No-op: conversion is kicked off explicitly by the client afterwards.
        // (This callback is only reachable on a publicly routable deployment.)
      },
    });
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload authorization failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
