import type { Metadata } from "next";
import { SiteHeader } from "@/src/components/site-header";
import { StructuredDataScript } from "@/src/components/structured-data-script";
import { UrlAnalyzerPage } from "@/src/components/url-analyzer-page";

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
  url: "https://colorarchive.me/analyze/",
  description:
    "Paste any URL to extract and analyze its color palette. Find matching ColorArchive colors and get AI-powered design critiques.",
};

const breadcrumbData = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "ColorArchive", item: "https://colorarchive.me/" },
    { "@type": "ListItem", position: 2, name: "Analyze", item: "https://colorarchive.me/analyze/" },
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
