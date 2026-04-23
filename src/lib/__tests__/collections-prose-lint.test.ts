import { describe, it, expect } from "vitest";
import { collections } from "@/src/lib/collections";
import { colors } from "@/src/data/colors";

/**
 * Prose lint for collections
 *
 * Collection descriptions frequently name specific color IDs ("amber-bloom-soft",
 * "cobalt-tone-muted") inline so readers can jump to those colors. Historically a
 * number of these inline references drifted from the real palette IDs — readers
 * would search for `amber-glow-soft` and find nothing. This test catches any
 * color-shaped token in description/editorialNote that does not resolve to a
 * real color ID.
 *
 * The pattern below is intentionally narrow: it only matches dash-separated
 * tokens that look like color IDs (two or three segments, all lowercase). False
 * positives are avoided by checking the token against the actual id set.
 */
// Every real color ID is exactly 3 dash-separated lowercase segments.
// 2-segment tokens ("rose-bloom", "apricot-pearl") are prose shorthand and
// explicitly allowed.
const COLOR_ID_PATTERN = /\b([a-z]+-[a-z]+-[a-z]+)\b/g;

const knownRoots = new Set([
  "crimson", "scarlet", "ruby", "vermillion", "ember", "tangerine",
  "coral", "apricot", "saffron", "amber", "canary", "citrine",
  "honey", "chartreuse", "olive", "lime", "moss", "leaf", "clover",
  "emerald", "mint", "seafoam", "celadon", "jade", "teal", "lagoon",
  "cyan", "aqua", "cerulean", "azure", "steel", "sapphire", "cobalt",
  "indigo", "iris", "amethyst", "violet", "orchid", "plum", "mulberry",
  "magenta", "fuchsia", "mauve", "peony", "rose", "blush", "garnet", "merlot",
  "warm", "taupe", "true", "sage", "cool",
]);

/**
 * Only these are valid second-segments of color IDs. Any `root-xxx` token where
 * xxx is not one of these is prose (e.g. "amber-brown", "coral-pink") and must
 * not trigger the lint.
 */
const knownLightnessBands = new Set([
  "veil", "whisper", "mist", "pearl", "bloom", "silk", "tone", "radiant",
  "core", "velvet", "dusk", "shadow", "nocturne", "ink",
  // neutral compound roots expose "gray" here
  "gray",
]);

describe("collections prose lint", () => {
  const validIds = new Set(colors.map((c) => c.id));

  it("every palette entry in every collection resolves to a real color", () => {
    const missing: Array<{ collectionId: string; paletteId: string }> = [];
    for (const c of collections) {
      for (const entry of c.palette) {
        if (!validIds.has(entry.id)) {
          missing.push({ collectionId: c.id, paletteId: entry.id });
        }
      }
    }
    expect(missing, JSON.stringify(missing, null, 2)).toEqual([]);
  });

  it("every color-id-shaped reference in descriptions resolves to a real color", () => {
    const problems: Array<{
      collectionId: string;
      field: "summary" | "description" | "editorialNote";
      referenced: string;
    }> = [];

    for (const c of collections) {
      const texts: Array<["summary" | "description" | "editorialNote", string | undefined]> = [
        ["summary", c.summary],
        ["description", c.description],
        ["editorialNote", c.editorialNote],
      ];
      for (const [field, text] of texts) {
        if (!text) continue;
        const matches = text.match(COLOR_ID_PATTERN) ?? [];
        for (const m of matches) {
          const parts = m.split("-");
          // Only flag tokens whose SECOND segment is a known lightness band
          // (or "gray" for neutral compound roots like "warm-gray-tone").
          // Prose like "amber-brown" or "coral-pink" slips through because
          // "brown"/"pink" are not lightness bands.
          const firstRoot = parts[0];
          const secondSegment = parts[1];
          const isNeutralCompound =
            parts.length >= 3 &&
            secondSegment === "gray" &&
            knownRoots.has(firstRoot) &&
            knownLightnessBands.has(parts[2]);
          const isChromatic =
            parts.length >= 2 &&
            knownRoots.has(firstRoot) &&
            knownLightnessBands.has(secondSegment) &&
            secondSegment !== "gray";
          if (!isNeutralCompound && !isChromatic) continue;
          if (!validIds.has(m)) {
            problems.push({ collectionId: c.id, field, referenced: m });
          }
        }
      }
    }

    // Print all problems on failure so they can be fixed in one pass.
    expect(problems, JSON.stringify(problems, null, 2)).toEqual([]);
  });
});
