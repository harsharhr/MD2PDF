import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import ConverterPage from "@/components/ConverterPage";
import { FORMAT_PAIRS, getFormatPair } from "@/lib/formats";

export function generateStaticParams() {
  return FORMAT_PAIRS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const pair = getFormatPair(slug);
  if (!pair) return { title: "Converter — PDFtoolsmd.com" };
  return { title: pair.metaTitle, description: pair.description };
}

export default async function ToolPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const pair = getFormatPair(slug);
  if (!pair) notFound();

  // UI-ready pairs whose engine isn't wired yet get an honest waitlist state.
  if (!pair.enabled) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-24 text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-ink">{pair.title}</h1>
        <p className="mx-auto mt-3 max-w-md text-ink-2">{pair.description}</p>
        <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-warn-soft px-3 py-1.5 text-sm font-medium text-warn">
          <span className="h-1.5 w-1.5 rounded-full bg-current" />
          Coming soon
        </div>
        <div className="mt-8">
          <Link
            href="/"
            className="rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-accent-ink hover:opacity-90"
          >
            Try the Markdown to PDF converter
          </Link>
        </div>
      </div>
    );
  }

  return <ConverterPage pair={pair} />;
}
