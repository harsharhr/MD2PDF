import { neon } from "@neondatabase/serverless";

// Conversion-task store backed by Neon Postgres. The file bytes live in Vercel
// Blob (object storage) — Neon holds only metadata plus the blob URLs. This
// keeps large files out of both the serverless request body and the database,
// so uploads well beyond the 4.5 MB function limit are supported.

export type TaskStatus = "queued" | "processing" | "finished" | "failed";

export type ConversionTaskRow = {
  id: string;
  source_filename: string;
  source_format: string;
  target_format: string;
  status: TaskStatus;
  input_size_bytes: number;
  output_size_bytes: number;
  output_filename: string;
  error_message: string | null;
  source_url: string | null;
  output_url: string | null;
  started_at: string;
  finished_at: string | null;
};

function db() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set.");
  return neon(url);
}

let counter = 0;
function makeId(): string {
  counter += 1;
  return `task_${Date.now().toString(36)}_${counter.toString(36)}`;
}

export async function createTask(input: {
  sourceFilename: string;
  sourceFormat: string;
  targetFormat: string;
  inputSizeBytes: number;
  outputFilename: string;
  sourceUrl: string;
}): Promise<string> {
  const sql = db();
  const id = makeId();
  await sql`
    INSERT INTO conversion_tasks
      (id, source_filename, source_format, target_format, status,
       input_size_bytes, output_filename, source_url)
    VALUES
      (${id}, ${input.sourceFilename}, ${input.sourceFormat}, ${input.targetFormat},
       'processing', ${input.inputSizeBytes}, ${input.outputFilename}, ${input.sourceUrl})
  `;
  // Opportunistic cleanup of tasks older than 24h. Delete the output blobs
  // FIRST, then the rows — deleting rows alone leaks the converted files in
  // Blob storage forever (they'd have no surviving reference to clean by).
  try {
    const expired = (await sql`
      SELECT output_url FROM conversion_tasks
      WHERE started_at < now() - interval '24 hours' AND output_url IS NOT NULL
      LIMIT 100
    `) as { output_url: string }[];
    if (expired.length) {
      const { del } = await import("@vercel/blob");
      await del(expired.map((r) => r.output_url));
    }
    await sql`DELETE FROM conversion_tasks WHERE started_at < now() - interval '24 hours'`;
  } catch {
    /* cleanup is best-effort; never block a new conversion on it */
  }
  return id;
}

export async function completeTask(
  id: string,
  outputUrl: string,
  outputSizeBytes: number
): Promise<void> {
  const sql = db();
  await sql`
    UPDATE conversion_tasks
    SET status = 'finished', output_url = ${outputUrl},
        output_size_bytes = ${outputSizeBytes}, finished_at = now()
    WHERE id = ${id}
  `;
}

export async function failTask(id: string, message: string): Promise<void> {
  const sql = db();
  await sql`
    UPDATE conversion_tasks
    SET status = 'failed', error_message = ${message}, finished_at = now()
    WHERE id = ${id}
  `;
}

export async function getTaskMeta(id: string): Promise<ConversionTaskRow | null> {
  const sql = db();
  const rows = (await sql`
    SELECT id, source_filename, source_format, target_format, status,
           input_size_bytes, output_size_bytes, output_filename,
           error_message, source_url, output_url, started_at, finished_at
    FROM conversion_tasks WHERE id = ${id}
  `) as ConversionTaskRow[];
  return rows[0] ?? null;
}

// Where to fetch the finished PDF from (a public Vercel Blob URL).
export async function getTaskOutput(
  id: string
): Promise<{ url: string; filename: string } | null> {
  const sql = db();
  const rows = (await sql`
    SELECT output_url, output_filename, status
    FROM conversion_tasks WHERE id = ${id}
  `) as { output_url: string | null; output_filename: string; status: TaskStatus }[];
  const row = rows[0];
  if (!row || row.status !== "finished" || !row.output_url) return null;
  return { url: row.output_url, filename: row.output_filename };
}

// Public, serializable view of a task.
export function publicTask(row: ConversionTaskRow) {
  return {
    id: row.id,
    sourceFilename: row.source_filename,
    sourceFormat: row.source_format,
    targetFormat: row.target_format,
    status: row.status,
    inputSizeBytes: row.input_size_bytes,
    outputSizeBytes: row.output_size_bytes,
    outputFilename: row.output_filename,
    downloadUrl: row.status === "finished" ? `/api/download/${row.id}` : null,
    errorMessage: row.error_message,
    startedAt: row.started_at,
    finishedAt: row.finished_at,
  };
}

export type PublicTask = ReturnType<typeof publicTask>;
