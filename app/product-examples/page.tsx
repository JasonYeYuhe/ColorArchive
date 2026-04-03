import type { Metadata } from "next";
import { ProductExamplesPage } from "@/src/components/product-examples-page";
import { SiteHeader } from "@/src/components/site-header";
import { collections } from "@/src/lib/collections";

export const metadata: Metadata = {
  title: "Product Examples",
  description:
    "See how ColorArchive palettes work in real design workflows — CSS variables, Figma tokens, Tailwind config, and more.",
  alternates: { canonical: "/product-examples/" },
};

export default function ProductExamplesRoute() {
  return (
    <>
      <SiteHeader currentPath="/product-examples" />
      <ProductExamplesPage collections={collections} />
    </>
  );
}
