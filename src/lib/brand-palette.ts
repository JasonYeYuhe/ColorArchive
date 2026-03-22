import { hexToRgb, rgbToHsl, hslToRgb, rgbToHex } from "./color-convert";

export const SCALE_STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;
export type ScaleStep = (typeof SCALE_STEPS)[number];

// Target lightness values for each step (Tailwind-inspired)
const STEP_LIGHTNESS: Record<ScaleStep, number> = {
  50: 97,
  100: 93,
  200: 86,
  300: 76,
  400: 63,
  500: 50,
  600: 39,
  700: 29,
  800: 20,
  900: 13,
  950: 8,
};

// Saturation multiplier at each step (full in midrange, reduced at extremes)
const STEP_SAT_FACTOR: Record<ScaleStep, number> = {
  50: 0.55,
  100: 0.65,
  200: 0.80,
  300: 0.90,
  400: 0.97,
  500: 1.00,
  600: 0.97,
  700: 0.90,
  800: 0.80,
  900: 0.68,
  950: 0.55,
};

export interface ScaleColor {
  step: ScaleStep;
  hex: string;
  hsl: string;
  lightness: number;
}

export interface ColorScale {
  label: string;
  colors: ScaleColor[];
}

export interface SemanticColor {
  role: "success" | "warning" | "error" | "info";
  label: string;
  hex: string;
  hsl: string;
}

export interface BrandPalette {
  inputHex: string;
  primary: ColorScale;
  neutral: ColorScale;
  semantics: SemanticColor[];
}

function scaleColor(step: ScaleStep, hue: number, baseSat: number): ScaleColor {
  const lightness = STEP_LIGHTNESS[step];
  const saturation = Math.round(Math.min(100, baseSat * STEP_SAT_FACTOR[step]));
  const rgb = hslToRgb(hue, saturation, lightness);
  const hex = rgbToHex(rgb);
  return {
    step,
    hex,
    hsl: `hsl(${hue}, ${saturation}%, ${lightness}%)`,
    lightness,
  };
}

/** Generate an 11-step primary color scale from a hex input. */
export function generateColorScale(hex: string): ColorScale | null {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;
  const { h, s } = rgbToHsl(rgb.r, rgb.g, rgb.b);
  const baseSat = Math.max(s, 20); // ensure minimum saturation for interesting scale
  return {
    label: "Primary",
    colors: SCALE_STEPS.map((step) => scaleColor(step, h, baseSat)),
  };
}

/** Generate an 11-step neutral scale tinted with the brand hue. */
export function generateNeutralScale(hex: string): ColorScale | null {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;
  const { h } = rgbToHsl(rgb.r, rgb.g, rgb.b);
  return {
    label: "Neutral",
    colors: SCALE_STEPS.map((step) => scaleColor(step, h, 7)),
  };
}

/** Semantic hues: fixed, but shifted slightly toward the brand hue for harmony. */
function harmoniseHue(targetHue: number, brandHue: number, weight = 0.12): number {
  const diff = ((brandHue - targetHue + 540) % 360) - 180;
  return Math.round((targetHue + diff * weight + 360) % 360);
}

/** Generate the four semantic color representatives (500-level). */
export function generateSemanticColors(hex: string): SemanticColor[] | null {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;
  const { h: brandHue } = rgbToHsl(rgb.r, rgb.g, rgb.b);

  const semanticDefs: { role: SemanticColor["role"]; label: string; hue: number; sat: number }[] = [
    { role: "success", label: "Success", hue: 142, sat: 72 },
    { role: "warning", label: "Warning", hue: 38, sat: 95 },
    { role: "error", label: "Error", hue: 4, sat: 86 },
    { role: "info", label: "Info", hue: 217, sat: 91 },
  ];

  return semanticDefs.map(({ role, label, hue, sat }) => {
    const h = harmoniseHue(hue, brandHue);
    const rgb500 = hslToRgb(h, sat, 50);
    const hex500 = rgbToHex(rgb500);
    return {
      role,
      label,
      hex: hex500,
      hsl: `hsl(${h}, ${sat}%, 50%)`,
    };
  });
}

