"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { isOnboardingDismissed, dismissOnboarding, subscribeToOnboarding } from "@/src/lib/onboarding";
import { useLocale } from "@/src/components/locale-provider";

export function OnboardingBanner() {
  const { t } = useLocale();
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (!isOnboardingDismissed()) {
      // Small delay so it slides in after page paint
      const timer = setTimeout(() => setVisible(true), 600);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    return subscribeToOnboarding((dismissed) => {
      if (dismissed) setVisible(false);
    });
  }, []);

  function handleDismiss() {
    setExiting(true);
    setTimeout(() => {
      dismissOnboarding();
      setVisible(false);
    }, 300);
  }

  if (!visible) return null;

  return (
    <div
      className={`fixed bottom-6 left-1/2 z-50 w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 transition-all duration-300 ${
        exiting ? "translate-y-4 opacity-0" : "translate-y-0 opacity-100"
      }`}
    >
      <div className="flex items-center gap-3 rounded-2xl border border-amber-200/60 bg-white/80 px-4 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.12)] backdrop-blur-xl dark:border-amber-800/40 dark:bg-neutral-900/80 sm:gap-4 sm:px-5 sm:py-3.5">
        <div className="min-w-0 flex-1">
          <p className="text-sm leading-snug text-neutral-700 dark:text-neutral-300">
            <span className="mr-1.5 text-amber-500">&#10022;</span>
            {t("onboarding.text")}
          </p>
        </div>
        <Link
          href="/pick-for-me/"
          onClick={handleDismiss}
          className="shrink-0 rounded-full bg-amber-500 px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-500"
        >
          {t("onboarding.cta")}
        </Link>
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss"
          className="shrink-0 rounded-full p-1 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-600 dark:hover:bg-white/10 dark:hover:text-neutral-300"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M4 4l8 8M12 4l-8 8" />
          </svg>
        </button>
      </div>
    </div>
  );
}
