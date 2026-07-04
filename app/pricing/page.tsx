import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Pricing — MarkPress",
  description: "Simple, credit-based pricing for file conversion at any scale.",
};

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-2xl px-5 py-24 text-center">
      <p className="text-sm font-medium uppercase tracking-wider text-accent">Pricing</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink">
        Credit-based plans, coming soon
      </h1>
      <p className="mx-auto mt-3 max-w-md text-ink-2">
        Free, Package, Subscription, and Enterprise tiers built around conversion credits. The
        converter is fully usable today — billing is next.
      </p>
      <div className="mt-8">
        <Link
          href="/"
          className="rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-accent-ink hover:opacity-90"
        >
          Convert a file now
        </Link>
      </div>
    </div>
  );
}
