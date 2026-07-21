import type { Metadata } from "next";
import { SiteHeader } from "@/src/components/site-header";
import { StructuredDataScript } from "@/src/components/structured-data-script";
import { DuotonePage } from "@/src/components/duotone-page";
import { SITE_URL } from "@/src/lib/site-config";

export const metadata: Metadata = {
  title: { absolute: "Duotone Generator — Two-Color Image Effect Online | ColorArchive" },
  description:
    "Free duotone image generator: upload a photo, pick shadow and highlight colors, and download the two-tone result. Processed entirely in your browser — nothing is uploaded.",
  alternates: {
    canonical: "/duotone/",
  },
  keywords: [
    "duotone generator",
    "duotone effect online",
    "duotone image maker",
    "two color image effect",
    "spotify duotone",
  ],
  openGraph: {
    title: "Duotone Generator — Two-Color Image Effect Online | ColorArchive",
    description:
      "Upload a photo, pick two colors, download the duotone. Local processing, curated color presets.",
    images: [`${SITE_URL}/og-image-v1.png`],
  },
  twitter: {
    title: "Duotone Generator — Two-Color Image Effect Online | ColorArchive",
    description:
      "Upload a photo, pick two colors, download the duotone. Local processing, curated color presets.",
    images: [`${SITE_URL}/og-image-v1.png`],
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Duotone Generator",
  applicationCategory: "DesignApplication",
  operatingSystem: "Any",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  url: `${SITE_URL}/duotone/`,
  description:
    "Browser-local duotone image effect: luminance mapped onto a shadow→highlight color ramp with adjustable contrast and PNG export.",
};

const breadcrumbData = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "ColorArchive", item: `${SITE_URL}/` },
    { "@type": "ListItem", position: 2, name: "Tools", item: `${SITE_URL}/tools/` },
    { "@type": "ListItem", position: 3, name: "Duotone", item: `${SITE_URL}/duotone/` },
  ],
};

export default function DuotoneRoute() {
  return (
    <>
      <SiteHeader currentPath="/duotone" />
      <StructuredDataScript data={[structuredData, breadcrumbData]} />
      <DuotonePage />
    </>
  );
}
