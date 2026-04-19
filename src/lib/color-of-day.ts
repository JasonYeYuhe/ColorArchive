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
 * COTD v2 — golden-angle hue rotation with weighted nearest-neighbor snap.
 * Mirrors server/colors.js#getColorOfDay exactly. See docs/color-of-day-redesign.md.
 *
 * Integer-first arithmetic guarantees byte-for-byte parity with the Node server
 * and iOS Swift implementations (per Gemini 2.5 Pro review, 2026-04-19).
 */

const COTD_EPOCH_MS = Date.UTC(2026, 0, 1); // 2026-01-01 UTC
const COTD_GOLDEN_ANGLE_SCALED = 137508;    // 137.508° × 1000
const COTD_HUE_MOD_SCALED = 360000;         // 360° × 1000
const COTD_MS_PER_DAY = 86400000;
const COTD_W_HUE = 0.60;
const COTD_W_LIGHT = 0.25;
const COTD_W_SAT = 0.15;

/** Non-negative modulo. */
function cotdMod(n: number, m: number): number {
  return ((n % m) + m) % m;
}

function cotdParseDateUtcMs(dateStr: string): number {
  const [y, m, d] = dateStr.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
}

/** Shortest angular distance on the hue wheel (0..180). */
function cotdCircularHueDistance(a: number, b: number): number {
  const diff = Math.abs(a - b);
  return diff > 180 ? 360 - diff : diff;
}

/**
 * Returns a deterministic "color of the day" for a given date string (YYYY-MM-DD).
 * Uses golden-angle hue rotation + weighted circular nearest-neighbor.
 */
export function getColorOfDay(dateStr: string): ColorRecord {
  const dateMs = cotdParseDateUtcMs(dateStr);
  const daysSinceEpoch = Math.floor((dateMs - COTD_EPOCH_MS) / COTD_MS_PER_DAY);

  const targetHueScaled = cotdMod(
    daysSinceEpoch * COTD_GOLDEN_ANGLE_SCALED,
    COTD_HUE_MOD_SCALED
  );
  const targetHue = targetHueScaled / 1000;
  const targetLight = 42 + cotdMod(daysSinceEpoch * 23, 34); // 42..75
  const targetSat = 55 + cotdMod(daysSinceEpoch * 29, 38);   // 55..92

  let best = heroColors[0];
  let bestScore = Infinity;
  for (let i = 0; i < heroColors.length; i++) {
    const c = heroColors[i];
    const dHue = cotdCircularHueDistance(c.hue, targetHue) / 180;
    const dLight = Math.abs(c.lightness - targetLight) / 100;
    const dSat = Math.abs(c.saturation - targetSat) / 100;
    const score = COTD_W_HUE * dHue + COTD_W_LIGHT * dLight + COTD_W_SAT * dSat;
    if (score < bestScore) {
      bestScore = score;
      best = c;
    }
  }
  return best;
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
