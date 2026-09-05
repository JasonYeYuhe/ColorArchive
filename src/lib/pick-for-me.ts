import type { ColorRecord } from "@/src/types/color";
import type { ColorCollection } from "@/src/lib/collections";

/**
 * The /pick-for-me/ matching engine.
 *
 * This used to live module-private inside `pick-for-me-page.tsx` ("use client"),
 * which meant none of it could be tested — the only export was the component.
 * Three real bugs survived in there for months precisely because nothing could
 * see them. It is a pure module now: no React, no "use client", no DOM. The page
 * keeps its own UI and state and imports these.
 */

/* ------------------------------------------------------------------ */
/*  Scenario → Palette matching engine                                */
/* ------------------------------------------------------------------ */

interface ScenarioKeywords {
  [key: string]: string[];
}

/**
 * Every fragment here is matched with `name.includes(fragment)` against the
 * 5,446 generated names ("Cobalt Shadow Vivid", "Warm Gray Pearl"), so a
 * fragment is only useful if it is a real hue root or a real band word.
 *
 * Two fragments were not, and both shipped:
 *   "ivory"  matched 0 of 5,446 names — there is no Ivory root.
 *   "sage"   matched 14, and all 14 were NEUTRAL GRAYS ("Sage Gray *"), because
 *            there is no Sage hue root either. It appeared in 13 entries as a
 *            stand-in for "soft green", which is why "Organic skincare" used to
 *            return four desaturated grays.
 * "sage" is gone rather than kept for the grays: no entry below actually wants a
 * gray palette, and `pick-for-me.test.ts` now fails on any fragment that matches
 * no colour at all.
 */
