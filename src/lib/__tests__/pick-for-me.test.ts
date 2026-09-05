import { describe, expect, it } from "vitest";

import { colors } from "@/src/data/colors";
import {
  matchScenarioToFragments,
  pickColorsFromFragments,
  QUICK_PROMPTS_EN,
  QUICK_PROMPTS_ZH,
  SCENARIO_KEYWORDS,
  tokenize,
} from "@/src/lib/pick-for-me";
import type { ColorRecord } from "@/src/types/color";

/**
 * /pick-for-me/ was shipped with three bugs that nothing could see, because the
 * whole engine was module-private inside a "use client" component and the only
 * export was the React component. Measured on the shipped code:
 *
 *   · 11 of the 12 Chinese chips returned ZERO colours (Chinese has no spaces,
 *     so the exact-key lookup could never hit a 2-character key).
 *   · 8 of the 12 English chips returned six colours in ONE lightness band —
 *     "Coffee shop brand" was six near-blacks.
 *   · "ivory" matched 0 of the 5,446 names and "sage" matched only neutral grays.
 *
 * So these are tests, not observations: each one fails on the old engine.
 */

/** The 14 real lightness band centres, Veil (98) down to Ink (14). */
const BAND_CENTRES = [98, 94, 90, 84, 76, 68, 60, 54, 48, 42, 34, 28, 20, 14];

/** Nearest centre wins. Every generated lightness sits exactly on one of these. */
function bandOf(color: ColorRecord): number {
  let best = BAND_CENTRES[0];
  for (const centre of BAND_CENTRES) {
    if (Math.abs(color.lightness - centre) < Math.abs(color.lightness - best)) {
      best = centre;
    }
  }
  return best;
}

function paletteFor(prompt: string): ColorRecord[] {
  return pickColorsFromFragments(matchScenarioToFragments(prompt), colors);
}

const distinct = <T>(values: T[]) => new Set(values).size;

