import Link from "next/link";

const COLUMNS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Company",
    links: [
      { label: "About", href: "/#" },
      { label: "Blog", href: "/#" },
      { label: "Careers", href: "/#" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Documentation", href: "/#" },
      { label: "API Reference", href: "/#api" },
      { label: "Status", href: "/#" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "/#" },
      { label: "Terms", href: "/#" },
      { label: "Security", href: "/security" },
    ],
  },
  {
    title: "Contact",
    links: [
      { label: "Support", href: "/#" },
      { label: "Sales", href: "/#" },
      { label: "hello@markpress.io", href: "mailto:hello@markpress.io" },
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
          <p>© {2026} MarkPress. File conversion infrastructure.</p>
          <p>All processing is isolated and files are deleted after conversion.</p>
        </div>
      </div>
    </footer>
  );
}
