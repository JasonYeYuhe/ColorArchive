import { Suspense } from "react";
import type { Metadata } from "next";
import { SiteHeader } from "@/src/components/site-header";
import { StructuredDataScript } from "@/src/components/structured-data-script";
import { ColorBlindSimulatorPage } from "@/src/components/colorblind-page";

export const metadata: Metadata = {
  title: { absolute: "Color Blindness Simulator — Test Color Accessibility | ColorArchive" },
  description:
    "Simulate how colors appear with protanopia, deuteranopia, tritanopia, and achromatopsia. Test palettes for color blindness accessibility. Free online tool.",
  alternates: {
    canonical: "/colorblind/",
  },
  keywords: ["color blindness simulator", "color blind test", "protanopia", "deuteranopia", "color accessibility"],
  openGraph: {
    title: "Color Blindness Simulator — Test Color Accessibility | ColorArchive",
    description:
      "Simulate how colors appear with protanopia, deuteranopia, tritanopia, and achromatopsia. Test palettes for color blindness accessibility. Free online tool.",
    images: ["https://colorarchive.me/og-image-v1.png"],
  },
  twitter: {
    title: "Color Blindness Simulator — Test Color Accessibility | ColorArchive",
    description:
      "Simulate how colors appear with protanopia, deuteranopia, tritanopia, and achromatopsia. Test palettes for color blindness accessibility. Free online tool.",
    images: ["https://colorarchive.me/og-image-v1.png"],
  },
};

const toolStructuredData = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Color Blindness Simulator",
  applicationCategory: "DesignApplication",
  operatingSystem: "Any",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  url: "https://colorarchive.me/colorblind/",
  description:
    "Simulate how colors appear to people with deuteranopia, protanopia, tritanopia, and achromatopsia. Free color accessibility tool for designers.",
};

const breadcrumbData = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "ColorArchive", item: "https://colorarchive.me/" },
    {
      "@type": "ListItem",
      position: 2,
      name: "Color Blindness Simulator",
      item: "https://colorarchive.me/colorblind/",
    },
  ],
};

export default function ColorBlindPage() {
  return (
    <>
      <SiteHeader currentPath="/colorblind" />
      <StructuredDataScript data={[toolStructuredData, breadcrumbData]} />
      <Suspense
        fallback={
          <main className="px-4 py-8 text-sm text-neutral-500">Loading simulator…</main>
        }
      >
        <ColorBlindSimulatorPage />
      </Suspense>
    </>
  );
}
