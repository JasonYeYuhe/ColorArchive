import type { Metadata } from "next";
import { FavoritesPage } from "@/src/components/favorites-page";
import { SiteHeader } from "@/src/components/site-header";
import { colors } from "@/src/data/colors";

export const metadata: Metadata = {
  title: "Favorites",
  description: "Your locally saved ColorArchive working set.",
};

export default function FavoritesRoute() {
  return (
    <>
      <SiteHeader currentPath="/favorites" />
      <FavoritesPage colors={colors} />
    </>
  );
}
