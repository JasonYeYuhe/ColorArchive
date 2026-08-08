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

/**
 * Avalanche step (the finalizer from MurmurHash3's fmix32).
 *
 * Only applied to hashes that never filled their high bits — see hashString.
 */
function avalanche(value: number): number {
  let x = value >>> 0;
  x = Math.imul(x ^ (x >>> 16), 0x85ebca6b) >>> 0;
  x = Math.imul(x ^ (x >>> 13), 0xc2b2ae35) >>> 0;
  return (x ^ (x >>> 16)) >>> 0;
}

/**
 * DO NOT "improve" this by mixing every hash. The site's whole promise is that a
 * word always returns the same colour — it is in the page copy, in the FAQ, and
 * in the metadata of 474 pre-rendered /word-to-color/[word]/ pages. Remixing
 * unconditionally would silently recolour every one of them and break every link
 * anyone has shared.
 *
 * THE CONDITION IS THE BUG ITSELF, NOT A RANGE AROUND IT. Lightness is
 * `32 + ((hash >>> 8) % 42)`, so the degenerate case is exactly `hash >>> 8 === 0`
 * — the shift discards the whole hash and lightness lands on 32 every time. That
 * is true for, and only for, hashes below 256 — a single character below U+0100,
 * i.e. every ASCII character plus the whole Latin-1 block (é, ñ, ü, ø, ß). All
 * 26 English letters and all 10 digits came out with lightness
 * pinned to exactly 32 and a hue equal to their raw char code, i.e. a 93° wedge
 * of yellow-green: "a" through "z" were the same dark green, "0" through "9" the
 * same olive.
 *
 * TWO THINGS THIS THRESHOLD IS DELIBERATELY NOT:
 *
 * It is not 4096. A first attempt used that, reasoning that 2-char ASCII tops out
 * at 3904 and 3-char starts at 96321, so the gap looked free. It was not: the
 * published seed list contains the 2-character word "ai" (hash 3112), and the
 * threshold silently recoloured its live page from #3948A7 to #D6964C — title,
 * h1, meta description, JSON-LD, OG card and all. Picking a range that "looks
 * safe" is not the same as checking the corpus, and the pinned-value test at the
 * time contained no 2-character word so it sailed through.
 *
 * It is not 65536 either. An even earlier attempt used that and recoloured every
 * single-character CJK word — U+4E00 is 19968, so a lone Han character never had
 * empty high bits and was never degenerate. That matters here: single Han
 * characters are real words, and Chinese is this site's promotion audience.
 *
 * The residual risk is a long input whose hash happens to wrap below 256: about
 * 1 in 16.7 million. The seed-snapshot test alongside this file pins all 474
 * published words, so any future change to this function has to face the whole
 * corpus rather than a handful of hand-picked examples.
 */
function isDegenerate(hash: number): boolean {
  // `hash >>> 8 === 0` — written as the comparison it actually is.
  return hash < 0x100;
}

function hashString(input: string): number {
  let hash = 0;

  for (let index = 0; index < input.length; index += 1) {
    hash = (hash * 31 + input.charCodeAt(index)) >>> 0;
  }

  return isDegenerate(hash) ? avalanche(hash) : hash;
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
    {
      label: "Mist",
      hue,
      saturation: Math.max(18, saturation - 24),
      lightness: Math.min(95, lightness + 30),
    },
    {
      label: "Glow",
      hue,
      saturation: Math.max(24, saturation - 10),
      lightness: Math.min(90, lightness + 14),
    },
    { label: "Base", hue, saturation, lightness },
    {
      label: "Deep",
      hue,
      saturation: Math.min(88, saturation + 10),
      lightness: Math.max(14, lightness - 18),
    },
    {
      label: "Accent",
      hue: (hue + 32) % 360,
      saturation: Math.min(88, saturation + 8),
      lightness: Math.max(22, Math.min(72, lightness)),
    },
  ].map(
    ({
      label,
      hue: variantHue,
      saturation: variantSaturation,
      lightness: variantLightness,
    }) => ({
      label,
      hex: rgbToHex(hslToRgb(variantHue, variantSaturation, variantLightness)),
    }),
  );

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
