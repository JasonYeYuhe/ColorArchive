import type { Metadata } from "next";
import { FavoritesPage } from "@/src/components/favorites-page";
import { SiteHeader } from "@/src/components/site-header";
import { StructuredDataScript } from "@/src/components/structured-data-script";
import { SITE_URL } from "@/src/lib/site-config";

export const metadata: Metadata = {
  title: "Favorites",
  description: "Your saved ColorArchive working set, available locally and syncable across devices.",
  robots: { index: false, follow: false },
};

const breadcrumbData = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "ColorArchive", item: `${SITE_URL}/` },
    { "@type": "ListItem", position: 2, name: "Favorites", item: `${SITE_URL}/favorites/` },
  ],
};

export default function FavoritesRoute() {
  return (
    <>
      <StructuredDataScript data={breadcrumbData} />
      <SiteHeader currentPath="/favorites" />
      <FavoritesPage />
    </>
  );
}
