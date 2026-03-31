import type { Metadata } from "next";
import { SiteHeader } from "@/src/components/site-header";
import { StructuredDataScript } from "@/src/components/structured-data-script";
import { BrandGeneratorPage } from "@/src/components/brand-generator-page";
import { colors } from "@/src/data/colors";
import { collections } from "@/src/lib/collections";

export const metadata: Metadata = {
  title: { absolute: "AI Brand Color Generator — Generate Your Brand Palette | ColorArchive" },
  description:
    "Describe your brand and let AI generate a full 6-color brand palette — primary, secondary, neutrals, and highlight. Get hex codes, names, and rationale for every color.",
  alternates: { canonical: "/brand-generator/" },
  openGraph: {
    title: "AI Brand Color Generator | ColorArchive",
    description:
      "Describe your brand and get a complete AI-generated brand palette with primary, accent, and neutral colors. Free to try.",
    images: ["https://colorarchive.me/og-image-v1.png"],
  },
  twitter: {
    title: "AI Brand Color Generator | ColorArchive",
    description:
      "Input your brand keywords and get a 6-color AI-generated palette with rationale for every color.",
    images: ["https://colorarchive.me/og-image-v1.png"],
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "AI Brand Color Generator",
  applicationCategory: "DesignApplication",
  operatingSystem: "Any",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  url: "https://colorarchive.me/brand-generator/",
  description:
    "Describe your brand and let AI generate a full 6-color brand palette — primary, secondary, neutrals, and highlight. Get hex codes, names, and rationale for every color.",
};

const breadcrumbData = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "ColorArchive", item: "https://colorarchive.me/" },
    { "@type": "ListItem", position: 2, name: "Brand Generator", item: "https://colorarchive.me/brand-generator/" },
  ],
};

export default function BrandGeneratorRoute() {
  return (
    <>
      <SiteHeader currentPath="/brand-generator" />
      <StructuredDataScript data={[structuredData, breadcrumbData]} />
      <BrandGeneratorPage
        archiveColors={colors}
        collectionPresets={collections.slice(0, 8).map((c) => ({
          id: c.id,
          title: c.title,
          style: c.promptWords.slice(0, 3).join(", "),
          summary: c.summary,
        }))}
      />
    </>
  );
}
