"use client";

import { useState, useEffect, type ReactNode } from "react";
import Link from "next/link";
import { useAuth } from "@/src/components/auth-provider";
import { decideGate } from "@/src/lib/pro-gate-policy";
import { track } from "@/src/lib/track";

const EXPORT_LIMIT_KEY = "colorarchive_export_count";
const EXPORT_DATE_KEY = "colorarchive_export_date";
const FREE_EXPORTS_PER_DAY = 3;

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

/** Tiny inline counter — render it next to a "Download / Export" header
 *  so the user sees the daily quota BEFORE clicking, not after. Pro
 *  users see nothing. */
export function ProGateCounter({ className = "" }: { className?: string }) {
  // NOTE: nothing renders this today (verified 2026-08-18 — the only occurrence
  // of the name in the repo is this declaration), so `source: "export_counter"`
  // can never appear in the analytics. Kept because the intent is right, and
  // routed through the same policy as ProGate so it cannot drift back into
  // deciding entitlement on its own.
  const { tier, status, sessionError } = useAuth();
  const [used, setUsed] = useState(0);

  useEffect(() => {
    setUsed(getExportCount());
    // Re-read at the day boundary so the counter resets without a reload.
    const interval = window.setInterval(() => setUsed(getExportCount()), 60_000);
    return () => window.clearInterval(interval);
  }, []);

  const { remaining } = decideGate({
    tier,
    resolved: status !== "loading" && !sessionError,
    used,
    limit: FREE_EXPORTS_PER_DAY,
  });

  // null means "no quota applies" — Pro, or entitlement not yet known. Showing
  // "0/3 today" to a subscriber, or to anyone we simply have not identified
  // yet, is the same mistake ProGate itself used to make.
  if (remaining === null) return null;

  const isOut = remaining === 0;
  const isLow = remaining === 1;

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider rounded-full px-2.5 py-1 ${
        isOut
          ? "bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300"
          : isLow
            ? "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400"
            : "bg-slate-100 dark:bg-white/8 text-slate-500 dark:text-slate-400"
      } ${className}`}
    >
      <span>
        Free: {used}/{FREE_EXPORTS_PER_DAY} today
      </span>
      {(isLow || isOut) && (
        <Link
          href="/pro/"
          onClick={() => track("upgrade_clicked", { source: "export_counter" })}
          className="font-semibold underline hover:opacity-80"
        >
          {isOut ? "Go Pro" : "Last one"}
        </Link>
      )}
    </span>
  );
}

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

  const { locked, charge, remaining } = decideGate({
    tier,
    // `sessionError` is the distinction that matters: AuthProvider reports a
    // failed session request as tier="anonymous", and treating that as a real
    // "anonymous" is how a paying subscriber got locked out and then told to
    // sign in. See src/lib/pro-gate-policy.ts.
    resolved: status !== "loading" && !sessionError,
    used,
    limit: FREE_EXPORTS_PER_DAY,
  });

  if (!locked) {
    // Only charge a daily export when the click/keypress lands on an actual
    // export control inside the wrapped subtree — not on padding, labels, help
    // text, or the upgrade notice below. Previously ANY click in the wrapper
    // burned a free export (med #6). (Format toggles also stopPropagation.)
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
                Free: {used}/{FREE_EXPORTS_PER_DAY} today ·{" "}
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
              Sign in for more
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
