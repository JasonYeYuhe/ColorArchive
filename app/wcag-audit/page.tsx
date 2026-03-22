import type { Metadata } from "next";
import { SiteHeader } from "@/src/components/site-header";
import { StructuredDataScript } from "@/src/components/structured-data-script";
import { WcagAuditPage } from "@/src/components/wcag-audit-page";

export const metadata: Metadata = {
  title: { absolute: "WCAG Contrast Auditor — ColorArchive" },
  description:
    "Paste your design system colors and instantly get a full WCAG AA/AAA compliance matrix. Check every foreground/background combination, see pass/fail for all pairs, and export as CSV.",
  alternates: {
    canonical: "/wcag-audit/",
  },
  openGraph: {
    title: "WCAG Contrast Auditor — ColorArchive",
    description:
      "Batch WCAG contrast checker. Paste up to 10 colors, get a full accessibility matrix showing AA/AAA compliance for every pair. Export as CSV.",
    images: ["https://colorarchive.me/og-image-v1.png"],
  },
  twitter: {
    title: "WCAG Contrast Auditor — ColorArchive",
    description:
      "Batch WCAG contrast checker: paste your design system colors, get a full AA/AAA compliance matrix for every combination. Free, instant.",
    images: ["https://colorarchive.me/og-image-v1.png"],
  },
};

const breadcrumbData = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "ColorArchive", item: "https://colorarchive.me/" },
    { "@type": "ListItem", position: 2, name: "Tools", item: "https://colorarchive.me/tools/" },
    { "@type": "ListItem", position: 3, name: "WCAG Contrast Auditor", item: "https://colorarchive.me/wcag-audit/" },
  ],
};

export default function WcagAuditRoute() {
  return (
    <>
      <SiteHeader currentPath="/wcag-audit" />
      <StructuredDataScript data={[breadcrumbData]} />
      <WcagAuditPage />
    </>
  );
}
