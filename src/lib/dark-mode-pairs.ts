import { hexToRgb, rgbToHsl, hslToRgb, rgbToHex } from "./color-convert";

export interface DarkModePair {
  name: string;
  light: string;
  dark: string;
}

/**
 * Generate a dark mode counterpart for a hex color.
 * Strategy: invert lightness around 50%, clamp saturation, and adjust for readability.
 */
function generateDarkVariant(hex: string): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  const { h, s, l } = rgbToHsl(rgb.r, rgb.g, rgb.b);

  // Invert lightness: light colors become dark, dark become light
  // Use a curve that keeps mid-tones stable and pushes extremes
  let darkL: number;
  if (l > 70) {
    // Very light → make dark (surface colors)
    darkL = Math.max(10, 100 - l - 5);
  } else if (l > 50) {
    // Medium-light → slightly darker
    darkL = Math.max(15, l - 30);
  } else if (l > 30) {
    // Medium → slightly lighter
    darkL = Math.min(85, l + 25);
  } else {
    // Dark → make light
    darkL = Math.min(90, 100 - l + 5);
  }

  // Reduce saturation slightly for dark mode to avoid harsh neon
  const darkS = Math.max(0, Math.min(100, s * 0.85));

  const darkRgb = hslToRgb(h, darkS, darkL);
  return rgbToHex(darkRgb);
}

/**
 * Generate light/dark CSS variable pairs from an array of hex colors.
 */
export function buildDarkModePairs(
  colors: { name: string; hex: string }[],
  prefix = "color",
): DarkModePair[] {
  return colors.map((c, i) => ({
    name: `${prefix}-${i + 1}`,
    light: c.hex,
    dark: generateDarkVariant(c.hex),
  }));
}

/**
 * Export dark mode pairs as CSS variables with data-theme attribute.
 */
export function buildDarkModeCss(pairs: DarkModePair[], prefix = "palette"): string {
  const lightVars = pairs
    .map((p) => `  --${prefix}-${p.name}: ${p.light};`)
    .join("\n");
  const darkVars = pairs
    .map((p) => `  --${prefix}-${p.name}: ${p.dark};`)
    .join("\n");

  return `/* Light mode (default) */\n:root {\n${lightVars}\n}\n\n/* Dark mode */\n[data-theme="dark"],\n.dark {\n${darkVars}\n}`;
}

/**
 * Export dark mode pairs as Tailwind dark: config.
 */
export function buildDarkModeTailwind(pairs: DarkModePair[], prefix = "palette"): string {
  const config = pairs
    .map(
      (p) =>
        `        '${p.name}': '${p.light}',\n        '${p.name}-dark': '${p.dark}',`,
    )
    .join("\n");

  return `/** @type {import('tailwindcss').Config} */\nmodule.exports = {\n  theme: {\n    extend: {\n      colors: {\n        '${prefix}': {\n${config}\n        },\n      },\n    },\n  },\n};`;
}
