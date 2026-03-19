import { Suspense } from "react";
import type { Metadata } from "next";
import { PalettePage } from "@/src/components/palette-page";
import { SiteHeader } from "@/src/components/site-header";

export const metadata: Metadata = {
  title: "Palette Builder",
  description: "View, export, and share curated color palettes from the ColorArchive.",
  robots: { index: false, follow: false },
};

export default function PaletteRoute() {
  return (
    <>
      <SiteHeader currentPath="/palette" />
      <Suspense fallback={null}>
        <PalettePage />
      </Suspense>
    </>
  );
}
