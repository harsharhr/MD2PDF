import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // These packages ship native/binary assets (Chromium, brotli) or expect to be
  // required at runtime — keep them out of the bundler and load from node_modules.
  // Binary/native packages must stay external (loaded from node_modules). The
  // office ESM packages (@turbodocx/html-to-docx, pptxgenjs) are intentionally
  // NOT listed — externalizing them makes the runtime require() ESM and throws
  // "Cannot use import statement outside a module"; letting Next bundle them fixes it.
  serverExternalPackages: [
    "puppeteer",
    "puppeteer-core",
    "@sparticuz/chromium",
    "@neondatabase/serverless",
    "xlsx",
  ],
  // Force the Chromium binary pack into the /api/convert function bundle. Without
  // this, Next's tracer misses bin/ (loaded via a computed path) and the function
  // throws "input directory .../@sparticuz/chromium/bin does not exist" on Vercel.
  outputFileTracingIncludes: {
    "/api/convert": ["./node_modules/@sparticuz/chromium/bin/**/*"],
  },
};

export default nextConfig;
