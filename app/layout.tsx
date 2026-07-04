import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Google AdSense publisher id — change here if the account changes.
const ADSENSE_CLIENT = "ca-pub-4910237367995817";

const SITE_URL = "https://pdftoolsmd.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "PDFtoolsmd.com — Free Online PDF Tools: Merge, Split, Compress, Convert",
    template: "%s",
  },
  description:
    "Free online PDF tools. Merge, split, compress, convert, rotate, protect, and watermark PDFs. All tools run in your browser — your files never leave your device.",
  keywords: [
    "pdf tools",
    "merge pdf",
    "split pdf",
    "compress pdf",
    "pdf to word",
    "pdf to excel",
    "word to pdf",
    "pdf converter",
    "rotate pdf",
    "protect pdf",
    "PDFtoolsmd.com",
  ],
  applicationName: "PDFtoolsmd.com",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "PDFtoolsmd.com",
    url: SITE_URL,
    title: "PDFtoolsmd.com — Free Online PDF Tools",
    description:
      "Free online PDF tools. Merge, split, compress, convert, rotate, protect, and watermark PDFs — all processed in your browser.",
  },
  twitter: {
    card: "summary_large_image",
    title: "PDFtoolsmd.com — Free Online PDF Tools",
    description: "Merge, split, compress, convert, rotate, protect, and watermark PDFs — all free and private.",
  },
  // AdSense ownership verification (also present via public/ads.txt).
  other: { "google-adsense-account": ADSENSE_CLIENT },
};

// Set the theme class before paint to avoid a flash of the wrong theme.
const themeScript = `
(function(){try{
  var t = localStorage.getItem('theme');
  var d = t ? t === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (d) document.documentElement.classList.add('dark');
}catch(e){}})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="flex min-h-full flex-col antialiased">
        {/* Google AdSense loader */}
        <Script
          id="adsense"
          async
          strategy="afterInteractive"
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
          crossOrigin="anonymous"
        />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
