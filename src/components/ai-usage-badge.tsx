"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { fetchAiUsage } from "@/src/lib/auth-client";
import { useAuth } from "@/src/components/auth-provider";

export function AiUsageBadge() {
  const { status, tier } = useAuth();
  const [used, setUsed] = useState<number | null>(null);
  const [limit, setLimit] = useState<number | null>(null);

  useEffect(() => {
    // Public /ai/usage works for anonymous users too — they should see
    // their wall before they hit it, not after a 429.
    fetchAiUsage()
      .then((u) => {
        setUsed(u.used);
        setLimit(u.limit);
      })
      .catch(() => {});
  }, [status]);

  // Don't show for Pro users (unlimited)
  if (tier === "pro") return null;

  // Don't show if not loaded yet
  if (used === null) return null;

  const effectiveLimit = limit ?? (status === "anonymous" ? 3 : 10);
  const remaining = Math.max(effectiveLimit - used, 0);
  const isOut = remaining === 0;
  const isLow = remaining <= 2 && !isOut;

  const upgradeHref = status === "anonymous" ? "/login" : "/pro";
  const upgradeLabel =
    status === "anonymous" ? "Sign in for 10/day" : "Go Pro for unlimited";

  return (
    <div
      className={`flex items-center gap-2 text-[11px] rounded-lg px-3 py-1.5 ${
        isOut
          ? "bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300"
          : isLow
            ? "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400"
            : "bg-slate-100 dark:bg-white/8 text-slate-500 dark:text-slate-400"
      }`}
    >
      <span>
        AI: {used}/{effectiveLimit} today
        {isOut && <span className="ml-1 font-semibold">— limit reached</span>}
      </span>
      {(isLow || isOut) && (
        <Link href={upgradeHref} className="font-semibold underline">
          {upgradeLabel}
        </Link>
      )}
    </div>
  );
}
