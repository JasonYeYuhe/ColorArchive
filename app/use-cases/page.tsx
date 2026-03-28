import type { Metadata } from "next";
import { SiteHeader } from "@/src/components/site-header";
import { StructuredDataScript } from "@/src/components/structured-data-script";
import { UseCasesPage } from "@/src/components/use-cases-page";

const structuredData = [
  {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Color Palettes by Industry & Use Case | ColorArchive",
    description:
      "Explore curated color palette guidance for every design context — SaaS, healthcare, luxury, food, finance, education, and more. Find the right palette strategy for your industry.",
    url: "https://colorarchive.me/use-cases/",
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "ColorArchive", item: "https://colorarchive.me/" },
      { "@type": "ListItem", position: 2, name: "Use Cases", item: "https://colorarchive.me/use-cases/" },
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
    images: ["https://colorarchive.me/og-image-v1.png"],
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
