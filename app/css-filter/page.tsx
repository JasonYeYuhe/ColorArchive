import type { Metadata } from "next";
import { SiteHeader } from "@/src/components/site-header";
import { StructuredDataScript } from "@/src/components/structured-data-script";
import { CssFilterPage } from "@/src/components/css-filter-page";
import { SITE_URL } from "@/src/lib/site-config";

export const metadata: Metadata = {
  title: { absolute: "CSS Filter Generator — HEX to Filter for Black Icons | ColorArchive" },
  description:
    "Turn black SVG or PNG icons any color with pure CSS. Enter a hex value and get a ready-to-paste filter chain (invert, sepia, saturate, hue-rotate, brightness, contrast) with a Delta E accuracy score.",
  alternates: {
    canonical: "/css-filter/",
  },
  keywords: [
    "css filter generator",
    "hex to css filter",
    "svg color filter",
    "recolor black svg css",
    "css filter color",
  ],
  openGraph: {
    title: "CSS Filter Generator — HEX to Filter for Black Icons | ColorArchive",
    description:
      "Recolor black icons with a generated CSS filter chain, scored with Delta E accuracy.",
    images: [`${SITE_URL}/og-image-v1.png`],
  },
  twitter: {
    title: "CSS Filter Generator — HEX to Filter for Black Icons | ColorArchive",
    description:
      "Recolor black icons with a generated CSS filter chain, scored with Delta E accuracy.",
    images: [`${SITE_URL}/og-image-v1.png`],
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "CSS Filter Generator",
  applicationCategory: "DesignApplication",
  operatingSystem: "Any",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  url: `${SITE_URL}/css-filter/`,
  description:
    "Generates a CSS filter chain that transforms pure black into any target color — the standard trick for recoloring black icon assets without editing them.",
};

const breadcrumbData = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "ColorArchive", item: `${SITE_URL}/` },
    { "@type": "ListItem", position: 2, name: "Tools", item: `${SITE_URL}/tools/` },
    { "@type": "ListItem", position: 3, name: "CSS Filter Generator", item: `${SITE_URL}/css-filter/` },
  ],
};

export default function CssFilterRoute() {
  return (
    <>
      <SiteHeader currentPath="/css-filter" />
      <StructuredDataScript data={[structuredData, breadcrumbData]} />
      <CssFilterPage />
    </>
  );
}
