import type { Metadata } from "next";
import { SiteHeader } from "@/src/components/site-header";
import { StructuredDataScript } from "@/src/components/structured-data-script";
import { RegionsIndexPage } from "@/src/components/regions-index-page";
import { regionPalettes } from "@/src/lib/region-palettes";
import { SITE_URL } from "@/src/lib/site-config";

const description = `Hex codes, named pigment sources, and design context for ${regionPalettes.length} of the world's most-cited cultural color palettes — Japan, Morocco, Greece, Mexico, India, Scandinavia, China, Korea, Egypt, Iceland, Italy, Vietnam. Each palette is matched to its closest entries in the 5,446-color ColorArchive system.`;

export const metadata: Metadata = {
  title: { absolute: "Color Palettes by Region & Culture | ColorArchive" },
  description,
  alternates: { canonical: "/regions/" },
  openGraph: {
    title: "Color Palettes by Region & Culture | ColorArchive",
    description,
    images: [`${SITE_URL}/og-image-v1.png`],
  },
  twitter: {
    title: "Color Palettes by Region & Culture | ColorArchive",
    description,
    images: [`${SITE_URL}/og-image-v1.png`],
  },
};

const structuredData = [
  {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Color Palettes by Region & Culture | ColorArchive",
    description,
    url: `${SITE_URL}/regions/`,
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "ColorArchive", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "Regions", item: `${SITE_URL}/regions/` },
    ],
  },
];

export default function RegionsRoute() {
  return (
    <>
      <SiteHeader currentPath="/regions" />
      <StructuredDataScript data={structuredData} />
      <RegionsIndexPage />
    </>
  );
}
