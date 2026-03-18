import type { Metadata } from "next";
import { PalettePacksPage } from "@/src/components/palette-packs-page";
import { SiteHeader } from "@/src/components/site-header";
import { palettePacks } from "@/src/lib/palette-packs";

export const metadata: Metadata = {
  title: "Packs",
  description: "Preview the first productized palette packs built from the ColorArchive collections.",
};

export default function PacksRoute() {
  return (
    <>
      <SiteHeader currentPath="/packs" />
      <PalettePacksPage packs={palettePacks} />
    </>
  );
}
