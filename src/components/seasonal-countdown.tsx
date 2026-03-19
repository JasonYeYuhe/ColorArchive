"use client";

import { useEffect, useState } from "react";

function getDaysLeft(endDate: string): number {
  const end = new Date(endDate).getTime();
  return Math.max(0, Math.ceil((end - Date.now()) / (1000 * 60 * 60 * 24)));
}

export function SeasonalCountdown({ endDate }: { endDate: string }) {
  const [daysLeft, setDaysLeft] = useState<number | null>(null);

  useEffect(() => {
    setDaysLeft(getDaysLeft(endDate));
  }, [endDate]);

  if (daysLeft === null || daysLeft <= 0) return null;

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-amber-700">
      <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />
      {daysLeft} day{daysLeft !== 1 ? "s" : ""} left this season
    </span>
  );
}
