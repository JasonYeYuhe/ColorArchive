"use client";

import { useState, useEffect, type ReactNode } from "react";
import Link from "next/link";
import { fetchSession, type UserTier } from "@/src/lib/auth-client";
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
  const [tier, setTier] = useState<UserTier | null>(null);
  const [, force] = useState(0);

  useEffect(() => {
    fetchSession()
      .then((s) => setTier(s.auth.tier))
      .catch(() => setTier("anonymous"));
    // Re-render daily so the counter resets at the day boundary.
    const interval = window.setInterval(() => force((n) => n + 1), 60_000);
    return () => window.clearInterval(interval);
  }, []);

  if (tier === null || tier === "pro") return null;

  const used = getExportCount();
  const remaining = Math.max(FREE_EXPORTS_PER_DAY - used, 0);
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
          href="/pro"
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
 * Wraps an export/download action. Free users get 1 export per day;
 * Pro users get unlimited. Shows upgrade prompt when limit reached.
 */
export function ProGate({ children, label = "Export" }: ProGateProps) {
  const [tier, setTier] = useState<UserTier>("anonymous");
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    fetchSession()
      .then((s) => {
        setTier(s.auth.tier);
        if (s.auth.tier === "pro") {
          setLocked(false);
        } else {
          setLocked(getExportCount() >= FREE_EXPORTS_PER_DAY);
        }
      })
      .catch(() => {
        setLocked(getExportCount() >= FREE_EXPORTS_PER_DAY);
      });
  }, []);

  if (!locked) {
    const used = getExportCount();
    const remaining = tier !== "pro" ? FREE_EXPORTS_PER_DAY - used : null;
    const handleActivate = () => {
      if (tier !== "pro") {
        incrementExportCount();
        if (getExportCount() >= FREE_EXPORTS_PER_DAY) setLocked(true);
      }
    };
    return (
      <div
        role="presentation"
        onClick={handleActivate}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") handleActivate(); }}
      >
        {children}
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
                  href="/pro"
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
                  href="/pro"
                  onClick={() => track("upgrade_clicked", { source: "export_inline" })}
                  className="underline hover:text-neutral-600"
                >
                  unlock unlimited
                </Link>
              </>
            )}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="relative group">
      <div className="opacity-40 pointer-events-none select-none">{children}</div>
      <div className="absolute inset-0 flex items-center justify-center">
        <Link
          href="/pro"
          onClick={() => track("upgrade_clicked", { source: "export_locked" })}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-lg shadow-sm hover:bg-indigo-500 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
          Upgrade to Pro
        </Link>
      </div>
    </div>
  );
}
