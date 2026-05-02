/**
 * Color Journal — local-first daily check-in.
 *
 * One entry per local-day:
 *   - colorId: archive ID (e.g. "amber-pearl-muted")
 *   - hex: snapshot of the color (so deletions of archive entries don't
 *     break old journal entries)
 *   - note: optional one-line inspiration / context, max 280 chars
 *
 * Uses the same subscribe/event pattern as recent-colors.ts and
 * favorites.ts. localStorage-first by design — Sprint 2 v1 ships
 * without cloud sync. Sync is queued for a follow-up once we see real
 * usage shape.
 *
 * Streaks: a streak is the count of consecutive *most-recent* days
 * (in the user's local timezone) that have an entry, including today.
 * Skipping a single day breaks the streak.
 */

const JOURNAL_KEY = "colorarchive:journal-v1";
const JOURNAL_EVENT = "colorarchive:journal-updated";

export const NOTE_MAX_LENGTH = 280;

export interface JournalEntry {
  /** Local YYYY-MM-DD. One entry per day, last write wins. */
  date: string;
  /** Archive color ID, e.g. "amber-pearl-muted". */
  colorId: string;
  /** Hex snapshot at write time, e.g. "#E8B96F". */
  hex: string;
  /** Optional one-line note (≤ 280 chars). Empty allowed. */
  note: string;
  /** ISO timestamp of last write. */
  updatedAt: string;
}

export interface StreakInfo {
  current: number;
  longest: number;
  /** Whether today already has an entry. Useful for UI nudges. */
  hasToday: boolean;
}

function hasWindow() {
  return typeof window !== "undefined";
}

/** Local YYYY-MM-DD — uses the browser's timezone, NOT UTC, because
 *  "today" should be what the user perceives as today. */
