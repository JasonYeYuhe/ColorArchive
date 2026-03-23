import type { Metadata } from "next";
import { SiteHeader } from "@/src/components/site-header";
import { StructuredDataScript } from "@/src/components/structured-data-script";
import { CombinationsPage } from "@/src/components/combinations-page";
import { combinations } from "@/src/lib/combinations";

export const metadata: Metadata = {
  title: { absolute: "Color Combinations — Curated Palettes for Designers | ColorArchive" },
  description:
    "30+ handpicked color combinations — complementary, analogous, triadic, and monochromatic — with hex codes and design use cases. Copy any color instantly.",
  alternates: {
    canonical: "/combinations/",
  },
  openGraph: {
    title: "Color Combinations — Curated Palettes for Designers",
    description:
      "30+ curated color combinations: complementary, analogous, triadic, and more. Each with hex codes, harmony type, and design use cases.",
    images: ["https://colorarchive.me/og-image-v1.png"],
  },
  twitter: {
    title: "Color Combinations — Curated Palettes for Designers",
    description:
      "30+ color combinations with harmony types and hex codes. Complementary, analogous, triadic, monochromatic, and more.",
    images: ["https://colorarchive.me/og-image-v1.png"],
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Color Combinations — Curated Palettes for Designers",
  description:
    "30+ handpicked color combinations including complementary, analogous, triadic, and monochromatic palettes with hex codes and design use cases.",
  url: "https://colorarchive.me/combinations/",
  breadcrumb: {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "ColorArchive", item: "https://colorarchive.me/" },
      { "@type": "ListItem", position: 2, name: "Color Combinations", item: "https://colorarchive.me/combinations/" },
    ],
  },
};

export default function CombinationsRoute() {
  return (
    <>
      <StructuredDataScript data={structuredData} />
      <SiteHeader currentPath="/combinations" />
      <CombinationsPage combinations={combinations} />
    </>
  );
}
