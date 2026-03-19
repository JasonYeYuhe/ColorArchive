import type { ColorFamily, ColorRecord } from "@/src/types/color";
import type { ColorCollection } from "@/src/lib/collections";
import { COLOR_FAMILIES, sortColors } from "@/src/lib/color-utils";

export interface ColorFamilyPageData {
  family: ColorFamily;
  slug: string;
  title: string;
  summary: string;
  description: string;
  seoDescription: string;
  useCases: string[];
}

const FAMILY_PAGE_DATA: Record<ColorFamily, ColorFamilyPageData> = {
  Red: {
    family: "Red",
    slug: "red",
    title: "Red Family",
    summary: "Crimson, ruby, and merlot shades for editorial warmth, campaigns, and bold contrast.",
    description:
      "The red family holds ColorArchive's warmest expressive tones, spanning pale blushes through deep merlots. Use this lane when the palette needs urgency, appetite, romance, or dramatic contrast.",
    seoDescription:
      "Browse the red color family in ColorArchive, from pale blush to merlot ink, with searchable shades and related collections.",
    useCases: ["Campaign accents", "Editorial warmth", "Beauty and food brands"],
  },
  Orange: {
    family: "Orange",
    slug: "orange",
    title: "Orange Family",
    summary: "Coral, apricot, and ember tones for warmth, hospitality, and sunlit product surfaces.",
    description:
      "The orange family adds heat without the bluntness of pure red. It is useful when the work should feel alive, tactile, and welcoming rather than purely loud.",
    seoDescription:
      "Explore the orange color family in ColorArchive, from coral and apricot to ember and amber tones.",
    useCases: ["Travel and lifestyle", "Warm product surfaces", "Hospitality brands"],
  },
  Yellow: {
    family: "Yellow",
    slug: "yellow",
    title: "Yellow Family",
    summary: "Amber, citrine, and honey tones for optimistic surfaces, highlights, and soft contrast.",
    description:
      "The yellow family moves from restrained paper-like warmth to vivid attention-grabbing signals. It works well when the interface needs lift, sunlight, or optimistic energy.",
    seoDescription:
      "Browse the yellow color family in ColorArchive, including amber, citrine, and honey shades.",
    useCases: ["Highlight systems", "Editorial warmth", "Optimistic interfaces"],
  },
  Lime: {
    family: "Lime",
    slug: "lime",
    title: "Lime Family",
    summary: "Olive and lime tones for freshness, sport energy, and sharp contrast in curated systems.",
    description:
      "The lime family sits between yellow energy and green structure. It works as a bright organic accent, especially when a product wants freshness without becoming candy-like.",
    seoDescription:
      "Browse lime and olive family colors in ColorArchive for fresh, energetic, and organic palette building.",
    useCases: ["Wellness accents", "Sport and movement", "Fresh organic brands"],
  },
  Green: {
    family: "Green",
    slug: "green",
    title: "Green Family",
    summary: "Moss, leaf, emerald, and mint tones for natural systems, wellness brands, and grounded UI.",
    description:
      "The green family is one of the broadest lanes in the archive, ranging from earthy moss to crisp mint. It is the most reliable choice when the work should feel organic, restorative, or environmentally rooted.",
    seoDescription:
      "Explore the green color family in ColorArchive, from moss and leaf tones to emerald and mint shades.",
    useCases: ["Wellness brands", "Environmental campaigns", "Grounded interface systems"],
  },
  Teal: {
    family: "Teal",
    slug: "teal",
    title: "Teal Family",
    summary: "Seafoam, jade, lagoon, and teal shades for coastal, health, and product clarity.",
    description:
      "The teal family bridges organic green and technical blue. It suits products that need calm confidence, gentle freshness, and a slightly aquatic feel.",
    seoDescription:
      "Browse teal and seafoam family colors in ColorArchive for calm, fresh, and coastal palettes.",
    useCases: ["Coastal product brands", "Calm dashboards", "Health and wellness UI"],
  },
  Blue: {
    family: "Blue",
    slug: "blue",
    title: "Blue Family",
    summary: "Azure, sapphire, cobalt, and indigo shades for interface systems, trust, and technical products.",
    description:
      "The blue family gives the archive its strongest product and systems language. It is the default lane for trust, precision, coolness, and technical clarity, but still spans soft airy mists through vivid cobalt cores.",
    seoDescription:
      "Explore the blue color family in ColorArchive, from pale azure and sapphire to vivid cobalt and indigo.",
    useCases: ["SaaS and product UI", "Trust-driven brands", "Technical landing pages"],
  },
  Purple: {
    family: "Purple",
    slug: "purple",
    title: "Purple Family",
    summary: "Iris, violet, orchid, plum, and mulberry tones for creative, cultural, and nocturne palettes.",
    description:
      "The purple family is where the archive becomes more expressive and atmospheric. Use it for culture, entertainment, launch pages, and products that need to feel imaginative without losing structure.",
    seoDescription:
      "Browse the purple color family in ColorArchive, from iris and violet to orchid, plum, and mulberry shades.",
    useCases: ["Creative brands", "Launch pages", "Atmospheric dark interfaces"],
  },
  Pink: {
    family: "Pink",
    slug: "pink",
    title: "Pink Family",
    summary: "Magenta, fuchsia, peony, rose, and blush tones for campaign energy and expressive brand surfaces.",
    description:
      "The pink family carries the archive's most social, campaign-ready, and expressive tones. It ranges from pale blushes to vivid fuchsias, useful for beauty, culture, and high-energy product stories.",
    seoDescription:
      "Explore the pink color family in ColorArchive, from soft blush and rose to vivid peony and fuchsia shades.",
    useCases: ["Beauty and culture", "Campaign systems", "Expressive social surfaces"],
  },
};

export const COLOR_FAMILY_PAGES = COLOR_FAMILIES.map((family) => FAMILY_PAGE_DATA[family]);

export function getFamilyPageData(family: ColorFamily) {
  return FAMILY_PAGE_DATA[family];
}

export function getFamilySlug(family: ColorFamily) {
  return FAMILY_PAGE_DATA[family].slug;
}

export function getFamilyBySlug(slug: string): ColorFamily | null {
  const match = COLOR_FAMILY_PAGES.find((entry) => entry.slug === slug);
  return match?.family ?? null;
}

export function getColorsForFamily(colors: readonly ColorRecord[], family: ColorFamily) {
  return sortColors(colors.filter((color) => color.family === family), "hue");
}

export function getCollectionsForFamily(
  collections: readonly ColorCollection[],
  family: ColorFamily,
) {
  return [...collections]
    .map((collection) => ({
      collection,
      matchingColors: collection.palette.filter((color) => color.family === family),
    }))
    .filter((entry) => entry.matchingColors.length > 0)
    .sort((left, right) => right.matchingColors.length - left.matchingColors.length);
}
