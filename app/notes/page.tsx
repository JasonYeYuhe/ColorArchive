import type { Metadata } from "next";
import { SiteHeader } from "@/src/components/site-header";
import { StructuredDataScript } from "@/src/components/structured-data-script";
import { NotesPage } from "@/src/components/notes-page";
import { newsletterIssues } from "@/src/lib/newsletter-issues";

export const metadata: Metadata = {
  title: "Color Notes & Newsletter",
  description: "Monthly notes from ColorArchive — featuring curated palettes, WCAG accessibility tips, seasonal color trends, and design token updates. Free to read.",
  alternates: {
    canonical: "/notes/",
  },
};

const collectionData = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Color Notes & Newsletter",
  description:
    "Monthly notes from ColorArchive — featuring curated palettes, WCAG accessibility tips, seasonal color trends, and design token updates. Free to read.",
  url: "https://colorarchive.me/notes/",
};

const breadcrumbData = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "ColorArchive", item: "https://colorarchive.me/" },
    { "@type": "ListItem", position: 2, name: "Notes", item: "https://colorarchive.me/notes/" },
  ],
};

export default function NotesRoute() {
  return (
    <>
      <SiteHeader currentPath="/notes" />
      <StructuredDataScript data={[collectionData, breadcrumbData]} />
      <NotesPage issues={newsletterIssues} />
    </>
  );
}
