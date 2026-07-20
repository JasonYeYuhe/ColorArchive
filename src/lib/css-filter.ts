/**
 * "Black → any color" CSS filter chain solver.
 *
 * Given a target color, finds filter values (invert → sepia → saturate →
 * hue-rotate → brightness → contrast) that transform pure black into (close to)
 * the target — the classic trick for recoloring black SVG icons with CSS only.
 *
 * Filter math follows the CSS Filter Effects spec matrices (sepia / saturate /
 * hue-rotate as color matrices; brightness / contrast as linear transfer;
 * invert as interpolation). The search is SPSA (simultaneous-perturbation
 * stochastic approximation): a wide multi-start phase then a narrow refine —
 * the well-known approach popularized by Barrett Sonntag's solver.
 *
 * All randomness flows through an injectable seeded PRNG so results are
 * reproducible and unit-testable.
 */

import { hexToLab, deltaE2000, type LabColor } from "@/src/lib/color-difference";

/* ---------------- seeded PRNG ---------------- */

/** mulberry32 — tiny deterministic PRNG. */
export function createRng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a += 0x6d2b79f5;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ---------------- color under filters ---------------- */

class FilterColor {
  r: number;
  g: number;
  b: number;

  constructor(r: number, g: number, b: number) {
    this.r = r;
    this.g = g;
    this.b = b;
  }

  private clamp(v: number): number {
    return Math.max(0, Math.min(255, v));
  }

  set(r: number, g: number, b: number) {
    this.r = this.clamp(r);
    this.g = this.clamp(g);
    this.b = this.clamp(b);
  }

  multiply(m: number[]) {
    const { r, g, b } = this;
    this.set(
      r * m[0] + g * m[1] + b * m[2],
      r * m[3] + g * m[4] + b * m[5],
      r * m[6] + g * m[7] + b * m[8],
    );
  }

  /** invert(v): per-spec interpolation toward the complement. */
  invert(v: number) {
    this.set(
      (v + (this.r / 255) * (1 - 2 * v)) * 255,
      (v + (this.g / 255) * (1 - 2 * v)) * 255,
      (v + (this.b / 255) * (1 - 2 * v)) * 255,
    );
  }

  sepia(v: number) {
    this.multiply([
      0.393 + 0.607 * (1 - v), 0.769 - 0.769 * (1 - v), 0.189 - 0.189 * (1 - v),
      0.349 - 0.349 * (1 - v), 0.686 + 0.314 * (1 - v), 0.168 - 0.168 * (1 - v),
      0.272 - 0.272 * (1 - v), 0.534 - 0.534 * (1 - v), 0.131 + 0.869 * (1 - v),
    ]);
  }

  saturate(v: number) {
    this.multiply([
      0.213 + 0.787 * v, 0.715 - 0.715 * v, 0.072 - 0.072 * v,
      0.213 - 0.213 * v, 0.715 + 0.285 * v, 0.072 - 0.072 * v,
      0.213 - 0.213 * v, 0.715 - 0.715 * v, 0.072 + 0.928 * v,
    ]);
  }

  hueRotate(deg: number) {
    const rad = (deg / 180) * Math.PI;
    const c = Math.cos(rad);
    const s = Math.sin(rad);
    this.multiply([
      0.213 + c * 0.787 - s * 0.213, 0.715 - c * 0.715 - s * 0.715, 0.072 - c * 0.072 + s * 0.928,
      0.213 - c * 0.213 + s * 0.143, 0.715 + c * 0.285 + s * 0.14, 0.072 - c * 0.072 - s * 0.283,
      0.213 - c * 0.213 - s * 0.787, 0.715 - c * 0.715 + s * 0.715, 0.072 + c * 0.928 + s * 0.072,
    ]);
  }

  private linear(slope: number, intercept = 0) {
    this.set(
      this.r * slope + intercept * 255,
      this.g * slope + intercept * 255,
      this.b * slope + intercept * 255,
    );
  }

  brightness(v: number) {
    this.linear(v);
  }

  contrast(v: number) {
    this.linear(v, -0.5 * v + 0.5);
  }
}

/** Filter values in solver space: [invert, sepia, saturate, hueRotate, brightness, contrast]. */
export type FilterValues = [number, number, number, number, number, number];

/** Apply the chain to pure black and return the resulting rgb. */
export function applyFilters(values: FilterValues): { r: number; g: number; b: number } {
  const c = new FilterColor(0, 0, 0);
  c.invert(values[0] / 100);
  c.sepia(values[1] / 100);
  c.saturate(values[2] / 100);
  c.hueRotate(values[3] * 3.6);
  c.brightness(values[4] / 100);
  c.contrast(values[5] / 100);
  return { r: Math.round(c.r), g: Math.round(c.g), b: Math.round(c.b) };
}

