import { Suspense } from "react";
import type { Metadata } from "next";
import { SiteHeader } from "@/src/components/site-header";
import { StructuredDataScript } from "@/src/components/structured-data-script";
import { ContrastCheckerPage } from "@/src/components/contrast-page";

export const metadata: Metadata = {
  title: { absolute: "WCAG Contrast Checker — ColorArchive" },
  description:
    "Free WCAG contrast ratio checker. Enter any two hex colors and see AA/AAA compliance for normal text, large text, and UI components in real time.",
  alternates: {
    canonical: "/contrast/",
  },
  openGraph: {
    title: "WCAG Contrast Checker — ColorArchive",
    description:
      "Free WCAG contrast ratio checker. Enter any two hex colors and see AA/AAA compliance for normal text, large text, and UI components in real time.",
    images: ["https://colorarchive.me/og-image-v1.png"],
  },
  twitter: {
    title: "WCAG Contrast Checker — ColorArchive",
    description:
      "Free WCAG contrast ratio checker. Enter any two hex colors and see AA/AAA compliance in real time.",
    images: ["https://colorarchive.me/og-image-v1.png"],
  },
};

const contrastStructuredData = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "WCAG Contrast Checker",
  applicationCategory: "DesignApplication",
  operatingSystem: "Any",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  url: "https://colorarchive.me/contrast/",
  description:
    "Free WCAG contrast ratio checker. Enter any two hex colors and see AA/AAA compliance for normal text, large text, and UI components in real time.",
};

const breadcrumbData = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "ColorArchive", item: "https://colorarchive.me/" },
    { "@type": "ListItem", position: 2, name: "Contrast Checker", item: "https://colorarchive.me/contrast/" },
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
