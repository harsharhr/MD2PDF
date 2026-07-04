import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import ConverterPage from "@/components/ConverterPage";
import { FORMAT_PAIRS, getFormatPair } from "@/lib/formats";
import { TOOLS, getToolDef } from "@/lib/tools";
import ToolPageClient from "@/components/ToolPageClient";

// Generate static params for BOTH format pairs AND pdf tools
export function generateStaticParams() {
  const formatSlugs = FORMAT_PAIRS.map((p) => ({ slug: p.slug }));
  const toolSlugs = TOOLS.filter((t) => t.enabled).map((t) => ({ slug: t.slug }));
  // Deduplicate — some tools (like word-to-pdf) exist in both systems.
  // The tool system takes priority for those.
  const seen = new Set<string>();
  const params: { slug: string }[] = [];
  for (const s of toolSlugs) {
    if (!seen.has(s.slug)) {
      seen.add(s.slug);
      params.push(s);
    }
  }
  for (const s of formatSlugs) {
    if (!seen.has(s.slug)) {
      seen.add(s.slug);
      params.push(s);
    }
  }
  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  // Check tool system first
  const tool = getToolDef(slug);
  if (tool) {
    return {
      title: `${tool.name} — PDFtoolsmd.com`,
      description: tool.tagline,
    };
  }
  // Fall back to format pair
  const pair = getFormatPair(slug);
  if (pair) return { title: pair.metaTitle, description: pair.description };
  return { title: "Tool — PDFtoolsmd.com" };
}

export default async function ToolPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Check tool system first
  const tool = getToolDef(slug);
  if (tool) {
    // If it uses server conversion, delegate to existing ConverterPage
    if (tool.usesServerConversion) {
      const pair = getFormatPair(slug);
      if (pair && pair.enabled) {
        return <ConverterPage pair={pair} />;
      }
    }
    // Otherwise render the client-side tool page
    return <ToolPageClient tool={tool} />;
  }

  // Fall back to format pair system
  const pair = getFormatPair(slug);
  if (!pair) notFound();

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
            Browse all tools
          </Link>
        </div>
      </div>
    );
  }

  return <ConverterPage pair={pair} />;
}
