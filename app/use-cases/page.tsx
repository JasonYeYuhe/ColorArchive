import type { Metadata } from "next";
import { SiteHeader } from "@/src/components/site-header";
import { UseCasesPage } from "@/src/components/use-cases-page";

export const metadata: Metadata = {
  title: { absolute: "Color Palettes by Industry & Use Case | ColorArchive" },
  description:
    "Explore curated color palette guidance for every design context — SaaS, healthcare, luxury, food, finance, education, and more. Find the right palette strategy for your industry.",
  alternates: { canonical: "/use-cases/" },
  openGraph: {
    title: "Color Palettes by Industry | ColorArchive",
    description:
      "Industry-specific color palette strategies for designers — from SaaS and healthcare to luxury and food brands.",
    images: ["https://colorarchive.me/og-image-v1.png"],
  },
};

export default function UseCasesRoute() {
  return (
    <>
      <SiteHeader currentPath="/use-cases" />
      <UseCasesPage />
    </>
  );
}
