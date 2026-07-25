"use client";

import { useEffect } from "react";
import Link from "next/link";
import { preorderConfig } from "@/src/lib/checkout-config";
import { track } from "@/src/lib/track";

/**
 * /preorder/ — CLOSED as of 2026-07-24.
 *
 * This page was a willingness-to-pay test for the Accessibility Auditor. The
 * 07-15 exit gate returned STOP (0 of the 10 required pre-orders), so the
 * feature was off-ramped — but the sell surfaces stayed live for another four
 * days and 3 people still reached the ¥4,999 checkout.
 *
 * The page stays reachable on purpose: it is noindex + robots-disallowed and
 * absent from the sitemap, but inbound direct links still exist and those
 * visitors deserve a straight answer rather than a 404 — or, far worse, a live
 * checkout for something we are not building.
 *
 * Everything that could take money or collect intent is gone. What remains is
 * an honest explanation and the free tools that actually shipped.
 */

const SHIPPED_INSTEAD = [
  {
    href: "/palette-audit/",
    title: "Palette Audit",
    body: "Paste your CSS or design tokens and get every failing contrast pair, duplicate, and off-archive color — with accessible replacements suggested from the 5,446-color archive.",
  },
  {
    href: "/wcag-audit/",
    title: "WCAG Audit Matrix",
    body: "A full foreground/background compliance matrix for a palette: AA and AAA, every pair at once, exportable as CSV.",
  },
  {
    href: "/contrast/",
    title: "Contrast Checker",
    body: "Check any two colors against WCAG AA/AAA — plus real APCA-W3 scores for the newer perceptual model.",
  },
  {
    href: "/colorblind/",
    title: "Color Blindness Simulator",
    body: "Preview a palette through eight vision types and get archive-sourced safe alternatives for pairs that collapse together.",
  },
];

export function PreorderPage() {
  useEffect(() => {
    track("preorder_view", { feature: preorderConfig.feature, closed: true });
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pb-24 dark:from-neutral-950 dark:to-neutral-900">
      {/* Hero */}
      <section className="mx-auto max-w-3xl px-4 pb-8 pt-12 text-center">
        <span className="mb-4 inline-block rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-neutral-800 dark:text-slate-300">
          Not shipping · pre-orders closed
        </span>
        <h1 className="mb-3 font-display text-3xl font-light leading-tight text-slate-900 dark:text-white sm:text-4xl">
          The {preorderConfig.feature} isn&rsquo;t happening
        </h1>
        <p className="mx-auto max-w-xl text-sm text-slate-500 dark:text-slate-400 sm:text-base">
          We tested demand for it honestly, the answer was no, and we stopped. Pre-orders are
          closed and no one was ever charged.
        </p>
      </section>

      <div className="mx-auto max-w-3xl space-y-8 px-4">
        {/* The honest explanation */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-neutral-900 sm:p-8">
          <h2 className="mb-3 text-lg font-semibold text-slate-900 dark:text-white">What happened</h2>
          <div className="space-y-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            <p>
              The plan was a paid pre-order: if enough people committed real money up front, we
              would build a full accessibility auditor. The bar was set before the test ran — ten
              genuine pre-orders — precisely so the decision couldn&rsquo;t be rationalised
              afterwards.
            </p>
            <p>
              The bar wasn&rsquo;t met, so the feature was shelved instead of built on hope. Taking
              money for something we weren&rsquo;t confident of shipping was never an option.
            </p>
            <p className="text-slate-500 dark:text-slate-500">
              Closed {preorderConfig.closedOn}. If you ever reserved a spot, nothing was charged and
              there is nothing you need to do.
            </p>
          </div>
        </section>

        {/* What exists today — the honest consolation, and it is genuinely good */}
        <section>
          <h2 className="mb-1 text-lg font-semibold text-slate-900 dark:text-white">
            Most of it already exists — free
          </h2>
          <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
            While the paid version was being tested, the individual pieces shipped as free tools.
            Between them they cover most of what the Auditor promised.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {SHIPPED_INSTEAD.map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                onClick={() => track("preorder_closed_tool_click", { target: tool.href })}
                className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-400 dark:border-white/10 dark:bg-neutral-900 dark:hover:border-white/25"
              >
                <p className="mb-1 text-sm font-semibold text-slate-800 group-hover:underline dark:text-white">
                  {tool.title} &rarr;
                </p>
                <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">{tool.body}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* Onward */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm dark:border-white/10 dark:bg-neutral-900">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Want the paid tier that does exist?{" "}
            <Link
              href="/pro/"
              className="font-medium underline hover:text-slate-900 dark:hover:text-white"
              onClick={() => track("preorder_closed_pro_click", {})}
            >
              ColorArchive Pro
            </Link>{" "}
            unlocks unlimited exports, AI palette tools, and audit reports — for a fraction of what
            the Auditor would have cost.
          </p>
        </div>
      </div>
    </main>
  );
}
