import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Pricing — PDFtoolsmd.com",
  description: "Simple, credit-based pricing for file conversion at any scale. Choose from Free, Pro, or Enterprise tiers.",
};

const TIERS = [
  {
    name: "Free",
    price: "$0",
    description: "Perfect for occasional use and quick conversions.",
    features: [
      "10 conversions per day",
      "5MB maximum file size",
      "Standard processing speed",
      "Files deleted after 1 hour",
      "Access to all standard formats",
    ],
    cta: "Start Converting",
    href: "/",
    popular: false,
  },
  {
    name: "Pro",
    price: "$9",
    period: "/month",
    description: "For professionals needing reliable, high-volume conversions.",
    features: [
      "Unlimited conversions",
      "50MB maximum file size",
      "Priority processing queue",
      "Instant deletion after download",
      "API access (1,000 req/mo)",
      "Ad-free experience",
    ],
    cta: "Upgrade to Pro",
    href: "/#",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For teams and platforms requiring custom infrastructure.",
    features: [
      "Unlimited file size",
      "Dedicated processing cluster",
      "Custom data retention policies",
      "Unlimited API access",
      "SLA & 24/7 Priority Support",
    ],
    cta: "Contact Sales",
    href: "mailto:hello@pdftoolsmd.com",
    popular: false,
  },
];

const FAQS = [
  {
    question: "Do I need an account to convert files?",
    answer: "No! Our free tier allows you to convert up to 10 files per day without ever creating an account or handing over your email address.",
  },
  {
    question: "How does the API access work in the Pro tier?",
    answer: "Pro users get access to our REST API, allowing you to integrate our document conversion engines directly into your own applications, scripts, or automated workflows.",
  },
  {
    question: "Are my files secure?",
    answer: "Absolutely. We never read, store, or train AI on your documents. Files are processed in isolated environments and hard-deleted shortly after conversion. Read our full Security policy for details.",
  },
  {
    question: "Can I cancel my Pro subscription at any time?",
    answer: "Yes, you can cancel your subscription from your dashboard at any time. Your Pro benefits will remain active until the end of your current billing cycle.",
  },
];

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-5xl px-5 py-24">
      <div className="text-center">
        <p className="text-sm font-medium uppercase tracking-wider text-accent">Pricing</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-ink sm:text-5xl">
          Simple, transparent pricing
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-ink-2">
          Whether you need to convert a single document or process thousands of files via API, we have a plan that scales with you.
        </p>
      </div>

      <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {TIERS.map((tier) => (
          <div
            key={tier.name}
            className={`relative flex flex-col rounded-2xl border ${
              tier.popular ? "border-accent bg-accent/5 shadow-lg" : "border-border bg-surface"
            } p-8`}
          >
            {tier.popular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-ink">
                Most Popular
              </div>
            )}
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-ink">{tier.name}</h3>
              <p className="mt-2 text-sm text-ink-2 min-h-[40px]">{tier.description}</p>
            </div>
            <div className="mb-6 flex items-baseline text-ink">
              <span className="text-4xl font-bold tracking-tight">{tier.price}</span>
              {tier.period && <span className="ml-1 text-sm font-medium text-ink-2">{tier.period}</span>}
            </div>
            <ul className="mb-8 flex-1 space-y-4">
              {tier.features.map((feature) => (
                <li key={feature} className="flex items-start">
                  <svg
                    className="mr-3 h-5 w-5 shrink-0 text-accent"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm text-ink-2">{feature}</span>
                </li>
              ))}
            </ul>
            <Link
              href={tier.href}
              className={`mt-auto block w-full rounded-lg px-4 py-3 text-center text-sm font-semibold transition-colors ${
                tier.popular
                  ? "bg-accent text-accent-ink hover:opacity-90"
                  : "bg-surface-2 text-ink hover:bg-border"
              }`}
            >
              {tier.cta}
            </Link>
          </div>
        ))}
      </div>

      <div className="mt-24">
        <h2 className="text-center text-2xl font-bold text-ink">Frequently asked questions</h2>
        <div className="mx-auto mt-12 max-w-3xl divide-y divide-border">
          {FAQS.map((faq) => (
            <div key={faq.question} className="py-6">
              <h3 className="text-lg font-medium text-ink">{faq.question}</h3>
              <p className="mt-2 text-base text-ink-2 leading-relaxed">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
