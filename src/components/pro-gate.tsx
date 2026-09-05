"use client";

import { useState, useEffect, type ReactNode } from "react";
import Link from "next/link";
import { useAuth } from "@/src/components/auth-provider";
import {
  decideGate,
  exportLimitFor,
  FREE_EXPORTS_PER_DAY,
} from "@/src/lib/pro-gate-policy";
import { track } from "@/src/lib/track";

const EXPORT_LIMIT_KEY = "colorarchive_export_count";
const EXPORT_DATE_KEY = "colorarchive_export_date";

/**
 * When the quota resets, in the VISITOR's local time.
 *
 * getExportCount() keys the day off `new Date().toISOString().slice(0,10)`,
 * which is the UTC date — so the reset is UTC midnight wherever you are. Shown
 * localised because "resets at 00:00 UTC" is a puzzle, and in JST (the owner's
 * timezone, and a large share of traffic) it lands at 09:00, which looks like a
 * bug unless you say so.
 *
 * Only ever rendered in the locked branch, which cannot appear during SSR:
 * `used` starts at 0 and is read in an effect, so the server always renders the
 * unlocked branch. No hydration mismatch from the locale call.
 */
function resetsAtLabel(): string {
  const now = new Date();
  const nextUtcMidnight = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0),
  );
  try {
    return nextUtcMidnight.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  } catch {
    return "00:00 UTC";
  }
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function getExportCount(): number {
  if (typeof window === "undefined") return 0;
  const date = localStorage.getItem(EXPORT_DATE_KEY);
  if (date !== today()) {
    localStorage.setItem(EXPORT_DATE_KEY, today());
    localStorage.setItem(EXPORT_LIMIT_KEY, "0");
    return 0;
  }
  return parseInt(localStorage.getItem(EXPORT_LIMIT_KEY) ?? "0", 10);
}

function incrementExportCount() {
  localStorage.setItem(EXPORT_DATE_KEY, today());
  const current = parseInt(localStorage.getItem(EXPORT_LIMIT_KEY) ?? "0", 10);
  localStorage.setItem(EXPORT_LIMIT_KEY, String(current + 1));
}

/*
 * ProGateCounter was here and is deleted (2026-09-05, G1).
 *
 * It was an exported component that NOTHING rendered — a repo-wide grep found
 * only its own declaration — so its analytics value `source: "export_counter"`
 * was unreachable by construction and its own comment had said so since
 * 2026-08-18. Its job (show the quota BEFORE clicking) is done twice over now:
 * the unlocked branch already prints "Free: n/N today", and the locked branch
 * below prints the count and the reset time. Dead code that describes a feature
 * reads like a feature; this file has already cost us once that way.
 */

interface ProGateProps {
  /** The gated action — rendered when user has access */
  children: ReactNode;
  /** Label shown on the locked state */
  label?: string;
}

/**
 * Wraps an export/download action. Free users get 3 exports per day;
 * Pro users get unlimited. Shows upgrade prompt when limit reached.
 */
