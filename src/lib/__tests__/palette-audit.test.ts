import { describe, it, expect } from "vitest";
import {
  extractColorsFromText,
  contrastRatioHex,
  findDuplicates,
  matchToArchive,
  audit,
} from "@/src/lib/palette-audit";

describe("extractColorsFromText", () => {
  it("extracts 6-digit hex", () => {
    const out = extractColorsFromText("color: #2563EB");
    expect(out).toHaveLength(1);
    expect(out[0].hex).toBe("#2563EB");
    expect(out[0].count).toBe(1);
  });

  it("expands shorthand hex to 6-digit", () => {
    const out = extractColorsFromText("--red: #abc;");
    expect(out[0].hex).toBe("#AABBCC");
  });

  it("drops alpha from 8-digit hex", () => {
    const out = extractColorsFromText("#1122334f");
    expect(out[0].hex).toBe("#112233");
  });

  it("extracts rgb() and rgba() with comma or space separators", () => {
    const out = extractColorsFromText(
      "a: rgb(37, 99, 235); b: rgb(37 99 235); c: rgba(37,99,235,0.5);",
    );
    // All three normalize to the same #2563EB.
    expect(out).toHaveLength(1);
    expect(out[0].hex).toBe("#2563EB");
    expect(out[0].count).toBe(3);
  });

  it("extracts hsl() with percent syntax", () => {
    const out = extractColorsFromText("--primary: hsl(220, 82%, 53%);");
    expect(out).toHaveLength(1);
    expect(out[0].hex.startsWith("#")).toBe(true);
  });

  it("deduplicates across notation", () => {
    // Same color written three ways should collapse into one bucket count=3.
    const out = extractColorsFromText(
      "#2563EB and rgb(37,99,235) and #2563eb",
    );
    expect(out).toHaveLength(1);
    expect(out[0].count).toBe(3);
  });

  it("sorts results by count descending", () => {
    const out = extractColorsFromText("#fff #fff #fff #000");
    expect(out[0].hex).toBe("#FFFFFF");
    expect(out[0].count).toBe(3);
    expect(out[1].hex).toBe("#000000");
  });

  it("ignores word-boundary false positives (not #XYZ)", () => {
    const out = extractColorsFromText("id-abc123 looks like # but isn't: # ABC");
    expect(out).toHaveLength(0);
  });

  it("handles a real Tailwind token snippet", () => {
    const input = `
      :root {
        --primary: #2563eb;
        --success: #10b981;
        --warning: #f59e0b;
        --danger: #ef4444;
      }
    `;
    const out = extractColorsFromText(input);
    expect(out).toHaveLength(4);
  });
});

describe("contrastRatioHex", () => {
  it("returns 21 for black on white", () => {
    expect(contrastRatioHex("#000000", "#FFFFFF")).toBe(21);
  });

  it("returns 1 for identical colors", () => {
    expect(contrastRatioHex("#2563EB", "#2563EB")).toBe(1);
  });

  it("is symmetric", () => {
    const a = contrastRatioHex("#2563EB", "#FFFFFF");
    const b = contrastRatioHex("#FFFFFF", "#2563EB");
    expect(a).toBe(b);
  });

  it("handles invalid input without throwing", () => {
    expect(contrastRatioHex("not a hex", "#fff")).toBe(1);
  });
});

describe("findDuplicates", () => {
  it("groups near-identical hexes into one cluster", () => {
    const extracted = extractColorsFromText("#2563EB #2564EB #2565EB #10B981");
    const clusters = findDuplicates(extracted);
    expect(clusters).toHaveLength(1);
    expect(clusters[0].members).toHaveLength(3);
  });

  it("leaves distinct colors alone", () => {
    const extracted = extractColorsFromText("#2563EB #10B981 #EF4444");
    expect(findDuplicates(extracted)).toHaveLength(0);
  });

  it("respects threshold — looser threshold captures more", () => {
    const extracted = extractColorsFromText("#2563EB #3B82F6");
    expect(findDuplicates(extracted, 10)).toHaveLength(0);
    expect(findDuplicates(extracted, 80)).toHaveLength(1);
  });
});

describe("matchToArchive", () => {
  it("returns a ColorArchive match for each input", () => {
    const extracted = extractColorsFromText("#2563EB #10B981");
    const matches = matchToArchive(extracted);
    expect(matches).toHaveLength(2);
    for (const m of matches) {
      expect(m.archive).not.toBeNull();
      expect(m.archive!.id).toMatch(/^[a-z]+(-[a-z]+){2}$/);
      expect(m.archive!.hex).toMatch(/^#[0-9A-F]{6}$/);
    }
  });

  it("computes non-zero rgbDistance for non-archive colors", () => {
    // #2563EB is a Tailwind blue-600 — unlikely to be an exact archive hit.
    const matches = matchToArchive(extractColorsFromText("#2563EB"));
    expect(matches[0].rgbDistance).toBeGreaterThan(0);
    expect(Number.isFinite(matches[0].rgbDistance)).toBe(true);
  });
});

describe("audit", () => {
  it("produces a complete result with summary counts", () => {
    const result = audit(`
      --primary: #2563EB;
      --primary-alt: #2564EB;
      --bg: #FFFFFF;
      --text: #EEEEEE;
    `);

    expect(result.summary.uniqueColors).toBe(4);
    expect(result.summary.duplicateGroups).toBeGreaterThanOrEqual(1);
    // #FFFFFF vs #EEEEEE is a low-contrast pair (~1.3:1).
    expect(result.summary.lowContrastCount).toBeGreaterThanOrEqual(1);
  });

  it("emits a duplicate suggestion with a ColorArchive replacement", () => {
    const result = audit("#2563EB #2564EB");
    const dup = result.suggestions.find((s) => s.kind === "duplicate");
    expect(dup).toBeDefined();
    expect(dup!.suggestion?.archiveId).toMatch(/^[a-z]+(-[a-z]+){2}$/);
  });

  it("emits a low-contrast suggestion below AA", () => {
    const result = audit("#FFFFFF #F0F0F0");
    const low = result.suggestions.find((s) => s.kind === "low-contrast");
    expect(low).toBeDefined();
    expect(low!.colors).toHaveLength(2);
  });

  it("returns an empty result gracefully on empty input", () => {
    const result = audit("");
    expect(result.summary.uniqueColors).toBe(0);
    expect(result.suggestions).toEqual([]);
  });
});
