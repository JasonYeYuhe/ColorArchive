"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { fetchUsage } from "@/src/lib/auth-client";
import { useAuth } from "@/src/components/auth-provider";

export function AiUsageBadge() {
  const { status, tier } = useAuth();
  const [used, setUsed] = useState<number | null>(null);
  const [limit, setLimit] = useState<number | null>(null);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetchUsage()
      .then((u) => {
        setUsed(u.ai.used);
        setLimit(u.ai.limit);
      })
      .catch(() => {});
  }, [status]);

  // Don't show for Pro users (unlimited)
  if (tier === "pro") return null;

  // Don't show if not loaded yet
  if (used === null) return null;

  const remaining = limit !== null ? limit - used : null;
  const isLow = remaining !== null && remaining <= 3;

  return (
    <div className={`flex items-center gap-2 text-[11px] rounded-lg px-3 py-1.5 ${
      isLow
        ? "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400"
        : "bg-slate-100 dark:bg-white/8 text-slate-500 dark:text-slate-400"
    }`}>
      <span>
        {status === "anonymous" ? (
          <>AI: {used}/{limit ?? 3} today</>
        ) : (
          <>AI: {used}/{limit} today</>
        )}
      </span>
      {isLow && (
        <Link href={status === "anonymous" ? "/login" : "/pro"} className="font-semibold underline">
          {status === "anonymous" ? "Sign in for more" : "Go Pro"}
        </Link>
      )}
    </div>
  );
}
