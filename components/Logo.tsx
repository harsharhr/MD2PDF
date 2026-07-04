import Link from "next/link";

// PDFtoolsmd.com wordmark — a compact, geometric "document" glyph plus the name.
export default function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5 text-ink" aria-label="PDFtoolsmd.com home">
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-accent text-accent-ink">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 3.5h8l4 4V20a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1z" />
          <path d="M13.5 3.5V8h4" />
          <path d="M8.5 12v4M8.5 12l1.6 2 1.6-2v4M14.5 12v4" strokeWidth="1.6" />
        </svg>
      </span>
      <span className="text-[17px] font-semibold tracking-tight">PDFtoolsmd.com</span>
    </Link>
  );
}
