"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  computeStreak,
  deleteJournalEntry,
  getJournalEntries,
  localToday,
  saveJournalEntry,
  subscribeToJournal,
  NOTE_MAX_LENGTH,
  type JournalEntry,
} from "@/src/lib/color-journal";
import { colors as archiveColors } from "@/src/data/colors";
import type { ColorRecord } from "@/src/types/color";

const archiveById = new Map(archiveColors.map((c) => [c.id, c]));

export function JournalPage() {
  // SSR-stable initial state — populate from localStorage after mount.
  const [mounted, setMounted] = useState(false);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [editingDate, setEditingDate] = useState<string | null>(null);
  const [draftNote, setDraftNote] = useState("");

  useEffect(() => {
    setMounted(true);
    setEntries(getJournalEntries());
    return subscribeToJournal((next) => setEntries(next));
  }, []);

  const today = localToday();
  const streak = useMemo(() => computeStreak(entries, today), [entries, today]);
  const todayEntry = useMemo(
    () => entries.find((e) => e.date === today),
    [entries, today],
  );

  return (
    <main className="min-h-screen bg-white dark:bg-neutral-950">
      <section className="max-w-3xl mx-auto px-4 pt-12 pb-6 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 mb-3">
          Daily check-in
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900 dark:text-white mb-3">
          Color Journal
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm max-w-lg mx-auto leading-relaxed">
          Save one color a day, with a one-line note. Builds a private 30-day record
          you can export, and a streak that keeps you noticing color in the wild.
        </p>
      </section>

      {mounted && (
        <section className="max-w-3xl mx-auto px-4 mb-8">
          <div className="grid grid-cols-3 gap-3">
            <StreakTile
              label="Current streak"
              value={streak.current}
              suffix={streak.current === 1 ? "day" : "days"}
              highlight={streak.current >= 7}
            />
            <StreakTile
              label="Longest"
              value={streak.longest}
              suffix={streak.longest === 1 ? "day" : "days"}
            />
            <StreakTile
              label="Total entries"
              value={entries.length}
              suffix="logged"
            />
          </div>
        </section>
      )}

      <section className="max-w-3xl mx-auto px-4 mb-10">
        <div className="rounded-2xl border border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5">
          <div className="flex items-baseline justify-between gap-3 flex-wrap mb-3">
            <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
              Today · {today}
            </h2>
            {!todayEntry && mounted && (
              <span className="text-[11px] text-amber-600 dark:text-amber-400">
                Not logged yet
              </span>
            )}
          </div>
          {!mounted ? (
            <p className="text-sm text-slate-400">Loading…</p>
          ) : todayEntry ? (
            <EntryRow
              entry={todayEntry}
              isEditing={editingDate === today}
              draftNote={draftNote}
              onStartEdit={() => {
                setEditingDate(today);
                setDraftNote(todayEntry.note);
              }}
              onCancelEdit={() => setEditingDate(null)}
              onSaveEdit={() => {
                saveJournalEntry({
                  colorId: todayEntry.colorId,
                  hex: todayEntry.hex,
                  date: today,
                  note: draftNote,
                });
                setEditingDate(null);
              }}
              onDraftChange={setDraftNote}
              onDelete={() => deleteJournalEntry(today)}
            />
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Pick a color from{" "}
              <Link href="/all-colors/" className="underline hover:text-neutral-700">
                the archive
              </Link>{" "}
              or{" "}
              <Link href="/today/" className="underline hover:text-neutral-700">
                today&apos;s suggested color
              </Link>{" "}
              and click <span className="font-medium">Save to journal</span>.
            </p>
          )}
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 pb-20">
        <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400 mb-3">
          Recent entries
        </h2>
        {!mounted ? (
          <p className="text-sm text-slate-400">Loading…</p>
        ) : entries.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-800 p-6 text-center text-sm text-slate-500 dark:text-slate-400">
            No entries yet. Your first save will start the streak.
          </div>
        ) : (
          <ul className="space-y-2">
            {entries
              .filter((e) => e.date !== today)
              .map((entry) => (
                <li key={entry.date}>
                  <EntryRow
                    entry={entry}
                    isEditing={editingDate === entry.date}
                    draftNote={draftNote}
                    onStartEdit={() => {
                      setEditingDate(entry.date);
                      setDraftNote(entry.note);
                    }}
                    onCancelEdit={() => setEditingDate(null)}
                    onSaveEdit={() => {
                      saveJournalEntry({
                        colorId: entry.colorId,
                        hex: entry.hex,
                        date: entry.date,
                        note: draftNote,
                      });
                      setEditingDate(null);
                    }}
                    onDraftChange={setDraftNote}
                    onDelete={() => deleteJournalEntry(entry.date)}
                  />
                </li>
              ))}
          </ul>
        )}
      </section>
    </main>
  );
}