export function ProGate({ children, label = "Export" }: ProGateProps) {
  // Entitlement comes from the ONE shared session in AuthProvider, not from a
  // per-gate fetchSession(). /palette alone renders six of these; each used to
  // fire its own uncached request and reach its own conclusion, and none of
  // them ever re-checked after mount, so upgrading in another tab left every
  // gate on this page locked until a full reload.
  const { tier, status, sessionError } = useAuth();
  const [used, setUsed] = useState(0);

  // localStorage is unavailable during SSR, so the count is read after mount.
  useEffect(() => {
    setUsed(getExportCount());
  }, []);

  const limit = exportLimitFor(tier);
  const { locked, charge, remaining } = decideGate({
    tier,
    // `sessionError` is the distinction that matters: AuthProvider reports a
    // failed session request as tier="anonymous", and treating that as a real
    // "anonymous" is how a paying subscriber got locked out and then told to
    // sign in. See src/lib/pro-gate-policy.ts.
    resolved: status !== "loading" && !sessionError,
    used,
    limit,
  });

  if (!locked) {
    // Only charge a daily export when the click/keypress lands on an actual
    // export control inside the wrapped subtree — not on padding, labels, help
    // text, or the upgrade notice below. Previously ANY click in the wrapper
    // burned a free export (med #6).
    //
    // THIS SELECTOR IS NOT A WHITELIST OF EXPORTS — it matches any <button> in
    // the subtree, format toggles included. The parenthetical here used to read
    // "(Format toggles also stopPropagation.)" as though that were a property of
    // the system; it was a description of three call sites and false at two
    // others, so DarkModePairsCard and BrandSystemPanel charged a free export
    // every time someone switched format to look at it. Fixed at those two on
    // 2026-09-05 (F4). Any NEW control inside a ProGate that is not an export
    // must call e.stopPropagation() itself — this component cannot tell them
    // apart, and nothing tests that it can.
    const EXPORT_TRIGGER =
      'button, a, [role="button"], input[type="submit"], input[type="button"], summary, [data-export]';
    const countIfExport = (target: EventTarget | null) => {
      // `charge` is false for Pro AND while entitlement is unknown — a click
      // that lands before the session resolves must not burn a free credit.
      if (!charge) return;
      if (!(target instanceof Element) || !target.closest(EXPORT_TRIGGER)) return;
      incrementExportCount();
      setUsed(getExportCount());
    };
    return (
      <>
        <div
          role="presentation"
          onClick={(e) => countIfExport(e.target)}
          onKeyDown={(e) => {
            if (e.key !== "Enter" && e.key !== " ") return;
            // Native controls (button/link/input/summary) already synthesize a
            // click from Enter/Space — counted by onClick above. Only count here
            // for non-native role=button/[data-export] controls, so a keyboard
            // export isn't double-charged.
            const el = e.target;
            if (el instanceof Element && el.closest("button, a[href], input, summary")) return;
            countIfExport(e.target);
          }}
        >
          {children}
        </div>
        {remaining !== null && (
          <p
            className={`mt-2 text-[10px] text-center ${
              remaining <= 1
                ? "text-amber-600 dark:text-amber-400 font-medium"
                : "text-neutral-400"
            }`}
          >
            {remaining <= 1 ? (
              <>
                {remaining === 1 ? "Last free export today — " : "Daily limit hit — "}
                <Link
                  href="/pro/"
                  onClick={() => track("upgrade_clicked", { source: "export_inline" })}
                  className="underline font-semibold"
                >
                  Go Pro for unlimited
                </Link>
              </>
            ) : (
              <>
                Free: {used}/{limit} today ·{" "}
                <Link
                  href="/pro/"
                  onClick={() => track("upgrade_clicked", { source: "export_inline" })}
                  className="underline hover:text-neutral-600"
                >
                  unlock unlimited
                </Link>
              </>
            )}
          </p>
        )}
      </>
    );
  }

  return (
    <div className="relative group">
      <div className="opacity-40 pointer-events-none select-none">{children}</div>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5">
        {/* SAY WHAT WAS BLOCKED AND WHY (2026-09-05, G1).
            Until today the locked overlay was two buttons and nothing else. The
            20 call sites each pass a `label` — "Download Procreate", "Full brand
            system", "Contrast audit" — and every one of those strings was dead:
            `label` was destructured with a default and never rendered. A visitor
            saw a greyed-out panel with no statement of what had been withheld,
            how much they had used, or when it came back. */}
        <p className="px-3 text-center text-[11px] font-semibold text-slate-700 dark:text-slate-200">
          {label} locked
        </p>
        <p className="px-3 text-center text-[10px] text-slate-500 dark:text-slate-400">
          {used}/{limit} free exports used today · resets {resetsAtLabel()}
        </p>
        {tier === "anonymous" ? (
          <>
            <Link
              href="/login?next=/pro"
              onClick={() => track("upgrade_clicked", { source: "export_locked_signin" })}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-sm hover:bg-slate-700 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
              Sign in for {FREE_EXPORTS_PER_DAY.free} a day
            </Link>
            <Link
              href="/pro/"
              onClick={() => track("upgrade_clicked", { source: "export_locked" })}
              className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 underline hover:opacity-80 transition-opacity"
            >
              Go Pro
            </Link>
          </>
        ) : (
          <Link
            href="/pro/"
            onClick={() => track("upgrade_clicked", { source: "export_locked" })}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-lg shadow-sm hover:bg-indigo-500 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
            Upgrade to Pro
          </Link>
        )}
      </div>
    </div>
  );
}