export const SCENARIO_KEYWORDS: ScenarioKeywords = {
  // Industries
  tech: ["cobalt", "azure", "violet", "ink", "vivid", "steel"],
  startup: ["cobalt", "violet", "azure", "vivid", "mint"],
  saas: ["cobalt", "azure", "violet", "ink", "vivid"],
  app: ["cobalt", "azure", "violet", "mint", "vivid"],
  software: ["cobalt", "azure", "sapphire", "steel", "ink"],
  fintech: ["cobalt", "sapphire", "ink", "amber", "steel"],
  healthcare: ["teal", "azure", "mint", "emerald", "celadon"],
  medical: ["teal", "azure", "cerulean", "mint", "celadon"],
  wellness: ["seafoam", "mint", "jade", "celadon", "soft"],
  yoga: ["moss", "jade", "celadon", "blush", "soft"],
  food: ["coral", "amber", "ember", "honey", "saffron"],
  restaurant: ["coral", "amber", "ember", "merlot", "saffron"],
  cafe: ["amber", "honey", "saffron", "ember", "muted"],
  coffee: ["ember", "amber", "honey", "saffron", "muted"],
  bakery: ["blush", "peony", "amber", "honey", "soft"],
  fashion: ["ink", "pearl", "garnet", "merlot", "blush"],
  luxury: ["merlot", "pearl", "garnet", "ink", "soft"],
  beauty: ["blush", "peony", "rose", "mauve", "pearl"],
  cosmetics: ["blush", "peony", "rose", "fuchsia", "pearl"],
  education: ["cobalt", "azure", "mint", "amber", "vivid"],
  finance: ["sapphire", "cobalt", "ink", "amber", "steel"],
  bank: ["sapphire", "cobalt", "ink", "steel", "muted"],
  real: ["amber", "honey", "olive", "ink", "pearl"],
  estate: ["amber", "honey", "olive", "ink", "pearl"],
  architecture: ["ink", "pearl", "olive", "amber", "muted"],
  interior: ["amber", "olive", "pearl", "blush", "celadon"],
  gaming: ["violet", "cobalt", "vivid", "fuchsia", "ink"],
  music: ["violet", "orchid", "cobalt", "vivid", "ink"],
  fitness: ["lime", "vivid", "cobalt", "coral", "bright"],
  sport: ["crimson", "cobalt", "vivid", "lime", "bright"],

  // Scenarios
  website: ["cobalt", "azure", "pearl", "ink", "vivid"],
  landing: ["cobalt", "vivid", "pearl", "coral", "ink"],
  brand: ["ink", "pearl", "vivid", "cobalt", "amber"],
  logo: ["ink", "vivid", "cobalt", "crimson", "amber"],
  dashboard: ["cobalt", "azure", "ink", "steel", "mint"],
  portfolio: ["ink", "pearl", "muted", "cobalt", "soft"],
  blog: ["pearl", "ink", "azure", "blush", "muted"],
  wedding: ["blush", "pearl", "peony", "rose"],
  invitation: ["blush", "pearl", "peony", "ink", "amber"],
  birthday: ["coral", "vivid", "amber", "mint", "fuchsia"],
  baby: ["blush", "mint", "pearl", "azure", "whisper"],
  nursery: ["blush", "mint", "pearl", "peony", "whisper"],
  poster: ["vivid", "ink", "crimson", "cobalt", "amber"],
  packaging: ["pearl", "ink", "vivid", "amber", "soft"],
  presentation: ["cobalt", "pearl", "ink", "amber", "vivid"],

  // Moods
  calm: ["cerulean", "aqua", "mist", "celadon", "soft"],
  peaceful: ["seafoam", "celadon", "mist", "pearl", "soft"],
  energetic: ["vivid", "coral", "amber", "citrine", "lime"],
  bold: ["vivid", "crimson", "cobalt", "ink", "bright"],
  playful: ["coral", "mint", "vivid", "citrine", "fuchsia"],
  elegant: ["pearl", "ink", "merlot", "garnet", "muted"],
  modern: ["cobalt", "ink", "steel", "vivid", "pearl"],
  vintage: ["muted", "amber", "soft", "ember", "garnet"],
  retro: ["muted", "amber", "ember", "garnet", "soft"],
  minimal: ["pearl", "mist", "whisper", "ink", "muted"],
  warm: ["amber", "coral", "ember", "honey", "saffron"],
  cool: ["azure", "sapphire", "cobalt", "steel", "teal"],
  dark: ["ink", "shadow", "nocturne", "velvet", "cobalt"],
  professional: ["cobalt", "ink", "steel", "pearl", "muted"],
  creative: ["violet", "orchid", "coral", "vivid", "mint"],
  friendly: ["coral", "mint", "amber", "azure", "bloom"],
  premium: ["ink", "pearl", "merlot", "garnet", "muted"],
  organic: ["moss", "olive", "leaf", "amber", "celadon"],
  natural: ["moss", "amber", "leaf", "olive", "celadon"],
  cozy: ["amber", "honey", "ember", "blush", "soft"],
  dreamy: ["blush", "peony", "mauve", "violet", "whisper"],
  futuristic: ["violet", "cobalt", "cyan", "vivid", "ink"],
  rustic: ["ember", "amber", "olive", "muted", "garnet"],
  clean: ["pearl", "whisper", "azure", "mist", "cobalt"],

  // Chinese keywords.
  // These are reached by substring scan (see matchScenarioToFragments), not by
  // exact token equality — Chinese has no spaces, so "咖啡店品牌" arrives as one
  // token and has to be read from the inside.
  科技: ["cobalt", "azure", "violet", "ink", "vivid"],
  创业: ["cobalt", "violet", "azure", "vivid", "mint"],
  餐厅: ["coral", "amber", "ember", "merlot", "saffron"],
  咖啡: ["ember", "amber", "honey", "saffron", "muted"],
  婚礼: ["blush", "pearl", "peony", "rose"],
  请柬: ["blush", "pearl", "peony", "ink", "amber"],
  品牌: ["ink", "pearl", "vivid", "cobalt", "amber"],
  网站: ["cobalt", "azure", "pearl", "ink", "vivid"],
  博客: ["pearl", "ink", "azure", "blush", "muted"],
  简约: ["pearl", "mist", "whisper", "ink", "muted"],
  温暖: ["amber", "coral", "ember", "honey", "saffron"],
  温馨: ["amber", "honey", "ember", "blush", "soft"],
  优雅: ["pearl", "ink", "merlot", "garnet", "muted"],
  活泼: ["coral", "mint", "vivid", "citrine", "fuchsia"],
  平静: ["cerulean", "aqua", "seafoam", "celadon", "soft"],
  高端: ["ink", "pearl", "merlot", "garnet", "muted"],
  自然: ["moss", "amber", "leaf", "olive", "celadon"],
  天然: ["moss", "leaf", "olive", "celadon", "amber"],
  时尚: ["ink", "pearl", "garnet", "blush", "vivid"],
  电商: ["coral", "cobalt", "ink", "amber", "vivid"],
  医疗: ["teal", "azure", "mint", "emerald", "celadon"],
  健康: ["teal", "mint", "emerald", "azure", "celadon"],
  护肤: ["blush", "peony", "celadon", "pearl", "mauve"],
  金融: ["sapphire", "cobalt", "ink", "amber", "steel"],
  仪表盘: ["cobalt", "azure", "ink", "steel", "mint"],
  教育: ["cobalt", "azure", "mint", "amber", "vivid"],
  美妆: ["blush", "peony", "rose", "mauve", "pearl"],
  游戏: ["violet", "cobalt", "vivid", "fuchsia", "ink"],
  工作室: ["ink", "cobalt", "vivid", "pearl", "amber"],
  瑜伽: ["moss", "jade", "celadon", "blush", "soft"],
  健身: ["lime", "vivid", "cobalt", "coral", "bright"],
  儿童: ["coral", "mint", "citrine", "azure", "fuchsia"],
  生日: ["coral", "vivid", "amber", "mint", "fuchsia"],
  派对: ["fuchsia", "coral", "vivid", "citrine", "mint"],
  房地产: ["amber", "honey", "olive", "ink", "pearl"],
};

