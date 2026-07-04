import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Security & Privacy — PDFtoolsmd.com",
  description: "Enterprise-grade security. Learn how PDFtoolsmd.com isolates conversion workloads, encrypts data in transit, and deletes files after processing.",
};

const SECURITY_PILLARS = [
  {
    title: "Ephemeral Processing",
    body: "Your files never touch persistent storage. Every document is processed in ephemeral memory or short-lived serverless functions. Once the conversion is complete and the download window expires, the data is permanently wiped from the infrastructure.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
    ),
  },
  {
    title: "Data in Transit Encryption",
    body: "All communications between your browser and our conversion servers are secured using TLS 1.2 or higher. Whether you are uploading a sensitive PDF or downloading a converted Word document, your data is protected against interception.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
  },
  {
    title: "Strict Workload Isolation",
    body: "We utilize isolated Edge and Serverless execution environments. This means your conversion task runs in a dedicated sandbox that cannot interact with other users' files or processes, preventing cross-tenant data leakage.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
      </svg>
    ),
  },
  {
    title: "Zero AI Training",
    body: "Your proprietary documents belong to you. We strictly prohibit the use of any user-uploaded files or converted outputs for training, fine-tuning, or improving any machine learning models or artificial intelligence systems.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
];

export default function SecurityPage() {
  return (
    <div className="mx-auto max-w-4xl px-5 py-24">
      <div className="text-center">
        <p className="text-sm font-medium uppercase tracking-wider text-accent">
          Trust & Security
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-ink sm:text-5xl">
          Built to handle your files carefully
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-ink-2">
          At PDFtoolsmd.com, we believe that file conversion shouldn't require compromising your privacy. We've built our infrastructure from the ground up to ensure your documents remain strictly confidential.
        </p>
      </div>

      <div className="mt-20 grid gap-8 md:grid-cols-2">
        {SECURITY_PILLARS.map((pillar) => (
          <div key={pillar.title} className="rounded-2xl border border-border bg-surface p-8 shadow-sm">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent">
              {pillar.icon}
            </div>
            <h2 className="text-xl font-semibold text-ink">{pillar.title}</h2>
            <p className="mt-3 leading-relaxed text-ink-2">{pillar.body}</p>
          </div>
        ))}
      </div>

      <div className="mt-20 rounded-2xl bg-surface-2 p-8 sm:p-12 text-center">
        <h2 className="text-2xl font-bold text-ink">Ready to convert your files securely?</h2>
        <p className="mt-3 text-ink-2">Join thousands of users who trust our infrastructure daily.</p>
        <div className="mt-8 flex justify-center">
          <Link
            href="/"
            className="rounded-lg bg-accent px-6 py-3 text-base font-semibold text-accent-ink transition-opacity hover:opacity-90"
          >
            Start converting now
          </Link>
        </div>
      </div>
    </div>
  );
}
