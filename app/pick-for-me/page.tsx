import type { Metadata } from "next";
import { SiteHeader } from "@/src/components/site-header";
import { StructuredDataScript } from "@/src/components/structured-data-script";
import { PickForMePage } from "@/src/components/pick-for-me-page";
import { colors } from "@/src/data/colors";
import { collections } from "@/src/lib/collections";

export const metadata: Metadata = {
  title: { absolute: "Pick Colors For Me — AI Color Suggestion | ColorArchive" },
  description:
    "Can't decide on a color? Describe what you're designing and get curated palette suggestions from 5,000+ colors. Try 'coffee shop brand', 'tech startup', or 'wedding invitation'.",
  alternates: { canonical: "/pick-for-me/" },
  openGraph: {
    title: "Pick Colors For Me | ColorArchive",
    description: "Describe your project and get instant color palette suggestions from 5,000+ curated colors.",
    images: ["https://colorarchive.me/og-image-v1.png"],
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Pick Colors For Me",
  applicationCategory: "DesignApplication",
  operatingSystem: "Any",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  url: "https://colorarchive.me/pick-for-me/",
  description:
    "Describe what you're designing and get curated color palette suggestions instantly. Powered by 5,000+ algorithmically named colors.",
};

const breadcrumbData = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "ColorArchive", item: "https://colorarchive.me/" },
    { "@type": "ListItem", position: 2, name: "Pick For Me", item: "https://colorarchive.me/pick-for-me/" },
  ],
};

export default function PickForMeRoute() {
  return (
    <>
      <SiteHeader currentPath="/pick-for-me" />
      <StructuredDataScript data={[structuredData, breadcrumbData]} />
      <PickForMePage colors={colors} collections={collections} />
    </>
  );
}
