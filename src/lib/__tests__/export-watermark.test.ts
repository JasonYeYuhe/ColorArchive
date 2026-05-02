import { describe, expect, it } from "vitest";
import {
  EXPORT_WATERMARK_TEXT,
  withSvgWatermark,
} from "@/src/lib/export-watermark";

const sampleSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="#FF5733"/></svg>`;

describe("withSvgWatermark", () => {
  it("does not modify Pro exports", () => {
    const out = withSvgWatermark(sampleSvg, "pro");
    expect(out).toBe(sampleSvg);
    expect(out.includes(EXPORT_WATERMARK_TEXT)).toBe(false);
  });

  it("inserts the watermark for Free users", () => {
    const out = withSvgWatermark(sampleSvg, "free");
    expect(out.includes(EXPORT_WATERMARK_TEXT)).toBe(true);
    // Watermark must be inside the SVG, before </svg>
    expect(out.endsWith("</svg>")).toBe(true);
    // Original rect must still be present
    expect(out.includes('fill="#FF5733"')).toBe(true);
  });

  it("inserts the watermark for anonymous users", () => {
    const out = withSvgWatermark(sampleSvg, "anonymous");
    expect(out.includes(EXPORT_WATERMARK_TEXT)).toBe(true);
  });

  it("returns the original svg when width/height attributes are missing", () => {
    const noDims = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="red"/></svg>`;
    const out = withSvgWatermark(noDims, "free");
    expect(out).toBe(noDims);
    expect(out.includes(EXPORT_WATERMARK_TEXT)).toBe(false);
  });

  it("handles fractional width/height attributes", () => {
    const frac = `<svg xmlns="http://www.w3.org/2000/svg" width="200.5" height="150.25"><rect/></svg>`;
    const out = withSvgWatermark(frac, "free");
    expect(out.includes(EXPORT_WATERMARK_TEXT)).toBe(true);
  });

  it("inserts watermark exactly once", () => {
    const out = withSvgWatermark(sampleSvg, "free");
    const occurrences = out.split(EXPORT_WATERMARK_TEXT).length - 1;
    expect(occurrences).toBe(1);
  });

  it("scales font-size with svg dimensions", () => {
    const big = `<svg xmlns="http://www.w3.org/2000/svg" width="2400" height="1800"><rect/></svg>`;
    const out = withSvgWatermark(big, "free");
    // For 2400x1800 the min-dim-based size should clamp at the upper bound (16)
    expect(out).toMatch(/font-size="16"/);
  });

  it("preserves trailing whitespace handling on </svg>", () => {
    const padded = sampleSvg.replace("</svg>", "</svg>\n");
    const out = withSvgWatermark(padded, "free");
    expect(out.includes(EXPORT_WATERMARK_TEXT)).toBe(true);
    expect(out.endsWith("</svg>")).toBe(true);
  });
});
