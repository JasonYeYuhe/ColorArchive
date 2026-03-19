import type { Metadata } from "next";
import { PalettePacksPage } from "@/src/components/palette-packs-page";
import { SiteHeader } from "@/src/components/site-header";
import { palettePacks } from "@/src/lib/palette-packs";

export const metadata: Metadata = {
  title: "Color Palette Packs",
  description: "Download professional color palette packs with hex codes, Figma tokens, CSS variables, and Tailwind config. Built for brand designers, UI developers, and creative teams.",
  alternates: { canonical: "/packs/" },
};

export default function PacksRoute() {
  return (
    <>
      <SiteHeader currentPath="/packs" />
      <PalettePacksPage packs={palettePacks} />
    </>
  );
}
