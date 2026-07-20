import type { Metadata } from "next";
import { SiteHeader } from "@/src/components/site-header";
import { StructuredDataScript } from "@/src/components/structured-data-script";
import { ScreenTestPage } from "@/src/components/screen-test-page";
import { SITE_URL } from "@/src/lib/site-config";

export const metadata: Metadata = {
  title: { absolute: "Screen Test — Check Your Display Online | ColorArchive" },
  description:
    "Free online screen test: check for dead pixels, backlight bleed, black level and highlight detail, and see what your browser reports about your display. Runs locally, no upload.",
  alternates: {
    canonical: "/screen-test/",
  },
  keywords: [
    "screen test",
    "monitor test online",
    "display test",
    "backlight bleed test",
    "black level test",
    "screen check",
  ],
  openGraph: {
    title: "Screen Test — Check Your Display Online | ColorArchive",
    description:
      "Free online screen test: dead pixels, backlight bleed, shadow and highlight detail, plus a browser-reported screen report. Runs locally.",
    images: [`${SITE_URL}/og-image-v1.png`],
  },
  twitter: {
    title: "Screen Test — Check Your Display Online | ColorArchive",
    description:
      "Free online screen test: dead pixels, backlight bleed, shadow and highlight detail, plus a browser-reported screen report. Runs locally.",
    images: [`${SITE_URL}/og-image-v1.png`],
  },
};

const screenTestStructuredData = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Screen Test",
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "Any",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  url: `${SITE_URL}/screen-test/`,
  description:
    "Free browser-based screen test: dead pixel check, backlight bleed and uniformity fields, near-black and near-white step wedges, and a report of what the browser says about the display.",
};

const breadcrumbData = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "ColorArchive", item: `${SITE_URL}/` },
    { "@type": "ListItem", position: 2, name: "Tools", item: `${SITE_URL}/tools/` },
    { "@type": "ListItem", position: 3, name: "Screen Test", item: `${SITE_URL}/screen-test/` },
  ],
};

export default function ScreenTestRoute() {
  return (
    <>
      <SiteHeader currentPath="/screen-test" />
      <StructuredDataScript data={[screenTestStructuredData, breadcrumbData]} />
      <ScreenTestPage />
    </>
  );
}
