import type { Metadata } from "next";
import { SiteHeader } from "@/src/components/site-header";
import { PalettePreviewPage } from "@/src/components/palette-preview-page";

export const metadata: Metadata = {
  title: { absolute: "Palette UI Preview | ColorArchive" },
  description:
    "See how any color palette looks applied to real UI components — landing pages, cards, and navigation. Preview before you build.",
  alternates: { canonical: "/preview/" },
  openGraph: {
    title: "Palette UI Preview | ColorArchive",
    description: "Visualize any palette on real UI components in seconds.",
    images: ["https://colorarchive.me/og-image-v1.png"],
  },
};

export default function PreviewRoute() {
  return (
    <>
      <SiteHeader currentPath="/preview" />
      <PalettePreviewPage />
    </>
  );
}