describe("pick-for-me: the prompt lists are real", () => {
  // Vacuity guard. Everything below iterates these lists; an empty list would
  // make the whole suite pass by testing nothing.
  it("ships both built-in prompt lists", () => {
    expect(QUICK_PROMPTS_EN.length).toBe(12);
    expect(QUICK_PROMPTS_ZH.length).toBe(12);
    expect(Object.keys(SCENARIO_KEYWORDS).length).toBeGreaterThan(50);
    expect(colors.length).toBe(5446);
  });

  it("returns a known-good shape for a known query", () => {
    const palette = paletteFor("Tech startup dashboard");
    expect(palette).toHaveLength(6);
    for (const color of palette) {
      expect(color.hex).toMatch(/^#[0-9a-f]{6}$/i);
      expect(color.id).toBe(color.name.toLowerCase().replace(/ /g, "-"));
      expect(BAND_CENTRES).toContain(color.lightness);
    }
    // Six colours, six different swatches — no duplicates in the output.
    expect(distinct(palette.map((c) => c.id))).toBe(6);
  });
});

describe("pick-for-me: Chinese prompts return palettes", () => {
  // The bug: tokenize() keeps CJK but splits on whitespace, so "咖啡店品牌" is
  // ONE token and SCENARIO_KEYWORDS["咖啡店品牌"] is undefined. Every chip
  // contains a key; none equals one.
  it.each(QUICK_PROMPTS_ZH)("%s yields at least 4 colours", (prompt) => {
    expect(tokenize(prompt).length).toBeGreaterThan(0);
    expect(paletteFor(prompt).length).toBeGreaterThanOrEqual(4);
  });
});

describe("pick-for-me: English prompts return palettes", () => {
  it.each(QUICK_PROMPTS_EN)("%s yields at least 4 colours", (prompt) => {
    expect(paletteFor(prompt).length).toBeGreaterThanOrEqual(4);
  });
});

describe("pick-for-me: palettes do not collapse", () => {
  // These three are the measured worst cases: all-black, all-pink, all-Azure.
  it.each(["Coffee shop brand", "Wedding invitation", "Yoga studio website"])(
    "%s spans lightness and hue",
    (prompt) => {
      const palette = paletteFor(prompt);
      expect(distinct(palette.map(bandOf))).toBeGreaterThanOrEqual(3);
      expect(distinct(palette.map((c) => c.family))).toBeGreaterThanOrEqual(4);
    },
  );

  it("never returns a single-lightness-band palette for a built-in prompt", () => {
    for (const prompt of [...QUICK_PROMPTS_EN, ...QUICK_PROMPTS_ZH]) {
      const palette = paletteFor(prompt);
      expect(palette.length).toBeGreaterThan(1);
      expect(distinct(palette.map(bandOf))).toBeGreaterThan(1);
    }
  });
});

describe("pick-for-me: every keyword fragment is a real word", () => {
  // Catches "ivory" (0 matches) and any future fragment invented from memory
  // rather than from the 48-root / 14-band / 8-chroma naming scheme.
  const names = colors.map((c) => c.name.toLowerCase());

  it("matches at least one colour name", () => {
    const dead: string[] = [];
    for (const [key, fragments] of Object.entries(SCENARIO_KEYWORDS)) {
      expect(fragments.length).toBeGreaterThan(0);
      for (const fragment of fragments) {
        if (!names.some((n) => n.includes(fragment))) dead.push(`${key}: ${fragment}`);
      }
    }
    expect(dead).toEqual([]);
  });

  it("does not send a chromatic request to the neutral grays", () => {
    // "sage" matched 14 names and all 14 were "Sage Gray *" — there is no Sage
    // hue root, so ~11 entries asking for a soft green got desaturated grays.
    for (const [key, fragments] of Object.entries(SCENARIO_KEYWORDS)) {
      for (const fragment of fragments) {
        const matched = colors.filter((c) => c.name.toLowerCase().includes(fragment));
        const chromatic = matched.filter((c) => !c.name.includes(" Gray "));
        expect(
          chromatic.length,
          `${key}: "${fragment}" only matches neutral grays`,
        ).toBeGreaterThan(0);
      }
    }
  });
});

describe("pick-for-me: the honest no-match path", () => {
  it("returns an empty array for a nonsense query", () => {
    expect(matchScenarioToFragments("qqzzx wubbleflarn")).toEqual([]);
    expect(paletteFor("qqzzx wubbleflarn")).toEqual([]);
    expect(paletteFor("")).toEqual([]);
    // Nonsense CJK too — the containment scan must not match on nothing.
    expect(paletteFor("蝴蝶飞飞")).toEqual([]);
  });
});

/**
 * ── THE TESTS ABOVE WERE NOT ENOUGH, AND THIS IS WHY ─────────────────────────
 *
 * An adversarial review replaced pickColorsFromFragments with a stub that
 * IGNORED ITS FRAGMENTS and returned the same six hardcoded colours every time,
 * keeping only the empty-in/empty-out early return. All 33 tests above passed.
 *
 * They had to: every assertion about the output was structural — "at least 4
 * colours", "at least 3 lightness bands", "at least 4 families", "looks like a
 * hex". A constant satisfies all of those. Nothing said the palette had
 * anything to do with what was asked for, which is the entire point of the
 * tool and the entire content of bug C.
 *
 * That is this project's recurring failure written in test form: a criterion
 * that cannot fail is not a criterion. The block below is the part that fails
 * against a constant function.
 */
describe("pick-for-me: the palette actually answers the prompt", () => {
  it("returns different palettes for different prompts", () => {
    // The cheapest possible refutation of a constant function.
    const ids = (p: string) => paletteFor(p).map((c) => c.id).join(",");
    const coffee = ids("Coffee shop brand");
    const wedding = ids("Wedding invitation");
    const gaming = ids("Gaming studio");
    expect(coffee).not.toBe(wedding);
    expect(wedding).not.toBe(gaming);
    expect(coffee).not.toBe(gaming);
  });

  it("gives each prompt in a language its own palette", () => {
    // Stronger than the pairwise check: 12 prompts, 12 different answers. A
    // constant function collapses this to 1.
    //
    // Deliberately WITHIN a language, not across. The first version of this
    // test asserted 24 distinct palettes across both lists and failed at 21 —
    // because "Tech startup dashboard"/科技创业公司,
    // "Wedding invitation"/婚礼请柬 and "Healthcare app"/医疗健康 App each
    // resolve to the same fragments and therefore the same palette. That is the
    // CJK fix WORKING (the Chinese chip now means what its English twin means),
    // so the assertion was wrong, not the engine.
    for (const list of [QUICK_PROMPTS_EN, QUICK_PROMPTS_ZH]) {
      const signatures = list.map((p) => paletteFor(p).map((c) => c.id).join(","));
      expect(distinct(signatures)).toBe(list.length);
    }
  });

  it("translates: a Chinese chip lands on its English twin's palette", () => {
    // The other side of the same coin, asserted rather than left implicit.
    const pairs: [string, string][] = [
      ["Wedding invitation", "婚礼请柬"],
      ["Tech startup dashboard", "科技创业公司"],
    ];
    for (const [en, zh] of pairs) {
      expect(paletteFor(zh).map((c) => c.id)).toEqual(paletteFor(en).map((c) => c.id));
    }
  });

  it("puts a requested hue in the palette it returns", () => {
    // The scenario keywords name real colour roots. If "Coffee shop brand"
    // resolves to ember/amber/honey/saffron, at least one of those roots has to
    // survive into the result, or the fragments did no work.
    for (const prompt of QUICK_PROMPTS_EN) {
      const fragments = matchScenarioToFragments(prompt);
      const palette = paletteFor(prompt);
      if (fragments.length === 0 || palette.length === 0) continue;
      const hit = palette.some((c) =>
        fragments.some((f) => c.name.toLowerCase().includes(f)),
      );
      expect(hit, `"${prompt}" returned a palette matching none of: ${fragments.join(", ")}`).toBe(
        true,
      );
    }
  });

  it("honours an explicitly requested lightness band", () => {
    // "ink" is a real band word (lightness 14). Ask for it directly and the
    // palette must contain a dark colour — this is what stops the mid-lightness
    // tie-breaker from overriding a stated preference.
    const dark = pickColorsFromFragments(["crimson", "ink"], colors);
    expect(dark.length).toBeGreaterThan(0);
    expect(dark.some((c) => c.lightness <= 28)).toBe(true);

    // And the mirror image, so the assertion above cannot pass by always
    // returning dark colours.
    const light = pickColorsFromFragments(["crimson", "veil"], colors);
    expect(light.length).toBeGreaterThan(0);
    expect(light.some((c) => c.lightness >= 90)).toBe(true);
  });

  it("a hue fragment outranks a band fragment", () => {
    // Bug C's mechanism: band words match 389-672 names each while a hue root
    // matches 112, so band words used to dominate the score and drag every
    // result into one band. Asking for one hue plus one band must return that
    // hue, not six unrelated colours that happen to share the band word.
    const palette = pickColorsFromFragments(["cobalt", "vivid"], colors);
    expect(palette.length).toBeGreaterThan(0);
    expect(palette.some((c) => c.name.toLowerCase().includes("cobalt"))).toBe(true);
  });

  it("Chinese and English forms of the same scenario agree on hue", () => {
    // The CJK fix is only worth anything if it resolves to the SAME meaning.
    // 咖啡 (coffee) and "Coffee shop brand" should share at least one family.
    const zh = paletteFor("咖啡店品牌");
    const en = paletteFor("Coffee shop brand");
    expect(zh.length).toBeGreaterThan(0);
    expect(en.length).toBeGreaterThan(0);
    const zhFamilies = new Set(zh.map((c) => c.family));
    expect(en.some((c) => zhFamilies.has(c.family))).toBe(true);
  });
});
