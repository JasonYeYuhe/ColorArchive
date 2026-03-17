import {
  formatHsl,
  formatRgb,
  getColorFamily,
  hslToRgb,
  rgbToHex,
} from "@/src/lib/color-utils";
import type { ColorFamily } from "@/src/types/color";

export interface GeneratedWordColor {
  family: ColorFamily;
  hex: string;
  hsl: string;
  hue: number;
  lightness: number;
  rgb: string;
  saturation: number;
  token: string;
  variants: {
    hex: string;
    label: string;
  }[];
}

function hashString(input: string): number {
  let hash = 0;

  for (let index = 0; index < input.length; index += 1) {
    hash = (hash * 31 + input.charCodeAt(index)) >>> 0;
  }

  return hash;
}

function normalizeToken(token: string): string {
  return token.trim().toLowerCase();
}

export function generateColorFromWord(token: string): GeneratedWordColor | null {
  const normalizedToken = normalizeToken(token);

  if (normalizedToken.length === 0) {
    return null;
  }

  const hash = hashString(normalizedToken);
  const hue = hash % 360;
  const saturation = 38 + ((hash >>> 3) % 42);
  const lightness = 32 + ((hash >>> 8) % 42);
  const rgbValue = hslToRgb(hue, saturation, lightness);
  const hex = rgbToHex(rgbValue);
  const family = getColorFamily(hue);

  const variants = [
    { label: "Mist", saturation: Math.max(18, saturation - 22), lightness: Math.min(95, lightness + 28) },
    { label: "Base", saturation, lightness },
    { label: "Deep", saturation: Math.min(88, saturation + 10), lightness: Math.max(14, lightness - 18) },
  ].map(({ label, saturation: variantSaturation, lightness: variantLightness }) => ({
    label,
    hex: rgbToHex(hslToRgb(hue, variantSaturation, variantLightness)),
  }));

  return {
    family,
    hex,
    hsl: formatHsl(hue, saturation, lightness),
    hue,
    lightness,
    rgb: formatRgb(rgbValue),
    saturation,
    token: normalizedToken,
    variants,
  };
}
