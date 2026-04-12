"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/src/components/auth-provider";

const TOOL_USE_KEY = "colorarchive_tool_uses";
const TOOL_DATE_KEY = "colorarchive_tool_date";
const SHOW_THRESHOLD = 3; // Show banner after 3 tool uses per day

function today() {
  return new Date().toISOString().slice(0, 10);
}

function getToolUseCount(): number {
  if (typeof window === "undefined") return 0;
  const date = localStorage.getItem(TOOL_DATE_KEY);
  if (date !== today()) {
    localStorage.setItem(TOOL_DATE_KEY, today());
    localStorage.setItem(TOOL_USE_KEY, "0");
    return 0;
  }
  return parseInt(localStorage.getItem(TOOL_USE_KEY) ?? "0", 10);
}

function incrementToolUse() {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOOL_DATE_KEY, today());
  const current = getToolUseCount();
  localStorage.setItem(TOOL_USE_KEY, String(current + 1));
}

interface ToolUpsellBannerProps {
  toolName?: string;
}

/**
 * Soft upsell banner shown at the bottom of tool pages after the user
 * has used 3+ tools in a day. Non-blocking — purely informational.
 * Hidden for Pro users.
 */
export function ToolUpsellBanner({ toolName }: ToolUpsellBannerProps) {
  const { tier } = useAuth();
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    incrementToolUse();
    const count = getToolUseCount();
    if (count >= SHOW_THRESHOLD && tier !== "pro") {
      setVisible(true);
    }
  }, [tier]);

  if (!visible || dismissed || tier === "pro") return null;

  return (
    <div className="mt-8 rounded-2xl border border-indigo-100 bg-indigo-50/60 p-5 dark:border-indigo-900/30 dark:bg-indigo-950/20">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 rounded-lg bg-indigo-100 p-2 dark:bg-indigo-900/40">
            <svg className="h-4 w-4 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-indigo-900 dark:text-indigo-200">
              Enjoying {toolName || "our tools"}?
            </p>
            <p className="mt-1 text-xs text-indigo-700/70 dark:text-indigo-300/60">
              Go Pro for unlimited exports, AI palettes, WCAG reports, and cloud sync across all devices.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="shrink-0 text-indigo-400 hover:text-indigo-600 dark:text-indigo-500 dark:hover:text-indigo-300"
          aria-label="Dismiss"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="mt-4 flex gap-3">
        <Link
          href="/pro"
          className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-indigo-500"
        >
          View Pro Plans
        </Link>
        <Link
          href="/free-resources"
          className="rounded-lg bg-white px-4 py-2 text-xs font-medium text-indigo-700 transition hover:bg-indigo-50 dark:bg-white/10 dark:text-indigo-300 dark:hover:bg-white/15"
        >
          Free Resources
        </Link>
      </div>
    </div>
  );
}
