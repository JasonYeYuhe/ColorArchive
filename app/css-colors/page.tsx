import { Suspense } from "react";
import type { Metadata } from "next";
import { SiteHeader } from "@/src/components/site-header";
import { StructuredDataScript } from "@/src/components/structured-data-script";
import { CssColorsPage } from "@/src/components/css-colors-page";
import { SITE_URL } from "@/src/lib/site-config";

export const metadata: Metadata = {
  title: { absolute: "CSS Named Colors — Complete Reference with HEX, RGB, HSL | ColorArchive" },
  description:
    "Complete reference for all 148 CSS named color keywords. Every color from CSS Level 1 through CSS4, with hex, RGB, and HSL values. Search, filter by family, and copy values instantly.",
  alternates: { canonical: "/css-colors/" },
  openGraph: {
    title: "CSS Named Colors — Complete Reference | ColorArchive",
    description:
      "All 148 CSS named colors with hex, RGB, and HSL values. From CSS1 basics to rebeccapurple. Search and filter by color family.",
    images: [`${SITE_URL}/og-image-v1.png`],
  },
  twitter: {
    title: "CSS Named Colors Reference | ColorArchive",
    description:
      "All 148 CSS named colors with hex, RGB, and HSL values. Search, filter, and copy instantly.",
    images: [`${SITE_URL}/og-image-v1.png`],
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "CSS Named Colors Reference",
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Any",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  url: `${SITE_URL}/css-colors/`,
  description:
    "Complete reference for all 148 CSS named color keywords with hex, RGB, and HSL values. Searchable and filterable by color family and CSS level.",
};

const breadcrumbData = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "ColorArchive", item: `${SITE_URL}/` },
    { "@type": "ListItem", position: 2, name: "Tools", item: `${SITE_URL}/tools/` },
    { "@type": "ListItem", position: 3, name: "CSS Named Colors", item: `${SITE_URL}/css-colors/` },
  ],
};

export default function CssColorsRoute() {
  return (
    <>
      <SiteHeader currentPath="/css-colors" />
      <StructuredDataScript data={[structuredData, breadcrumbData]} />
      <Suspense fallback={<main className="px-4 py-8 text-sm text-neutral-500">Loading CSS colors…</main>}>
        <CssColorsPage />
      </Suspense>
    </>
  );
}
