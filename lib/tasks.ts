import { neon } from "@neondatabase/serverless";

// Conversion-task store backed by Neon Postgres. Serverless functions are
// stateless and isolated, so the task created in /api/convert must be readable
// from a *different* instance in /api/download — hence a shared database rather
// than an in-memory map. PDF bytes are stored as bytea (fine for the <5MB MVP;
// move to object storage for larger files).

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
  started_at: string;
  finished_at: string | null;
};

function db() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set.");
  return neon(url);
}

// Counter-based id (uuid dep avoided). Uniqueness across warm instances is
// backed by a random suffix; the PK constraint is the real guarantee.
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
}): Promise<string> {
  const sql = db();
  const id = makeId();
  await sql`
    INSERT INTO conversion_tasks
      (id, source_filename, source_format, target_format, status,
       input_size_bytes, output_filename)
    VALUES
      (${id}, ${input.sourceFilename}, ${input.sourceFormat}, ${input.targetFormat},
       'queued', ${input.inputSizeBytes}, ${input.outputFilename})
  `;
  // Opportunistic cleanup of results older than 24h.
  await sql`DELETE FROM conversion_tasks WHERE started_at < now() - interval '24 hours'`;
  return id;
}

export async function completeTask(id: string, output: Buffer): Promise<void> {
  const sql = db();
  // node-postgres bytea input: pass a hex-encoded string with \x prefix.
  const hex = "\\x" + output.toString("hex");
  await sql`
    UPDATE conversion_tasks
    SET status = 'finished',
        output = ${hex}::bytea,
        output_size_bytes = ${output.byteLength},
        finished_at = now()
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
           error_message, started_at, finished_at
    FROM conversion_tasks WHERE id = ${id}
  `) as ConversionTaskRow[];
  return rows[0] ?? null;
}

export async function getTaskOutput(
  id: string
): Promise<{ output: Buffer; filename: string; size: number } | null> {
  const sql = db();
  const rows = (await sql`
    SELECT output, output_filename, output_size_bytes, status
    FROM conversion_tasks WHERE id = ${id}
  `) as {
    output: string | null;
    output_filename: string;
    output_size_bytes: number;
    status: TaskStatus;
  }[];
  const row = rows[0];
  if (!row || row.status !== "finished" || !row.output) return null;
  // The serverless driver returns bytea as a Buffer/Uint8Array; older configs
  // hand back a \x-prefixed hex string. Handle both.
  const raw = row.output as unknown;
  let output: Buffer;
  if (typeof raw === "string") {
    const hex = raw.startsWith("\\x") ? raw.slice(2) : raw;
    output = Buffer.from(hex, "hex");
  } else {
    output = Buffer.from(raw as Uint8Array);
  }
  return {
    output,
    filename: row.output_filename,
    size: row.output_size_bytes,
  };
}

// Public, serializable view of a task (no raw output buffer).
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
