/**
 * Duotone mapping: pixel luminance → a two-color ramp (shadow → highlight).
 * Pure math here; the canvas plumbing lives in the component.
 */

export interface RgbTuple {
  r: number;
  g: number;
  b: number;
}

export function hexToRgbTuple(hex: string): RgbTuple | null {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return null;
  return {
    r: parseInt(m[1].slice(0, 2), 16),
    g: parseInt(m[1].slice(2, 4), 16),
    b: parseInt(m[1].slice(4, 6), 16),
  };
}

/** Rec. 709 luma of an sRGB pixel, 0–1. Fast path for per-pixel work. */
export function pixelLuma(r: number, g: number, b: number): number {
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}

/**
 * Build a 256-entry lookup table mapping luma → duotone rgb, lerped in sRGB
 * between shadow and highlight (the standard duotone look; gamma-correct
 * blending would wash out the midtone character designers expect here).
 * Optional contrast (0–1 strength) applies a smoothstep-like S-curve first.
 */
export function buildDuotoneLut(shadow: RgbTuple, highlight: RgbTuple, contrast = 0): Uint8ClampedArray {
  const lut = new Uint8ClampedArray(256 * 3);
  const c = Math.max(0, Math.min(1, contrast));
  for (let i = 0; i < 256; i++) {
    let t = i / 255;
    if (c > 0) {
      const s = t * t * (3 - 2 * t); // smoothstep
      t = t + (s - t) * c;
    }
    lut[i * 3] = shadow.r + (highlight.r - shadow.r) * t;
    lut[i * 3 + 1] = shadow.g + (highlight.g - shadow.g) * t;
    lut[i * 3 + 2] = shadow.b + (highlight.b - shadow.b) * t;
  }
  return lut;
}

/** Apply the LUT to RGBA image data in place (alpha untouched). */
export function applyDuotone(data: Uint8ClampedArray, lut: Uint8ClampedArray): void {
  for (let i = 0; i < data.length; i += 4) {
    const luma = Math.round(pixelLuma(data[i], data[i + 1], data[i + 2]) * 255);
    data[i] = lut[luma * 3];
    data[i + 1] = lut[luma * 3 + 1];
    data[i + 2] = lut[luma * 3 + 2];
  }
}
