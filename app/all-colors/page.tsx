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
    name: "All 3,000+ Hex Colors — ColorArchive",
    description:
      "Browse the complete ColorArchive — all 3,000+ curated hex color codes in a single dense view, organized by hue across the full spectrum.",
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
  title: "All 3,000+ Hex Colors",
  description: "Browse the complete ColorArchive — all 3,000+ curated hex color codes in a single dense view, organized by hue across the full spectrum.",
  alternates: { canonical: "/all-colors/" },
  openGraph: {
    images: ["https://colorarchive.me/og-image-v1.png"],
  },
  twitter: {
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
