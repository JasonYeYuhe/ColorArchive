/**
 * "What paints mix to make this color?" — an APPROXIMATE subtractive-mixing
 * solver over a classic artist primary set.
 *
 * Model: weighted geometric mixing of linearized sRGB reflectances
 * (channel = Π channelᵢ^wᵢ). This mimics how pigments multiply light away and
 * predicts the familiar results (yellow + blue → green) that additive RGB
 * averaging cannot. It is NOT Kubelka-Munk and real pigments vary — the UI
 * must present results as a starting recipe, never a guarantee (honest-copy
 * rule, dev-plan-2026-07-20 §2.3).
 */

import { deltaE2000, hexToLab } from "@/src/lib/color-difference";

export interface PaintPrimary {
  id: string;
  en: string;
  zh: string;
  hex: string;
}

/** A compact artist set: warm/cool reds+blues would be better still, but five keeps recipes practical. */
export const PAINT_PRIMARIES: PaintPrimary[] = [
  { id: "red", en: "Cadmium Red", zh: "镉红", hex: "#d32f2f" },
  { id: "yellow", en: "Cadmium Yellow", zh: "镉黄", hex: "#f9d71c" },
  { id: "blue", en: "Ultramarine Blue", zh: "群青", hex: "#2b4a9b" },
  { id: "white", en: "Titanium White", zh: "钛白", hex: "#f8f8f4" },
  { id: "black", en: "Ivory Black", zh: "象牙黑", hex: "#221f1e" },
];

export interface PaintRecipe {
  /** parts per primary, aligned with `primaries`; total parts kept small (≤ 8). */
  parts: Array<{ primary: PaintPrimary; count: number }>;
  /** Predicted mix under the model. */
  mixedHex: string;
  /** CIEDE2000 between prediction and target. */
  deltaE: number;
}

const EPS = 1e-4;

function srgbToLinear(v: number): number {
  const c = v / 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function linearToSrgb(v: number): number {
  const c = v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(v, 1 / 2.4) - 0.055;
  return Math.max(0, Math.min(255, Math.round(c * 255)));
}

/** Weighted geometric mix of hex colors in linear-light space. Weights must sum > 0. */
export function mixPaints(hexes: string[], weights: number[]): string {
  const total = weights.reduce((a, b) => a + b, 0);
  const channels: [number, number, number] = [0, 0, 0];
  for (let i = 0; i < hexes.length; i++) {
    const w = weights[i] / total;
    if (w === 0) continue;
    const m = /^#?([0-9a-f]{6})$/i.exec(hexes[i].trim());
    if (!m) continue;
    for (let ch = 0; ch < 3; ch++) {
      const v = parseInt(m[1].slice(ch * 2, ch * 2 + 2), 16);
      channels[ch] += w * Math.log(Math.max(EPS, srgbToLinear(v)));
    }
  }
  const out = channels.map((c) => linearToSrgb(Math.exp(c)));
  return `#${out.map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

/**
 * Search small integer-part recipes (2–3 primaries, ≤ 8 total parts) for the
 * closest match to the target. Deterministic exhaustive search — the space is
 * tiny (a few thousand combinations).
 */
export function solvePaintRecipe(targetHex: string, maxResults = 3): PaintRecipe[] {
  const targetLab = hexToLab(targetHex);
  if (!targetLab) return [];

  const results: PaintRecipe[] = [];
  const n = PAINT_PRIMARIES.length;
  const MAX_TOTAL = 8;

  const evaluate = (idxs: number[], parts: number[]) => {
    const hexes = idxs.map((i) => PAINT_PRIMARIES[i].hex);
    const mixedHex = mixPaints(hexes, parts);
    const lab = hexToLab(mixedHex);
    if (!lab) return;
    const dE = deltaE2000(lab, targetLab);
    results.push({
      parts: idxs.map((p, k) => ({ primary: PAINT_PRIMARIES[p], count: parts[k] })),
      mixedHex,
      deltaE: dE,
    });
  };

  // Singles — a target near a pure paint must return the pure paint.
  for (let a = 0; a < n; a++) {
    evaluate([a], [1]);
  }
  // Pairs and triples over EVERY total from 2..MAX_TOTAL — a fixed total of 8
  // would silently miss ratios like 1:2 or 2:3 whose part sums don't divide 8
  // (dedup below collapses scaled duplicates such as 2:4 → 1:2).
  for (let total = 2; total <= MAX_TOTAL; total++) {
    for (let a = 0; a < n; a++) {
      for (let b = a + 1; b < n; b++) {
        for (let pa = 1; pa < total; pa++) {
          evaluate([a, b], [pa, total - pa]);
        }
        for (let c = b + 1; c < n; c++) {
          for (let pa = 1; pa <= total - 2; pa++) {
            for (let pb = 1; pb <= total - pa - 1; pb++) {
              evaluate([a, b, c], [pa, pb, total - pa - pb]);
            }
          }
        }
      }
    }
  }

  results.sort((x, y) => x.deltaE - y.deltaE);

  // Deduplicate by primary-set + reduced ratio (e.g. 2:2 ≡ 1:1, 2:4 ≡ 1:2).
  const seen = new Set<string>();
  const unique: PaintRecipe[] = [];
  for (const r of results) {
    const counts = r.parts.map((p) => p.count);
    const gcd = counts.reduce((g, v) => {
      let x = g;
      let y = v;
      while (y) [x, y] = [y, x % y];
      return x;
    });
    const key = r.parts.map((p) => `${p.primary.id}:${p.count / gcd}`).join("|");
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push({
      ...r,
      parts: r.parts.map((p) => ({ ...p, count: p.count / gcd })),
    });
    if (unique.length >= maxResults) break;
  }
  return unique;
}
