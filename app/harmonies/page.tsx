import type { Metadata } from "next";
import { SiteHeader } from "@/src/components/site-header";
import { StructuredDataScript } from "@/src/components/structured-data-script";
import { ColorHarmoniesPage } from "@/src/components/color-harmonies-page";

export const metadata: Metadata = {
  title: { absolute: "Color Harmonies Calculator — Complementary, Triadic, Analogous | ColorArchive" },
  description: "Calculate color harmonies from any hex color. See complementary, analogous, triadic, tetradic, split-complementary, and monochromatic relationships on an interactive color wheel.",
  alternates: { canonical: "/harmonies/" },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Color Harmonies Calculator",
  applicationCategory: "DesignApplication",
  operatingSystem: "Any",
  offers: { "@type": "Offer", price: "0", priceCurrency: "JPY" },
  url: "https://colorarchive.me/harmonies/",
  description: "Calculate color harmonies from any hex color. Interactive color wheel with 6 harmony types.",
  breadcrumb: {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://colorarchive.me" },
      { "@type": "ListItem", position: 2, name: "Color Harmonies", item: "https://colorarchive.me/harmonies/" },
    ],
  },
};

export default function HarmoniesRoute() {
  return (
    <>
      <StructuredDataScript data={structuredData} />
      <SiteHeader currentPath="/harmonies" />
      <ColorHarmoniesPage />
    </>
  );
}
