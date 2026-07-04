import Link from "next/link";
import type { Metadata } from "next";
import { TOOLS, TOOL_CATEGORIES, type ToolCategory } from "@/lib/tools";

export const metadata: Metadata = {
  title: "PDFtoolsmd.com — Every PDF tool you need, free and private",
  description:
    "Merge, split, compress, convert, rotate, unlock, and watermark PDFs with ease. All tools are free, run in your browser, and your files never leave your device.",
  keywords: [
    "pdf tools",
    "merge pdf",
    "split pdf",
    "compress pdf",
    "pdf to word",
    "pdf to excel",
    "pdf to jpg",
    "word to pdf",
    "pdf converter",
    "PDFtoolsmd.com",
  ],
};

// Category display order
const CATEGORY_ORDER: ToolCategory[] = [
  "organize",
  "convert-to-pdf",
  "convert-from-pdf",
  "optimize",
  "security",
  "edit",
];

// Category colors for the icon backgrounds
const CATEGORY_ICON_COLORS: Record<ToolCategory, string> = {
  organize: "bg-indigo-100 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400",
  optimize: "bg-cyan-100 text-cyan-600 dark:bg-cyan-500/15 dark:text-cyan-400",
  "convert-to-pdf": "bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400",
  "convert-from-pdf": "bg-orange-100 text-orange-600 dark:bg-orange-500/15 dark:text-orange-400",
  security: "bg-purple-100 text-purple-600 dark:bg-purple-500/15 dark:text-purple-400",
  edit: "bg-teal-100 text-teal-600 dark:bg-teal-500/15 dark:text-teal-400",
};

export default function Home() {
  return (
    <div className="mx-auto max-w-[1180px] px-5">
      {/* Hero */}
      <section className="pt-16 pb-12 text-center sm:pt-24 sm:pb-16">
        <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-1.5 text-xs font-medium text-ink-2">
          <span className="h-1.5 w-1.5 rounded-full bg-ok animate-pulse" />
          100% free · No sign-up · Files stay on your device
        </div>
        <h1 className="mx-auto max-w-3xl text-balance text-4xl font-bold tracking-tight text-ink sm:text-5xl lg:text-6xl">
          Every PDF tool you need,{" "}
          <span className="bg-gradient-to-r from-accent to-[#e91e63] bg-clip-text text-transparent">
            all in one place
          </span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-pretty text-[15px] leading-relaxed text-ink-2 sm:text-lg">
          Merge, split, compress, convert, rotate, unlock, and watermark PDFs
          with ease. All tools run directly in your browser — your files never
          leave your device.
        </p>
      </section>

      {/* Tool grid by category */}
      <section className="pb-20">
        {CATEGORY_ORDER.map((cat) => {
          const tools = TOOLS.filter((t) => t.category === cat && t.enabled);
          if (tools.length === 0) return null;
          const catMeta = TOOL_CATEGORIES[cat];
          return (
            <div key={cat} className="mb-12 last:mb-0">
              <h2 className="mb-5 text-lg font-semibold tracking-tight text-ink flex items-center gap-2">
                <span
                  className="inline-block h-3 w-3 rounded-sm"
                  style={{ backgroundColor: catMeta.color }}
                />
                {catMeta.label}
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {tools.map((tool) => (
                  <Link
                    key={tool.slug}
                    href={`/tools/${tool.slug}`}
                    className="group relative rounded-2xl border border-border bg-surface p-5 transition-all duration-200 hover:border-border-strong hover:bg-surface-2 hover:shadow-[0_4px_20px_-6px_rgba(0,0,0,0.12)] hover:-translate-y-0.5"
                  >
                    <div
                      className={`mb-3 grid h-11 w-11 place-items-center rounded-xl text-lg ${CATEGORY_ICON_COLORS[cat]}`}
                    >
                      {tool.icon}
                    </div>
                    <h3 className="text-[15px] font-semibold text-ink group-hover:text-accent transition-colors">
                      {tool.name}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-ink-3 line-clamp-2">
                      {tool.tagline}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </section>

      {/* Trust section */}
      <section className="border-t border-border pt-16 pb-20">
        <div className="grid gap-10 md:grid-cols-3">
          <div className="text-center">
            <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-surface-2 text-2xl">
              🔒
            </div>
            <h3 className="text-[15px] font-semibold text-ink">100% Private</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-2">
              Your files are processed directly in your browser. They never leave your
              device and are never uploaded to any server.
            </p>
          </div>
          <div className="text-center">
            <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-surface-2 text-2xl">
              ⚡
            </div>
            <h3 className="text-[15px] font-semibold text-ink">Lightning Fast</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-2">
              All processing happens locally on your device. No upload wait times,
              no server queues — results are instant.
            </p>
          </div>
          <div className="text-center">
            <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-surface-2 text-2xl">
              💰
            </div>
            <h3 className="text-[15px] font-semibold text-ink">Completely Free</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-2">
              No hidden charges, no sign-up required, no file limits. Use all
              tools as many times as you need.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
