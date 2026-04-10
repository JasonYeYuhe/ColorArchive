import type { Metadata } from "next";
import { SiteHeader } from "@/src/components/site-header";
import { StructuredDataScript } from "@/src/components/structured-data-script";
import { UrlAnalyzerPage } from "@/src/components/url-analyzer-page";
import { SITE_URL } from "@/src/lib/site-config";

export const metadata: Metadata = {
  title: "Brand Color Analyzer",
  description:
    "Paste any URL to extract and analyze its color palette. Find matching ColorArchive colors and get AI-powered design critiques.",
  alternates: { canonical: "/analyze/" },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Brand Color Analyzer",
  applicationCategory: "DesignApplication",
  operatingSystem: "Any",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  url: `${SITE_URL}/analyze/`,
  description:
    "Paste any URL to extract and analyze its color palette. Find matching ColorArchive colors and get AI-powered design critiques.",
};

const breadcrumbData = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "ColorArchive", item: `${SITE_URL}/` },
    { "@type": "ListItem", position: 2, name: "Analyze", item: `${SITE_URL}/analyze/` },
  ],
};

export default function AnalyzeRoute() {
  return (
    <>
      <SiteHeader currentPath="/analyze" />
      <StructuredDataScript data={[structuredData, breadcrumbData]} />
      <UrlAnalyzerPage />
    </>
  );
}
