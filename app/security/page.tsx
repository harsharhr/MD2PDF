import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Security — MarkPress",
  description: "How MarkPress isolates conversion workloads and deletes files after processing.",
};

const POINTS = [
  { title: "Isolated processing", body: "Each conversion runs in an isolated context, separate from other users' jobs." },
  { title: "Deleted after conversion", body: "Uploaded files and their outputs are removed shortly after your download window closes." },
  { title: "Encrypted transfer", body: "All uploads and downloads move over encrypted connections." },
  { title: "No account required", body: "Convert without signing up — nothing is retained against a profile." },
];

export default function SecurityPage() {
  return (
    <div className="mx-auto max-w-2xl px-5 py-24">
      <p className="text-center text-sm font-medium uppercase tracking-wider text-accent">
        Security
      </p>
      <h1 className="mt-3 text-center text-3xl font-semibold tracking-tight text-ink">
        Built to handle your files carefully
      </h1>
      <p className="mx-auto mt-3 max-w-md text-center text-ink-2">
        A full trust and compliance page is on the way. Here is how conversions are handled today.
      </p>
      <div className="mt-10 grid gap-3 sm:grid-cols-2">
        {POINTS.map((p) => (
          <div key={p.title} className="rounded-xl border border-border bg-surface p-5">
            <h2 className="text-[15px] font-semibold text-ink">{p.title}</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-2">{p.body}</p>
          </div>
        ))}
      </div>
      <div className="mt-10 text-center">
        <Link
          href="/"
          className="rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-accent-ink hover:opacity-90"
        >
          Back to the converter
        </Link>
      </div>
    </div>
  );
}
