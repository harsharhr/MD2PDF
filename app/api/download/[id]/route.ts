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

  return new NextResponse(new Uint8Array(result.output), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Length": String(result.size),
      "Content-Disposition": `attachment; filename="${result.filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
