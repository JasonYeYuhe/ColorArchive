import type { Metadata } from "next";
import { SiteHeader } from "@/src/components/site-header";
import { StructuredDataScript } from "@/src/components/structured-data-script";
import { PaletteGeneratorPage } from "@/src/components/palette-generator-page";

export const metadata: Metadata = {
  title: { absolute: "Free Color Palette Generator — Create & Export | ColorArchive" },
  description: "Generate beautiful color palettes instantly. Choose complementary, analogous, or triadic harmonies. Export to CSS, Tailwind, JSON. Free online tool, no sign-up.",
  alternates: { canonical: "/palette-generator/" },
  keywords: ["color palette generator", "palette maker", "color harmony", "CSS palette", "Tailwind colors", "free color tool"],
  openGraph: {
    title: "Free Color Palette Generator — Create & Export | ColorArchive",
    description: "Generate beautiful color palettes instantly. Choose complementary, analogous, or triadic harmonies. Export to CSS, Tailwind, JSON. Free online tool, no sign-up.",
    images: ["https://colorarchive.me/og-image-v1.png"],
  },
  twitter: {
    title: "Free Color Palette Generator — Create & Export | ColorArchive",
    description: "Generate beautiful color palettes instantly. Choose complementary, analogous, or triadic harmonies. Export to CSS, Tailwind, JSON. Free online tool, no sign-up.",
    images: ["https://colorarchive.me/og-image-v1.png"],
  },
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
      <SiteHeader currentPath="/palette" />
      <PaletteGeneratorPage />
    </>
  );
}
