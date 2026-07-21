/**
 * Color temperature (Kelvin) → RGB, using Tanner Helland's well-known
 * black-body curve fit (accurate to a few ΔE across 1000–40000K — an
 * approximation of CIE illuminant colors, good for lighting/design work,
 * not for colorimetry).
 */

export interface TemperaturePreset {
  kelvin: number;
  en: string;
  zh: string;
}

export const TEMPERATURE_PRESETS: TemperaturePreset[] = [
  { kelvin: 1900, en: "Candle flame", zh: "烛光" },
  { kelvin: 2400, en: "Warm incandescent", zh: "暖白炽灯" },
  { kelvin: 2700, en: "Soft white bulb", zh: "柔白灯泡" },
  { kelvin: 3200, en: "Studio tungsten", zh: "影棚钨丝灯" },
  { kelvin: 4000, en: "Cool white / moonlight", zh: "冷白 / 月光" },
  { kelvin: 5000, en: "Horizon daylight", zh: "地平线日光" },
  { kelvin: 5600, en: "Midday daylight / flash", zh: "正午日光 / 闪光灯" },
  { kelvin: 6500, en: "Overcast sky (D65)", zh: "阴天(D65)" },
  { kelvin: 7500, en: "North sky shade", zh: "背阴北窗" },
  { kelvin: 10000, en: "Deep blue sky", zh: "深蓝天空" },
];

export const KELVIN_MIN = 1000;
export const KELVIN_MAX = 12000;

/** Kelvin → sRGB via the Tanner Helland fit. Input clamped to [1000, 40000]. */
export function kelvinToRgb(kelvin: number): { r: number; g: number; b: number } {
  const k = Math.max(1000, Math.min(40000, kelvin)) / 100;
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));

  let r: number;
  let g: number;
  let b: number;

  // Red
  if (k <= 66) {
    r = 255;
  } else {
    r = 329.698727446 * Math.pow(k - 60, -0.1332047592);
  }

  // Green
  if (k <= 66) {
    g = 99.4708025861 * Math.log(k) - 161.1195681661;
  } else {
    g = 288.1221695283 * Math.pow(k - 60, -0.0755148492);
  }

  // Blue
  if (k >= 66) {
    b = 255;
  } else if (k <= 19) {
    b = 0;
  } else {
    b = 138.5177312231 * Math.log(k - 10) - 305.0447927307;
  }

  return { r: clamp(r), g: clamp(g), b: clamp(b) };
}

export function kelvinToHex(kelvin: number): string {
  const { r, g, b } = kelvinToRgb(kelvin);
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

/** Coarse warm/neutral/cool label for a Kelvin value. */
export function temperatureLabel(kelvin: number): { key: "warm" | "neutral" | "cool"; en: string; zh: string } {
  if (kelvin < 3500) return { key: "warm", en: "Warm", zh: "暖" };
  if (kelvin < 5500) return { key: "neutral", en: "Neutral", zh: "中性" };
  return { key: "cool", en: "Cool", zh: "冷" };
}
