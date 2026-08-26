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

/**
 * CLOSED 2026-08-26. Only the pre-rendered pairs below exist; every other pair
 * 404s instead of being rendered on demand.
 *
 * This route was the single largest line on the Vercel bill. It spans ~29.6M
 * pairs (5,446 colours squared) and `dynamicParams = true` meant any crawler
 * request for a pair nobody had ever asked for rendered a page AND wrote an ISR
 * entry. Jul 25 – Aug 25: 8.75M ISR writes / $34.99, against 16.2M edge
 * requests — roughly half of all traffic to the site was minting cache for
 * pairs no human requested.
 *
 * WHY THE TWO EARLIER ATTEMPTS DIDN'T WORK, which is the reusable lesson:
 *   9fece2b (06-20) added rel="nofollow" to the vs→vs links.
 *   9a2d0b2 (06-27) added robots: { index: false } to this page's metadata.
 * Both target INDEXING. Neither reduces CRAWLING — a noindex tag has to be
 * fetched to be read, and fetching is the billable event. ISR writes went
 * 4.78M → 8.75M in the two months AFTER noindex shipped. robots.txt Disallow
 * (caf2f96) stops compliant crawlers; this line stops everyone else, because
 * robots.txt is a courtesy and not a control boundary.
 *
 * THE FEATURE IS NOT LOST. /compare/ has always existed and does the same job:
 * a "use client" page reading ?a=/?b= hex, and — the part that matters here —
 * a STATIC route, so query strings on it create no ISR entries at all. Both
 * former link sites now point there (color-detail-page.tsx, color-vs-page.tsx),
 * so every pair a visitor could previously reach is still reachable.
 *
 * The 28 pre-rendered pairs stay: they are already built, cost nothing extra,
 * and keep whatever external links and index entries point at them alive.
 */
export const dynamicParams = false;

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
    // noindex: the vs route spans ~29M color pairs and is rendered on-demand
    // (dynamicParams). Letting crawlers spider that combinatorial space drove the
    // ISR-write cost (reference_vercel_cost). Keep it usable for humans + followable
    // (entry links carry equity) but out of the index. Pairs with real intent are
    // reached via the color pages, not search.
    robots: { index: false, follow: true },
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
