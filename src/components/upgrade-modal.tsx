"use client";

import { useState } from "react";
import Link from "next/link";
import type { UserTier } from "@/src/lib/auth-client";
import { track } from "@/src/lib/track";

interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
  tier: UserTier;
  used?: number;
  limit?: number;
}

export function UpgradeModal({ open, onClose, tier, used, limit }: UpgradeModalProps) {
  if (!open) return null;

  const isAnonymous = tier === "anonymous";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-5">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-lg"
        >
          &times;
        </button>

        {/* Icon */}
        <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center mx-auto">
          <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
          </svg>
        </div>

        <div className="text-center">
          <h3 className="text-lg font-bold text-slate-900">
            {isAnonymous ? "Sign in to continue" : "Upgrade to Pro"}
          </h3>
          {typeof used === "number" && typeof limit === "number" && (
            <p className="text-sm text-slate-500 mt-1">
              You&apos;ve used {used}/{limit} AI generations today.
            </p>
          )}
        </div>

        {isAnonymous ? (
          <div className="space-y-3">
            <p className="text-sm text-slate-600 text-center">
              Sign in with your email to get <strong>10 free AI generations per day</strong>.
            </p>
            <Link
              href="/login?next=/brand-generator"
              className="block w-full text-center py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-700 transition-colors"
            >
              Sign in
            </Link>
            <div className="relative flex items-center gap-3 py-1">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-xs text-slate-400">or</span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>
            <Link
              href="/pro"
              className="block w-full text-center py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-500 transition-colors"
            >
              Go Pro — Unlimited AI
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <ul className="space-y-2 text-sm text-slate-600">
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 mt-0.5">&#10003;</span>
                Unlimited AI palette generations
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 mt-0.5">&#10003;</span>
                Unlimited exports (CSS, Tailwind, SCSS, JSON)
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 mt-0.5">&#10003;</span>
                WCAG audit report downloads
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 mt-0.5">&#10003;</span>
                Full token generator output
              </li>
            </ul>

            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/pro"
                className="text-center py-2.5 bg-slate-100 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-200 transition-colors"
              >
                ¥480/mo
              </Link>
              <Link
                href="/pro"
                className="text-center py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-500 transition-colors"
              >
                ¥3,980/yr <span className="text-indigo-200 text-xs">Save 31%</span>
              </Link>
            </div>
          </div>
        )}

        <p className="text-[10px] text-slate-400 text-center">
          Cancel anytime. No credit card required for free tier.
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Hook for managing the upgrade modal state                          */
/* ------------------------------------------------------------------ */

interface RateLimitResponse {
  error: string;
  limit: boolean;
  tier: UserTier;
  used: number;
  dailyLimit: number;
  upgradeUrl: string;
  upgradeMessage: string;
}

export function useUpgradeModal() {
  const [open, setOpen] = useState(false);
  const [info, setInfo] = useState<{ tier: UserTier; used?: number; limit?: number }>({
    tier: "anonymous",
  });

  function handleRateLimitError(data: RateLimitResponse) {
    setInfo({ tier: data.tier as UserTier, used: data.used, limit: data.dailyLimit });
    setOpen(true);
    track("upgrade_modal_shown", { tier: data.tier, used: data.used });
  }

  function close() {
    setOpen(false);
  }

  return { open, info, handleRateLimitError, close };
}
