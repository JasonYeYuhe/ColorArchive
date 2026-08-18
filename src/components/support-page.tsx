"use client";

import Link from "next/link";
import { useLocale } from "@/src/components/locale-provider";
import { proSubscriptionConfig } from "@/src/lib/checkout-config";

const faqs = [
  {
    q: "What does Pro include?",
    a: "Pro unlocks unlimited AI palette generations, exports in all formats (CSS, Tailwind, SCSS, JSON, Figma, SwiftUI, Android, Flutter), WCAG audit reports, and full token generation (50-950 scale).",
  },
  {
    q: "Can I cancel my subscription anytime?",
    a: "Yes. Go to Account → Manage Subscription to cancel. You keep access until the end of your billing period. No partial refunds.",
  },
  {
    q: "What happens to my exports if I cancel?",
    a: "All colors and code you exported while subscribed are permanently yours. You can use them commercially forever. Cancellation only stops access to future Pro features.",
  },
  {
    q: "What's the Lifetime option?",
    a: `Pro Lifetime is a one-time purchase that gives you permanent Pro access — no recurring charges. ${proSubscriptionConfig.lifetime.price} JPY (≈ ${proSubscriptionConfig.lifetime.priceUsd} USD).`,
  },
  {
    q: "Do you offer refunds?",
    a: "We offer a 7-day money-back guarantee on all Pro purchases. After 7 days, sales are final. See our Refund Policy for details.",
  },
  {
    q: "How do I contact support?",
    a: "Email support@colorarchive.org with your issue. We aim to respond within 2 business days.",
  },
] as const;

const freeTools = [
  { label: "Contrast Checker", href: "/contrast/" },
  { label: "Color Harmonies", href: "/harmonies/" },
  { label: "Gradient Builder", href: "/gradient/" },
  { label: "Color Converter", href: "/convert/" },
  { label: "Colorblind Simulator", href: "/colorblind/" },
  { label: "Palette Generator", href: "/palette-generator/" },
  { label: "Color Mixer", href: "/mixer/" },
  { label: "Word to Color", href: "/word-to-color/" },
  { label: "Brand Generator", href: "/brand-generator/" },
  { label: "Token Generator", href: "/tokens/" },
  { label: "WCAG Audit", href: "/wcag-audit/" },
  { label: "Image Palette", href: "/image-palette/" },
] as const;

export function SupportPage() {
  const { t } = useLocale();
  return (
    <main className="px-4 py-4 sm:px-6 sm:py-6">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6">
        <section className="relative overflow-hidden rounded-[2rem] border border-black/6 bg-white/74 px-6 py-10 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:px-10 sm:py-14">
          <div className="relative mx-auto max-w-4xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-black/8 bg-white/85 px-3 py-1 text-xs font-medium tracking-[0.22em] text-neutral-500 uppercase">
              <span className="inline-block h-2 w-2 rounded-full bg-neutral-900" />
              Help Center
            </div>

            <h1 className="max-w-3xl font-display text-4xl font-light tracking-[-0.04em] text-neutral-950 sm:text-6xl">
              How can we help?
            </h1>

            <p className="mt-4 max-w-2xl text-balance text-base leading-7 text-neutral-600 sm:text-lg">
              Browse answers to common questions, explore our free tools, or reach out to our support team.
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="rounded-[1.75rem] border border-black/6 bg-white/82 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
          <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
            Frequently Asked Questions
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {faqs.map((faq) => (
              <article
                key={faq.q}
                className="rounded-[1.2rem] border border-black/6 bg-neutral-50 px-4 py-4"
              >
                <div className="text-sm font-semibold text-neutral-950">{faq.q}</div>
                <p className="mt-2 text-sm leading-6 text-neutral-600">{faq.a}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(20rem,0.9fr)]">
          {/* Free Tools */}
          <div className="rounded-[1.75rem] border border-black/6 bg-white/82 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
            <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
              Free Tools — No Account Required
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {freeTools.map((tool) => (
                <Link
                  key={tool.href}
                  href={tool.href}
                  className="flex items-center gap-2 rounded-[1rem] border border-black/6 bg-neutral-50 px-3 py-3 text-sm text-neutral-700 transition hover:bg-white"
                >
                  <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
                  {tool.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact & Links */}
          <div className="flex flex-col gap-6">
            <aside className="rounded-[1.75rem] border border-black/6 bg-white/82 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
              <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
                Contact Us
              </div>
              <div className="mt-4 space-y-3 text-sm leading-6 text-neutral-600">
                <p>For billing, technical issues, or general questions:</p>
                <a
                  href="mailto:support@colorarchive.org"
                  className="inline-flex items-center gap-2 rounded-full border border-black/8 bg-neutral-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800"
                >
                  support@colorarchive.org
                </a>
                <p className="text-xs text-neutral-400">Response time: within 2 business days</p>
              </div>
            </aside>

            <aside className="rounded-[1.75rem] border border-black/6 bg-white/82 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
              <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
                Quick Links
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  href="/pro/"
                  className="rounded-full border border-black/8 bg-neutral-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800"
                >
                  View Pro plans
                </Link>
                <Link
                  href="/account/"
                  className="rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
                >
                  Account & billing
                </Link>
                <Link
                  href="/refund-policy/"
                  className="rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
                >
                  Refund Policy
                </Link>
                <Link
                  href="/terms/"
                  className="rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
                >
                  Terms of Service
                </Link>
                <Link
                  href="/free-resources/"
                  className="rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
                >
                  Free resources
                </Link>
                <Link
                  href="/api-docs/"
                  className="rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
                >
                  API docs
                </Link>
              </div>
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
}
