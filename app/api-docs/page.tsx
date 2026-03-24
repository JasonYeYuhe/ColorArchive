import type { Metadata } from "next";
import { SiteHeader } from "@/src/components/site-header";
import { StructuredDataScript } from "@/src/components/structured-data-script";
import { ApiDocsPage } from "@/src/components/api-docs-page";

export const metadata: Metadata = {
  title: { absolute: "Color API Documentation — ColorArchive" },
  description:
    "Free REST API for 3,000+ curated hex colors. Search by name, hex, or mood. Filter by color family. Get color relationships. No auth required.",
  alternates: {
    canonical: "/api-docs/",
  },
  twitter: {
    card: "summary_large_image",
  },
};

const breadcrumbData = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "ColorArchive", item: "https://colorarchive.me/" },
    { "@type": "ListItem", position: 2, name: "Tools", item: "https://colorarchive.me/tools/" },
    { "@type": "ListItem", position: 3, name: "Color API", item: "https://colorarchive.me/api-docs/" },
  ],
};

export default function ApiDocsRoute() {
  return (
    <>
      <SiteHeader currentPath="/api-docs" />
      <StructuredDataScript data={[breadcrumbData]} />
      <ApiDocsPage />
    </>
  );
}
