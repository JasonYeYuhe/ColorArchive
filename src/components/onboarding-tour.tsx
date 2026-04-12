"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { isOnboardingDismissed, dismissOnboarding } from "@/src/lib/onboarding";

interface TourStep {
  title: string;
  description: string;
  action?: { label: string; href: string };
}

const TOUR_STEPS: TourStep[] = [
  {
    title: "Search & Discover",
    description:
      "Press / to search 5,446 colors by name or hex. Try typing a mood like \"sunset\" or a hex code.",
    action: { label: "Try Search", href: "/search/" },
  },
  {
    title: "Generate Palettes Instantly",
    description:
      "On the Palette Generator, press Spacebar to create random 5-color palettes. Lock colors you like and regenerate the rest.",
    action: { label: "Open Generator", href: "/palette-generator/" },
  },
  {
    title: "25+ Free Tools",
    description:
      "From contrast checking to gradient building to AI brand palettes — explore the full toolkit. Press ? anytime for keyboard shortcuts.",
    action: { label: "Browse Tools", href: "/tools/" },
  },
];

/**
 * Multi-step onboarding tour shown to first-time visitors.
 * Replaces the single-banner onboarding with a 3-step guided tour.
 * Can be skipped at any point.
 */
export function OnboardingTour() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (!isOnboardingDismissed()) {
      const timer = setTimeout(() => setVisible(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const finish = useCallback(() => {
    setExiting(true);
    setTimeout(() => {
      dismissOnboarding();
      setVisible(false);
    }, 300);
  }, []);

  const next = useCallback(() => {
    if (step < TOUR_STEPS.length - 1) {
      setStep((s) => s + 1);
    } else {
      finish();
    }
  }, [step, finish]);

  if (!visible) return null;

  const current = TOUR_STEPS[step];
  const isLast = step === TOUR_STEPS.length - 1;

  return (
    <div
      className={`fixed bottom-6 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 transition-all duration-300 ${
        exiting ? "translate-y-4 opacity-0" : "translate-y-0 opacity-100"
      }`}
    >
      <div className="rounded-2xl border border-indigo-200/60 bg-white/90 p-5 shadow-[0_12px_48px_rgba(0,0,0,0.15)] backdrop-blur-xl dark:border-indigo-800/40 dark:bg-neutral-900/90">
        {/* Progress dots */}
        <div className="mb-3 flex items-center justify-between">
          <div className="flex gap-1.5">
            {TOUR_STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === step
                    ? "w-6 bg-indigo-500"
                    : i < step
                      ? "w-1.5 bg-indigo-300 dark:bg-indigo-700"
                      : "w-1.5 bg-neutral-200 dark:bg-neutral-700"
                }`}
              />
            ))}
          </div>
          <span className="text-[10px] font-medium text-neutral-400 dark:text-neutral-500">
            {step + 1}/{TOUR_STEPS.length}
          </span>
        </div>

        {/* Content */}
        <h3 className="text-base font-bold text-neutral-900 dark:text-white">
          {current.title}
        </h3>
        <p className="mt-1.5 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
          {current.description}
        </p>

        {/* Actions */}
        <div className="mt-4 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={finish}
            className="text-xs font-medium text-neutral-400 transition hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300"
          >
            Skip tour
          </button>

          <div className="flex gap-2">
            {current.action && (
              <button
                type="button"
                onClick={() => {
                  finish();
                  router.push(current.action!.href);
                }}
                className="rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100 dark:border-indigo-800 dark:bg-indigo-950/30 dark:text-indigo-300 dark:hover:bg-indigo-900/40"
              >
                {current.action.label}
              </button>
            )}
            <button
              type="button"
              onClick={next}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-indigo-500"
            >
              {isLast ? "Get Started" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
