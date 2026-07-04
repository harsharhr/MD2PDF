import type { MetadataRoute } from "next";
import { FORMAT_PAIRS } from "@/lib/formats";

const SITE_URL = "https://markpress-zeta.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = ["", "/pricing", "/security"].map((path) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: "monthly" as const,
    priority: path === "" ? 1 : 0.6,
  }));

  const toolPages = FORMAT_PAIRS.filter((p) => p.enabled).map((p) => ({
    url: `${SITE_URL}/tools/${p.slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  return [...staticPages, ...toolPages];
}
