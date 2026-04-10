import type { Metadata } from "next";
import { Suspense } from "react";
import { SiteHeader } from "@/src/components/site-header";
import { StructuredDataScript } from "@/src/components/structured-data-script";
import { ColorComparePage } from "@/src/components/color-compare-page";
import { SITE_URL } from "@/src/lib/site-config";

export const metadata: Metadata = {
  title: { absolute: "Compare Two Colors Side by Side | ColorArchive" },
  description: "Compare any two colors side by side. See HEX, RGB, HSL values, contrast ratio, WCAG compliance, and visual preview in one place.",
  alternates: { canonical: "/compare/" },
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
