import type { Metadata } from "next";
import { SiteHeader } from "@/src/components/site-header";
import { StructuredDataScript } from "@/src/components/structured-data-script";
import { ColorTemperaturePage } from "@/src/components/color-temperature-page";
import { SITE_URL } from "@/src/lib/site-config";

export const metadata: Metadata = {
  title: { absolute: "Color Temperature Converter — Kelvin to RGB | ColorArchive" },
  description:
    "Convert Kelvin color temperature to RGB and HEX: candlelight 1900K to deep sky 10000K, with lighting presets, warm/cool labels, and the nearest named archive color.",
  alternates: {
    canonical: "/color-temperature/",
  },
  keywords: [
    "kelvin to rgb",
    "color temperature converter",
    "color temperature chart",
    "kelvin to hex",
    "warm white vs cool white",
  ],
  openGraph: {
    title: "Color Temperature Converter — Kelvin to RGB | ColorArchive",
    description:
      "Kelvin → RGB/HEX with lighting presets from candlelight to deep sky, plus warm/cool guidance.",
    images: [`${SITE_URL}/og-image-v1.png`],
  },
  twitter: {
    title: "Color Temperature Converter — Kelvin to RGB | ColorArchive",
    description:
      "Kelvin → RGB/HEX with lighting presets from candlelight to deep sky, plus warm/cool guidance.",
    images: [`${SITE_URL}/og-image-v1.png`],
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Color Temperature Converter",
  applicationCategory: "DesignApplication",
  operatingSystem: "Any",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  url: `${SITE_URL}/color-temperature/`,
  description:
    "Kelvin color temperature to RGB/HEX conversion with lighting presets, using the classic black-body approximation.",
};

const breadcrumbData = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "ColorArchive", item: `${SITE_URL}/` },
    { "@type": "ListItem", position: 2, name: "Tools", item: `${SITE_URL}/tools/` },
    { "@type": "ListItem", position: 3, name: "Color Temperature", item: `${SITE_URL}/color-temperature/` },
  ],
};

export default function ColorTemperatureRoute() {
  return (
    <>
      <SiteHeader currentPath="/color-temperature" />
      <StructuredDataScript data={[structuredData, breadcrumbData]} />
      <ColorTemperaturePage />
    </>
  );
}
