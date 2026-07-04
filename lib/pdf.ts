import type { Browser } from "puppeteer-core";

// Running on Vercel / AWS Lambda? Then we can't ship a full Chromium — use the
// Lambda-optimized @sparticuz/chromium binary via puppeteer-core. Locally
// (Windows/macOS dev) we use the full `puppeteer` package and its bundled Chrome.
const IS_SERVERLESS = !!(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);

let browserPromise: Promise<Browser> | null = null;

async function launch(): Promise<Browser> {
  if (IS_SERVERLESS) {
    const chromium = (await import("@sparticuz/chromium")).default;
    const puppeteer = (await import("puppeteer-core")).default;
    return puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: true,
    }) as unknown as Promise<Browser>;
  }
  // Local dev: full puppeteer ships its own Chrome.
  const puppeteer = (await import("puppeteer")).default;
  return puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  }) as unknown as Promise<Browser>;
}

async function getBrowser(): Promise<Browser> {
  if (!browserPromise) browserPromise = launch();
  try {
    const b = await browserPromise;
    if (b.connected) return b;
  } catch {
    /* fall through to relaunch */
  }
  browserPromise = null;
  browserPromise = launch();
  return browserPromise;
}

// Render a complete HTML document to a PDF buffer with print margins + footer.
export async function htmlToPdf(html: string): Promise<Buffer> {
  const browser = await getBrowser();
  const page = await browser.newPage();
  try {
    await page.setContent(html, { waitUntil: "load" });
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "20mm", bottom: "20mm", left: "18mm", right: "18mm" },
      displayHeaderFooter: true,
      headerTemplate: "<span></span>",
      footerTemplate:
        '<div style="width:100%;font-size:8px;color:#999;text-align:center;padding-top:4px;">' +
        '<span class="pageNumber"></span> / <span class="totalPages"></span></div>',
    });
    return Buffer.from(pdf);
  } finally {
    await page.close();
  }
}
