import type { Metadata } from "next";
import { SiteHeader } from "@/src/components/site-header";
import { NotesPage } from "@/src/components/notes-page";
import { newsletterIssues } from "@/src/lib/newsletter-issues";

export const metadata: Metadata = {
  title: "Color Notes & Newsletter",
  description: "Monthly notes from ColorArchive — featuring curated palettes, WCAG accessibility tips, seasonal color trends, and design token updates. Free to read.",
  alternates: {
    canonical: "/notes/",
  },
};

export default function NotesRoute() {
  return (
    <>
      <SiteHeader currentPath="/notes" />
      <NotesPage issues={newsletterIssues} />
    </>
  );
}
