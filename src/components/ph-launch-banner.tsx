"use client";

import { useEffect, useState } from "react";

/**
 * Set to true on launch day, false after launch week.
 * Update PH_LISTING_URL to the actual Product Hunt listing URL.
 */
const PH_LAUNCH_ACTIVE = true;
const PH_LISTING_URL = "https://www.producthunt.com/posts/colorarchive";
const DISMISS_KEY = "colorarchive-ph-banner-dismissed";

export function PHLaunchBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!PH_LAUNCH_ACTIVE) return;
    try {
      if (localStorage.getItem(DISMISS_KEY) !== "1") {
        setVisible(true);
      }
    } catch {
      /* localStorage unavailable */
    }
  }, []);

  if (!visible) return null;

  function dismiss() {
    setVisible(false);
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="relative z-50 flex items-center justify-center gap-3 border-b border-black/6 bg-white/80 px-4 py-2.5 text-sm backdrop-blur-lg dark:border-white/8 dark:bg-neutral-900/80">
      <span className="text-neutral-600 dark:text-neutral-400">
        We&apos;re live on Product Hunt!
      </span>
      <a
        href={PH_LISTING_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 rounded-full border border-orange-200 bg-orange-50 px-3 py-0.5 text-xs font-medium text-orange-700 transition hover:bg-orange-100 dark:border-orange-800 dark:bg-orange-950 dark:text-orange-300 dark:hover:bg-orange-900"
      >
        <svg viewBox="0 0 26 26" className="h-3.5 w-3.5" fill="currentColor" aria-hidden="true">
          <path d="M18.56 12.77 14.17 4.33a1.01 1.01 0 0 0-1.79 0L7.99 12.77a1.01 1.01 0 0 0 .9 1.48h2.66l-2.15 7.08a1.01 1.01 0 0 0 1.72.93l7.99-8.44a1.01 1.01 0 0 0-.55-1.05Z" />
        </svg>
        Support us
      </a>
      <button
        onClick={dismiss}
        className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-neutral-400 transition hover:text-neutral-600 dark:hover:text-neutral-300"
        aria-label="Dismiss banner"
      >
        <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor" aria-hidden="true">
          <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
        </svg>
      </button>
    </div>
  );
}
