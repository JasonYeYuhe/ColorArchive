import { describe, expect, it } from "vitest";

import { colors } from "@/src/data/colors";
import { HUE_ROOT_COLORS, rootColorFor } from "@/src/lib/hue-root-colors";
import { generateColorFromWord } from "@/src/lib/word-color";

/**
 * The 48 literals in hue-root-colors.ts must equal what the archive generates.
 *
 * The module holds literals rather than importing src/data/colors.ts, to keep
 * 5,446 records out of the client bundle that renders the word tool. That is a
 * copy, and a copy drifts. This file is what stops it: every value is
 * re-derived from the dataset here, where bundle size does not matter.
 */
describe("the hue-root map agrees with the archive it quotes", () => {
  const canonical = new Map<string, { hue: number; saturation: number; lightness: number }>();
  for (const c of colors) {
    const parts = c.id.split("-");
    if (parts[1] === "gray") continue;
    if (c.id !== `${parts[0]}-core-pure`) continue;
    if (!canonical.has(parts[0])) {
      canonical.set(parts[0], { hue: c.hue, saturation: c.saturation, lightness: c.lightness });
    }
  }

  it("covers every chromatic hue root, and only those", () => {
    expect(canonical.size).toBe(48);
    expect(Object.keys(HUE_ROOT_COLORS).sort()).toEqual([...canonical.keys()].sort());
  });

  it("every literal matches the archive's {root}-core-pure record", () => {
    for (const [root, truth] of canonical) {
      expect(HUE_ROOT_COLORS[root], `hue-root-colors.ts drifted for "${root}"`).toEqual(truth);
    }
  });

  it("a root now returns the archive's own hue, not the hash's", () => {
    // The specific absurdities this shipped to fix. Before 2026-09-08 these
    // pages said, in their own FAQ text, that scarlet is cyan and aqua is red.
    for (const [root, expectedFamily] of [
      ["scarlet", "Red"],
      ["aqua", "Teal"],
      ["coral", "Orange"],
      ["ember", "Orange"],
      ["rose", "Pink"],
      ["seafoam", "Green"],
    ] as const) {
      const g = generateColorFromWord(root)!;
      expect(g.hue, `${root} hue`).toBe(canonical.get(root)!.hue);
      expect(g.family, `${root} family`).toBe(expectedFamily);
    }
  });

  it("leaves every non-root word on the hash, untouched", () => {
    expect(rootColorFor("nostalgia")).toBeNull();
    expect(rootColorFor("quiet luxury")).toBeNull();
    // The two values word-color.test.ts has pinned since the hash was last
    // touched. If the override ever leaks past the 48 roots, these move.
    expect(generateColorFromWord("cat")!.hex).toBe("#932A49");
    expect(generateColorFromWord("爱")!.hex).toBe("#B3C379");
  });

  it("variants stay coherent with the overridden base", () => {
    // The override sets only hue/saturation/lightness; everything else derives.
    // A root whose Base variant disagreed with its own hex would mean the
    // override landed after the variants were computed.
    const g = generateColorFromWord("coral")!;
    expect(g.variants.find((v) => v.label === "Base")!.hex).toBe(g.hex);
    expect(g.variants).toHaveLength(5);
  });
});
