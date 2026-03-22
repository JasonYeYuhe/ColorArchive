/**
 * Color mixing utilities: RGB, HSL, and OKLCH interpolation.
 * OKLCH uses the perceptually uniform Björn Ottosson OKLab color space.
 */

import { hexToRgb, rgbToHex, rgbToHsl, hslToRgb } from "./color-convert";

/* ------------------------------------------------------------------ */
/*  OKLCH conversions                                                  */
/* ------------------------------------------------------------------ */

function linearize(c: number): number {
  const n = c / 255;
  return n <= 0.04045 ? n / 12.92 : Math.pow((n + 0.055) / 1.055, 2.4);
}

function delinearize(c: number): number {
  return c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
}

interface OklchColor {
  l: number; // 0–1
  c: number; // 0–0.4 (chroma)
  h: number; // 0–360 (hue angle)
}

/** Convert sRGB (0–255 each) to OKLCH */
export function rgbToOklch(r: number, g: number, b: number): OklchColor {
  // Step 1: linearize
  const rl = linearize(r);
  const gl = linearize(g);
  const bl = linearize(b);

  // Step 2: linear sRGB → LMS (OKLab M1)
  const l = 0.4122214708 * rl + 0.5363325363 * gl + 0.0514459929 * bl;
  const m = 0.2119034982 * rl + 0.6806995451 * gl + 0.1073969566 * bl;
  const s = 0.0883024619 * rl + 0.2817188376 * gl + 0.6299787005 * bl;

  // Step 3: cube root
  const l_ = Math.cbrt(l);
  const m_ = Math.cbrt(m);
  const s_ = Math.cbrt(s);

  // Step 4: LMS → OKLab (M2)
  const L = 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_;
  const a = 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_;
  const bk = 0.0259040371 * l_ + 0.1259921792 * m_ - 0.152096029 * s_;

  // Step 5: OKLab → OKLCH
  const C = Math.sqrt(a * a + bk * bk);
  let H = (Math.atan2(bk, a) * 180) / Math.PI;
  if (H < 0) H += 360;

  return { l: L, c: C, h: H };
}

/** Convert OKLCH to sRGB (0–255 each), clamped. */
export function oklchToRgb(L: number, C: number, H: number): { r: number; g: number; b: number } {
  // OKLCH → OKLab
  const hRad = (H * Math.PI) / 180;
  const a = C * Math.cos(hRad);
  const bk = C * Math.sin(hRad);

  // OKLab → LMS (inverse M2)
  const l_ = L + 0.3963377774 * a + 0.2158037573 * bk;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * bk;
  const s_ = L - 0.0894841775 * a - 1.291485548 * bk;

  // cube
  const l = l_ * l_ * l_;
  const m = m_ * m_ * m_;
  const s = s_ * s_ * s_;

  // LMS → linear sRGB (inverse M1)
  const rl = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  const gl = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  const bl = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s;

  // linear → sRGB, clamp
  const clamp = (v: number) => Math.max(0, Math.min(1, v));
  return {
    r: Math.round(clamp(delinearize(rl)) * 255),
    g: Math.round(clamp(delinearize(gl)) * 255),
    b: Math.round(clamp(delinearize(bl)) * 255),
  };
}

/* ------------------------------------------------------------------ */
/*  Interpolation helpers                                              */
/* ------------------------------------------------------------------ */

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** Lerp hue angles taking the short path (< 180° difference). */
function lerpHue(a: number, b: number, t: number): number {
  let delta = b - a;
  if (delta > 180) delta -= 360;
  if (delta < -180) delta += 360;
  return (a + delta * t + 360) % 360;
}

/* ------------------------------------------------------------------ */
/*  Mix step generators                                                */
/* ------------------------------------------------------------------ */

export type MixMode = "rgb" | "hsl" | "oklch";

export interface MixStep {
  hex: string;
  r: number;
  g: number;
  b: number;
  pct: number; // 0–100
}

/**
 * Generate `steps` interpolated swatches from hexA to hexB.
 * Returns an array of length `steps` (inclusive of endpoints).
 */
export function generateMixSteps(hexA: string, hexB: string, steps: number, mode: MixMode): MixStep[] {
  const rgbA = hexToRgb(hexA);
  const rgbB = hexToRgb(hexB);
  if (!rgbA || !rgbB) return [];

  const result: MixStep[] = [];

  for (let i = 0; i < steps; i++) {
    const t = steps === 1 ? 0 : i / (steps - 1);
    const pct = Math.round(t * 100);

    let r: number, g: number, b: number;

    if (mode === "rgb") {
      r = Math.round(lerp(rgbA.r, rgbB.r, t));
      g = Math.round(lerp(rgbA.g, rgbB.g, t));
      b = Math.round(lerp(rgbA.b, rgbB.b, t));
    } else if (mode === "hsl") {
      const hslA = rgbToHsl(rgbA.r, rgbA.g, rgbA.b);
      const hslB = rgbToHsl(rgbB.r, rgbB.g, rgbB.b);
      const h = lerpHue(hslA.h, hslB.h, t);
      const s = lerp(hslA.s, hslB.s, t);
      const l = lerp(hslA.l, hslB.l, t);
      const rgb = hslToRgb(h, s, l);
      r = rgb.r;
      g = rgb.g;
      b = rgb.b;
    } else {
      // oklch
      const oklchA = rgbToOklch(rgbA.r, rgbA.g, rgbA.b);
      const oklchB = rgbToOklch(rgbB.r, rgbB.g, rgbB.b);
      const L = lerp(oklchA.l, oklchB.l, t);
      const C = lerp(oklchA.c, oklchB.c, t);
      const H = lerpHue(oklchA.h, oklchB.h, t);
      const rgb = oklchToRgb(L, C, H);
      r = rgb.r;
      g = rgb.g;
      b = rgb.b;
    }

    result.push({ hex: rgbToHex({ r, g, b }), r, g, b, pct });
  }

  return result;
}

/* ------------------------------------------------------------------ */
/*  CSS color-mix() output                                             */
/* ------------------------------------------------------------------ */

const CSS_COLOR_SPACE: Record<MixMode, string> = {
  rgb: "srgb",
  hsl: "hsl",
  oklch: "oklch",
};

/** Generate a CSS color-mix() declaration for a given step. */
export function toCssColorMix(hexA: string, hexB: string, pct: number, mode: MixMode): string {
  const space = CSS_COLOR_SPACE[mode];
  const bPct = 100 - pct;
  return `color-mix(in ${space}, ${hexA.toUpperCase()} ${pct}%, ${hexB.toUpperCase()} ${bPct}%)`;
}

/** CSS custom properties for all steps */
export function toCssVarsMix(steps: MixStep[], name: string): string {
  const safe = name.toLowerCase().replace(/[^a-z0-9]/g, "-") || "mix";
  return `:root {\n${steps.map((s, i) => `  --color-${safe}-${i}: ${s.hex};`).join("\n")}\n}`;
}

/** JSON array of hex strings */
export function toJsonMix(steps: MixStep[]): string {
  return JSON.stringify(steps.map((s) => s.hex), null, 2);
}
