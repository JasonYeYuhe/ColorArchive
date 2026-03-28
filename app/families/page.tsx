import type { Metadata } from "next";
import { FamiliesPage } from "@/src/components/families-page";
import { SiteHeader } from "@/src/components/site-header";
import { StructuredDataScript } from "@/src/components/structured-data-script";
import { colors } from "@/src/data/colors";
import { collections } from "@/src/lib/collections";

const structuredData = [
  {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Color Families — ColorArchive",
    description:
      "Explore hex colors by hue family — Red, Orange, Yellow, Green, Teal, Blue, Purple, and Pink. Each family page includes all shades, tones, and design-ready swatches.",
    url: "https://colorarchive.me/families/",
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "ColorArchive", item: "https://colorarchive.me/" },
      { "@type": "ListItem", position: 2, name: "Color Families", item: "https://colorarchive.me/families/" },
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
    images: ["https://colorarchive.me/generated/og/families/index.svg"],
  },
  twitter: {
    images: ["https://colorarchive.me/generated/og/families/index.svg"],
  },
};

export default function FamiliesRoute() {
  return (
    <>
      <SiteHeader currentPath="/families" />
      <StructuredDataScript data={structuredData} />
      <FamiliesPage colors={colors} collections={collections} />
    </>
  );
}
