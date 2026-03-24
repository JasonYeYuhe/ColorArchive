import type { Metadata } from "next";
import { SiteHeader } from "@/src/components/site-header";
import { UrlAnalyzerPage } from "@/src/components/url-analyzer-page";

export const metadata: Metadata = {
  title: "Brand Color Analyzer",
  description:
    "Paste any URL to extract and analyze its color palette. Find matching ColorArchive colors and get AI-powered design critiques.",
  alternates: { canonical: "/analyze/" },
};

export default function AnalyzeRoute() {
  return (
    <>
      <SiteHeader currentPath="/analyze" />
      <UrlAnalyzerPage />
    </>
  );
}
