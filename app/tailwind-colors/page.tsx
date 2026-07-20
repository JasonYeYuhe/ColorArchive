import type { Metadata } from "next";
import { SiteHeader } from "@/src/components/site-header";
import { StructuredDataScript } from "@/src/components/structured-data-script";
import { TailwindColorsPage } from "@/src/components/tailwind-colors-page";
import { SITE_URL } from "@/src/lib/site-config";

export const metadata: Metadata = {
  title: { absolute: "Tailwind Color Finder — HEX to Tailwind Class | ColorArchive" },
  description:
    "Find the closest Tailwind CSS class for any hex color (CIEDE2000-matched), and browse the full Tailwind v4 palette with every shade cross-named to its nearest ColorArchive color.",
  alternates: {
    canonical: "/tailwind-colors/",
  },
  keywords: [
    "tailwind colors",
    "hex to tailwind",
    "tailwind color finder",
    "tailwind css color palette",
    "closest tailwind color",
  ],
  openGraph: {
    title: "Tailwind Color Finder — HEX to Tailwind Class | ColorArchive",
    description:
      "Match any hex to its closest Tailwind CSS class and browse the full v4 palette, cross-named with ColorArchive colors.",
    images: [`${SITE_URL}/og-image-v1.png`],
  },
  twitter: {
    title: "Tailwind Color Finder — HEX to Tailwind Class | ColorArchive",
    description:
      "Match any hex to its closest Tailwind CSS class and browse the full v4 palette, cross-named with ColorArchive colors.",
    images: [`${SITE_URL}/og-image-v1.png`],
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Tailwind Color Finder",
  applicationCategory: "DesignApplication",
  operatingSystem: "Any",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  url: `${SITE_URL}/tailwind-colors/`,
  description:
    "Closest-Tailwind-class matcher for any hex color plus a browsable Tailwind v4 palette, generated from the official package values.",
};

const breadcrumbData = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "ColorArchive", item: `${SITE_URL}/` },
    { "@type": "ListItem", position: 2, name: "Tools", item: `${SITE_URL}/tools/` },
    { "@type": "ListItem", position: 3, name: "Tailwind Colors", item: `${SITE_URL}/tailwind-colors/` },
  ],
};

export default function TailwindColorsRoute() {
  return (
    <>
      <SiteHeader currentPath="/tailwind-colors" />
      <StructuredDataScript data={[structuredData, breadcrumbData]} />
      <TailwindColorsPage />
    </>
  );
}
