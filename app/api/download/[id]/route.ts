import { NextRequest, NextResponse } from "next/server";
import { getTaskOutput } from "@/lib/tasks";

export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  let result: Awaited<ReturnType<typeof getTaskOutput>> = null;
  try {
    result = await getTaskOutput(id);
  } catch {
    return NextResponse.json({ error: "Storage is unavailable." }, { status: 503 });
  }

  if (!result) {
    return NextResponse.json(
      { error: "Result not found or expired. Please convert again." },
      { status: 404 }
    );
  }

  // Redirect to the public Blob URL with a download disposition. This keeps large
  // PDFs from streaming back through the serverless function (and its size caps).
  const target = new URL(result.url);
  target.searchParams.set("download", result.filename);
  return NextResponse.redirect(target.toString(), 302);
}
