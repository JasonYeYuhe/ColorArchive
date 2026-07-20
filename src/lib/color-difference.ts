/**
 * Perceptual color difference: sRGB → CIE Lab (D65) and Delta E.
 *
 * deltaE76 is the plain Euclidean distance in Lab; deltaE2000 implements the
 * full CIEDE2000 formula (Sharma, Wu & Dalal 2005) including the hue-rotation
 * term. Verified against the Sharma reference pairs in the unit tests.
 */

export interface LabColor {
  L: number;
  a: number;
  b: number;
}

/** sRGB channel (0-255) → linear-light (0-1). */
function srgbToLinear(channel: number): number {
  const c = channel / 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

/** Hex "#rrggbb" (or 3-digit) → CIE Lab under D65. Returns null for invalid hex. */
export function hexToLab(hex: string): LabColor | null {
  const cleaned = hex.trim().replace(/^#/, "");
  const full =
    /^[0-9a-fA-F]{3}$/.test(cleaned)
      ? cleaned
          .split("")
          .map((c) => c + c)
          .join("")
      : cleaned;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return null;
  const r = srgbToLinear(parseInt(full.slice(0, 2), 16));
  const g = srgbToLinear(parseInt(full.slice(2, 4), 16));
  const b = srgbToLinear(parseInt(full.slice(4, 6), 16));

  // sRGB D65 → XYZ (scaled to Yn=100)
  const X = (0.4124564 * r + 0.3575761 * g + 0.1804375 * b) * 100;
  const Y = (0.2126729 * r + 0.7151522 * g + 0.072175 * b) * 100;
  const Z = (0.0193339 * r + 0.119192 * g + 0.9503041 * b) * 100;

  const Xn = 95.047;
  const Yn = 100;
  const Zn = 108.883;
  const EPS = 216 / 24389;
  const KAPPA = 24389 / 27;
  const f = (t: number) => (t > EPS ? Math.cbrt(t) : (KAPPA * t + 16) / 116);

  const fx = f(X / Xn);
  const fy = f(Y / Yn);
  const fz = f(Z / Zn);
  return { L: 116 * fy - 16, a: 500 * (fx - fy), b: 200 * (fy - fz) };
}

/** CIE76: Euclidean distance in Lab. */
export function deltaE76(lab1: LabColor, lab2: LabColor): number {
  return Math.sqrt((lab1.L - lab2.L) ** 2 + (lab1.a - lab2.a) ** 2 + (lab1.b - lab2.b) ** 2);
}

const rad = (deg: number) => (deg * Math.PI) / 180;
const deg = (r: number) => (r * 180) / Math.PI;

/** CIEDE2000 (kL = kC = kH = 1), per Sharma, Wu & Dalal (2005). */
export function deltaE2000(lab1: LabColor, lab2: LabColor): number {
  const { L: L1, a: a1, b: b1 } = lab1;
  const { L: L2, a: a2, b: b2 } = lab2;

  const C1 = Math.sqrt(a1 * a1 + b1 * b1);
  const C2 = Math.sqrt(a2 * a2 + b2 * b2);
  const Cbar = (C1 + C2) / 2;
  const G = 0.5 * (1 - Math.sqrt(Cbar ** 7 / (Cbar ** 7 + 25 ** 7)));

  const a1p = (1 + G) * a1;
  const a2p = (1 + G) * a2;
  const C1p = Math.sqrt(a1p * a1p + b1 * b1);
  const C2p = Math.sqrt(a2p * a2p + b2 * b2);

  const h1p = C1p === 0 ? 0 : (deg(Math.atan2(b1, a1p)) + 360) % 360;
  const h2p = C2p === 0 ? 0 : (deg(Math.atan2(b2, a2p)) + 360) % 360;

  const dLp = L2 - L1;
  const dCp = C2p - C1p;

  let dhp: number;
  if (C1p * C2p === 0) {
    dhp = 0;
  } else {
    const diff = h2p - h1p;
    if (Math.abs(diff) <= 180) dhp = diff;
    else dhp = diff > 180 ? diff - 360 : diff + 360;
  }
  const dHp = 2 * Math.sqrt(C1p * C2p) * Math.sin(rad(dhp) / 2);

  const Lbarp = (L1 + L2) / 2;
  const Cbarp = (C1p + C2p) / 2;

  let hbarp: number;
  if (C1p * C2p === 0) {
    hbarp = h1p + h2p;
  } else {
    const sum = h1p + h2p;
    const diff = Math.abs(h1p - h2p);
    if (diff <= 180) hbarp = sum / 2;
    else hbarp = sum < 360 ? (sum + 360) / 2 : (sum - 360) / 2;
  }

  const T =
    1 -
    0.17 * Math.cos(rad(hbarp - 30)) +
    0.24 * Math.cos(rad(2 * hbarp)) +
    0.32 * Math.cos(rad(3 * hbarp + 6)) -
    0.2 * Math.cos(rad(4 * hbarp - 63));

  const dTheta = 30 * Math.exp(-(((hbarp - 275) / 25) ** 2));
  const RC = 2 * Math.sqrt(Cbarp ** 7 / (Cbarp ** 7 + 25 ** 7));
  const SL = 1 + (0.015 * (Lbarp - 50) ** 2) / Math.sqrt(20 + (Lbarp - 50) ** 2);
  const SC = 1 + 0.045 * Cbarp;
  const SH = 1 + 0.015 * Cbarp * T;
  const RT = -Math.sin(rad(2 * dTheta)) * RC;

  return Math.sqrt(
    (dLp / SL) ** 2 +
      (dCp / SC) ** 2 +
      (dHp / SH) ** 2 +
      RT * (dCp / SC) * (dHp / SH),
  );
}

/** Convenience: CIEDE2000 straight from two hex values (null on invalid input). */
export function deltaE2000Hex(hexA: string, hexB: string): number | null {
  const a = hexToLab(hexA);
  const b = hexToLab(hexB);
  if (!a || !b) return null;
  return deltaE2000(a, b);
}

export interface DeltaEInterpretation {
  /** Short machine bucket. */
  bucket: "identical" | "imperceptible" | "close" | "noticeable" | "distinct" | "different";
  en: string;
  zh: string;
}

/** Plain-language read of a CIEDE2000 value (rule-of-thumb thresholds, not a standard). */
export function interpretDeltaE(dE: number): DeltaEInterpretation {
  if (dE < 0.5)
    return { bucket: "identical", en: "Effectively identical — no observer would tell them apart.", zh: "实际上完全相同 —— 没有人能分辨出来。" };
  if (dE < 1)
    return { bucket: "imperceptible", en: "Difference is imperceptible to most eyes.", zh: "差异小到绝大多数人无法察觉。" };
  if (dE < 2)
    return { bucket: "close", en: "Perceptible only on close side-by-side inspection.", zh: "只有并排仔细对比才能察觉。" };
  if (dE < 10)
    return { bucket: "noticeable", en: "Noticeable at a glance — reads as the same family, different shade.", zh: "一眼可辨 —— 同一色系里的不同深浅。" };
  if (dE < 50)
    return { bucket: "distinct", en: "Clearly distinct colors.", zh: "明显不同的两种颜色。" };
  return { bucket: "different", en: "Nearly opposite colors.", zh: "接近相反的颜色。" };
}
