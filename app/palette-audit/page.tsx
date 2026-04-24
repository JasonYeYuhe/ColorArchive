import type { Metadata } from "next";
import { SiteHeader } from "@/src/components/site-header";
import { StructuredDataScript } from "@/src/components/structured-data-script";
import { PaletteAuditPage } from "@/src/components/palette-audit-page";
import { SITE_URL } from "@/src/lib/site-config";

export const metadata: Metadata = {
  title: { absolute: "Palette Audit — ColorArchive" },
  description:
    "Paste your CSS, Tailwind config, or design-token JSON. We extract every color, map each one to its nearest ColorArchive entry, find near-duplicates, and flag every pairwise WCAG AA contrast failure. Instant, free, runs locally.",
  alternates: {
    canonical: "/palette-audit/",
  },
  openGraph: {
    title: "Palette Audit — ColorArchive",
    description:
      "Paste a block of CSS or token JSON. Get named ColorArchive matches for every color, duplicate clusters, contrast failures, and specific swap-to-fix suggestions.",
    images: [`${SITE_URL}/og-image-v1.png`],
  },
  twitter: {
    title: "Palette Audit — ColorArchive",
    description:
      "Audit any design-token file against the 5,446-color ColorArchive system. Named nearest matches, duplicate detection, WCAG AA contrast matrix — all client-side.",
    images: [`${SITE_URL}/og-image-v1.png`],
  },
};

const breadcrumbData = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "ColorArchive", item: `${SITE_URL}/` },
    { "@type": "ListItem", position: 2, name: "Tools", item: `${SITE_URL}/tools/` },
    { "@type": "ListItem", position: 3, name: "Palette Audit", item: `${SITE_URL}/palette-audit/` },
  ],
};

export default function PaletteAuditRoute() {
  return (
    <>
      <SiteHeader currentPath="/palette-audit" />
      <StructuredDataScript data={[breadcrumbData]} />
      <PaletteAuditPage />
    </>
  );
}
