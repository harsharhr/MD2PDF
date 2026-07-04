import Link from "next/link";

const COLUMNS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Popular Tools",
    links: [
      { label: "Merge PDF", href: "/tools/merge-pdf" },
      { label: "Split PDF", href: "/tools/split-pdf" },
      { label: "Compress PDF", href: "/tools/compress-pdf" },
      { label: "PDF to Word", href: "/tools/pdf-to-word" },
      { label: "Word to PDF", href: "/tools/word-to-pdf" },
    ],
  },
  {
    title: "More Tools",
    links: [
      { label: "PDF to Excel", href: "/tools/pdf-to-excel" },
      { label: "PDF to JPG", href: "/tools/pdf-to-jpg" },
      { label: "JPG to PDF", href: "/tools/jpg-to-pdf" },
      { label: "Rotate PDF", href: "/tools/rotate-pdf" },
      { label: "Protect PDF", href: "/tools/protect-pdf" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "All Tools", href: "/" },
      { label: "API Reference", href: "/#api" },
      { label: "Pricing", href: "/pricing" },
      { label: "Security", href: "/security" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/#" },
      { label: "Privacy", href: "/#" },
      { label: "Terms", href: "/#" },
      { label: "hello@pdftoolsmd.com", href: "mailto:hello@pdftoolsmd.com" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-border bg-surface">
      <div className="mx-auto max-w-[1180px] px-5 py-14">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-ink-3">
                {col.title}
              </h3>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-ink-2 transition-colors hover:text-ink"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-border pt-6 text-xs text-ink-3 sm:flex-row sm:items-center">
          <p>© {2026} PDFtoolsmd.com. Every PDF tool you need, free and private.</p>
          <p>Client-side processing — your files never leave your device.</p>
        </div>
      </div>
    </footer>
  );
}
