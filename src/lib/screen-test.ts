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
