import type { Metadata } from "next";
import { SiteHeader } from "@/src/components/site-header";
import { StructuredDataScript } from "@/src/components/structured-data-script";
import { TrendingPage } from "@/src/components/trending-page";
import { SITE_URL } from "@/src/lib/site-config";

export const metadata: Metadata = {
  title: "Trending Colors — ColorArchive",
  description:
    "Discover the most-viewed colors and palettes on ColorArchive right now. See what designers are reaching for this week.",
  alternates: {
    canonical: "/trending/",
  },
  openGraph: {
    title: "Trending Colors — ColorArchive",
    description: "Discover the most-viewed colors on ColorArchive right now.",
    url: `${SITE_URL}/trending/`,
    images: [`${SITE_URL}/og-image-v1.png`],
  },
};

const collectionData = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Trending Colors",
  description:
    "Discover the most-viewed colors and palettes on ColorArchive right now. See what designers are reaching for this week.",
  url: `${SITE_URL}/trending/`,
};

const breadcrumbData = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "ColorArchive", item: `${SITE_URL}/` },
    { "@type": "ListItem", position: 2, name: "Trending", item: `${SITE_URL}/trending/` },
  ],
};

export default function TrendingRoute() {
  return (
    <>
      <SiteHeader currentPath="/all-colors" />
      <StructuredDataScript data={[collectionData, breadcrumbData]} />
      <TrendingPage />
    </>
  );
}
