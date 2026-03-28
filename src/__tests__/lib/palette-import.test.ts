import { describe, it, expect } from "vitest";
import type { ColorRecord } from "@/src/types/color";
import { parsePaletteInput } from "@/src/lib/palette-import";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function makeColor(id: string, hex: string): ColorRecord {
  return {
    id,
    name: id,
    hex,
    rgb: "rgb(0,0,0)",
    hsl: "hsl(0,0%,0%)",
    hue: 0,
    saturation: 50,
    lightness: 50,
    family: "Red",
  };
}

const colors: ColorRecord[] = [
  makeColor("amber-pearl-muted", "#e8d5b0"),
  makeColor("cobalt-shadow-vivid", "#1a3d7a"),
  makeColor("emerald-bloom-clear", "#3daa6e"),
  makeColor("warm-gray-whisper", "#ede9e5"),
];

// ---------------------------------------------------------------------------
// 1. Empty input
// ---------------------------------------------------------------------------
describe("parsePaletteInput — empty input", () => {
  it("returns error for empty string", () => {
    const result = parsePaletteInput("", colors);
    expect(result.ids).toEqual([]);
    expect(result.error).toBeTruthy();
  });

  it("returns error for whitespace-only string", () => {
    const result = parsePaletteInput("   ", colors);
    expect(result.ids).toEqual([]);
    expect(result.error).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// 2. URL with ids param
// ---------------------------------------------------------------------------
describe("parsePaletteInput — URL mode", () => {
  it("extracts valid ids from URL query param", () => {
    const url = "https://colorarchive.me/palette?ids=amber-pearl-muted,cobalt-shadow-vivid";
    const result = parsePaletteInput(url, colors);
    expect(result.ids).toEqual(["amber-pearl-muted", "cobalt-shadow-vivid"]);
    expect(result.error).toBe("");
  });

  it("ignores unknown ids in URL", () => {
    const url = "https://colorarchive.me/palette?ids=amber-pearl-muted,unknown-color-id";
    const result = parsePaletteInput(url, colors);
    expect(result.ids).toEqual(["amber-pearl-muted"]);
  });

  it("returns error when URL has ids param but none match", () => {
    const url = "https://colorarchive.me/palette?ids=fake-one,fake-two";
    const result = parsePaletteInput(url, colors);
    expect(result.ids).toEqual([]);
    expect(result.error).toBeTruthy();
  });

  it("deduplicates ids from URL", () => {
    const url = "https://colorarchive.me/palette?ids=amber-pearl-muted,amber-pearl-muted";
    const result = parsePaletteInput(url, colors);
    expect(result.ids).toEqual(["amber-pearl-muted"]);
  });
});

// ---------------------------------------------------------------------------
// 3. JSON input
// ---------------------------------------------------------------------------
describe("parsePaletteInput — JSON mode", () => {
  it("parses a JSON array of id strings", () => {
    const input = '["amber-pearl-muted", "emerald-bloom-clear"]';
    const result = parsePaletteInput(input, colors);
    expect(result.ids).toEqual(["amber-pearl-muted", "emerald-bloom-clear"]);
    expect(result.error).toBe("");
  });

  it("parses a JSON array of objects with id field", () => {
    const input = '[{"id": "amber-pearl-muted"}, {"id": "cobalt-shadow-vivid"}]';
    const result = parsePaletteInput(input, colors);
    expect(result.ids).toEqual(["amber-pearl-muted", "cobalt-shadow-vivid"]);
  });

  it("parses a JSON array of objects with hex field", () => {
    const input = '[{"hex": "#e8d5b0"}, {"hex": "#1a3d7a"}]';
    const result = parsePaletteInput(input, colors);
    expect(result.ids).toEqual(["amber-pearl-muted", "cobalt-shadow-vivid"]);
  });

  it("parses a JSON object (uses values)", () => {
    const input = '{"primary": "amber-pearl-muted", "secondary": "emerald-bloom-clear"}';
    const result = parsePaletteInput(input, colors);
    expect(result.ids).toEqual(["amber-pearl-muted", "emerald-bloom-clear"]);
  });

  it("deduplicates JSON results", () => {
    const input = '["amber-pearl-muted", "amber-pearl-muted"]';
    const result = parsePaletteInput(input, colors);
    expect(result.ids).toEqual(["amber-pearl-muted"]);
  });
});

// ---------------------------------------------------------------------------
// 4. Plain text — id matching
// ---------------------------------------------------------------------------
describe("parsePaletteInput — plain text ids", () => {
  it("extracts hyphenated color ids from free text", () => {
    const input = "I like amber-pearl-muted and also emerald-bloom-clear!";
    const result = parsePaletteInput(input, colors);
    expect(result.ids).toEqual(["amber-pearl-muted", "emerald-bloom-clear"]);
  });

  it("ignores ids not in the archive", () => {
    const input = "unknown-fake-id amber-pearl-muted";
    const result = parsePaletteInput(input, colors);
    expect(result.ids).toEqual(["amber-pearl-muted"]);
  });
});

// ---------------------------------------------------------------------------
// 5. Plain text — hex matching
// ---------------------------------------------------------------------------
describe("parsePaletteInput — plain text hex values", () => {
  it("matches hex values with # prefix", () => {
    const input = "Colors: #e8d5b0 and #1a3d7a";
    const result = parsePaletteInput(input, colors);
    expect(result.ids).toEqual(["amber-pearl-muted", "cobalt-shadow-vivid"]);
  });

  it("matches hex values without # prefix", () => {
    const input = "Colors: e8d5b0 1a3d7a";
    const result = parsePaletteInput(input, colors);
    expect(result.ids).toEqual(["amber-pearl-muted", "cobalt-shadow-vivid"]);
  });

  it("returns error when no values match", () => {
    const input = "nothing useful here";
    const result = parsePaletteInput(input, colors);
    expect(result.ids).toEqual([]);
    expect(result.error).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// 6. Mixed id + hex in plain text
// ---------------------------------------------------------------------------
describe("parsePaletteInput — mixed ids and hex", () => {
  it("deduplicates when same color is referenced by id and hex", () => {
    const input = "amber-pearl-muted #e8d5b0";
    const result = parsePaletteInput(input, colors);
    expect(result.ids).toEqual(["amber-pearl-muted"]);
  });
});
