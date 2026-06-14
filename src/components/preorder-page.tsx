"use client";

import { useEffect } from "react";
import Link from "next/link";
import { preorderConfig } from "@/src/lib/checkout-config";
import { track } from "@/src/lib/track";
import { CotdSubscribeForm } from "@/src/components/cotd-subscribe-form";

const CAPABILITIES = [
  {
    title: "Whole-palette WCAG scan",
    body: "Check every foreground/background pair in your palette for AA and AAA at once — not one pair at a time. See exactly which combinations fail and by how much.",
  },
  {
    title: "Color-blindness check across the set",
    body: "Simulate deuteranopia, protanopia, and tritanopia for the entire palette and flag pairs that collapse into the same tone for color-blind users.",
  },
  {
    title: "Auto-fix from the archive",
    body: "For every failing pair, get the nearest accessible color from the 5,446-color ColorArchive — a fix that still looks like your brand.",
  },
  {
    title: "Shareable compliance report (PDF)",
    body: "Export a clean, dated accessibility report to hand to clients, PMs, or an accessibility reviewer.",
  },
  {
    title: "Fixed token export",
    body: "Download the corrected, accessible palette as CSS variables, Tailwind config, or Figma tokens — ready to drop into the codebase.",
  },
];

const FAQ = [
  {
    q: "Is the feature available now?",
    a: `Not yet — this is a pre-order for an upcoming Pro feature, shipping ${preorderConfig.shipBy}. Pre-ordering at the founder price helps us prioritize it and tells us it's worth building.`,
  },
  {
    q: "What if it doesn't ship?",
    a: `You get a full refund, no questions asked, if we don't ship by ${preorderConfig.shipBy}. The pre-order is a commitment from us as much as from you.`,
  },
  {
    q: "Is this a subscription?",
    a: `No — the ${preorderConfig.feature} pre-order is a one-time founder price (${preorderConfig.priceUsd}, regularly ${preorderConfig.regularUsd} at launch).`,
  },
  {
    q: "How is this different from the free contrast checker?",
    a: "The free tools check one pair (or one color) at a time. The Auditor scans a whole palette/design system in one pass, suggests accessible fixes from the archive, and exports a report + corrected tokens.",
  },
];

function PreorderCTA() {
  const url = preorderConfig.checkoutUrl;

  if (url) {
    return (
      <button
        type="button"
        onClick={() => {
          track("preorder_checkout_clicked", { feature: preorderConfig.feature });
          window.open(url, "_blank", "noopener,noreferrer");
          track("preorder_checkout_redirected", { feature: preorderConfig.feature });
        }}
        className="w-full rounded-xl bg-neutral-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-neutral-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
      >
        Pre-order — {preorderConfig.priceUsd} (founder price)
      </button>
    );
  }

  // Fallback until the Lemon Squeezy pre-order product exists: email reservation.
  return (
    <div>
      <CotdSubscribeForm
        source="preorder"
        heading={`Reserve your founder price (${preorderConfig.priceUsd})`}
      />
      <p className="mt-2 text-[11px] text-slate-400">
        We&rsquo;ll email you the moment pre-orders open at the founder price.
      </p>
    </div>
  );
}

export function PreorderPage() {
  useEffect(() => {
    track("preorder_view", { feature: preorderConfig.feature });
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pb-24 dark:from-neutral-950 dark:to-neutral-900">
      {/* Hero */}
      <section className="mx-auto max-w-3xl px-4 pb-8 pt-12 text-center">
        <span className="mb-4 inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
          Pre-order · upcoming Pro feature
        </span>
        <h1 className="mb-3 font-display text-3xl font-light leading-tight text-slate-900 dark:text-white sm:text-4xl">
          ColorArchive {preorderConfig.feature}
        </h1>
        <p className="mx-auto max-w-xl text-sm text-slate-500 dark:text-slate-400 sm:text-base">
          {preorderConfig.tagline} WCAG + color-blindness across your whole palette, accessible
          auto-fixes from the archive, and an exportable report — in one pass.
        </p>
      </section>

      <div className="mx-auto max-w-3xl space-y-10 px-4">
        {/* Pre-order box */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-neutral-900 sm:p-8">
          <div className="flex flex-wrap items-baseline justify-center gap-2 text-center">
            <span className="text-4xl font-bold text-slate-900 dark:text-white">{preorderConfig.priceUsd}</span>
            <span className="text-sm text-slate-400 line-through">{preorderConfig.regularUsd}</span>
            <span className="text-sm text-slate-500 dark:text-slate-400">one-time · founder price</span>
          </div>
          <p className="mb-5 mt-1 text-center text-xs text-slate-400">
            Ships {preorderConfig.shipBy} · full refund if we don&rsquo;t ship by then
          </p>
          <div className="mx-auto max-w-sm">
            <PreorderCTA />
          </div>
        </div>

        {/* Problem */}
        <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-neutral-900">
          <h2 className="mb-2 text-lg font-semibold text-slate-900 dark:text-white">
            Accessibility is mandatory — and checking it by hand is brutal
          </h2>
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            WCAG compliance is a hard requirement for more and more teams, but verifying a real
            palette means checking dozens of color pairs, simulating color-blindness, and then
            finding on-brand replacements for everything that fails. The {preorderConfig.feature}
            does the whole pass for you and hands you the fixes.
          </p>
        </section>

        {/* Capabilities */}
        <section className="grid gap-4 sm:grid-cols-2">
          {CAPABILITIES.map((c) => (
            <div key={c.title} className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-neutral-900">
              <p className="mb-1 text-sm font-semibold text-slate-800 dark:text-white">{c.title}</p>
              <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">{c.body}</p>
            </div>
          ))}
        </section>

        {/* FAQ */}
        <section>
          <h2 className="mb-4 text-lg font-semibold text-slate-800 dark:text-white">Frequently asked questions</h2>
          <div className="space-y-4">
            {FAQ.map(({ q, a }) => (
              <div key={q} className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-neutral-900">
                <p className="mb-1 text-sm font-semibold text-slate-800 dark:text-white">{q}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Repeat CTA */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm dark:border-white/10 dark:bg-neutral-900">
          <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">
            Founder price {preorderConfig.priceUsd} (regularly {preorderConfig.regularUsd}). Refund anytime before launch.
          </p>
          <div className="mx-auto max-w-sm">
            <PreorderCTA />
          </div>
          <p className="mt-5 text-xs text-slate-400">
            Not ready? <Link href="/pro/" className="underline hover:text-slate-600">See ColorArchive Pro</Link> or{" "}
            <Link href="/wcag-audit/" className="underline hover:text-slate-600">try the free contrast tools</Link>.
          </p>
        </div>
      </div>
    </main>
  );
}
