import type { Metadata } from "next";
import { SiteHeader } from "@/src/components/site-header";
import { StructuredDataScript } from "@/src/components/structured-data-script";
import { RecentColorsPage } from "@/src/components/recent-colors-page";
import { SITE_URL } from "@/src/lib/site-config";

export const metadata: Metadata = {
  title: "Recent Colors",
  description: "Local recently viewed color trail for ColorArchive browsing sessions.",
  robots: { index: false, follow: false },
};

const breadcrumbData = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "ColorArchive", item: `${SITE_URL}/` },
    { "@type": "ListItem", position: 2, name: "Recent Colors", item: `${SITE_URL}/recent/` },
  ],
};

export default function RecentRoute() {
  return (
    <>
      <StructuredDataScript data={breadcrumbData} />
      <SiteHeader currentPath="/recent" />
      <RecentColorsPage />
    </>
  );
}
