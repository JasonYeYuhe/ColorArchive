"use client";

import Link from "next/link";
import { forwardRef, useMemo, useState } from "react";
import {
  buildCalendarGrid,
  currentMonthKey,
  type JournalEntry,
} from "@/src/lib/color-journal";

interface Props {
  /** Map of YYYY-MM-DD → entry, e.g. from getJournalByDate(). */
  entriesByDate: Map<string, JournalEntry>;
  /** YYYY-MM-DD of "today" — used to highlight today's cell. */
  today: string;
  /** Optional: if set, render this month instead of today's month. Used for navigation + export. */
  monthKey?: string;
  /** Whether to show a small "Made with colorarchive.org" watermark in the corner. Used by PNG export. */
  watermark?: boolean;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

/**
 * Pure month-grid presentation. The entries map is passed in (rather
 * than read from localStorage) so the same component can be reused for
 * the live UI AND for the PNG export — the export wraps a snapshot of
 * the entries map and a fixed monthKey.
 *
 * Forwarded ref lets the export function use html-to-image to grab the
 * underlying DOM node without traversing.
 */
export const JournalCalendarGrid = forwardRef<HTMLDivElement, Props>(function JournalCalendarGrid(
  { entriesByDate, today, monthKey, watermark = false }: Props,
  ref,
) {
  const grid = useMemo(
    () => buildCalendarGrid(monthKey ?? currentMonthKey()),
    [monthKey],
  );

  const monthEntryCount = useMemo(
    () =>
      grid.cells.filter((c) => c.inMonth && c.date && entriesByDate.has(c.date)).length,
    [grid, entriesByDate],
  );

  return (
    <div
      ref={ref}
      className="rounded-2xl border border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5"
    >
      <div className="grid grid-cols-7 gap-1 mb-2 text-center text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
        {WEEKDAYS.map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {grid.cells.map((cell, i) => {
          if (!cell.inMonth || !cell.date) {
            return (
              <div
                key={`pad-${i}`}
                className="aspect-square rounded-lg"
                aria-hidden="true"
              />
            );
          }
          const entry = entriesByDate.get(cell.date);
          const isToday = cell.date === today;
          if (entry) {
            return (
              <Link
                key={cell.date}
                href={`/colors/${entry.colorId}/`}
                className={`relative aspect-square rounded-lg border ${
                  isToday
                    ? "border-amber-400 ring-2 ring-amber-200 dark:ring-amber-900/40"
                    : "border-black/10 dark:border-white/10"
                }`}
                style={{ backgroundColor: entry.hex }}
                title={`${cell.date} — ${entry.note || entry.hex}`}
                aria-label={`${cell.date}: ${entry.note || entry.hex}`}
              >
                <span className="absolute top-1 left-1.5 text-[9px] font-semibold text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.4)]">
                  {cell.day}
                </span>
              </Link>
            );
          }
          return (
            <div
              key={cell.date}
              className={`aspect-square rounded-lg border text-[10px] flex items-start justify-start p-1.5 ${
                isToday
                  ? "border-amber-400 bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 font-semibold"
                  : "border-neutral-100 dark:border-neutral-800 bg-neutral-50/40 dark:bg-neutral-950/40 text-slate-300 dark:text-slate-600"
              }`}
              title={cell.date}
            >
              {cell.day}
            </div>
          );
        })}
      </div>

      <div className="mt-3 flex items-baseline justify-between text-[11px] text-slate-500 dark:text-slate-400">
        <span>
          {monthEntryCount} / {grid.cells.filter((c) => c.inMonth).length} days logged
        </span>
        {watermark && (
          <span className="text-[10px] tracking-wider text-slate-400 dark:text-slate-500">
            colorarchive.org
          </span>
        )}
      </div>
    </div>
  );
});

/** Stand-alone month picker — prev/current/next, designed to live above the grid. */
export function MonthPicker({
  monthKey,
  label,
  prevMonthKey,
  nextMonthKey,
  onChange,
}: {
  monthKey: string;
  label: string;
  prevMonthKey: string;
  nextMonthKey: string;
  onChange: (next: string) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <button
        type="button"
        onClick={() => onChange(prevMonthKey)}
        className="rounded-full border border-black/8 dark:border-white/10 bg-white dark:bg-neutral-900 px-3 py-1.5 text-xs text-slate-600 dark:text-slate-300 hover:bg-neutral-50 dark:hover:bg-neutral-800"
        aria-label={`Show ${prevMonthKey}`}
      >
        ← {prevMonthKey}
      </button>
      <h3 className="text-sm font-semibold text-neutral-900 dark:text-white" aria-live="polite">
        {label}
      </h3>
      <button
        type="button"
        onClick={() => onChange(nextMonthKey)}
        className="rounded-full border border-black/8 dark:border-white/10 bg-white dark:bg-neutral-900 px-3 py-1.5 text-xs text-slate-600 dark:text-slate-300 hover:bg-neutral-50 dark:hover:bg-neutral-800"
        aria-label={`Show ${nextMonthKey}`}
      >
        {nextMonthKey} →
      </button>
    </div>
  );
}

/** Hook to manage current month state with prev/next setters. */
export function useMonthNav(initial: string = currentMonthKey()) {
  const [monthKey, setMonthKey] = useState(initial);
  const grid = useMemo(() => buildCalendarGrid(monthKey), [monthKey]);
  return { monthKey, setMonthKey, label: grid.label, prevMonthKey: grid.prevMonthKey, nextMonthKey: grid.nextMonthKey };
}
