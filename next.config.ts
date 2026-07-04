import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // These packages ship native/binary assets (Chromium, brotli) or expect to be
  // required at runtime — keep them out of the bundler and load from node_modules.
  serverExternalPackages: [
    "puppeteer",
    "puppeteer-core",
    "@sparticuz/chromium",
    "@neondatabase/serverless",
    "@turbodocx/html-to-docx",
    "xlsx",
    "pptxgenjs",
  ],
  // Force the Chromium binary pack into the /api/convert function bundle. Without
  // this, Next's tracer misses bin/ (loaded via a computed path) and the function
  // throws "input directory .../@sparticuz/chromium/bin does not exist" on Vercel.
  outputFileTracingIncludes: {
    "/api/convert": ["./node_modules/@sparticuz/chromium/bin/**/*"],
  },
};

export default nextConfig;
