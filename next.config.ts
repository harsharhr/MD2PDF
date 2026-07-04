import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // These packages ship native/binary assets (Chromium, brotli) or expect to be
  // required at runtime — keep them out of the bundler and load from node_modules.
  serverExternalPackages: [
    "puppeteer",
    "puppeteer-core",
    "@sparticuz/chromium",
    "@neondatabase/serverless",
  ],
};

export default nextConfig;
