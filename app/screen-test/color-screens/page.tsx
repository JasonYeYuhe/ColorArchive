import { Suspense } from "react";
import type { Metadata } from "next";
import { SiteHeader } from "@/src/components/site-header";
import { StructuredDataScript } from "@/src/components/structured-data-script";
import { ColorScreensPage } from "@/src/components/color-screens-page";
import { SITE_URL } from "@/src/lib/site-config";

export const metadata: Metadata = {
  title: { absolute: "White Screen, Black Screen & Color Screens — Fullscreen Any Color | ColorArchive" },
  description:
    "Fullscreen white screen, black screen, or any color — for cleaning, lighting, tracing, stuck-pixel checks and backlight tests. Supports any hex or 5,446 named archive colors.",
  alternates: {
    // ?color= variants canonicalize here — no crawlable parameter space.
    canonical: "/screen-test/color-screens/",
  },
  keywords: [
    "white screen",
    "black screen test",
    "blue screen full screen",
    "green screen online",
    "color screen",
  ],
  openGraph: {
    title: "White Screen, Black Screen & Color Screens | ColorArchive",
    description:
      "Fullscreen any color — white for light, black for bleed checks, RGB for stuck pixels, or any of 5,446 named colors.",
    images: [`${SITE_URL}/og-image-v1.png`],
  },
  twitter: {
    title: "White Screen, Black Screen & Color Screens | ColorArchive",
    description:
      "Fullscreen any color — white for light, black for bleed checks, RGB for stuck pixels, or any of 5,446 named colors.",
    images: [`${SITE_URL}/og-image-v1.png`],
  },
};

const colorScreensStructuredData = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Color Screens",
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "Any",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  url: `${SITE_URL}/screen-test/color-screens/`,
  description:
    "One-click fullscreen solid color screens: white, black, RGB primaries, custom hex values, and every named ColorArchive color via the color parameter.",
};

const breadcrumbData = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "ColorArchive", item: `${SITE_URL}/` },
    { "@type": "ListItem", position: 2, name: "Screen Test", item: `${SITE_URL}/screen-test/` },
    { "@type": "ListItem", position: 3, name: "Color Screens", item: `${SITE_URL}/screen-test/color-screens/` },
  ],
};

export default function ColorScreensRoute() {
  return (
    <>
      <SiteHeader currentPath="/screen-test" />
      <StructuredDataScript data={[colorScreensStructuredData, breadcrumbData]} />
      {/* Suspense required: the client component reads ?color= via useSearchParams. */}
      <Suspense fallback={<main className="px-4 py-8 text-sm text-neutral-500">Loading…</main>}>
        <ColorScreensPage />
      </Suspense>
    </>
  );
}
