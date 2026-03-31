import { Suspense } from "react";
import type { Metadata } from "next";
import { AllColorsPage } from "@/src/components/all-colors-page";
import { SiteHeader } from "@/src/components/site-header";
import { StructuredDataScript } from "@/src/components/structured-data-script";
import { colors } from "@/src/data/colors";

const structuredData = [
  {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "All 5,400+ Hex Colors — ColorArchive",
    description:
      "Browse the complete ColorArchive — all 5,400+ curated hex color codes in a single dense view, organized by hue across the full spectrum.",
    url: "https://colorarchive.me/all-colors/",
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "ColorArchive", item: "https://colorarchive.me/" },
      { "@type": "ListItem", position: 2, name: "All Colors", item: "https://colorarchive.me/all-colors/" },
    ],
  },
];

export const metadata: Metadata = {
  title: { absolute: "5,446 Hex Color Codes — Browse All Colors | ColorArchive" },
  description: "Browse 5,446 hex color codes organized by hue, lightness, and family. Search by name, hex value, or mood. Copy any color code instantly. Free color reference.",
  alternates: { canonical: "/all-colors/" },
  keywords: ["hex color codes", "color codes list", "all colors", "hex colors", "color reference", "color names"],
  openGraph: {
    title: "5,446 Hex Color Codes — Browse All Colors | ColorArchive",
    description: "Browse 5,446 hex color codes organized by hue, lightness, and family. Search by name, hex value, or mood. Copy any color code instantly. Free color reference.",
    images: ["https://colorarchive.me/og-image-v1.png"],
  },
  twitter: {
    title: "5,446 Hex Color Codes — Browse All Colors | ColorArchive",
    description: "Browse 5,446 hex color codes organized by hue, lightness, and family. Search by name, hex value, or mood. Copy any color code instantly. Free color reference.",
    images: ["https://colorarchive.me/og-image-v1.png"],
  },
  robots: { index: true, follow: true },
};

export default function AllColorsRoute() {
  return (
    <>
      <SiteHeader currentPath="/all-colors" />
      <StructuredDataScript data={structuredData} />
      <Suspense fallback={null}>
        <AllColorsPage colors={colors} />
      </Suspense>
    </>
  );
}
