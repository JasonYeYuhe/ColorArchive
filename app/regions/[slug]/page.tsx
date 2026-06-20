import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/src/components/site-header";
import { StructuredDataScript } from "@/src/components/structured-data-script";
import { RegionDetailPage } from "@/src/components/region-detail-page";
import { regionPalettes, getRegionBySlug } from "@/src/lib/region-palettes";
import { SITE_URL } from "@/src/lib/site-config";

interface RegionRouteProps {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = false;

export function generateStaticParams() {
  return regionPalettes.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: RegionRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const region = getRegionBySlug(slug);
  if (!region) return {};

  const colorList = region.colors.map((c) => `${c.name} ${c.hex.toUpperCase()}`).join(", ");
  const description = `${region.name} traditional color palette: ${colorList}. ${region.tagline} Sourced from documented dye, pigment, and architectural traditions; matched to its closest ColorArchive entries.`;

  return {
    title: { absolute: `${region.name} Color Palette — Hex Codes & Cultural Context | ColorArchive` },
    description,
    alternates: { canonical: `/regions/${region.slug}/` },
    // No explicit `images` — lets the colocated opengraph-image.tsx route bind (per-region
    // PNG card). An explicit images array would override and suppress it (the 9885f5b bug).
    openGraph: {
      title: `${region.name} Color Palette | ColorArchive`,
      description: region.tagline,
    },
    twitter: {
      card: "summary_large_image",
      title: `${region.name} Color Palette | ColorArchive`,
      description: region.tagline,
    },
  };
}

export default async function RegionRouteHandler({ params }: RegionRouteProps) {
  const { slug } = await params;
  const region = getRegionBySlug(slug);
  if (!region) notFound();

  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: `${region.name} Color Palette — Hex Codes & Cultural Context`,
      description: region.tagline,
      url: `${SITE_URL}/regions/${region.slug}/`,
      author: {
        "@type": "Organization",
        name: "ColorArchive",
        url: SITE_URL,
      },
      publisher: {
        "@type": "Organization",
        name: "ColorArchive",
        url: SITE_URL,
      },
      mainEntity: {
        "@type": "ItemList",
        itemListElement: region.colors.map((c, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: `${c.name} (${c.hex.toUpperCase()})`,
        })),
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "ColorArchive", item: `${SITE_URL}/` },
        { "@type": "ListItem", position: 2, name: "Regions", item: `${SITE_URL}/regions/` },
        { "@type": "ListItem", position: 3, name: region.name, item: `${SITE_URL}/regions/${region.slug}/` },
      ],
    },
  ];

  return (
    <>
      <SiteHeader currentPath="/regions" />
      <StructuredDataScript data={structuredData} />
      <RegionDetailPage region={region} />
    </>
  );
}
