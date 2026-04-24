"use client";

import { useState, useEffect, type ReactNode } from "react";
import Link from "next/link";
import { fetchSession, type UserTier } from "@/src/lib/auth-client";

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
    const remaining = tier !== "pro" ? FREE_EXPORTS_PER_DAY - getExportCount() : null;
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
        {remaining !== null && remaining <= FREE_EXPORTS_PER_DAY && (
          <p className="mt-2 text-[10px] text-neutral-400 text-center">
            {remaining <= 1 ? (
              <span className="text-amber-500">Last free export today — <Link href="/pro" className="underline font-medium">Go Pro for unlimited</Link></span>
            ) : (
              <>{remaining}/{FREE_EXPORTS_PER_DAY} free exports remaining today</>
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
