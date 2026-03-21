import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ColorDetailPage } from "@/src/components/color-detail-page";
import { SiteHeader } from "@/src/components/site-header";
import { StructuredDataScript } from "@/src/components/structured-data-script";
import {
  getAnalogousColors,
  getComplementaryColor,
  getNearestColors,
  getToneCompanion,
  getTriadicColors,
  getWcagPairings,
  sortColors,
} from "@/src/lib/color-utils";
import { colors } from "@/src/data/colors";

export const dynamicParams = false;

interface ColorPageProps {
  params: Promise<{
    slug: string;
  }>;
}

function getColorBySlug(slug: string) {
  return colors.find((color) => color.id === slug) ?? null;
}

export async function generateStaticParams() {
  return colors.map((color) => ({
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
    openGraph: {
      images: [`https://api.colorarchive.me/og/color/${color.hex.slice(1)}?name=${encodeURIComponent(color.name)}`],
    },
    twitter: {
      card: "summary_large_image",
      images: [`https://api.colorarchive.me/og/color/${color.hex.slice(1)}?name=${encodeURIComponent(color.name)}`],
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
  const lighterCompanion = getToneCompanion(colors, color, "lighter");
  const darkerCompanion = getToneCompanion(colors, color, "darker");
  const wcagPairings = getWcagPairings(colors, color, 6);
  const colorStructuredData = {
    "@context": "https://schema.org",
    "@type": "Thing",
    name: `${color.name} ${color.hex}`,
    description: `${color.hex} is a ${color.family.toLowerCase()} hex color code named ${color.name}. ${getUsageHint(color.lightness, color.saturation)}`,
    url: `https://colorarchive.me/colors/${color.id}/`,
    identifier: color.hex,
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
        "@type": "Thing",
        name: entry.name,
        url: `https://colorarchive.me/colors/${entry.id}/`,
      })),
      ...(complementaryColor
        ? [
            {
              "@type": "Thing",
              name: complementaryColor.name,
              url: `https://colorarchive.me/colors/${complementaryColor.id}/`,
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
        item: "https://colorarchive.me/",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Colors",
        item: "https://colorarchive.me/colors/",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: color.family,
        item: `https://colorarchive.me/colors/?family=${encodeURIComponent(color.family)}`,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: `${color.name} ${color.hex}`,
        item: `https://colorarchive.me/colors/${color.id}/`,
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
        complementaryColor={complementaryColor}
        lighterCompanion={lighterCompanion}
        darkerCompanion={darkerCompanion}
        wcagPairings={wcagPairings}
      />
    </>
  );
}
