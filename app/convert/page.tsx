import { Suspense } from "react";
import type { Metadata } from "next";
import { SiteHeader } from "@/src/components/site-header";
import { StructuredDataScript } from "@/src/components/structured-data-script";
import { ColorConverterPage } from "@/src/components/color-converter-page";

export const metadata: Metadata = {
  title: { absolute: "Color Converter — HEX, RGB, HSL, HSB, CMYK | ColorArchive" },
  description:
    "Free online color converter. Instantly convert any color between HEX, RGB, HSL, HSB/HSV, and CMYK formats. See live preview and find the nearest color in the ColorArchive palette.",
  alternates: {
    canonical: "/convert/",
  },
  openGraph: {
    title: "Color Converter — HEX, RGB, HSL, HSB, CMYK | ColorArchive",
    description:
      "Free online color converter. Instantly convert any color between HEX, RGB, HSL, HSB/HSV, and CMYK formats with live preview.",
    images: ["https://colorarchive.me/og-image-v1.png"],
  },
  twitter: {
    title: "Color Converter — HEX to RGB, HSL, HSB, CMYK | ColorArchive",
    description:
      "Free online color converter. Convert HEX, RGB, HSL, HSB, and CMYK instantly with live preview.",
    images: ["https://colorarchive.me/og-image-v1.png"],
  },
};

const converterStructuredData = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Color Converter",
  applicationCategory: "DesignApplication",
  operatingSystem: "Any",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  url: "https://colorarchive.me/convert/",
  description:
    "Free online color converter. Convert any color between HEX, RGB, HSL, HSB/HSV, and CMYK formats with instant live preview.",
};

const breadcrumbData = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "ColorArchive", item: "https://colorarchive.me/" },
    { "@type": "ListItem", position: 2, name: "Color Converter", item: "https://colorarchive.me/convert/" },
  ],
};

export default function ConvertPage() {
  return (
    <>
      <SiteHeader currentPath="/convert" />
      <StructuredDataScript data={[converterStructuredData, breadcrumbData]} />
      <Suspense fallback={<main className="px-4 py-8 text-sm text-neutral-500">Loading converter…</main>}>
        <ColorConverterPage />
      </Suspense>
    </>
  );
}
