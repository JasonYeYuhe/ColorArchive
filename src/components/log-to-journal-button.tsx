"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  getEntryForDate,
  localToday,
  saveJournalEntry,
  subscribeToJournal,
  deleteJournalEntry,
} from "@/src/lib/color-journal";
import type { ColorRecord } from "@/src/types/color";

interface Props {
  color: ColorRecord;
  variant?: "primary" | "ghost";
}

/**
 * One-click "Save to journal" button. Writes (or replaces) today's
 * entry with this color. Pure localStorage — Sprint 2 v1 has no cloud
 * sync. Idempotent: clicking it again on the same color says "Logged
 * for today"; clicking on a different color overwrites today's entry.
 */
export function LogToJournalButton({ color, variant = "ghost" }: Props) {
  const [today, setToday] = useState<string | null>(null);
  const [todayColorId, setTodayColorId] = useState<string | null>(null);
  const [showFlash, setShowFlash] = useState(false);

  useEffect(() => {
    const refresh = () => {
      const t = localToday();
      setToday(t);
      const entry = getEntryForDate(t);
      setTodayColorId(entry?.colorId ?? null);
    };
    refresh();
    return subscribeToJournal(refresh);
  }, []);

  const isLoggedToday = todayColorId === color.id;

  const handleClick = () => {
    if (isLoggedToday) {
      // Toggle off — remove today's entry. Confirms via small flash
      // because the journal page is the canonical "I changed my mind"
      // surface; this is a quick undo.
      deleteJournalEntry(today!);
      return;
    }
    saveJournalEntry({ colorId: color.id, hex: color.hex });
    setShowFlash(true);
    window.setTimeout(() => setShowFlash(false), 1500);
  };

  if (today === null) {
    // Pre-mount: render a skeleton-shaped button so SSR + hydrate
    // emit identical HTML.
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium uppercase tracking-[0.14em] ${
          variant === "primary"
            ? "bg-neutral-200 dark:bg-neutral-800 text-transparent"
            : "border border-black/8 bg-white text-transparent dark:border-white/10 dark:bg-white/5"
        }`}
        aria-hidden="true"
      >
        Save to journal
      </span>
    );
  }

  const baseClasses =
    "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium uppercase tracking-[0.14em] transition";
  const variantClasses =
    variant === "primary"
      ? isLoggedToday
        ? "bg-emerald-600 text-white hover:bg-emerald-500"
        : "bg-neutral-950 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-100"
      : isLoggedToday
        ? "border border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-400"
        : "border border-black/8 bg-white text-neutral-700 hover:bg-neutral-50 dark:border-white/10 dark:bg-white/5 dark:text-neutral-200 dark:hover:bg-white/10";

  return (
    <span className="inline-flex items-center gap-2">
      <button
        type="button"
        onClick={handleClick}
        className={`${baseClasses} ${variantClasses}`}
        aria-pressed={isLoggedToday}
        title={isLoggedToday ? "Remove from today's journal" : "Save to today's journal"}
      >
        {isLoggedToday ? (
          <>
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
            Logged today
          </>
        ) : (
          <>
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 3.75V16.5L12 14.25 7.5 16.5V3.75m9 0H18A2.25 2.25 0 0120.25 6v12a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18V6A2.25 2.25 0 016 3.75h1.5m9 0h-9" />
            </svg>
            Save to journal
          </>
        )}
      </button>
      {showFlash && (
        <Link
          href="/journal/"
          className="text-[10px] text-emerald-600 dark:text-emerald-400 underline"
        >
          View journal →
        </Link>
      )}
    </span>
  );
}
