import type { Metadata } from "next";
import { Suspense } from "react";
import { SiteHeader } from "@/src/components/site-header";
import { StructuredDataScript } from "@/src/components/structured-data-script";
import { ColorComparePage } from "@/src/components/color-compare-page";
import { SITE_URL } from "@/src/lib/site-config";

export const metadata: Metadata = {
  title: { absolute: "Compare Two Colors — Delta E & Contrast Checker | ColorArchive" },
  description:
    "Compare any two colors side by side: Delta E color difference (CIEDE2000), WCAG contrast ratio, HEX/RGB/HSL values, and a plain-English read of how different they really look.",
  alternates: { canonical: "/compare/" },
  keywords: [
    "delta e calculator",
    "color difference calculator",
    "ciede2000",
    "compare two colors",
    "color contrast checker",
  ],
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Color Comparison Tool",
  applicationCategory: "DesignApplication",
  operatingSystem: "Any",
  offers: { "@type": "Offer", price: "0", priceCurrency: "JPY" },
  url: `${SITE_URL}/compare/`,
  description: "Compare any two colors side by side with HEX, RGB, HSL values and WCAG contrast ratio.",
  breadcrumb: {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Compare Colors", item: `${SITE_URL}/compare/` },
    ],
  },
};

export default function CompareRoute() {
  return (
    <>
      <StructuredDataScript data={structuredData} />
      <SiteHeader currentPath="/compare" />
      <Suspense fallback={<main className="px-4 py-8 text-sm text-neutral-500">Loading...</main>}>
        <ColorComparePage />
      </Suspense>
    </>
  );
}
