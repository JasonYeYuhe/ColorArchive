import type { Metadata } from "next";
import { SiteHeader } from "@/src/components/site-header";
import { StructuredDataScript } from "@/src/components/structured-data-script";
import { BrandsIndexPage } from "@/src/components/brands-index-page";
import { brandPalettes } from "@/src/lib/brand-palettes";
import { SITE_URL } from "@/src/lib/site-config";

const description = `Hex codes, color names, and design rationale for ${brandPalettes.length} of the world's most-recognized brand color palettes — Apple, Google, Notion, Stripe, Spotify, Netflix, Discord, and more. Each palette is sourced from public brand guidelines and matched to its closest entry in the 5,446-color ColorArchive system.`;

export const metadata: Metadata = {
  title: { absolute: "Famous Brand Color Palettes — Hex Codes & Guidelines | ColorArchive" },
  description,
  alternates: { canonical: "/brands/" },
  openGraph: {
    title: "Famous Brand Color Palettes | ColorArchive",
    description,
    images: [`${SITE_URL}/og-image-v1.png`],
  },
  twitter: {
    title: "Famous Brand Color Palettes | ColorArchive",
    description,
    images: [`${SITE_URL}/og-image-v1.png`],
  },
};

const structuredData = [
  {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Famous Brand Color Palettes | ColorArchive",
    description,
    url: `${SITE_URL}/brands/`,
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "ColorArchive", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "Brands", item: `${SITE_URL}/brands/` },
    ],
  },
];

export default function BrandsRoute() {
  return (
    <>
      <SiteHeader currentPath="/brands" />
      <StructuredDataScript data={structuredData} />
      <BrandsIndexPage />
    </>
  );
}
