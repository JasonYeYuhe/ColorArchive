"use client";

import Link from "next/link";
import { preorderConfig } from "@/src/lib/checkout-config";
import { track } from "@/src/lib/track";

/**
 * Contextual entry point into the Accessibility Auditor pre-order (the WTP test).
 * Placed on the highest-intent ICP pages (palette-audit, wcag-audit) — someone
 * hand-auditing one palette is exactly who'd pay to audit a whole system.
 *
 * `from` is recorded on the click so we can see which surface drives pre-orders.
 */
export function AuditorPreorderCta({ from }: { from: string }) {
  return (
    <Link
      href="/preorder/"
      onClick={() => track("preorder_cta_click", { from })}
      className="block rounded-2xl border border-amber-200 bg-amber-50/60 p-5 transition hover:border-amber-300 dark:border-amber-900/50 dark:bg-amber-950/20"
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
            accessible fixes from the archive — plus a shareable report. Founder {preorderConfig.price}.
          </p>
        </div>
        <span className="shrink-0 text-sm font-semibold text-amber-700 dark:text-amber-400">
          Pre-order &rarr;
        </span>
      </div>
    </Link>
  );
}
