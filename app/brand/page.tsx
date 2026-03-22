import type { Metadata } from "next";
import { SiteHeader } from "@/src/components/site-header";
import { StructuredDataScript } from "@/src/components/structured-data-script";
import { BrandPage } from "@/src/components/brand-page";

export const metadata: Metadata = {
  title: { absolute: "Brand Color System Generator — ColorArchive" },
  description:
    "Generate a complete brand color system from a single hex color. Get primary scales, neutral grays, semantic colors (success/warning/error/info), WCAG contrast validation, and export as CSS variables or Tailwind config.",
  alternates: {
    canonical: "/brand/",
  },
  openGraph: {
    title: "Brand Color System Generator — ColorArchive",
    description:
      "Turn any hex color into a complete design system: 11-step primary scale, neutral grays, semantic colors, and WCAG-validated pairings. Export as CSS variables or Tailwind config.",
    images: ["https://colorarchive.me/og-image-v1.png"],
  },
  twitter: {
    title: "Brand Color System Generator — ColorArchive",
    description:
      "Turn any hex color into a complete design system: primary scale, neutral grays, semantic colors, WCAG contrast. Free, instant, no sign-up.",
    images: ["https://colorarchive.me/og-image-v1.png"],
  },
};

const breadcrumbData = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "ColorArchive", item: "https://colorarchive.me/" },
    { "@type": "ListItem", position: 2, name: "Tools", item: "https://colorarchive.me/tools/" },
    { "@type": "ListItem", position: 3, name: "Brand Color System Generator", item: "https://colorarchive.me/brand/" },
  ],
};

export default function BrandSystemPage() {
  return (
    <>
      <SiteHeader currentPath="/brand" />
      <StructuredDataScript data={[breadcrumbData]} />
      <BrandPage />
    </>
  );
}
