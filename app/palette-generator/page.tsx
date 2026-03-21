import type { Metadata } from "next";
import { SiteHeader } from "@/src/components/site-header";
import { StructuredDataScript } from "@/src/components/structured-data-script";
import { PaletteGeneratorPage } from "@/src/components/palette-generator-page";

export const metadata: Metadata = {
  title: { absolute: "Color Palette Generator — Create Harmonious Palettes | ColorArchive" },
  description: "Generate beautiful color palettes from any seed color. Get complementary, analogous, triadic, and split-complementary harmonies with CSS, Tailwind, and JSON exports.",
  alternates: { canonical: "/palette-generator/" },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Color Palette Generator",
  applicationCategory: "DesignApplication",
  operatingSystem: "Any",
  offers: { "@type": "Offer", price: "0", priceCurrency: "JPY" },
  url: "https://colorarchive.me/palette-generator/",
  description: "Generate harmonious color palettes from any seed color with complementary, analogous, triadic, and split-complementary harmonies.",
  breadcrumb: {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://colorarchive.me" },
      { "@type": "ListItem", position: 2, name: "Palette Generator", item: "https://colorarchive.me/palette-generator/" },
    ],
  },
};

export default function PaletteGeneratorRoute() {
  return (
    <>
      <StructuredDataScript data={structuredData} />
      <SiteHeader currentPath="/palette-generator" />
      <PaletteGeneratorPage />
    </>
  );
}
