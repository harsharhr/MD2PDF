"use client";

import { useCallback, useRef, useState } from "react";
import type { FormatPair } from "@/lib/formats";
import type { PublicTask } from "@/lib/tasks";
import { formatBytes } from "@/lib/format";
import StatusBadge from "./StatusBadge";

type ItemStatus = "ready" | "processing" | "finished" | "failed";

type QueueItem = {
  id: string;
  file: File;
  status: ItemStatus;
  result: PublicTask | null;
  error: string | null;
};

let localCounter = 0;
const nextId = () => `f${(localCounter += 1)}`;

function FormatChip({ label, tone }: { label: string; tone: "source" | "target" }) {
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold ${
        tone === "target"
          ? "bg-accent-soft text-accent"
          : "bg-surface-2 text-ink-2 border border-border"
      }`}
    >
      {label}
    </span>
  );
}

function Arrow() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-ink-3">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export default function ConverterWidget({ pair }: { pair: FormatPair }) {
  const [items, setItems] = useState<QueueItem[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback((files: FileList | File[]) => {
    const incoming = Array.from(files).map((file) => ({
      id: nextId(),
      file,
      status: "ready" as ItemStatus,
      result: null,
      error: null,
    }));
    if (incoming.length) setItems((prev) => [...prev, ...incoming]);
  }, []);

  const removeItem = (id: string) => setItems((prev) => prev.filter((i) => i.id !== id));
  const clearAll = () => setItems([]);

  async function convertOne(item: QueueItem) {
    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, status: "processing", error: null } : i))
    );
    try {
      const body = new FormData();
      body.append("file", item.file);
      const res = await fetch("/api/convert", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Conversion failed.");
      const task = data as PublicTask;
      setItems((prev) =>
        prev.map((i) =>
          i.id === item.id
            ? task.status === "finished"
              ? { ...i, status: "finished", result: task, error: null }
              : { ...i, status: "failed", error: task.errorMessage || "Conversion failed." }
            : i
        )
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "Conversion failed.";
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, status: "failed", error: message } : i))
      );
    }
  }

  async function convertAll() {
    const pending = items.filter((i) => i.status === "ready" || i.status === "failed");
    await Promise.all(pending.map(convertOne));
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
  };

  const hasReady = items.some((i) => i.status === "ready" || i.status === "failed");
  const anyProcessing = items.some((i) => i.status === "processing");
  const isEmpty = items.length === 0;

  return (
    <div className="rounded-2xl border border-border bg-surface p-3 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-12px_rgba(0,0,0,0.12)] sm:p-4">
      {/* Dropzone / empty state */}
      {isEmpty ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-14 text-center transition-colors ${
            dragOver ? "border-accent bg-accent-soft/40" : "border-border-strong bg-surface-2/40"
          }`}
        >
          <div className="mb-4 grid h-12 w-12 place-items-center rounded-full bg-surface text-accent shadow-sm">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 16V4M7 9l5-5 5 5" />
              <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
            </svg>
          </div>
          <p className="text-[15px] font-medium text-ink">
            Drop your {pair.source.name} file here
          </p>
          <p className="mt-1 text-sm text-ink-2">or choose a file to get started</p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-accent-ink transition-opacity hover:opacity-90"
            >
              Select file
            </button>
            <button
              type="button"
              disabled
              title="Cloud imports available on paid plans"
              className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-ink-3"
            >
              Select file source
            </button>
          </div>
          <p className="mt-4 text-xs text-ink-3">
            Accepts {pair.source.extensions.map((e) => "." + e).join(", ")} · up to 5 MB
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {/* File / conversion / result rows */}
          {items.map((item) => (
            <div
              key={item.id}
              className="rounded-xl border border-border bg-surface-2/50 p-3 sm:p-3.5"
            >
              <div className="flex items-center gap-3">
                {/* File icon */}
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-surface text-ink-2">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 3.5h8l4 4V20a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1z" />
                    <path d="M13.5 3.5V8h4" />
                  </svg>
                </div>

                {/* Name + meta */}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">
                    {item.status === "finished" && item.result
                      ? item.result.outputFilename
                      : item.file.name}
                  </p>
                  <div className="mt-0.5 flex items-center gap-2 text-xs text-ink-3">
                    {item.status === "finished" && item.result ? (
                      <span>{formatBytes(item.result.outputSizeBytes)} · PDF</span>
                    ) : (
                      <span>{formatBytes(item.file.size)}</span>
                    )}
                  </div>
                </div>

                {/* Format chips */}
                <div className="hidden items-center gap-2 sm:flex">
                  <FormatChip label={pair.source.label} tone="source" />
                  <Arrow />
                  <FormatChip label={pair.target.label} tone="target" />
                </div>

                {/* Status */}
                <div className="shrink-0">
                  <StatusBadge status={item.status} />
                </div>

                {/* Row action */}
                <div className="shrink-0">
                  {item.status === "finished" && item.result?.downloadUrl ? (
                    <a
                      href={item.result.downloadUrl}
                      download={item.result.outputFilename}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-ink px-3 py-2 text-xs font-semibold text-bg transition-opacity hover:opacity-90"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 4v12M7 11l5 5 5-5" />
                        <path d="M4 20h16" />
                      </svg>
                      Download
                    </a>
                  ) : item.status === "processing" ? (
                    <div className="grid h-8 w-8 place-items-center">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-border-strong border-t-accent" />
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      aria-label="Remove file"
                      className="grid h-8 w-8 place-items-center rounded-lg text-ink-3 transition-colors hover:bg-surface hover:text-err"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M6 6l12 12M18 6L6 18" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              {/* Error message row */}
              {item.status === "failed" && item.error && (
                <div className="mt-2.5 flex items-center justify-between gap-3 rounded-lg bg-err-soft px-3 py-2">
                  <p className="text-xs text-err">{item.error}</p>
                  <button
                    type="button"
                    onClick={() => convertOne(item)}
                    className="shrink-0 rounded-md border border-err/30 px-2.5 py-1 text-xs font-medium text-err transition-colors hover:bg-err/10"
                  >
                    Retry
                  </button>
                </div>
              )}
            </div>
          ))}

          {/* Footer actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-medium text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                Add more files
              </button>
              <button
                type="button"
                onClick={clearAll}
                className="rounded-lg px-3 py-2 text-sm font-medium text-ink-3 transition-colors hover:text-ink"
              >
                Clear
              </button>
            </div>

            <button
              type="button"
              onClick={convertAll}
              disabled={!hasReady || anyProcessing}
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-accent-ink transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {anyProcessing ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-accent-ink/40 border-t-accent-ink" />
                  Converting…
                </>
              ) : (
                <>Convert to {pair.target.label}</>
              )}
            </button>
          </div>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={pair.source.accept}
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files) addFiles(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
}
