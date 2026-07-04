import type { MetadataRoute } from "next";

// Update to the custom domain once pdftoolsmd.com is connected in Vercel.
const SITE_URL = "https://pdftoolsmd.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
