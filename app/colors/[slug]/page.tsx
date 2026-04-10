import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ColorDetailPage } from "@/src/components/color-detail-page";
import { SiteHeader } from "@/src/components/site-header";
import { StructuredDataScript } from "@/src/components/structured-data-script";
import { SITE_URL } from "@/src/lib/site-config";
import {
  getAnalogousColors,
  getComplementaryColor,
  getNearestColors,
  getToneCompanion,
  getSplitComplementaryColors,
  getTriadicColors,
  getWcagPairings,
  sortColors,
} from "@/src/lib/color-utils";
import { collections } from "@/src/lib/collections";
import { colors } from "@/src/data/colors";

export const dynamicParams = true;

interface ColorPageProps {
  params: Promise<{
    slug: string;
  }>;
}

function getColorBySlug(slug: string) {
  return colors.find((color) => color.id === slug) ?? null;
}

export async function generateStaticParams() {
  // Pre-render a representative subset at build time to stay within Vercel's
  // 80 MB deployment output limit. The remaining pages are rendered on-demand
  // via dynamicParams = true and cached by the CDN after first visit.
  const ORIGINAL_HUE_ROOTS = [
    "crimson", "ruby", "ember", "coral", "apricot", "amber",
    "citrine", "honey", "olive", "lime", "moss", "leaf",
    "emerald", "mint", "seafoam", "jade", "teal", "lagoon",
    "aqua", "cerulean", "azure", "sapphire", "cobalt", "indigo",
    "iris", "violet", "orchid", "plum", "mulberry", "magenta",
    "fuchsia", "peony", "rose", "blush", "garnet", "merlot",
  ];
  const ORIGINAL_CHROMA = ["faint", "muted", "soft", "clear", "vivid", "pure"];
  const NEUTRAL_ROOTS = ["warm-gray", "true-gray", "cool-gray"];

  const subset = colors.filter((c) => {
    // All original neutrals (3 groups)
    if (NEUTRAL_ROOTS.some((r) => c.id.startsWith(r))) return true;
    // Original 36 hues × original 6 chromas only
    const parts = c.id.split("-");
    return ORIGINAL_HUE_ROOTS.includes(parts[0]) && ORIGINAL_CHROMA.includes(parts[2]);
  });

  return subset.map((color) => ({
    slug: color.id,
  }));
}

function getLightnessLabel(lightness: number): string {
  if (lightness >= 90) return "very light";
  if (lightness >= 76) return "light";
  if (lightness >= 60) return "mid-lightness";
  if (lightness >= 42) return "medium";
  if (lightness >= 28) return "dark";
  return "very dark";
}

function getSaturationLabel(saturation: number): string {
  if (saturation <= 18) return "muted";
  if (saturation <= 34) return "soft";
  if (saturation <= 54) return "clear";
  return "vivid";
}

function getTemperatureLabel(hue: number): string {
  if (hue >= 15 && hue < 70) return "warm";
  if (hue >= 70 && hue < 150) return "natural";
  if (hue >= 150 && hue < 250) return "cool";
  if (hue >= 250 && hue < 310) return "cool";
  return "warm";
}

function getUsageHint(lightness: number, saturation: number): string {
  if (lightness >= 90) {
    return "Ideal for backgrounds, whitespace accents, and subtle tonal layering.";
  }
  if (lightness >= 76 && saturation <= 34) {
    return "Well suited for neutral backdrops, soft UI surfaces, and editorial layouts.";
  }
  if (lightness >= 76) {
    return "A good fit for pastel palettes, card backgrounds, and airy brand identities.";
  }
  if (lightness >= 60 && saturation >= 54) {
    return "Strong enough for primary brand colors, call-to-action buttons, and hero sections.";
  }
  if (lightness >= 60) {
    return "Versatile for editorial design, mid-tone palettes, and balanced UI themes.";
  }
  if (lightness >= 42 && saturation >= 54) {
    return "Works well as an accent color, for data visualizations, and bold typographic treatments.";
  }
  if (lightness >= 42) {
    return "A dependable mid-tone for icons, secondary UI elements, and understated branding.";
  }
  if (lightness >= 28) {
    return "Effective for dark UI themes, contrast text, and sophisticated color pairings.";
  }
  return "Best for deep backgrounds, high-contrast text, and dramatic editorial compositions.";
}

