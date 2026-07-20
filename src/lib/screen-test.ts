/**
 * Pure logic for the /screen-test/ tool family.
 *
 * Everything here is client-safe but DOM-free where possible so it can be unit
 * tested. All detection helpers report browser-provided facts only — the UI must
 * present them as "as reported by your browser", never as measured verdicts
 * (a browser cannot calibrate or measure a panel; see dev-plan-2026-07-20 §2.3).
 */

export interface ScreenTestColor {
  hex: string;
  /** Human label shown in the fullscreen HUD and color grids. */
  name: string;
}

/**
 * Dead / stuck pixel inspection cycle. Solid fields in this order: the five
 * classics first (every competitor uses them — they surface stuck subpixels of
 * each primary), then high-visibility archive-adjacent fields. Cycling is
 * strictly manual or slow (≥3s) — rapid flashing was cut permanently for
 * photosensitivity safety (plan §2.2).
 */
export const DEAD_PIXEL_CYCLE: ScreenTestColor[] = [
  { hex: "#ffffff", name: "White" },
  { hex: "#000000", name: "Black" },
  { hex: "#ff0000", name: "Red" },
  { hex: "#00ff00", name: "Green" },
  { hex: "#0000ff", name: "Blue" },
  { hex: "#00ffff", name: "Cyan" },
  { hex: "#ff00ff", name: "Magenta" },
  { hex: "#ffff00", name: "Yellow" },
  { hex: "#808080", name: "Mid Gray" },
];

/** Preset fields for the color-screens utility (white screen / black screen family). */
export const COLOR_SCREEN_PRESETS: ScreenTestColor[] = [
  { hex: "#ffffff", name: "White Screen" },
  { hex: "#000000", name: "Black Screen" },
  { hex: "#ff0000", name: "Red Screen" },
  { hex: "#00ff00", name: "Green Screen" },
  { hex: "#0000ff", name: "Blue Screen" },
  { hex: "#ffff00", name: "Yellow Screen" },
  { hex: "#ff69b4", name: "Pink Screen" },
  { hex: "#800080", name: "Purple Screen" },
  { hex: "#ffa500", name: "Orange Screen" },
  { hex: "#808080", name: "Gray Screen" },
  { hex: "#fff8e7", name: "Warm Light" },
  { hex: "#e7f0ff", name: "Cool Light" },
];

/**
 * Near-black wedge (PLUGE-style shadow detail check). Values are R=G=B levels
 * rendered on a pure #000 background; the user reports the lowest step they can
 * distinguish. Steps follow the Lagom-style progression.
 */
export const NEAR_BLACK_STEPS = [1, 2, 3, 4, 6, 8, 10, 12, 16] as const;

/** Near-white wedge (highlight clipping check) on a pure #fff background. */
export const NEAR_WHITE_STEPS = [254, 253, 252, 250, 248, 245, 240] as const;

/** Uniformity / backlight-bleed fields: pure black, 25% and 50% gray. */
export const UNIFORMITY_LEVELS: ScreenTestColor[] = [
  { hex: "#000000", name: "Black (backlight bleed)" },
  { hex: "#404040", name: "25% Gray (dirty-screen effect)" },
  { hex: "#808080", name: "50% Gray (tint / vignetting)" },
];

/** rgb() string for an equal-channel level, e.g. 4 → "rgb(4, 4, 4)". */
export function grayLevel(value: number): string {
  const v = Math.max(0, Math.min(255, Math.round(value)));
  return `rgb(${v}, ${v}, ${v})`;
}

