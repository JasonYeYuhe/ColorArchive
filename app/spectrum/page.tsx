import type { Metadata } from "next";
import { SiteHeader } from "@/src/components/site-header";
import { SpectrumExplorerPage } from "@/src/components/spectrum-explorer-page";
import { colors } from "@/src/data/colors";

export const metadata: Metadata = {
  title: "Color Spectrum Explorer",
  description: "Visualize all 2016 ColorArchive hex colors as a hue-by-lightness matrix. See every shade across the full spectrum from red through violet at a glance.",
  alternates: { canonical: "/spectrum/" },
};

export default function SpectrumPage() {
  return (
    <>
      <SiteHeader currentPath="/spectrum" />
      <SpectrumExplorerPage colors={colors} />
    </>
  );
}
