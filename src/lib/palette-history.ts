/**
 * Lightweight palette generation history backed by localStorage.
 * Stores the last N generated palettes so users can revisit previous results.
 * Pro users see full history; free users see last 3.
 */

const STORAGE_KEY = "colorarchive_palette_history";
const MAX_ENTRIES = 20;

export interface PaletteHistoryEntry {
  id: string;
  timestamp: number;
  source: "brand" | "mood" | "ai";
  inputs: Record<string, string>;
  palette: { role: string; hex: string; name: string }[];
  summary?: string;
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function getHistory(): PaletteHistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addToHistory(entry: Omit<PaletteHistoryEntry, "id" | "timestamp">): void {
  if (typeof window === "undefined") return;
  const history = getHistory();
  history.unshift({
    ...entry,
    id: generateId(),
    timestamp: Date.now(),
  });
  // Keep only the last MAX_ENTRIES
  if (history.length > MAX_ENTRIES) history.length = MAX_ENTRIES;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

export function clearHistory(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

export function removeFromHistory(id: string): void {
  if (typeof window === "undefined") return;
  const history = getHistory().filter((e) => e.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}
