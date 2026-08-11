import type { Metadata } from "next";
import { SiteHeader } from "@/src/components/site-header";
import { StructuredDataScript } from "@/src/components/structured-data-script";
import { ApiDocsPage } from "@/src/components/api-docs-page";
import { SITE_URL } from "@/src/lib/site-config";

export const metadata: Metadata = {
  title: { absolute: "Color API Documentation — ColorArchive" },
  description:
    "Free REST API for 5,446 curated hex colors. Search by name, hex, or mood. Filter by color family. Get color relationships. No auth required.",
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
    { "@type": "ListItem", position: 1, name: "ColorArchive", item: `${SITE_URL}/` },
    { "@type": "ListItem", position: 2, name: "Tools", item: `${SITE_URL}/tools/` },
    { "@type": "ListItem", position: 3, name: "Color API", item: `${SITE_URL}/api-docs/` },
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
