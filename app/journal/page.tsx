import type { Metadata } from "next";
import { SiteHeader } from "@/src/components/site-header";
import { StructuredDataScript } from "@/src/components/structured-data-script";
import { JournalPage } from "@/src/components/journal-page";
import { SITE_URL } from "@/src/lib/site-config";

const description =
  "Color Journal — save one color a day, with a one-line note. Builds a private 30-day record and a daily streak that keeps you noticing color in the wild.";

export const metadata: Metadata = {
  title: { absolute: "Color Journal — Daily Color Check-in | ColorArchive" },
  description,
  alternates: { canonical: "/journal/" },
  openGraph: {
    title: "Color Journal | ColorArchive",
    description,
    images: [`${SITE_URL}/og-image-v1.png`],
  },
  twitter: {
    title: "Color Journal | ColorArchive",
    description,
    images: [`${SITE_URL}/og-image-v1.png`],
  },
  robots: { index: true, follow: true },
};

const structuredData = [
  {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Color Journal — Daily Check-in",
    description,
    url: `${SITE_URL}/journal/`,
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "ColorArchive", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "Journal", item: `${SITE_URL}/journal/` },
    ],
  },
];

export default function JournalRoute() {
  return (
    <>
      <SiteHeader currentPath="/journal" />
      <StructuredDataScript data={structuredData} />
      <JournalPage />
    </>
  );
}
