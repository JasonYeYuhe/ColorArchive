"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const COPY_THRESHOLD = 5;
const STORAGE_KEY = "colorarchive-copy-count";
const DISMISSED_KEY = "colorarchive-upsell-dismissed";

export function CopyUpsellToast() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function handleCopy() {
      try {
        const dismissed = localStorage.getItem(DISMISSED_KEY);
        if (dismissed) return;

        const count = Number(localStorage.getItem(STORAGE_KEY) || "0") + 1;
        localStorage.setItem(STORAGE_KEY, String(count));

        if (count === COPY_THRESHOLD) {
          setVisible(true);
        }
      } catch {}
    }

    document.addEventListener("copy", handleCopy);
    return () => document.removeEventListener("copy", handleCopy);
  }, []);

  function dismiss() {
    setVisible(false);
    try {
      localStorage.setItem(DISMISSED_KEY, "1");
    } catch {}
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-20 right-6 z-50 max-w-sm animate-in slide-in-from-bottom-4 rounded-2xl border border-black/8 bg-white/95 p-4 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-neutral-900/95">
      <div className="flex items-start gap-3">
        <div className="min-w-0">
          <div className="text-sm font-semibold text-neutral-950 dark:text-white">
            You&apos;ve been copying colors!
          </div>
          <p className="mt-1 text-xs leading-5 text-neutral-500">
            Get all 5,000+ colors in CSS, Tailwind, Figma, SwiftUI, and 12 more formats with the Complete Archive.
          </p>
          <div className="mt-3 flex gap-2">
            <Link
              href="/packs/"
              onClick={dismiss}
              className="rounded-full bg-neutral-950 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-neutral-800 dark:bg-white dark:text-neutral-950"
            >
              Browse packs
            </Link>
            <button
              type="button"
              onClick={dismiss}
              className="rounded-full border border-black/8 px-3 py-1.5 text-xs font-medium text-neutral-500 transition hover:bg-neutral-50 dark:border-white/10"
            >
              Dismiss
            </button>
          </div>
        </div>
        <button
          type="button"
          onClick={dismiss}
          className="shrink-0 text-neutral-400 transition hover:text-neutral-600"
          aria-label="Close"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}
