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
    default: "PDFtoolsmd.com — Convert Markdown to PDF, Word, Excel & PowerPoint",
    template: "%s",
  },
  description:
    "Free online Markdown converter. Turn Markdown into PDF, Word, Excel, PowerPoint, HTML, or plain text — fast, isolated, and files deleted after conversion.",
  keywords: [
    "markdown to pdf",
    "markdown to word",
    "markdown to excel",
    "markdown to powerpoint",
    "md converter",
    "markdown converter",
    "PDFtoolsmd.com",
  ],
  applicationName: "PDFtoolsmd.com",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "PDFtoolsmd.com",
    url: SITE_URL,
    title: "PDFtoolsmd.com — Convert Markdown to PDF, Word, Excel & PowerPoint",
    description:
      "Free online Markdown converter. PDF, Word, Excel, PowerPoint, HTML, and text — files deleted after conversion.",
  },
  twitter: {
    card: "summary_large_image",
    title: "PDFtoolsmd.com — Markdown converters",
    description: "Convert Markdown to PDF, Word, Excel, PowerPoint, HTML, and text.",
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
