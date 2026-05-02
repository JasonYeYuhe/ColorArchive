import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  buildCalendarGrid,
  computeStreak,
  currentMonthKey,
  deleteJournalEntry,
  getJournalByDate,
  getJournalEntries,
  localToday,
  previousDay,
  saveJournalEntry,
  toMonthKey,
  clearJournal,
  NOTE_MAX_LENGTH,
} from "@/src/lib/color-journal";

// jsdom is not in this vitest config, so simulate window/localStorage.
beforeEach(() => {
  const store = new Map<string, string>();
  vi.stubGlobal("window", {
    localStorage: {
      getItem: (k: string) => (store.has(k) ? store.get(k)! : null),
      setItem: (k: string, v: string) => void store.set(k, v),
      removeItem: (k: string) => void store.delete(k),
      clear: () => store.clear(),
    },
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => true,
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("previousDay", () => {
  it("steps back across the month boundary", () => {
    expect(previousDay("2026-03-01")).toBe("2026-02-28");
    expect(previousDay("2024-03-01")).toBe("2024-02-29");
  });

  it("steps back across the year boundary", () => {
    expect(previousDay("2026-01-01")).toBe("2025-12-31");
  });

  it("inverse of one-day forward", () => {
    expect(previousDay(previousDay("2026-05-03"))).toBe("2026-05-01");
  });
});

describe("localToday", () => {
  it("returns YYYY-MM-DD format", () => {
    const today = localToday();
    expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("respects the reference date", () => {
    const ref = new Date(2026, 0, 15);
    expect(localToday(ref)).toBe("2026-01-15");
  });
});

describe("saveJournalEntry", () => {
  it("creates a new entry when none exists for that date", () => {
    saveJournalEntry({ colorId: "amber-pearl-muted", hex: "#E8B96F", date: "2026-05-01" });
    const entries = getJournalEntries();
    expect(entries).toHaveLength(1);
    expect(entries[0]).toMatchObject({
      date: "2026-05-01",
      colorId: "amber-pearl-muted",
      hex: "#E8B96F",
      note: "",
    });
  });

  it("overwrites the existing entry for the same date (last-write-wins)", () => {
    saveJournalEntry({ colorId: "amber-pearl-muted", hex: "#E8B96F", date: "2026-05-01" });
    saveJournalEntry({ colorId: "cobalt-shadow-vivid", hex: "#1E3A8A", date: "2026-05-01" });
    const entries = getJournalEntries();
    expect(entries).toHaveLength(1);
    expect(entries[0].colorId).toBe("cobalt-shadow-vivid");
  });

  it("clamps note length to NOTE_MAX_LENGTH", () => {
    const long = "a".repeat(500);
    saveJournalEntry({ colorId: "x", hex: "#000000", date: "2026-05-01", note: long });
    const entry = getJournalEntries()[0];
    expect(entry.note).toHaveLength(NOTE_MAX_LENGTH);
  });
});

describe("getJournalByDate", () => {
  it("returns a Map keyed by date for O(1) calendar lookup", () => {
    saveJournalEntry({ colorId: "a", hex: "#111", date: "2026-05-01" });
    saveJournalEntry({ colorId: "b", hex: "#222", date: "2026-05-03" });
    const map = getJournalByDate();
    expect(map.size).toBe(2);
    expect(map.get("2026-05-01")?.colorId).toBe("a");
    expect(map.get("2026-05-02")).toBeUndefined();
  });
});

describe("deleteJournalEntry", () => {
  it("removes the entry for that date", () => {
    saveJournalEntry({ colorId: "a", hex: "#111", date: "2026-05-01" });
    saveJournalEntry({ colorId: "b", hex: "#222", date: "2026-05-02" });
    deleteJournalEntry("2026-05-01");
    const entries = getJournalEntries();
    expect(entries).toHaveLength(1);
    expect(entries[0].date).toBe("2026-05-02");
  });
});

describe("clearJournal", () => {
  it("removes all entries", () => {
    saveJournalEntry({ colorId: "a", hex: "#111", date: "2026-05-01" });
    clearJournal();
    expect(getJournalEntries()).toHaveLength(0);
  });
});

describe("computeStreak", () => {
  const today = "2026-05-03";

  it("returns 0/0/false on an empty journal", () => {
    expect(computeStreak([], today)).toEqual({ current: 0, longest: 0, hasToday: false });
  });

  it("counts a single-day streak when only today is present", () => {
    const entries = [
      { date: today, colorId: "x", hex: "#000", note: "", updatedAt: "" },
    ];
    expect(computeStreak(entries, today)).toEqual({ current: 1, longest: 1, hasToday: true });
  });

  it("counts back consecutive days from today", () => {
    const entries = ["2026-05-03", "2026-05-02", "2026-05-01", "2026-04-30"].map((d) => ({
      date: d,
      colorId: "x",
      hex: "#000",
      note: "",
      updatedAt: "",
    }));
    expect(computeStreak(entries, today).current).toBe(4);
    expect(computeStreak(entries, today).hasToday).toBe(true);
  });

  it("preserves the streak when today is empty but yesterday is filled (grace period)", () => {
    const entries = ["2026-05-02", "2026-05-01"].map((d) => ({
      date: d,
      colorId: "x",
      hex: "#000",
      note: "",
      updatedAt: "",
    }));
    const s = computeStreak(entries, today);
    expect(s.current).toBe(2);
    expect(s.hasToday).toBe(false);
  });

  it("breaks the streak when there's a gap of one or more days", () => {
    // today + day-before-yesterday but no yesterday
    const entries = ["2026-05-03", "2026-05-01"].map((d) => ({
      date: d,
      colorId: "x",
      hex: "#000",
      note: "",
      updatedAt: "",
    }));
    expect(computeStreak(entries, today).current).toBe(1);
  });

  it("computes longest streak across non-overlapping runs", () => {
    const entries = [
      "2026-04-01", "2026-04-02", "2026-04-03", "2026-04-04",
      "2026-04-10",
    ].map((d) => ({ date: d, colorId: "x", hex: "#000", note: "", updatedAt: "" }));
    const s = computeStreak(entries, today);
    expect(s.longest).toBe(4);
    expect(s.current).toBe(0);
  });

  it("longest is at least the current streak", () => {
    const entries = ["2026-05-03", "2026-05-02"].map((d) => ({
      date: d,
      colorId: "x",
      hex: "#000",
      note: "",
      updatedAt: "",
    }));
    const s = computeStreak(entries, today);
    expect(s.longest).toBeGreaterThanOrEqual(s.current);
  });
});

describe("buildCalendarGrid", () => {
  it("emits whole weeks (cells.length is a multiple of 7)", () => {
    const grid = buildCalendarGrid("2026-05");
    expect(grid.cells.length % 7).toBe(0);
  });

  it("contains exactly the right number of in-month cells", () => {
    // May 2026 has 31 days
    const may = buildCalendarGrid("2026-05");
    expect(may.cells.filter((c) => c.inMonth).length).toBe(31);
    // February 2026 (non-leap) has 28 days
    const feb = buildCalendarGrid("2026-02");
    expect(feb.cells.filter((c) => c.inMonth).length).toBe(28);
    // February 2024 (leap year) has 29 days
    const feb24 = buildCalendarGrid("2024-02");
    expect(feb24.cells.filter((c) => c.inMonth).length).toBe(29);
  });

  it("aligns the first day of the month under the correct weekday column", () => {
    // May 1, 2026 is a Friday → should be column 5 (Sun=0..Sat=6)
    const grid = buildCalendarGrid("2026-05");
    const firstInMonth = grid.cells.findIndex((c) => c.day === 1);
    expect(firstInMonth).toBe(5);
  });

  it("rolls back to December across the year boundary for prevMonthKey", () => {
    expect(buildCalendarGrid("2026-01").prevMonthKey).toBe("2025-12");
  });

  it("rolls forward to January across the year boundary for nextMonthKey", () => {
    expect(buildCalendarGrid("2025-12").nextMonthKey).toBe("2026-01");
  });

  it("emits a human-readable label", () => {
    expect(buildCalendarGrid("2026-05").label).toMatch(/May 2026/);
  });

  it("padding cells have null date + null day + inMonth false", () => {
    const grid = buildCalendarGrid("2026-05");
    for (const c of grid.cells.filter((c) => !c.inMonth)) {
      expect(c.date).toBeNull();
      expect(c.day).toBeNull();
    }
  });

  it("rejects malformed monthKey", () => {
    expect(() => buildCalendarGrid("not-a-month")).toThrow();
    expect(() => buildCalendarGrid("2026-13")).toThrow();
    expect(() => buildCalendarGrid("2026-00")).toThrow();
  });
});

describe("toMonthKey / currentMonthKey", () => {
  it("toMonthKey strips the day component", () => {
    expect(toMonthKey("2026-05-03")).toBe("2026-05");
  });

  it("currentMonthKey returns YYYY-MM in local time", () => {
    expect(currentMonthKey()).toMatch(/^\d{4}-\d{2}$/);
  });
});
