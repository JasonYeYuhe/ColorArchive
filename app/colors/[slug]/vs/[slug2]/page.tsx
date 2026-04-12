import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/src/components/site-header";
import { StructuredDataScript } from "@/src/components/structured-data-script";
import { ColorVsPage } from "@/src/components/color-vs-page";
import { SITE_URL } from "@/src/lib/site-config";
import { colors } from "@/src/data/colors";
import {
  getComplementaryColor,
  getAnalogousColors,
} from "@/src/lib/color-utils";

export const dynamicParams = true;

interface VsPageProps {
  params: Promise<{ slug: string; slug2: string }>;
}

function findColor(id: string) {
  return colors.find((c) => c.id === id) ?? null;
}

/* ------------------------------------------------------------------ */
/*  Static params — pre-render high-value pairs                        */
/* ------------------------------------------------------------------ */

export function generateStaticParams() {
  // Pre-render complementary pairs for a representative subset of hue roots.
  // Remaining pairs are rendered on-demand via dynamicParams = true.
  const SEED_ROOTS = [
    "crimson", "ember", "amber", "honey", "olive", "emerald",
    "teal", "azure", "cobalt", "indigo", "violet", "magenta",
    "rose", "garnet",
  ];
  const LIGHTNESS = "core";
  const CHROMA = "vivid";

  const params: Array<{ slug: string; slug2: string }> = [];
  const seedColors = SEED_ROOTS.map((r) => `${r}-${LIGHTNESS}-${CHROMA}`)
    .map(findColor)
    .filter(Boolean) as typeof colors;

  for (const color of seedColors) {
    const comp = getComplementaryColor(colors, color);
    if (comp) {
      params.push({ slug: color.id, slug2: comp.id });
    }
    const analogous = getAnalogousColors(colors, color, 1);
    for (const a of analogous) {
      params.push({ slug: color.id, slug2: a.id });
    }
  }

  return params;
}

/* ------------------------------------------------------------------ */
/*  Metadata                                                           */
/* ------------------------------------------------------------------ */

export async function generateMetadata({ params }: VsPageProps): Promise<Metadata> {
  const { slug, slug2 } = await params;
  const colorA = findColor(slug);
  const colorB = findColor(slug2);

  if (!colorA || !colorB) {
    return { title: "Comparison not found" };
  }

  const title = `${colorA.name} vs ${colorB.name} — ${colorA.hex} vs ${colorB.hex} | ColorArchive`;
  const description = `Compare ${colorA.name} (${colorA.hex}) and ${colorB.name} (${colorB.hex}) side by side. See contrast ratio, WCAG compliance, color properties, and gradient blends. Free color comparison tool.`;

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: `/colors/${colorA.id}/vs/${colorB.id}/` },
    openGraph: {
      title: `${colorA.name} vs ${colorB.name} | ColorArchive`,
      description,
    },
  };
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default async function VsRoute({ params }: VsPageProps) {
  const { slug, slug2 } = await params;
  const colorA = findColor(slug);
  const colorB = findColor(slug2);

  if (!colorA || !colorB || colorA.id === colorB.id) {
    notFound();
  }

  // Generate related comparison pairs
  const compA = getComplementaryColor(colors, colorA);
  const compB = getComplementaryColor(colors, colorB);
  const analogA = getAnalogousColors(colors, colorA, 1);
  const analogB = getAnalogousColors(colors, colorB, 1);

  const seen = new Set([`${colorA.id}:${colorB.id}`, `${colorB.id}:${colorA.id}`]);
  const relatedPairs: Array<{ a: (typeof colors)[number]; b: (typeof colors)[number] }> = [];

  function addPair(a: (typeof colors)[number] | null, b: (typeof colors)[number] | null) {
    if (!a || !b || a.id === b.id) return;
    const key = `${a.id}:${b.id}`;
    const keyR = `${b.id}:${a.id}`;
    if (seen.has(key) || seen.has(keyR)) return;
    seen.add(key);
    relatedPairs.push({ a, b });
  }

  // Same colors with complementary partners
  if (compA) addPair(colorA, compA);
  if (compB) addPair(colorB, compB);
  // Cross analogous
  for (const a of analogA) addPair(a, colorB);
  for (const b of analogB) addPair(colorA, b);
  // Analogous vs each other
  for (const a of analogA) {
    for (const b of analogB) addPair(a, b);
  }

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `${colorA.name} vs ${colorB.name}`,
    description: `Color comparison between ${colorA.name} (${colorA.hex}) and ${colorB.name} (${colorB.hex}).`,
    url: `${SITE_URL}/colors/${colorA.id}/vs/${colorB.id}/`,
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: colorA.name, item: `${SITE_URL}/colors/${colorA.id}/` },
        { "@type": "ListItem", position: 3, name: `vs ${colorB.name}`, item: `${SITE_URL}/colors/${colorA.id}/vs/${colorB.id}/` },
      ],
    },
  };

  return (
    <>
      <StructuredDataScript data={structuredData} />
      <SiteHeader currentPath="/colors" />
      <ColorVsPage
        colorA={colorA}
        colorB={colorB}
        relatedPairs={relatedPairs.slice(0, 6)}
      />
    </>
  );
}
