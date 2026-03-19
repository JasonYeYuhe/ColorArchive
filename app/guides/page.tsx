import type { Metadata } from "next";
import { GuidesPage } from "@/src/components/guides-page";
import { SiteHeader } from "@/src/components/site-header";
import { landingGuides } from "@/src/lib/guides";

export const metadata: Metadata = {
  title: "Color Guides",
  description:
    "Practical ColorArchive guides for brand palettes, SaaS website color schemes, free palette downloads, and Figma or Tailwind token workflows.",
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