/** Loose hex validation for the ?color= param / custom input (3/6 digit, # optional). */
export function normalizeHexInput(raw: string): string | null {
  const cleaned = raw.trim().replace(/^#/, "").toLowerCase();
  if (/^[0-9a-f]{6}$/.test(cleaned)) return `#${cleaned}`;
  if (/^[0-9a-f]{3}$/.test(cleaned)) {
    return `#${cleaned[0]}${cleaned[0]}${cleaned[1]}${cleaned[1]}${cleaned[2]}${cleaned[2]}`;
  }
  return null;
}

/** Facts the browser reports about the current display. All fields are "as reported". */
export interface ScreenFacts {
  resolution: string;
  devicePixelRatio: number;
  /** True when dPR is not a whole number — browser zoom or OS scaling *may* be active (cannot be proven apart). */
  fractionalDpr: boolean;
  colorGamut: "rec2020" | "p3" | "srgb" | "unknown";
  /** Capability, not state: the display+browser *could* show HDR content. */
  hdrCapable: boolean;
  /** Nominal bits per pixel. Spec allows a hard-coded 24 — display only, never judge. */
  colorDepth: number;
  /** OS is actively rewriting colors (Windows High Contrast etc.) — tests are invalid. */
  forcedColors: boolean;
  /** User asked the OS for more contrast — rendering may be altered. */
  prefersMoreContrast: boolean;
}

/**
 * Read display facts from the browser. Call client-side only; attach listeners
 * separately (see reactiveScreenFactQueries) so results follow the window when
 * it moves between monitors.
 */
export function detectScreenFacts(): ScreenFacts {
  const mq = (q: string) => typeof window !== "undefined" && window.matchMedia(q).matches;
  const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
  const gamut: ScreenFacts["colorGamut"] = mq("(color-gamut: rec2020)")
    ? "rec2020"
    : mq("(color-gamut: p3)")
      ? "p3"
      : mq("(color-gamut: srgb)")
        ? "srgb"
        : "unknown";
  return {
    resolution:
      typeof window !== "undefined" ? `${window.screen.width} × ${window.screen.height}` : "unknown",
    devicePixelRatio: Math.round(dpr * 100) / 100,
    fractionalDpr: Math.abs(dpr - Math.round(dpr)) > 0.001,
    colorGamut: gamut,
    hdrCapable: mq("(dynamic-range: high)"),
    colorDepth: typeof window !== "undefined" ? window.screen.colorDepth : 24,
    forcedColors: mq("(forced-colors: active)"),
    prefersMoreContrast: mq("(prefers-contrast: more)"),
  };
}

/** Media queries whose changes should re-run detectScreenFacts (multi-monitor drags, mode switches). */
export const REACTIVE_SCREEN_QUERIES = [
  "(color-gamut: rec2020)",
  "(color-gamut: p3)",
  "(dynamic-range: high)",
  "(forced-colors: active)",
  "(prefers-contrast: more)",
] as const;

/* ================================================================== */
/*  Phase 2 — canvas patterns, archive tests, wizard (plan §2.2 P1)    */
/* ================================================================== */

import { oklchToRgb } from "@/src/lib/color-mix";
import type { ColorRecord } from "@/src/types/color";

/**
 * Gamma check patches: a solid gray of value v optically matches a field of
 * alternating pure black/white lines (which average to 50% light) when the
 * display's transfer curve satisfies (v/255)^gamma = 0.5, i.e.
 * v = 255 · 0.5^(1/gamma). The user picks the patch that best melts into the
 * stripes — reported as "closest to gamma X", a visual check, not a measurement.
 */
export const GAMMA_PATCHES = [1.8, 2.0, 2.2, 2.4, 2.6].map((gamma) => ({
  gamma,
  value: Math.round(255 * Math.pow(0.5, 1 / gamma)),
}));

export type BandingChannel = "gray" | "red" | "green" | "blue";
export const BANDING_CHANNELS: BandingChannel[] = ["gray", "red", "green", "blue"];

/** CSS/canvas fill for step i (0-255) of a banding ramp on the given channel. */
export function bandFillStyle(channel: BandingChannel, i: number): string {
  const v = Math.max(0, Math.min(255, Math.round(i)));
  switch (channel) {
    case "red":
      return `rgb(${v}, 0, 0)`;
    case "green":
      return `rgb(0, ${v}, 0)`;
    case "blue":
      return `rgb(0, 0, ${v})`;
    default:
      return `rgb(${v}, ${v}, ${v})`;
  }
}

/* ---------------- archive color-distance pairs ---------------- */

export interface DistancePair {
  a: ColorRecord;
  b: ColorRecord;
}

/**
 * Deterministic set of near-identical archive pairs: same hue root and
 * lightness band, adjacent chroma bands (the subtlest steps in the lattice).
 * Spread across the hue wheel so panel weaknesses in any region show up.
 * Takes the colorsById map from a dynamic import of src/data/colors so the
 * 5,446-color dataset never lands in the main client chunk.
 */
export function pickDistancePairs(colorsById: ReadonlyMap<string, ColorRecord>): DistancePair[] {
  const SPECS: Array<[root: string, lightness: string, chromaA: string, chromaB: string]> = [
    ["crimson", "tone", "faint", "muted"],
    ["amber", "silk", "faint", "muted"],
    ["chartreuse", "tone", "dust", "soft"],
    ["emerald", "bloom", "faint", "muted"],
    ["teal", "silk", "dust", "soft"],
    ["azure", "tone", "faint", "muted"],
    ["indigo", "bloom", "dust", "soft"],
    ["magenta", "silk", "faint", "muted"],
  ];
  const pairs: DistancePair[] = [];
  for (const [root, light, ca, cb] of SPECS) {
    const a = colorsById.get(`${root}-${light}-${ca}`);
    const b = colorsById.get(`${root}-${light}-${cb}`);
    if (a && b) pairs.push({ a, b });
  }
  return pairs;
}

/* ---------------- hue arrangement game ---------------- */

export interface HueChip {
  hex: string;
  /** Position in the correct ordering (0 = leftmost). */
  trueIndex: number;
}

/**
 * FM-100-style chips: interpolate hue in OKLCH at fixed lightness/chroma so
 * every chip differs ONLY in hue by an equal perceptual-ish step. C is kept
 * moderate so the whole sweep stays inside sRGB.
 */
export function generateHueChips(count = 12, startHue = 250, endHue = 340): HueChip[] {
  const chips: HueChip[] = [];
  for (let i = 0; i < count; i++) {
    const h = startHue + ((endHue - startHue) * i) / (count - 1);
    const { r, g, b } = oklchToRgb(0.72, 0.1, h);
    const hex = `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
    chips.push({ hex, trueIndex: i });
  }
  return chips;
}

/** Fixed scramble (deterministic — no Math.random in render paths). */
export const HUE_SHUFFLE = [7, 2, 9, 4, 0, 11, 5, 1, 8, 3, 10, 6] as const;

/** Apply the fixed scramble to a chip set of matching length (returns a copy otherwise). */
export function scrambleChips(chips: HueChip[]): HueChip[] {
  if (chips.length !== HUE_SHUFFLE.length) return [...chips];
  return HUE_SHUFFLE.map((i) => chips[i]);
}

/**
 * FM-100-style error score for an arrangement: sum of |trueIndex deltas|
 * between neighbours, minus the perfect-row baseline (n-1). 0 = perfect;
 * higher = more chips out of sequence.
 */
export function hueArrangementScore(arrangement: HueChip[]): number {
  if (arrangement.length < 2) return 0;
  let sum = 0;
  for (let i = 1; i < arrangement.length; i++) {
    sum += Math.abs(arrangement[i].trueIndex - arrangement[i - 1].trueIndex);
  }
  return sum - (arrangement.length - 1);
}

/* ---------------- guided wizard result codec ---------------- */

export interface WizardResult {
  /** Lowest near-black step reported visible (RGB value). */
  black?: number;
  /** Highest near-white step reported visible (RGB value). */
  white?: number;
  /** Uniformity fields looked even (user judgement). */
  uniformityOk?: boolean;
  /** Gamma patch the user reported blending best (e.g. 2.2). */
  gamma?: number;
  /** Gradient looked smooth (no visible steps). */
  bandingSmooth?: boolean;
  /** Archive pair boundaries seen, out of total shown. */
  distanceSeen?: number;
  distanceTotal?: number;
  /** Hue arrangement error score (0 = perfect). */
  hueScore?: number;
}

/**
 * Compact URL-hash codec for a wizard result ("#st=v1.b4.w250.u1.g22.s1.d6-8.h3").
 * Hash (not query) so shared results never create crawlable URL variants
 * (robots.ts can only disallow paths — dev-plan-2026-07-20 §2.4).
 */
export function encodeWizardResult(r: WizardResult): string {
  const parts: string[] = ["v1"];
  if (r.black !== undefined) parts.push(`b${r.black}`);
  if (r.white !== undefined) parts.push(`w${r.white}`);
  if (r.uniformityOk !== undefined) parts.push(`u${r.uniformityOk ? 1 : 0}`);
  if (r.gamma !== undefined) parts.push(`g${Math.round(r.gamma * 10)}`);
  if (r.bandingSmooth !== undefined) parts.push(`s${r.bandingSmooth ? 1 : 0}`);
  if (r.distanceSeen !== undefined && r.distanceTotal !== undefined)
    parts.push(`d${r.distanceSeen}-${r.distanceTotal}`);
  if (r.hueScore !== undefined) parts.push(`h${r.hueScore}`);
  return parts.join(".");
}

/** Parse the wizard hash payload; null for anything that isn't a v1 result. */
export function parseWizardResult(encoded: string): WizardResult | null {
  const parts = encoded.split(".");
  if (parts[0] !== "v1") return null;
  const r: WizardResult = {};
  for (const p of parts.slice(1)) {
    const m = /^([bwugsdh])(\d+)(?:-(\d+))?$/.exec(p);
    if (!m) continue;
    const n = parseInt(m[1] === "d" ? m[2] : m[2], 10);
    switch (m[1]) {
      case "b":
        if (n >= 0 && n <= 255) r.black = n;
        break;
      case "w":
        if (n >= 0 && n <= 255) r.white = n;
        break;
      case "u":
        r.uniformityOk = n === 1;
        break;
      case "g":
        if (n >= 10 && n <= 40) r.gamma = n / 10;
        break;
      case "s":
        r.bandingSmooth = n === 1;
        break;
      case "d":
        if (m[3] !== undefined) {
          const total = parseInt(m[3], 10);
          if (total > 0 && n <= total) {
            r.distanceSeen = n;
            r.distanceTotal = total;
          }
        }
        break;
      case "h":
        if (n >= 0 && n <= 200) r.hueScore = n;
        break;
    }
  }
  return Object.keys(r).length > 0 ? r : null;
}
