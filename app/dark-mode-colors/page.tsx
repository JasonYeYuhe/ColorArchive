import type { Metadata } from "next";
import { SiteHeader } from "@/src/components/site-header";
import { StructuredDataScript } from "@/src/components/structured-data-script";
import { DarkModeColorsPage } from "@/src/components/dark-mode-colors-page";
import { SITE_URL } from "@/src/lib/site-config";

export const metadata: Metadata = {
  title: { absolute: "Dark Mode Palette Converter — Light to Dark Colors | ColorArchive" },
  description:
    "Paste a light-mode palette and get a tuned dark-mode counterpart: lightness flipped around midtones, saturation eased against neon glare, exported as CSS variables or Tailwind config.",
  alternates: {
    canonical: "/dark-mode-colors/",
  },
  keywords: [
    "dark mode colors",
    "dark mode color palette",
    "light to dark mode converter",
    "dark theme colors css",
    "dark mode css variables",
  ],
  openGraph: {
    title: "Dark Mode Palette Converter — Light to Dark Colors | ColorArchive",
    description:
      "Convert a light-mode palette into a tuned dark-mode counterpart with CSS variable and Tailwind exports.",
    images: [`${SITE_URL}/og-image-v1.png`],
  },
  twitter: {
    title: "Dark Mode Palette Converter — Light to Dark Colors | ColorArchive",
    description:
      "Convert a light-mode palette into a tuned dark-mode counterpart with CSS variable and Tailwind exports.",
    images: [`${SITE_URL}/og-image-v1.png`],
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Dark Mode Palette Converter",
  applicationCategory: "DesignApplication",
  operatingSystem: "Any",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  url: `${SITE_URL}/dark-mode-colors/`,
  description:
    "Generates dark-mode counterparts for a light palette — hue-preserving lightness inversion with eased saturation — and exports CSS variables or a Tailwind config.",
};

const breadcrumbData = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "ColorArchive", item: `${SITE_URL}/` },
    { "@type": "ListItem", position: 2, name: "Tools", item: `${SITE_URL}/tools/` },
    { "@type": "ListItem", position: 3, name: "Dark Mode Colors", item: `${SITE_URL}/dark-mode-colors/` },
  ],
};

export default function DarkModeColorsRoute() {
  return (
    <>
      <SiteHeader currentPath="/dark-mode-colors" />
      <StructuredDataScript data={[structuredData, breadcrumbData]} />
      <DarkModeColorsPage />
    </>
  );
}
