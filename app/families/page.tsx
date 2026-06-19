import type { Metadata } from "next";
import { FamiliesPage } from "@/src/components/families-page";
import { SiteHeader } from "@/src/components/site-header";
import { StructuredDataScript } from "@/src/components/structured-data-script";
import { collections } from "@/src/lib/collections";
import { SITE_URL } from "@/src/lib/site-config";

const structuredData = [
  {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Color Families — ColorArchive",
    description:
      "Explore hex colors by hue family — Red, Orange, Yellow, Green, Teal, Blue, Purple, and Pink. Each family page includes all shades, tones, and design-ready swatches.",
    url: `${SITE_URL}/families/`,
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "ColorArchive", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "Color Families", item: `${SITE_URL}/families/` },
    ],
  },
];

export const metadata: Metadata = {
  title: "Color Families",
  description: "Explore hex colors by hue family — Red, Orange, Yellow, Green, Teal, Blue, Purple, and Pink. Each family page includes all shades, tones, and design-ready swatches.",
  alternates: {
    canonical: "/families/",
  },
  openGraph: {
    images: [`${SITE_URL}/og-image-v1.png`],
  },
  twitter: {
    images: [`${SITE_URL}/og-image-v1.png`],
  },
};

export default function FamiliesRoute() {
  return (
    <>
      <SiteHeader currentPath="/families" />
      <StructuredDataScript data={structuredData} />
      <FamiliesPage collections={collections} />
    </>
  );
}
