import type { Metadata } from "next";
import { SiteHeader } from "@/src/components/site-header";
import { StructuredDataScript } from "@/src/components/structured-data-script";
import { PaintMixPage } from "@/src/components/paint-mix-page";
import { SITE_URL } from "@/src/lib/site-config";

export const metadata: Metadata = {
  title: { absolute: "Paint Mixing Calculator — What Colors Make This? | ColorArchive" },
  description:
    "Enter any color and get paint mixing recipes from a classic five-paint set (cadmium red, cadmium yellow, ultramarine, white, black) with part-by-part ratios and accuracy scores.",
  alternates: {
    canonical: "/paint-mix/",
  },
  keywords: [
    "paint mixing calculator",
    "what colors make",
    "how to mix colors",
    "paint color mixer",
    "color mixing chart",
  ],
  openGraph: {
    title: "Paint Mixing Calculator — What Colors Make This? | ColorArchive",
    description:
      "Part-by-part paint recipes for any target color, from a classic five-paint artist set.",
    images: [`${SITE_URL}/og-image-v1.png`],
  },
  twitter: {
    title: "Paint Mixing Calculator — What Colors Make This? | ColorArchive",
    description:
      "Part-by-part paint recipes for any target color, from a classic five-paint artist set.",
    images: [`${SITE_URL}/og-image-v1.png`],
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Paint Mixing Calculator",
  applicationCategory: "DesignApplication",
  operatingSystem: "Any",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  url: `${SITE_URL}/paint-mix/`,
  description:
    "Subtractive-mixing approximation that searches part-by-part recipes over a classic artist paint set for any target color, scored with Delta E.",
};

const breadcrumbData = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "ColorArchive", item: `${SITE_URL}/` },
    { "@type": "ListItem", position: 2, name: "Tools", item: `${SITE_URL}/tools/` },
    { "@type": "ListItem", position: 3, name: "Paint Mixing", item: `${SITE_URL}/paint-mix/` },
  ],
};

export default function PaintMixRoute() {
  return (
    <>
      <SiteHeader currentPath="/paint-mix" />
      <StructuredDataScript data={[structuredData, breadcrumbData]} />
      <PaintMixPage />
    </>
  );
}
