import type { Metadata } from "next";
import { ProductExamplesPage } from "@/src/components/product-examples-page";
import { SiteHeader } from "@/src/components/site-header";
import { collections } from "@/src/lib/collections";
import { palettePacks } from "@/src/lib/palette-packs";

export const metadata: Metadata = {
  title: "Product Examples",
  description:
    "Concrete product examples and deliverables for the ColorArchive palette packs and digital goods.",
};

export default function ProductExamplesRoute() {
  return (
    <>
      <SiteHeader currentPath="/packs" />
      <ProductExamplesPage collections={collections} packs={palettePacks} />
    </>
  );
}
