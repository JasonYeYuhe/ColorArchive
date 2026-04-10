import { Suspense } from "react";
import type { Metadata } from "next";
import { SiteHeader } from "@/src/components/site-header";
import { StructuredDataScript } from "@/src/components/structured-data-script";
import { ContrastCheckerPage } from "@/src/components/contrast-page";
import { SITE_URL } from "@/src/lib/site-config";

export const metadata: Metadata = {
  title: { absolute: "Color Contrast Checker — WCAG AA/AAA Compliance | ColorArchive" },
  description:
    "Check WCAG contrast ratios between any two colors. See AA and AAA compliance for text, large text, and UI. Real-time results. Free accessibility tool.",
  alternates: {
    canonical: "/contrast/",
  },
  keywords: ["color contrast checker", "WCAG contrast", "contrast ratio", "AA AAA compliance", "accessibility checker"],
  openGraph: {
    title: "Color Contrast Checker — WCAG AA/AAA Compliance | ColorArchive",
    description:
      "Check WCAG contrast ratios between any two colors. See AA and AAA compliance for text, large text, and UI. Real-time results. Free accessibility tool.",
    images: [`${SITE_URL}/og-image-v1.png`],
  },
  twitter: {
    title: "Color Contrast Checker — WCAG AA/AAA Compliance | ColorArchive",
    description:
      "Check WCAG contrast ratios between any two colors. See AA and AAA compliance for text, large text, and UI. Real-time results. Free accessibility tool.",
    images: [`${SITE_URL}/og-image-v1.png`],
  },
};

const contrastStructuredData = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "WCAG Contrast Checker",
  applicationCategory: "DesignApplication",
  operatingSystem: "Any",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  url: `${SITE_URL}/contrast/`,
  description:
    "Free WCAG contrast ratio checker. Enter any two hex colors and see AA/AAA compliance for normal text, large text, and UI components in real time.",
};

const breadcrumbData = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "ColorArchive", item: `${SITE_URL}/` },
    { "@type": "ListItem", position: 2, name: "Contrast Checker", item: `${SITE_URL}/contrast/` },
  ],
};

export default function ContrastPage() {
  return (
    <>
      <SiteHeader currentPath="/contrast" />
      <StructuredDataScript data={[contrastStructuredData, breadcrumbData]} />
      <Suspense fallback={<main className="px-4 py-8 text-sm text-neutral-500">Loading checker…</main>}>
        <ContrastCheckerPage />
      </Suspense>
    </>
  );
}
