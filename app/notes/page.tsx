import type { Metadata } from "next";
import { SiteHeader } from "@/src/components/site-header";
import { NotesPage } from "@/src/components/notes-page";
import { newsletterIssues } from "@/src/lib/newsletter-issues";

export const metadata: Metadata = {
  title: "Notes",
  description: "Public monthly notes connecting featured palettes, product updates, and archive direction.",
  alternates: {
    canonical: "/notes",
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
