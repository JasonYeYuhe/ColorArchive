import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/src/components/site-header";
import { StructuredDataScript } from "@/src/components/structured-data-script";
import { BrandDetailPage } from "@/src/components/brand-detail-page";
import { brandPalettes, getBrandBySlug } from "@/src/lib/brand-palettes";
import { SITE_URL } from "@/src/lib/site-config";

interface BrandRouteProps {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = false;

export function generateStaticParams() {
  return brandPalettes.map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({ params }: BrandRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const brand = getBrandBySlug(slug);
  if (!brand) return {};

  const colorList = brand.colors.map((c) => `${c.name} ${c.hex.toUpperCase()}`).join(", ");
  const description = `${brand.name} brand color palette: ${colorList}. ${brand.tagline} Sourced from public brand guidelines and matched to its closest ColorArchive entry.`;

  return {
    title: { absolute: `${brand.name} Color Palette — Hex Codes & Brand Colors | ColorArchive` },
    description,
    alternates: { canonical: `/brands/${brand.slug}/` },
    // No explicit `images` — lets the colocated opengraph-image.tsx route bind (per-brand
    // PNG card). An explicit images array would override and suppress it (the 9885f5b bug).
    openGraph: {
      title: `${brand.name} Color Palette | ColorArchive`,
      description: brand.tagline,
    },
    twitter: {
      card: "summary_large_image",
      title: `${brand.name} Color Palette | ColorArchive`,
      description: brand.tagline,
    },
  };
}

export default async function BrandDetailRoute({ params }: BrandRouteProps) {
  const { slug } = await params;
  const brand = getBrandBySlug(slug);
  if (!brand) notFound();

  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: `${brand.name} Color Palette — Hex Codes & Brand Colors`,
      description: brand.tagline,
      url: `${SITE_URL}/brands/${brand.slug}/`,
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
        itemListElement: brand.colors.map((c, i) => ({
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
        { "@type": "ListItem", position: 2, name: "Brands", item: `${SITE_URL}/brands/` },
        { "@type": "ListItem", position: 3, name: brand.name, item: `${SITE_URL}/brands/${brand.slug}/` },
      ],
    },
  ];

  return (
    <>
      <SiteHeader currentPath="/brands" />
      <StructuredDataScript data={structuredData} />
      <BrandDetailPage brand={brand} />
    </>
  );
}
