import type { Metadata } from "next";
import { SiteHeader } from "@/src/components/site-header";
import { LaunchPage } from "@/src/components/launch-page";

export const metadata: Metadata = {
  title: "ColorArchive — 2,016 Curated Colors with Production-Ready Tokens",
  description:
    "Browse a calm, searchable color archive. Build palettes, check WCAG contrast, and export design tokens for Figma, CSS, Tailwind, and Style Dictionary. Free sample pack included.",
  alternates: { canonical: "/launch/" },
  openGraph: {
    title: "ColorArchive — 2,016 Curated Colors with Production-Ready Tokens",
    description:
      "Browse a calm, searchable color archive. Build palettes, check WCAG contrast, and export design tokens for Figma, CSS, Tailwind, and Style Dictionary.",
    url: "https://colorarchive.me/launch/",
  },
  twitter: {
    card: "summary_large_image",
    title: "ColorArchive — 2,016 Curated Colors with Production-Ready Tokens",
    description:
      "Browse a calm, searchable color archive. Build palettes, check WCAG contrast, and export design tokens for Figma, CSS, Tailwind, and Style Dictionary.",
  },
};

export default function LaunchRoute() {
  return (
    <>
      <SiteHeader currentPath="/" />
      <LaunchPage />
    </>
  );
}
