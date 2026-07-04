import Link from "next/link";
import Logo from "./Logo";
import ThemeToggle from "./ThemeToggle";

const NAV = [
  { label: "Tools", href: "/" },
  { label: "API", href: "/#api" },
  { label: "Pricing", href: "/pricing" },
];

// Shared across every page. ~68px tall, sticky, with a hairline bottom border.
export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg/85 backdrop-blur-md">
      <div className="mx-auto flex h-[68px] max-w-[1180px] items-center gap-6 px-5">
        <Logo />
        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          <Link
            href="/#"
            className="hidden rounded-md px-3 py-2 text-sm font-medium text-ink-2 transition-colors hover:text-ink sm:block"
          >
            Sign in
          </Link>
          <Link
            href="/#"
            className="rounded-md bg-ink px-3.5 py-2 text-sm font-semibold text-bg transition-opacity hover:opacity-90"
          >
            Sign up
          </Link>
        </div>
      </div>
    </header>
  );
}