export function localToday(reference: Date = new Date()): string {
  const y = reference.getFullYear();
  const m = String(reference.getMonth() + 1).padStart(2, "0");
  const d = String(reference.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Given a YYYY-MM-DD, return the YYYY-MM-DD of the day before. */
export function previousDay(date: string): string {
  const [y, m, d] = date.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() - 1);
  return localToday(dt);
}

function emitUpdate() {
  if (!hasWindow()) return;
  window.dispatchEvent(new CustomEvent(JOURNAL_EVENT));
}

function readRaw(): JournalEntry[] {
  if (!hasWindow()) return [];
  try {
    const stored = window.localStorage.getItem(JOURNAL_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (entry): entry is JournalEntry =>
        entry &&
        typeof entry === "object" &&
        typeof entry.date === "string" &&
        typeof entry.colorId === "string" &&
        typeof entry.hex === "string" &&
        typeof entry.note === "string" &&
        typeof entry.updatedAt === "string",
    );
  } catch {
    return [];
  }
}

function writeRaw(entries: JournalEntry[]) {
  if (!hasWindow()) return;
  // Always store newest-first; one entry per day.
  const sorted = [...entries].sort((a, b) => (a.date < b.date ? 1 : -1));
  window.localStorage.setItem(JOURNAL_KEY, JSON.stringify(sorted));
}

/** Newest-first list of all journal entries. */
export function getJournalEntries(): JournalEntry[] {
  return readRaw();
}

/** Map of date → entry for O(1) lookups during calendar render. */
export function getJournalByDate(): Map<string, JournalEntry> {
  const map = new Map<string, JournalEntry>();
  for (const entry of readRaw()) map.set(entry.date, entry);
  return map;
}

export function getEntryForDate(date: string): JournalEntry | undefined {
  return getJournalByDate().get(date);
}

/**
 * Save (insert or update) the entry for a given date. If date is
 * omitted, uses local today. Returns the saved entry.
 */
export function saveJournalEntry(input: {
  colorId: string;
  hex: string;
  note?: string;
  date?: string;
}): JournalEntry {
  const date = input.date ?? localToday();
  const note = (input.note ?? "").slice(0, NOTE_MAX_LENGTH);
  const entry: JournalEntry = {
    date,
    colorId: input.colorId,
    hex: input.hex,
    note,
    updatedAt: new Date().toISOString(),
  };
  const existing = readRaw().filter((e) => e.date !== date);
  writeRaw([entry, ...existing]);
  emitUpdate();
  return entry;
}

export function deleteJournalEntry(date: string) {
  const next = readRaw().filter((e) => e.date !== date);
  writeRaw(next);
  emitUpdate();
}

export function clearJournal() {
  if (!hasWindow()) return;
  window.localStorage.removeItem(JOURNAL_KEY);
  emitUpdate();
}

/**
 * Compute streak info from entries. The reference "today" defaults to
 * the local current date but can be overridden for tests.
 */
export function computeStreak(
  entries: readonly JournalEntry[],
  todayOverride?: string,
): StreakInfo {
  const today = todayOverride ?? localToday();
  const yesterday = previousDay(today);
  const dates = new Set(entries.map((e) => e.date));

  // Current streak: count back from today (or, if today is missing
  // but yesterday exists, count back from yesterday — gives the user
  // until end-of-day to avoid losing the streak).
  let cursor: string | null = null;
  if (dates.has(today)) {
    cursor = today;
  } else if (dates.has(yesterday)) {
    cursor = yesterday;
  }

  let current = 0;
  while (cursor && dates.has(cursor)) {
    current += 1;
    cursor = previousDay(cursor);
  }

  // Longest streak: scan all entries, sorted ascending.
  const sortedDates = [...dates].sort();
  let longest = 0;
  let run = 0;
  let prev: string | null = null;
  for (const d of sortedDates) {
    if (prev !== null && previousDay(d) === prev) {
      run += 1;
    } else {
      run = 1;
    }
    if (run > longest) longest = run;
    prev = d;
  }

  return {
    current,
    longest: Math.max(longest, current),
    hasToday: dates.has(today),
  };
}

/** Convenience wrapper that reads entries and computes streak. */
export function getStreak(todayOverride?: string): StreakInfo {
  return computeStreak(readRaw(), todayOverride);
}

// ---- Calendar grid generator ----

export interface CalendarCell {
  /** YYYY-MM-DD; null if this slot is padding (out of month). */
  date: string | null;
  /** 1..31 if in-month; null otherwise. */
  day: number | null;
  /** Whether this cell is the rendered month's date (vs leading/trailing padding). */
  inMonth: boolean;
}

export interface CalendarGrid {
  /** "YYYY-MM" of the rendered month. */
  monthKey: string;
  /** "January 2026" etc — already localized to Intl default. */
  label: string;
  /** Sunday-first 7-column grid, padded to whole weeks. */
  cells: CalendarCell[];
  /** Previous/next month keys for navigation. */
  prevMonthKey: string;
  nextMonthKey: string;
}

/**
 * Build a Sunday-first month grid for display. Always emits whole
 * weeks (multiple of 7 cells), padding leading/trailing slots with
 * `inMonth: false` cells so the UI can render a tidy 7-col grid.
 */
export function buildCalendarGrid(monthKey: string): CalendarGrid {
  const [yStr, mStr] = monthKey.split("-");
  const year = Number.parseInt(yStr, 10);
  const month = Number.parseInt(mStr, 10); // 1-12
  if (!Number.isFinite(year) || !Number.isFinite(month) || month < 1 || month > 12) {
    throw new Error(`Invalid monthKey: ${monthKey}`);
  }
  const firstOfMonth = new Date(year, month - 1, 1);
  const daysInMonth = new Date(year, month, 0).getDate();
  const leadingPadding = firstOfMonth.getDay(); // 0 (Sun) .. 6 (Sat)

  const cells: CalendarCell[] = [];
  for (let i = 0; i < leadingPadding; i += 1) {
    cells.push({ date: null, day: null, inMonth: false });
  }
  for (let d = 1; d <= daysInMonth; d += 1) {
    cells.push({
      date: `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
      day: d,
      inMonth: true,
    });
  }
  while (cells.length % 7 !== 0) {
    cells.push({ date: null, day: null, inMonth: false });
  }

  const prevMonthDate = new Date(year, month - 2, 1);
  const nextMonthDate = new Date(year, month, 1);
  const prevMonthKey = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, "0")}`;
  const nextMonthKey = `${nextMonthDate.getFullYear()}-${String(nextMonthDate.getMonth() + 1).padStart(2, "0")}`;

  const label = firstOfMonth.toLocaleString("en-US", { month: "long", year: "numeric" });

  return { monthKey, label, cells, prevMonthKey, nextMonthKey };
}

/** Convert a YYYY-MM-DD into a YYYY-MM month key. */
export function toMonthKey(date: string): string {
  return date.slice(0, 7);
}

/** "YYYY-MM" for the local current month. */
export function currentMonthKey(): string {
  return toMonthKey(localToday());
}

export function subscribeToJournal(listener: (entries: JournalEntry[]) => void) {
  if (!hasWindow()) return () => undefined;
  const handle = () => listener(readRaw());
  window.addEventListener(JOURNAL_EVENT, handle);
  window.addEventListener("storage", handle);
  return () => {
    window.removeEventListener(JOURNAL_EVENT, handle);
    window.removeEventListener("storage", handle);
  };
}
