import Link from "next/link";

// PDFtoolsmd.com wordmark — a compact, geometric "document" glyph plus the name.
export default function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5 text-ink" aria-label="PDFtoolsmd.com home">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-red-500 to-rose-600 text-white shadow-sm">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16c0 1.1.9 2 2 2h12a2 2 0 0 0 2-2V8l-6-6z" />
          <path d="M14 3v5h5M16 13H8M16 17H8M10 9H8" />
        </svg>
      </span>
      <span className="text-[18px] font-bold tracking-tight text-ink">
        PDF<span className="text-accent">tools</span>md
      </span>
    </Link>
  );
}
