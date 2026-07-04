import type { TaskStatus } from "@/lib/tasks";

type Kind = TaskStatus | "ready";

const STYLES: Record<Kind, { label: string; className: string }> = {
  ready: { label: "Ready", className: "bg-accent-soft text-accent" },
  queued: { label: "Queued", className: "bg-warn-soft text-warn" },
  processing: { label: "Processing", className: "bg-warn-soft text-warn" },
  finished: { label: "Finished", className: "bg-ok-soft text-ok" },
  failed: { label: "Failed", className: "bg-err-soft text-err" },
};

export default function StatusBadge({ status }: { status: Kind }) {
  const s = STYLES[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${s.className}`}
    >
      {status === "processing" || status === "queued" ? (
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" />
      ) : (
        <span className="h-1.5 w-1.5 rounded-full bg-current" />
      )}
      {s.label}
    </span>
  );
}
