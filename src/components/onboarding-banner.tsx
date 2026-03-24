"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useLocale } from "@/src/components/locale-provider";

const DISMISSED_KEY = "colorarchive_onboarding_dismissed";

export function OnboardingBanner() {
  const { t } = useLocale();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && !localStorage.getItem(DISMISSED_KEY)) {
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  const dismiss = () => {
    localStorage.setItem(DISMISSED_KEY, "1");
    setVisible(false);
  };

  return (
    <div className="mx-auto max-w-[1600px] px-4 pt-4">
      <div className="relative rounded-2xl border border-indigo-100 dark:border-indigo-900/30 bg-indigo-50/60 dark:bg-indigo-950/20 p-5">
        <button
          onClick={dismiss}
          className="absolute top-3 right-3 text-indigo-300 dark:text-indigo-700 hover:text-indigo-500 text-lg leading-none"
          aria-label="Dismiss"
        >
          &times;
        </button>

        <p className="text-sm font-semibold text-indigo-900 dark:text-indigo-300 mb-3">
          {t("onboarding.title")}
        </p>

        <div className="flex flex-wrap gap-2">
          <Link
            href="/all-colors/"
            onClick={dismiss}
            className="flex items-center gap-2 rounded-xl bg-white dark:bg-white/10 border border-indigo-200/50 dark:border-white/10 px-4 py-2.5 text-sm font-medium text-indigo-800 dark:text-indigo-300 transition hover:bg-indigo-50 dark:hover:bg-white/15"
          >
            <span className="text-base">&#9632;</span>
            {t("onboarding.browseColors")}
          </Link>
          <Link
            href="/brand-generator/"
            onClick={dismiss}
            className="flex items-center gap-2 rounded-xl bg-white dark:bg-white/10 border border-indigo-200/50 dark:border-white/10 px-4 py-2.5 text-sm font-medium text-indigo-800 dark:text-indigo-300 transition hover:bg-indigo-50 dark:hover:bg-white/15"
          >
            <span className="text-base">&#10024;</span>
            {t("onboarding.aiBrand")}
          </Link>
          <Link
            href="/image-palette/"
            onClick={dismiss}
            className="flex items-center gap-2 rounded-xl bg-white dark:bg-white/10 border border-indigo-200/50 dark:border-white/10 px-4 py-2.5 text-sm font-medium text-indigo-800 dark:text-indigo-300 transition hover:bg-indigo-50 dark:hover:bg-white/15"
          >
            <span className="text-base">&#128247;</span>
            {t("onboarding.extractImage")}
          </Link>
        </div>
      </div>
    </div>
  );
}
