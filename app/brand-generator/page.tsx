import type { Metadata } from "next";
import { SiteHeader } from "@/src/components/site-header";
import { BrandGeneratorPage } from "@/src/components/brand-generator-page";

export const metadata: Metadata = {
  title: { absolute: "AI Brand Color Generator — Generate Your Brand Palette | ColorArchive" },
  description:
    "Describe your brand and let AI generate a full 6-color brand palette — primary, secondary, neutrals, and highlight. Get hex codes, names, and rationale for every color.",
  alternates: { canonical: "/brand-generator/" },
  openGraph: {
    title: "AI Brand Color Generator | ColorArchive",
    description:
      "Describe your brand and get a complete AI-generated brand palette with primary, accent, and neutral colors. Free to try.",
    images: ["https://colorarchive.me/og-image-v1.png"],
  },
  twitter: {
    title: "AI Brand Color Generator | ColorArchive",
    description:
      "Input your brand keywords and get a 6-color AI-generated palette with rationale for every color.",
    images: ["https://colorarchive.me/og-image-v1.png"],
  },
};

export default function BrandGeneratorRoute() {
  return (
    <>
      <SiteHeader currentPath="/brand-generator" />
      <BrandGeneratorPage />
    </>
  );
}
