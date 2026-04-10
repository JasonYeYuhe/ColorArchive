import type { Metadata } from "next";
import { SiteHeader } from "@/src/components/site-header";
import { StructuredDataScript } from "@/src/components/structured-data-script";
import { UseCasesPage } from "@/src/components/use-cases-page";
import { SITE_URL } from "@/src/lib/site-config";

const structuredData = [
  {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Color Palettes by Industry & Use Case | ColorArchive",
    description:
      "Explore curated color palette guidance for every design context — SaaS, healthcare, luxury, food, finance, education, and more. Find the right palette strategy for your industry.",
    url: `${SITE_URL}/use-cases/`,
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "ColorArchive", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "Use Cases", item: `${SITE_URL}/use-cases/` },
    ],
  },
];

export const metadata: Metadata = {
  title: { absolute: "Color Palettes by Industry & Use Case | ColorArchive" },
  description:
    "Explore curated color palette guidance for every design context — SaaS, healthcare, luxury, food, finance, education, and more. Find the right palette strategy for your industry.",
  alternates: { canonical: "/use-cases/" },
  openGraph: {
    title: "Color Palettes by Industry | ColorArchive",
    description:
      "Industry-specific color palette strategies for designers — from SaaS and healthcare to luxury and food brands.",
    images: [`${SITE_URL}/og-image-v1.png`],
  },
};

export default function UseCasesRoute() {
  return (
    <>
      <SiteHeader currentPath="/use-cases" />
      <StructuredDataScript data={structuredData} />
      <UseCasesPage />
    </>
  );
}
