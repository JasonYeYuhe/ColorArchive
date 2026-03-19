import type { Metadata } from "next";
import { ProductExamplesPage } from "@/src/components/product-examples-page";
import { SiteHeader } from "@/src/components/site-header";
import { collections } from "@/src/lib/collections";
import { palettePacks } from "@/src/lib/palette-packs";

export const metadata: Metadata = {
  title: "Color Pack Examples — What's Inside",
  description:
    "See exactly what you get in a ColorArchive palette pack: CSS variables, Figma tokens, Tailwind config, Procreate swatches, and ACO files. Concrete examples before you buy.",
  alternates: { canonical: "/product-examples/" },
};

export default function ProductExamplesRoute() {
  return (
    <>
      <SiteHeader currentPath="/packs" />
      <ProductExamplesPage collections={collections} packs={palettePacks} />
    </>
  );
}