export async function generateMetadata({ params }: ColorPageProps): Promise<Metadata> {
  const { slug } = await params;
  const color = getColorBySlug(slug);

  if (!color) {
    return {
      title: "Color not found",
    };
  }

  const temperature = getTemperatureLabel(color.hue);
  const lightnessLabel = getLightnessLabel(color.lightness);
  const saturationLabel = getSaturationLabel(color.saturation);
  const familyLower = color.family.toLowerCase();
  const usageHint = getUsageHint(color.lightness, color.saturation);

  const title = `${color.name} — ${color.hex} Hex Color Code | ColorArchive`;
  const description = `${color.hex} is a ${temperature}, ${lightnessLabel} ${familyLower} named ${color.name}. ${usageHint} Find complementary colors, tonal variants, and export as CSS, Figma tokens, or Tailwind config at ColorArchive.`;

  return {
    title: { absolute: title },
    description,
    alternates: {
      canonical: `/colors/${color.id}/`,
    },
    twitter: {
      card: "summary_large_image",
    },
  };
}

export default async function ColorPage({ params }: ColorPageProps) {
  const { slug } = await params;
  const color = getColorBySlug(slug);

  if (!color) {
    notFound();
  }

  const relatedColors = sortColors(
    colors.filter((item) => item.family === color.family),
    "hue",
  )
    .slice(0, 8)
    .sort((a, b) => (a.id === color.id ? -1 : b.id === color.id ? 1 : 0));
  const nearestColors = getNearestColors(colors, color, 6);
  const complementaryColor = getComplementaryColor(colors, color);
  const analogousColors = getAnalogousColors(colors, color, 2);
  const triadicColors = getTriadicColors(colors, color);
  const splitCompColors = getSplitComplementaryColors(colors, color);
  const lighterCompanion = getToneCompanion(colors, color, "lighter");
  const darkerCompanion = getToneCompanion(colors, color, "darker");
  const wcagPairings = getWcagPairings(colors, color, 6);
  const usedInCollections = collections.filter((c) => c.palette.some((p) => p.id === color.id));
  const temperature = getTemperatureLabel(color.hue);
  const lightnessLabel = getLightnessLabel(color.lightness);
  const saturationLabel = getSaturationLabel(color.saturation);
  const familyLower = color.family.toLowerCase();
  const usageHint = getUsageHint(color.lightness, color.saturation);

  const colorStructuredData = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: color.name,
    description: `${color.name} (${color.hex}) is a ${temperature}, ${lightnessLabel}, ${saturationLabel} ${familyLower} color. ${usageHint}`,
    url: `${SITE_URL}/colors/${color.id}/`,
    identifier: color.hex,
    color: color.hex,
    isPartOf: {
      "@type": "WebSite",
      name: "ColorArchive",
      url: SITE_URL,
    },
    additionalProperty: [
      { "@type": "PropertyValue", name: "HEX", value: color.hex },
      { "@type": "PropertyValue", name: "RGB", value: color.rgb },
      { "@type": "PropertyValue", name: "HSL", value: color.hsl },
      { "@type": "PropertyValue", name: "Hue", value: color.hue },
      { "@type": "PropertyValue", name: "Saturation", value: color.saturation },
      { "@type": "PropertyValue", name: "Lightness", value: color.lightness },
      { "@type": "PropertyValue", name: "Family", value: color.family },
    ],
    isSimilarTo: [
      ...analogousColors.map((entry) => ({
        "@type": "CreativeWork",
        name: entry.name,
        url: `${SITE_URL}/colors/${entry.id}/`,
      })),
      ...(complementaryColor
        ? [
            {
              "@type": "CreativeWork",
              name: complementaryColor.name,
              url: `${SITE_URL}/colors/${complementaryColor.id}/`,
            },
          ]
        : []),
    ],
  };

  const breadcrumbStructuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "ColorArchive",
        item: `${SITE_URL}/`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Colors",
        item: `${SITE_URL}/colors/`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: color.family,
        item: `${SITE_URL}/colors/?family=${encodeURIComponent(color.family)}`,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: `${color.name} ${color.hex}`,
        item: `${SITE_URL}/colors/${color.id}/`,
      },
    ],
  };

  return (
    <>
      <SiteHeader currentPath="/colors" />
      <StructuredDataScript data={[colorStructuredData, breadcrumbStructuredData]} />
      <ColorDetailPage
        allColors={colors}
        color={color}
        relatedColors={relatedColors}
        nearestColors={nearestColors}
        analogousColors={analogousColors}
        triadicColors={triadicColors}
        splitCompColors={splitCompColors}
        complementaryColor={complementaryColor}
        lighterCompanion={lighterCompanion}
        darkerCompanion={darkerCompanion}
        wcagPairings={wcagPairings}
        usedInCollections={usedInCollections}
      />
    </>
  );
}