/** Build the full brand palette from a hex string. Returns null for invalid input. */
export function generateBrandPalette(hex: string): BrandPalette | null {
  const clean = hex.startsWith("#") ? hex : `#${hex}`;
  const primary = generateColorScale(clean);
  const neutral = generateNeutralScale(clean);
  const semantics = generateSemanticColors(clean);
  if (!primary || !neutral || !semantics) return null;
  return { inputHex: clean.toUpperCase(), primary, neutral, semantics };
}

/** CSS custom properties output. */
export function buildBrandCssVariables(palette: BrandPalette): string {
  const lines: string[] = [":root {"];
  for (const color of palette.primary.colors) {
    lines.push(`  --color-primary-${color.step}: ${color.hex};`);
  }
  lines.push("");
  for (const color of palette.neutral.colors) {
    lines.push(`  --color-neutral-${color.step}: ${color.hex};`);
  }
  lines.push("");
  for (const sem of palette.semantics) {
    lines.push(`  --color-${sem.role}: ${sem.hex};`);
  }
  lines.push("}");
  return lines.join("\n");
}

/** Tailwind v3 config snippet. */
export function buildBrandTailwindConfig(palette: BrandPalette): string {
  const toObj = (colors: ScaleColor[]) =>
    colors.map((c) => `      ${c.step}: "${c.hex}",`).join("\n");

  const semLines = palette.semantics
    .map((s) => `      ${s.role}: "${s.hex}",`)
    .join("\n");

  return `/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
        brand: {
${toObj(palette.primary.colors)}
        },
        neutral: {
${toObj(palette.neutral.colors)}
        },
${semLines}
      },
    },
  },
};`;
}

/** W3C Design Tokens Community Group format (Figma Variables / Tokens Studio compatible). */
export function buildBrandFigmaTokens(palette: BrandPalette): string {
  const scaleObj = (colors: ScaleColor[]) =>
    Object.fromEntries(colors.map((c) => [String(c.step), { $type: "color", $value: c.hex }]));

  const semObj = Object.fromEntries(
    palette.semantics.map((s) => [s.role, { $type: "color", $value: s.hex }]),
  );

  return JSON.stringify(
    {
      brand: scaleObj(palette.primary.colors),
      neutral: scaleObj(palette.neutral.colors),
      semantic: semObj,
    },
    null,
    2,
  );
}

/** Style Dictionary format (Amazon). */
export function buildBrandStyleDictionary(palette: BrandPalette): string {
  const scaleObj = (colors: ScaleColor[]) =>
    Object.fromEntries(colors.map((c) => [String(c.step), { value: c.hex, type: "color" }]));

  const semObj = Object.fromEntries(
    palette.semantics.map((s) => [s.role, { value: s.hex, type: "color" }]),
  );

  return JSON.stringify(
    {
      color: {
        brand: scaleObj(palette.primary.colors),
        neutral: scaleObj(palette.neutral.colors),
        semantic: semObj,
      },
    },
    null,
    2,
  );
}

/** Compute WCAG contrast ratio between two hex colors (1–21). */
export function hexContrastRatio(hex1: string, hex2: string): number {
  const toLinear = (c: number) => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  const lum = (hex: string) => {
    const rgb = hexToRgb(hex);
    if (!rgb) return 0;
    return 0.2126 * toLinear(rgb.r) + 0.7152 * toLinear(rgb.g) + 0.0722 * toLinear(rgb.b);
  };
  const l1 = lum(hex1);
  const l2 = lum(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return Math.round(((lighter + 0.05) / (darker + 0.05)) * 10) / 10;
}

export function wcagLabel(ratio: number): "AAA" | "AA" | "AA Large" | "Fail" {
  if (ratio >= 7) return "AAA";
  if (ratio >= 4.5) return "AA";
  if (ratio >= 3) return "AA Large";
  return "Fail";
}