function rgbToLabLocal(r: number, g: number, b: number): LabColor {
  const hex = `#${[r, g, b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("")}`;
  return hexToLab(hex) ?? { L: 0, a: 0, b: 0 };
}

/** Perceptual loss between the filtered black and the target. */
export function filterLoss(values: FilterValues, targetLab: LabColor): number {
  const { r, g, b } = applyFilters(values);
  return deltaE2000(rgbToLabLocal(r, g, b), targetLab);
}

/* ---------------- SPSA solver ---------------- */

function fix(value: number, idx: number): number {
  let max = 100;
  if (idx === 2) max = 7500; // saturate
  else if (idx === 4 || idx === 5) max = 200; // brightness / contrast
  if (idx === 3) {
    // hue-rotate wraps
    if (value > max) value %= max;
    else if (value < 0) value = max + (value % max);
  } else {
    value = Math.max(0, Math.min(max, value));
  }
  return value;
}

function spsa(
  targetLab: LabColor,
  A: number,
  a: number[],
  c: number,
  values: FilterValues,
  iters: number,
  rng: () => number,
): { values: FilterValues; loss: number } {
  const alpha = 1;
  const gamma = 1 / 6;
  let best: FilterValues | null = null;
  let bestLoss = Infinity;
  const deltas = new Array<number>(6);
  const highArgs = new Array(6) as FilterValues;
  const lowArgs = new Array(6) as FilterValues;

  for (let k = 0; k < iters; k++) {
    const ck = c / Math.pow(k + 1, gamma);
    for (let i = 0; i < 6; i++) {
      deltas[i] = rng() > 0.5 ? 1 : -1;
      highArgs[i] = values[i] + ck * deltas[i];
      lowArgs[i] = values[i] - ck * deltas[i];
    }
    const lossDiff = filterLoss(highArgs, targetLab) - filterLoss(lowArgs, targetLab);
    for (let i = 0; i < 6; i++) {
      const g = (lossDiff / (2 * ck)) * deltas[i];
      const ak = a[i] / Math.pow(A + k + 1, alpha);
      values[i] = fix(values[i] - ak * g, i);
    }
    const loss = filterLoss(values, targetLab);
    if (loss < bestLoss) {
      best = [...values] as FilterValues;
      bestLoss = loss;
    }
  }
  return { values: best ?? values, loss: bestLoss };
}

export interface FilterSolution {
  values: FilterValues;
  /** CIEDE2000 between the filtered black and the target. */
  loss: number;
  /** Ready-to-paste CSS (for a black source). */
  css: string;
}

export function formatFilterCss(values: FilterValues): string {
  const f = (v: number, digits = 0) => v.toFixed(digits);
  return `filter: invert(${f(values[0])}%) sepia(${f(values[1])}%) saturate(${f(values[2])}%) hue-rotate(${f(values[3] * 3.6)}deg) brightness(${f(values[4])}%) contrast(${f(values[5])}%);`;
}

/**
 * Solve for a target hex. Deterministic for a given seed. Runs a spread of
 * wide SPSA starts then refines the best — a few thousand loss evaluations,
 * comfortably fast on the client.
 */
export function solveFilters(targetHex: string, seed = 42): FilterSolution | null {
  const targetLab = hexToLab(targetHex);
  if (!targetLab) return null;
  const rng = createRng(seed);

  // Wide phase: multi-start.
  const A = 5;
  const c = 15;
  const a: number[] = [60, 180, 18000, 600, 1.2, 1.2];
  let best: { values: FilterValues; loss: number } | null = null;
  for (let i = 0; i < 4; i++) {
    const initial: FilterValues = [50, 20, 3750, 50, 100, 100];
    const result = spsa(targetLab, A, a, c, initial, 500, rng);
    if (!best || result.loss < best.loss) best = result;
  }
  if (!best) return null; // unreachable (loop always runs) — satisfies narrowing

  // Narrow phase: refine around the best.
  const A2 = best.loss;
  const c2 = 2;
  const A2a = A2 + 1;
  const a2: number[] = [0.25 * A2a, 0.25 * A2a, A2a, 0.25 * A2a, 0.2 * A2a, 0.2 * A2a];
  const refined = spsa(targetLab, A2, a2, c2, [...best.values] as FilterValues, 500, rng);
  const final = refined.loss < best.loss ? refined : best;

  return { values: final.values, loss: final.loss, css: formatFilterCss(final.values) };
}