export const QUICK_PROMPTS_EN = [
  "Coffee shop brand",
  "Tech startup dashboard",
  "Yoga studio website",
  "Wedding invitation",
  "Fashion e-commerce",
  "Healthcare app",
  "Kids birthday party",
  "Luxury real estate",
  "Organic skincare",
  "Gaming studio",
  "Cozy blog",
  "Finance dashboard",
];

export const QUICK_PROMPTS_ZH = [
  "咖啡店品牌",
  "科技创业公司",
  "瑜伽工作室网站",
  "婚礼请柬",
  "时尚电商",
  "医疗健康 App",
  "儿童生日派对",
  "高端房地产",
  "天然护肤品牌",
  "游戏工作室",
  "温馨博客",
  "金融仪表盘",
];

/**
 * The CJK range this engine understands. It is deliberately the same range
 * `tokenize` keeps, so a character can never survive tokenization and then be
 * invisible to the matcher.
 * No `g` flag: `.test` on a global regex carries `lastIndex` between calls.
 */
const CJK_RE = /[一-鿿]/;

/** Longest first, so "房地产" wins over a hypothetical "房" if both ever exist. */
const CJK_KEYS: string[] = Object.keys(SCENARIO_KEYWORDS)
  .filter((k) => CJK_RE.test(k))
  .sort((a, b) => b.length - a.length);

export function tokenize(input: string): string[] {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9一-鿿\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1);
}

/**
 * Resolve ONE token to the keyword fragments it stands for.
 *
 * The Latin path is an exact key lookup, unchanged: "app" and "wedding" behave
 * exactly as they always did.
 *
 * The CJK path is the fix for the bug that made every Chinese prompt return an
 * empty palette. Chinese has no spaces, so `tokenize` hands back ONE token for
 * the whole phrase ("咖啡店品牌"), and an exact lookup against 2-character keys
 * could only ever hit if the user typed one bare word. 11 of the 12 built-in
 * Chinese chips returned 0 colours; the 12th only worked because it happens to
 * contain the ASCII word "app". Every chip CONTAINS a key but EQUALS none — so
 * a CJK token is scanned for keys as substrings instead.
 *
 * Order is preserved and de-duplicated because the caller weights earlier
 * fragments higher.
 */
function resolveTokenFragments(token: string): string[] {
  const exact = SCENARIO_KEYWORDS[token];
  if (exact) return exact;
  if (!CJK_RE.test(token)) return [];

  const out: string[] = [];
  const seen = new Set<string>();
  for (const key of CJK_KEYS) {
    if (!token.includes(key)) continue;
    for (const frag of SCENARIO_KEYWORDS[key]) {
      if (seen.has(frag)) continue;
      seen.add(frag);
      out.push(frag);
    }
  }
  return out;
}

export function matchScenarioToFragments(input: string): string[] {
  const tokens = tokenize(input);
  const fragmentScores = new Map<string, number>();

  for (const token of tokens) {
    const frags = resolveTokenFragments(token);
    for (let i = 0; i < frags.length; i++) {
      const weight = frags.length - i; // first fragment gets highest score
      fragmentScores.set(frags[i], (fragmentScores.get(frags[i]) || 0) + weight);
    }
  }

  return [...fragmentScores.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([frag]) => frag);
}

