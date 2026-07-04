"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Logo from "./Logo";
import ThemeToggle from "./ThemeToggle";
import { TOOLS, TOOL_CATEGORIES, type ToolCategory } from "@/lib/tools";

const NAV = [
  { label: "API", href: "/#api" },
  { label: "Pricing", href: "/pricing" },
];

const CATEGORY_ORDER: ToolCategory[] = [
  "organize",
  "convert-to-pdf",
  "convert-from-pdf",
  "optimize",
  "security",
  "edit",
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  // Close mega menu on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        btnRef.current &&
        !btnRef.current.contains(e.target as Node)
      ) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }
  }, [menuOpen]);

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setMenuOpen(false);
        setMobileOpen(false);
      }
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg/85 backdrop-blur-md">
      <div className="mx-auto flex h-[68px] max-w-[1180px] items-center gap-6 px-5">
        <Logo />

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {/* Tools mega-menu trigger */}
          <div className="relative">
            <button
              ref={btnRef}
              onClick={() => setMenuOpen(!menuOpen)}
              className={`flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                menuOpen
                  ? "bg-surface-2 text-ink"
                  : "text-ink-2 hover:bg-surface-2 hover:text-ink"
              }`}
            >
              Tools
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`transition-transform ${menuOpen ? "rotate-180" : ""}`}
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>

            {/* Mega menu dropdown */}
            {menuOpen && (
              <div
                ref={menuRef}
                className="absolute left-1/2 top-full mt-2 w-[720px] -translate-x-1/2 rounded-2xl border border-border bg-surface p-5 shadow-[0_12px_48px_-12px_rgba(0,0,0,0.25)] animate-in fade-in slide-in-from-top-2 duration-150"
              >
                <div className="grid grid-cols-3 gap-x-6 gap-y-4">
                  {CATEGORY_ORDER.map((cat) => {
                    const tools = TOOLS.filter(
                      (t) => t.category === cat && t.enabled
                    );
                    if (tools.length === 0) return null;
                    const catMeta = TOOL_CATEGORIES[cat];
                    return (
                      <div key={cat}>
                        <h4 className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-ink-3">
                          <span
                            className="inline-block h-2 w-2 rounded-sm"
                            style={{ backgroundColor: catMeta.color }}
                          />
                          {catMeta.label}
                        </h4>
                        <ul className="space-y-0.5">
                          {tools.map((tool) => (
                            <li key={tool.slug}>
                              <Link
                                href={`/tools/${tool.slug}`}
                                onClick={() => setMenuOpen(false)}
                                className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink"
                              >
                                <span className="text-base leading-none">
                                  {tool.icon}
                                </span>
                                {tool.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-4 border-t border-border pt-3 text-center">
                  <Link
                    href="/"
                    onClick={() => setMenuOpen(false)}
                    className="text-sm font-medium text-accent hover:underline"
                  >
                    View all tools →
                  </Link>
                </div>
              </div>
            )}
          </div>

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

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="grid h-9 w-9 place-items-center rounded-lg text-ink-2 hover:bg-surface-2 md:hidden"
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-border bg-surface px-5 py-4 md:hidden">
          <div className="space-y-4 max-h-[70vh] overflow-y-auto">
            {CATEGORY_ORDER.map((cat) => {
              const tools = TOOLS.filter((t) => t.category === cat && t.enabled);
              if (tools.length === 0) return null;
              const catMeta = TOOL_CATEGORIES[cat];
              return (
                <div key={cat}>
                  <h4 className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-ink-3 flex items-center gap-1.5">
                    <span className="inline-block h-2 w-2 rounded-sm" style={{ backgroundColor: catMeta.color }} />
                    {catMeta.label}
                  </h4>
                  <div className="grid grid-cols-2 gap-1">
                    {tools.map((tool) => (
                      <Link
                        key={tool.slug}
                        href={`/tools/${tool.slug}`}
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-ink-2 hover:bg-surface-2 hover:text-ink"
                      >
                        <span className="text-base leading-none">{tool.icon}</span>
                        {tool.name}
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
            <div className="flex items-center gap-2 border-t border-border pt-3">
              <Link
                href="/#api"
                onClick={() => setMobileOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-medium text-ink-2 hover:text-ink"
              >
                API
              </Link>
              <Link
                href="/pricing"
                onClick={() => setMobileOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-medium text-ink-2 hover:text-ink"
              >
                Pricing
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
