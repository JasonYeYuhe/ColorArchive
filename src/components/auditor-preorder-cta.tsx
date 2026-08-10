"use client";

import Link from "next/link";
import { preorderConfig } from "@/src/lib/checkout-config";
import { track } from "@/src/lib/track";

/**
 * Contextual entry point into the Accessibility Auditor pre-order (the WTP test).
 *
 * DEAD as of 2026-07-24 — the Auditor was off-ramped when the exit gate returned
 * STOP, so this renders nothing. Every call site has been removed; the guard
 * below is the belt-and-braces second line of defence in case one is ever
 * re-added by accident (or by a stale branch). Do not "temporarily" flip
 * `preorderConfig.closed` to revive this: we are not selling a product we have
 * no intention of building.
 *
 * `from` is retained so the signature stays stable for anything mid-merge.
 */
export function AuditorPreorderCta({ from }: { from: string }) {
  if (preorderConfig.closed) return null;

  return (
    <Link
      href="/preorder/"
      onClick={() => track("preorder_cta_click", { from })}
      className="block rounded-2xl border border-amber-200 bg-amber-50/60 p-5 transition hover:border-amber-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:border-amber-900/50 dark:hover:border-amber-700 dark:bg-amber-950/20 dark:focus-visible:ring-offset-neutral-950"
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400">
            Coming soon · pre-order
          </span>
          <p className="mt-1 text-base font-semibold text-neutral-900 dark:text-white">
            Audit your whole palette in one pass
          </p>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            The {preorderConfig.feature} checks every pair for WCAG + color-blindness and exports
            accessible fixes from the archive — plus a shareable report. Founder JP{preorderConfig.price}.
          </p>
        </div>
        <span className="shrink-0 text-sm font-semibold text-amber-700 dark:text-amber-400">
          Pre-order &rarr;
        </span>
      </div>
    </Link>
  );
}
