import type { Metadata } from "next";
import { SiteHeader } from "@/src/components/site-header";
import { StructuredDataScript } from "@/src/components/structured-data-script";
import { ColorWheelPage } from "@/src/components/color-wheel-page";
import { SITE_URL } from "@/src/lib/site-config";

export const metadata: Metadata = {
  title: { absolute: "Color Wheel — Interactive Harmony Picker | ColorArchive" },
  description:
    "An interactive color wheel: drag to pick a base hue and explore complementary, analogous, triadic, tetradic, and split-complementary harmonies — every point snapped to a named ColorArchive color.",
  alternates: {
    canonical: "/color-wheel/",
  },
  keywords: [
    "color wheel",
    "color wheel chart",
    "complementary colors wheel",
    "color wheel picker",
    "color harmony wheel",
  ],
  openGraph: {
    title: "Color Wheel — Interactive Harmony Picker | ColorArchive",
    description:
      "Drag around an interactive color wheel and explore five classic harmonies, snapped to named archive colors.",
    images: [`${SITE_URL}/og-image-v1.png`],
  },
  twitter: {
    title: "Color Wheel — Interactive Harmony Picker | ColorArchive",
    description:
      "Drag around an interactive color wheel and explore five classic harmonies, snapped to named archive colors.",
    images: [`${SITE_URL}/og-image-v1.png`],
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Color Wheel",
  applicationCategory: "DesignApplication",
  operatingSystem: "Any",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  url: `${SITE_URL}/color-wheel/`,
  description:
    "Interactive HSL color wheel with complementary, analogous, triadic, tetradic and split-complementary harmony overlays, cross-linked to 5,446 named colors.",
};

const breadcrumbData = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "ColorArchive", item: `${SITE_URL}/` },
    { "@type": "ListItem", position: 2, name: "Tools", item: `${SITE_URL}/tools/` },
    { "@type": "ListItem", position: 3, name: "Color Wheel", item: `${SITE_URL}/color-wheel/` },
  ],
};

export default function ColorWheelRoute() {
  return (
    <>
      <SiteHeader currentPath="/color-wheel" />
      <StructuredDataScript data={[structuredData, breadcrumbData]} />
      <ColorWheelPage />
    </>
  );
}