function StreakTile({
  label,
  value,
  suffix,
  highlight,
}: {
  label: string;
  value: number;
  suffix: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-4 ${
        highlight
          ? "border-amber-300 bg-amber-50 dark:border-amber-900/40 dark:bg-amber-950/20"
          : "border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900"
      }`}
    >
      <div
        className={`text-2xl font-semibold tabular-nums ${
          highlight ? "text-amber-700 dark:text-amber-300" : "text-neutral-900 dark:text-white"
        }`}
      >
        {value}
      </div>
      <div className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
        {label}
      </div>
      <div className="text-[10px] text-neutral-400">{suffix}</div>
    </div>
  );
}

function EntryRow({
  entry,
  isEditing,
  draftNote,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onDraftChange,
  onDelete,
}: {
  entry: JournalEntry;
  isEditing: boolean;
  draftNote: string;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  onDraftChange: (note: string) => void;
  onDelete: () => void;
}) {
  const archive: ColorRecord | undefined = archiveById.get(entry.colorId);
  const displayName = archive?.name ?? entry.hex;
  return (
    <div className="rounded-xl border border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4">
      <div className="flex items-start gap-3">
        <Link
          href={archive ? `/colors/${archive.id}/` : `/colors/hex/?c=${entry.hex.replace("#", "")}`}
          className="h-12 w-12 shrink-0 rounded-lg border border-black/8 dark:border-white/10"
          style={{ backgroundColor: entry.hex }}
          aria-label={`View ${displayName}`}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between gap-2 flex-wrap">
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
              {displayName}
            </h3>
            <span className="text-[11px] text-slate-400">{entry.date}</span>
          </div>
          <p className="mt-0.5 font-mono text-[11px] text-slate-500 dark:text-slate-400">
            {entry.hex.toUpperCase()}
          </p>
          {isEditing ? (
            <div className="mt-2">
              <textarea
                value={draftNote}
                onChange={(e) => onDraftChange(e.target.value.slice(0, NOTE_MAX_LENGTH))}
                rows={2}
                placeholder="What about this color today? (optional)"
                className="w-full rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-3 py-2 text-sm text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-300"
              />
              <div className="mt-2 flex items-center justify-between gap-2">
                <span className="text-[10px] text-slate-400">
                  {draftNote.length}/{NOTE_MAX_LENGTH}
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={onCancelEdit}
                    className="rounded-lg border border-neutral-200 dark:border-neutral-700 px-3 py-1 text-xs text-slate-600 dark:text-slate-300 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={onSaveEdit}
                    className="rounded-lg bg-neutral-950 dark:bg-white px-3 py-1 text-xs font-medium text-white dark:text-neutral-950 hover:bg-neutral-800 dark:hover:bg-neutral-100"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              {entry.note && (
                <p className="mt-1.5 text-sm text-neutral-600 dark:text-neutral-300 leading-snug">
                  {entry.note}
                </p>
              )}
              <div className="mt-2 flex gap-3 text-[11px]">
                <button
                  type="button"
                  onClick={onStartEdit}
                  className="text-slate-500 hover:text-neutral-800 dark:text-slate-400 dark:hover:text-neutral-200 transition-colors"
                >
                  {entry.note ? "Edit note" : "Add note"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`Delete journal entry for ${entry.date}?`)) {
                      onDelete();
                    }
                  }}
                  className="text-slate-400 hover:text-rose-600 transition-colors"
                >
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
