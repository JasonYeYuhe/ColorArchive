import type { Metadata } from "next";
import { GuidesPage } from "@/src/components/guides-page";
import { SiteHeader } from "@/src/components/site-header";
import { landingGuides } from "@/src/lib/guides";

export const metadata: Metadata = {
  title: "Color Guides — Palettes, Tokens & Design Systems",
  description:
    "290+ practical guides for color palettes, dark mode UI, Figma color tokens, Tailwind themes, brand color systems, and accessible design. Free tools and downloadable palettes included.",
  alternates: { canonical: "/guides/" },
};

export default function GuidesRoute() {
  return (
    <>
      <SiteHeader currentPath="/guides" />
      <GuidesPage guides={landingGuides} />
    </>
  );
}
