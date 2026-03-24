import { colors as archiveColors } from "@/src/data/colors";
import type { ColorRecord } from "@/src/types/color";

/**
 * Visually interesting colors — excludes very light/dark/muted extremes.
 * Mirrors the heroColors filter in server/colors.js.
 */
const heroColors: ColorRecord[] = archiveColors.filter(
  (c) => c.lightness >= 30 && c.lightness <= 75 && c.saturation >= 34
);

/**
 * Returns a deterministic "color of the day" for a given date string (YYYY-MM-DD).
 * Uses the same bit-shift hash as server/colors.js so results are identical.
 */
export function getColorOfDay(dateStr: string): ColorRecord {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = ((hash << 5) - hash + dateStr.charCodeAt(i)) | 0;
  }
  return heroColors[Math.abs(hash) % heroColors.length];
}

/**
 * Returns today's date as YYYY-MM-DD in the local timezone.
 */
export function todayDateStr(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Formats a date string (YYYY-MM-DD) into a human-readable form.
 * e.g. "2026-03-24" → "March 24, 2026"
 */
export function formatDateStr(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Returns 3 analogous colors (±24° hue steps) for a base color.
 * Mirrors server/colors.js getAnalogous logic.
 */
export function getAnalogousColors(base: ColorRecord, count = 3): ColorRecord[] {
  const step = 24;
  const result: ColorRecord[] = [];
  for (let i = 1; i <= count; i++) {
    const dir = i % 2 === 1 ? Math.ceil(i / 2) : -Math.ceil(i / 2);
    const targetHue = ((base.hue + step * dir) % 360 + 360) % 360;
    const match = archiveColors.find(
      (c) =>
        Math.abs(c.hue - targetHue) <= 12 &&
        Math.abs(c.lightness - base.lightness) <= 10 &&
        Math.abs(c.saturation - base.saturation) <= 18
    );
    if (match && !result.find((r) => r.id === match.id)) {
      result.push(match);
    }
  }
  return result;
}
