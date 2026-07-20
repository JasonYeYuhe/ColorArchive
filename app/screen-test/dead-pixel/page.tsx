import type { Metadata } from "next";
import { SiteHeader } from "@/src/components/site-header";
import { StructuredDataScript } from "@/src/components/structured-data-script";
import { DeadPixelTestPage } from "@/src/components/dead-pixel-test-page";
import { SITE_URL } from "@/src/lib/site-config";

export const metadata: Metadata = {
  title: { absolute: "Dead Pixel Test — Find Dead & Stuck Pixels Online | ColorArchive" },
  description:
    "Free dead pixel test: cycle fullscreen solid colors to spot dead or stuck pixels on any screen. Works on monitors, laptops, phones and tablets. Runs locally in your browser.",
  alternates: {
    canonical: "/screen-test/dead-pixel/",
  },
  keywords: [
    "dead pixel test",
    "stuck pixel test",
    "dead pixel checker",
    "screen pixel test",
    "dead pixel fix",
  ],
  openGraph: {
    title: "Dead Pixel Test — Find Dead & Stuck Pixels Online | ColorArchive",
    description:
      "Cycle fullscreen solid colors to spot dead or stuck pixels on any screen. Free, runs locally in your browser.",
    images: [`${SITE_URL}/og-image-v1.png`],
  },
  twitter: {
    title: "Dead Pixel Test — Find Dead & Stuck Pixels Online | ColorArchive",
    description:
      "Cycle fullscreen solid colors to spot dead or stuck pixels on any screen. Free, runs locally in your browser.",
    images: [`${SITE_URL}/og-image-v1.png`],
  },
};

const deadPixelStructuredData = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Dead Pixel Test",
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "Any",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  url: `${SITE_URL}/screen-test/dead-pixel/`,
  description:
    "Fullscreen solid-color cycling to reveal dead and stuck pixels, with guidance on telling defects apart from dust and on warranty standards.",
};

const breadcrumbData = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "ColorArchive", item: `${SITE_URL}/` },
    { "@type": "ListItem", position: 2, name: "Screen Test", item: `${SITE_URL}/screen-test/` },
    { "@type": "ListItem", position: 3, name: "Dead Pixel Test", item: `${SITE_URL}/screen-test/dead-pixel/` },
  ],
};

export default function DeadPixelRoute() {
  return (
    <>
      <SiteHeader currentPath="/screen-test" />
      <StructuredDataScript data={[deadPixelStructuredData, breadcrumbData]} />
      <DeadPixelTestPage />
    </>
  );
}
