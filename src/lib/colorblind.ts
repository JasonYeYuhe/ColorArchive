/* ------------------------------------------------------------------ */
/*  Color Blindness Simulation — Viénot et al. (1999)                */
/*  Simulates how colors appear to people with color vision           */
/*  deficiency using linearized sRGB matrix transforms.              */
/* ------------------------------------------------------------------ */

export type ColorBlindType = "deuteranopia" | "protanopia" | "tritanopia" | "achromatopsia";

export interface RGB {
  r: number;
  g: number;
  b: number;
}

/** Convert a single sRGB channel [0–255] to linear light */
function toLinear(c: number): number {
  const s = c / 255;
  return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

/** Convert a linear light value back to sRGB [0–255] */
function toSRGB(c: number): number {
  const clamped = Math.max(0, Math.min(1, c));
  const s =
    clamped <= 0.0031308
      ? clamped * 12.92
      : 1.055 * Math.pow(clamped, 1 / 2.4) - 0.055;
  return Math.round(s * 255);
}

/**
 * Simulation matrices in linearized sRGB space.
 * Source: Viénot, Brettel & Mollon (1999), "Digital video colourmaps
 * for checking the legibility of displays by dichromats."
 */
const SIMULATION_MATRICES: Record<
  Exclude<ColorBlindType, "achromatopsia">,
  [number, number, number, number, number, number, number, number, number]
> = {
  protanopia: [
    0.56667, 0.43333, 0.0,
    0.55833, 0.44167, 0.0,
    0.0,     0.24167, 0.75833,
  ],
  deuteranopia: [
    0.625,   0.375,   0.0,
    0.7,     0.3,     0.0,
    0.0,     0.3,     0.7,
  ],
  tritanopia: [
    0.95,    0.05,    0.0,
    0.0,     0.43333, 0.56667,
    0.0,     0.47500, 0.52500,
  ],
};

/**
 * Simulate how an RGB color appears under a given color vision deficiency.
 * Returns a new RGB object in sRGB [0–255].
 */
export function simulateColorBlindness(rgb: RGB, type: ColorBlindType): RGB {
  const rL = toLinear(rgb.r);
  const gL = toLinear(rgb.g);
  const bL = toLinear(rgb.b);

  if (type === "achromatopsia") {
    // Convert to luminance — perceived as uniform gray
    const y = 0.2126 * rL + 0.7152 * gL + 0.0722 * bL;
    return { r: toSRGB(y), g: toSRGB(y), b: toSRGB(y) };
  }

  const [m00, m01, m02, m10, m11, m12, m20, m21, m22] = SIMULATION_MATRICES[type];
  return {
    r: toSRGB(m00 * rL + m01 * gL + m02 * bL),
    g: toSRGB(m10 * rL + m11 * gL + m12 * bL),
    b: toSRGB(m20 * rL + m21 * gL + m22 * bL),
  };
}

/** Parse a hex string (#RRGGBB or #RGB) to RGB. Returns null if invalid. */
export function hexToRgbCB(hex: string): RGB | null {
  const cleaned = hex.replace(/^#/, "");
  const expanded =
    cleaned.length === 3
      ? cleaned
          .split("")
          .map((c) => c + c)
          .join("")
      : cleaned;
  if (expanded.length !== 6) return null;
  const num = parseInt(expanded, 16);
  if (isNaN(num)) return null;
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}

/** Convert RGB to uppercase hex string */
export function rgbToHexCB(rgb: RGB): string {
  return `#${rgb.r.toString(16).padStart(2, "0")}${rgb.g.toString(16).padStart(2, "0")}${rgb.b.toString(16).padStart(2, "0")}`.toUpperCase();
}

/** Perceived luminance (0–1) for a simulated color — used to pick legible text */
export function luminance(rgb: RGB): number {
  return 0.2126 * toLinear(rgb.r) + 0.7152 * toLinear(rgb.g) + 0.0722 * toLinear(rgb.b);
}

export const COLOR_BLIND_INFO: {
  type: ColorBlindType;
  label: string;
  shortLabel: string;
  description: string;
  prevalence: string;
  affected: string;
}[] = [
  {
    type: "deuteranopia",
    label: "Deuteranopia",
    shortLabel: "Deutan",
    description:
      "Missing or non-functional M (medium-wave, green-sensitive) cones. Reds and greens are difficult to distinguish.",
    prevalence: "~6% of males",
    affected: "Most common type of color blindness",
  },
  {
    type: "protanopia",
    label: "Protanopia",
    shortLabel: "Protan",
    description:
      "Missing or non-functional L (long-wave, red-sensitive) cones. Reds appear darker and are confused with greens.",
    prevalence: "~2% of males",
    affected: "Second most common type",
  },
  {
    type: "tritanopia",
    label: "Tritanopia",
    shortLabel: "Tritan",
    description:
      "Missing or non-functional S (short-wave, blue-sensitive) cones. Blues and yellows are difficult to distinguish.",
    prevalence: "~0.01% of people",
    affected: "Rare, affects both sexes equally",
  },
  {
    type: "achromatopsia",
    label: "Achromatopsia",
    shortLabel: "Achroma",
    description:
      "Complete absence of cone function. Only brightness (luminance) is perceived — no hue or saturation information.",
    prevalence: "~0.003% of people",
    affected: "Extremely rare; design for this ensures strong luminance contrast",
  },
];

/** A preset palette of colors commonly used in UI design — good for testing */
export const SAMPLE_PALETTE: string[] = [
  "#E63946", // vivid red
  "#2A9D8F", // teal green
  "#E9C46A", // warm yellow
  "#264653", // dark teal
  "#F4A261", // orange
  "#A8DADC", // soft cyan
];