export function matchCollections(
  input: string,
  collections: ColorCollection[],
): ColorCollection[] {
  const tokens = tokenize(input);
  if (tokens.length === 0) return [];

  const scored = collections.map((col) => {
    let score = 0;
    const searchable = [
      ...col.tags,
      ...col.promptWords,
      ...col.useCases,
      col.title,
      col.summary,
    ]
      .join(" ")
      .toLowerCase();

    for (const token of tokens) {
      // A CJK token is a whole phrase and the collection text is English, so
      // `searchable.includes(token)` was asking whether English prose contains
      // "瑜伽工作室网站" — always false, which is why Chinese queries matched no
      // collections either. Score through the fragments the phrase resolves to.
      if (CJK_RE.test(token)) {
        for (const frag of resolveTokenFragments(token)) {
          if (searchable.includes(frag)) score += 2;
        }
        continue;
      }

      if (searchable.includes(token)) score += 3;
      // partial match
      if (token.length >= 3) {
        const words = searchable.split(/\s+/);
        for (const word of words) {
          if (word.startsWith(token) || token.startsWith(word)) score += 1;
        }
      }
    }
    return { col, score };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((s) => s.col);
}

/* ------------------------------------------------------------------ */
/*  Name vocabulary, derived from the dataset (never hardcoded)       */
/* ------------------------------------------------------------------ */

interface NameVocabulary {
  /** 48 hue roots + the 5 two-word neutral roots ("warm gray"). */
  roots: Set<string>;
  /** 14 lightness band words. */
  lightBands: Set<string>;
  /** 8 chroma band words. */
  chromaBands: Set<string>;
}

/**
 * Which words are hue roots and which are band words is a property of the data,
 * so it is read back off the data rather than copied here. Copies drift; this
 * cannot. `src/data/colors.ts` stays untouched and exports nothing new.
 *
 * Names come in exactly two shapes:
 *   "Cobalt Shadow Vivid"  → root, lightness band, chroma band
 *   "Warm Gray Pearl"      → TWO-word root, lightness band, no chroma band
 * The neutrals are recognised by `words[1] === "gray"`, which is the only
 * reliable test — positional parsing reads "Gray" as the lightness band.
 */
const vocabularyCache = new WeakMap<ColorRecord[], NameVocabulary>();

function vocabularyFor(pool: ColorRecord[]): NameVocabulary {
  const cached = vocabularyCache.get(pool);
  if (cached) return cached;

  const vocab: NameVocabulary = {
    roots: new Set<string>(),
    lightBands: new Set<string>(),
    chromaBands: new Set<string>(),
  };

  for (const color of pool) {
    const words = color.name.toLowerCase().split(" ");
    if (words.length !== 3) continue;
    if (words[1] === "gray") {
      vocab.roots.add(`${words[0]} ${words[1]}`);
      vocab.lightBands.add(words[2]);
    } else {
      vocab.roots.add(words[0]);
      vocab.lightBands.add(words[1]);
      vocab.chromaBands.add(words[2]);
    }
  }

  vocabularyCache.set(pool, vocab);
  return vocab;
}

/* ------------------------------------------------------------------ */
/*  Palette selection                                                 */
/* ------------------------------------------------------------------ */

const PALETTE_SIZE = 6;
/** At most this many colours may share one lightness band. */
const MAX_PER_BAND = 2;
/**
 * A hue match outranks every possible combination of band matches: with at most
 * 8 fragments, band score tops out at 8 × BAND_WEIGHT = 40 < 100. That is the
 * whole point — bands are a preference, hues decide the palette.
 */
const HUE_WEIGHT = 100;
const BAND_WEIGHT = 5;
/**
 * Tie-breakers, deliberately smaller than one BAND_WEIGHT step so they can only
 * ever reorder colours the fragments rank EQUALLY. Ask for "ink" and you still
 * get ink; ask for nothing in particular and you get something usable instead of
 * whatever the dataset happens to list first.
 *
 * Both were measured on the fixed scorer, not assumed. Once hue outranks band,
 * huge numbers of colours tie exactly, and a tie is settled by dataset order —
 * which starts at Veil (98) and Faint (10). So "Coffee shop brand" came back
 * with two near-white Veil swatches, and "Organic skincare" with six Faint ones
 * at saturation 10 that read as gray: the same complaint "sage" caused,
 * arriving by a different road. The old engine's failure was the opposite end
 * (six near-blacks) for a different reason — band over-weighting.
 */
/** Dusk (34) … Silk (68): the range that is usable as an actual brand colour. */
const MID_LIGHTNESS_MIN = 34;
const MID_LIGHTNESS_MAX = 68;
const MID_LIGHTNESS_BONUS = 2;
/** Clear (54) and up: still recognisably a colour rather than a gray. */
const MIN_USEFUL_SATURATION = 54;
const SATURATION_BONUS = 1;

interface ScoredColor {
  color: ColorRecord;
  score: number;
}

export function pickColorsFromFragments(
  fragments: string[],
  pool: ColorRecord[],
): ColorRecord[] {
  if (fragments.length === 0) return [];

  const vocab = vocabularyFor(pool);
  const isBandWord = (frag: string) =>
    vocab.lightBands.has(frag) || vocab.chromaBands.has(frag);

  /**
   * Why the split. Scoring ran `name.includes(fragment)` over the WHOLE name, so
   * band words were matched — and heavily OVER-weighted, because a hue root
   * matches 112 of the 5,446 names while a lightness band matches 389 and a
   * chroma band 672. Twelve fragments in SCENARIO_KEYWORDS are band words, and
   * the result was palettes that collapsed into one band: "Coffee shop brand"
   * returned six near-black swatches, "Wedding invitation" five identical pinks.
   *
   * Anything that is not a known band word is treated as a hue fragment, so a
   * new root added to the dataset needs no change here.
   */
  const hueFragments = fragments.filter((f) => !isBandWord(f));
  const bandFragments = fragments.filter(isBandWord);

  const scored: ScoredColor[] = [];
  for (const color of pool) {
    const nameLower = color.name.toLowerCase();
    let score = 0;

    for (let i = 0; i < hueFragments.length; i++) {
      if (nameLower.includes(hueFragments[i])) {
        score += HUE_WEIGHT * (hueFragments.length - i);
      }
    }
    for (let i = 0; i < bandFragments.length; i++) {
      if (nameLower.includes(bandFragments[i])) {
        score += BAND_WEIGHT * (bandFragments.length - i);
      }
    }

    // No match is still no match — the bonus below only reorders colours that
    // already matched something, so a nonsense query still returns [].
    if (score === 0) continue;

    if (color.lightness >= MID_LIGHTNESS_MIN && color.lightness <= MID_LIGHTNESS_MAX) {
      score += MID_LIGHTNESS_BONUS;
    }
    if (color.saturation >= MIN_USEFUL_SATURATION) {
      score += SATURATION_BONUS;
    }

    scored.push({ color, score });
  }

  scored.sort((a, b) => b.score - a.score);

  /**
   * The old comment here promised "different hue families, varied lightness" and
   * the code tracked only `usedFamilies` — neither `lightness` nor `saturation`
   * was referenced anywhere in the function. Half the fix was never written.
   * (This repo has been bitten twice today by a comment that claims a fix the
   * code does not make; the guard against it is the test file, not this note.)
   *
   * Buckets come from the numeric fields, never from the name: `name.split(" ")[1]`
   * returns "Gray" for the 70 neutrals. Every generated lightness is exactly one
   * of the 14 band centres, so the value IS the bucket.
   */
  const picked: ColorRecord[] = [];
  const takenIds = new Set<string>();
  const familyCount = new Map<string, number>();
  const bandCount = new Map<number, number>();

  const sweep = (maxPerFamily: number) => {
    for (const { color } of scored) {
      if (picked.length >= PALETTE_SIZE) return;
      if (takenIds.has(color.id)) continue; // later sweeps re-walk the same list
      if ((bandCount.get(color.lightness) ?? 0) >= MAX_PER_BAND) continue;
      if ((familyCount.get(color.family) ?? 0) >= maxPerFamily) continue;
      picked.push(color);
      takenIds.add(color.id);
      familyCount.set(color.family, (familyCount.get(color.family) ?? 0) + 1);
      bandCount.set(color.lightness, (bandCount.get(color.lightness) ?? 0) + 1);
    }
  };

  // One per family first, then loosen the family rule if the pool is narrow.
  // The lightness cap is never loosened: returning five varied colours beats
  // returning six that all look the same, which was the original complaint.
  sweep(1);
  sweep(2);
  sweep(PALETTE_SIZE);

  return picked;
}
