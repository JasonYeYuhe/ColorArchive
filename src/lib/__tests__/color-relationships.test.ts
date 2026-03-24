import { describe, it, expect } from "vitest";
import { findClosestArchiveColor } from "@/src/lib/color-relationships";
import { colors } from "@/src/data/colors";

describe("findClosestArchiveColor", () => {
  it("finds exact match for archive color", () => {
    const target = colors[0];
    const match = findClosestArchiveColor(colors, target.hex);
    expect(match).not.toBeNull();
    expect(match!.hex).toBe(target.hex);
  });

  it("finds close match for arbitrary hex", () => {
    const match = findClosestArchiveColor(colors, "#FF0000");
    expect(match).not.toBeNull();
    expect(match!.family).toBe("Red");
  });

  it("returns null for invalid hex", () => {
    const match = findClosestArchiveColor(colors, "not-a-hex");
    expect(match).toBeNull();
  });

  it("finds a blue for a blue input", () => {
    const match = findClosestArchiveColor(colors, "#2563EB");
    expect(match).not.toBeNull();
    expect(["Blue", "Purple"]).toContain(match!.family);
  });

  it("finds a green for a green input", () => {
    const match = findClosestArchiveColor(colors, "#22C55E");
    expect(match).not.toBeNull();
    expect(["Green", "Lime", "Teal"]).toContain(match!.family);
  });
});
