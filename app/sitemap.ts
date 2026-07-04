import type { MetadataRoute } from "next";
import { FORMAT_PAIRS } from "@/lib/formats";
import { TOOLS } from "@/lib/tools";

// Update to the custom domain once pdftoolsmd.com is connected in Vercel.
const SITE_URL = "https://pdftoolsmd.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = ["", "/pricing", "/security"].map((path) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: "monthly" as const,
    priority: path === "" ? 1 : 0.6,
  }));

  // Collect all tool slugs (deduplicate between formats and tools)
  const seen = new Set<string>();
  const toolPages: MetadataRoute.Sitemap = [];

  for (const t of TOOLS.filter((t) => t.enabled)) {
    if (!seen.has(t.slug)) {
      seen.add(t.slug);
      toolPages.push({
        url: `${SITE_URL}/tools/${t.slug}`,
        changeFrequency: "monthly" as const,
        priority: 0.8,
      });
    }
  }

  for (const p of FORMAT_PAIRS.filter((p) => p.enabled)) {
    if (!seen.has(p.slug)) {
      seen.add(p.slug);
      toolPages.push({
        url: `${SITE_URL}/tools/${p.slug}`,
        changeFrequency: "monthly" as const,
        priority: 0.8,
      });
    }
  }

  return [...staticPages, ...toolPages];
}
