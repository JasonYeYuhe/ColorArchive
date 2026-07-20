import { Suspense } from "react";
import type { Metadata } from "next";
import { SiteHeader } from "@/src/components/site-header";
import { StructuredDataScript } from "@/src/components/structured-data-script";
import { ColorConverterPage } from "@/src/components/color-converter-page";
import { SITE_URL } from "@/src/lib/site-config";

export const metadata: Metadata = {
  title: { absolute: "Color Converter — HEX, RGB, HSL, OKLCH, LAB, CMYK | ColorArchive" },
  description:
    "Free online color converter. Instantly convert any color between HEX, RGB, HSL, HSB/HSV, CMYK, OKLCH, OKLab, CIE Lab and LCH (CSS Color 4). Live preview and nearest archive color.",
  alternates: {
    canonical: "/convert/",
  },
  keywords: [
    "color converter",
    "hex to rgb",
    "oklch converter",
    "hex to oklch",
    "rgb to lab",
    "hex to hsl",
    "css color 4",
  ],
  openGraph: {
    title: "Color Converter — HEX, RGB, HSL, OKLCH, LAB, CMYK | ColorArchive",
    description:
      "Free online color converter. Convert between HEX, RGB, HSL, HSB/HSV, CMYK, OKLCH, OKLab, CIE Lab and LCH with live preview.",
    images: [`${SITE_URL}/og-image-v1.png`],
  },
  twitter: {
    title: "Color Converter — HEX to RGB, HSL, OKLCH, LAB | ColorArchive",
    description:
      "Free online color converter. HEX, RGB, HSL, HSB, CMYK, OKLCH, OKLab, CIE Lab and LCH — instantly, with live preview.",
    images: [`${SITE_URL}/og-image-v1.png`],
  },
};

const converterStructuredData = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Color Converter",
  applicationCategory: "DesignApplication",
  operatingSystem: "Any",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  url: `${SITE_URL}/convert/`,
  description:
    "Free online color converter. Convert any color between HEX, RGB, HSL, HSB/HSV, and CMYK formats with instant live preview.",
};

const breadcrumbData = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "ColorArchive", item: `${SITE_URL}/` },
    { "@type": "ListItem", position: 2, name: "Color Converter", item: `${SITE_URL}/convert/` },
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
