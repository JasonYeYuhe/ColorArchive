import type { Metadata } from "next";
import { SiteHeader } from "@/src/components/site-header";
import { SharedProjectPage } from "@/src/components/shared-project-page";

export const metadata: Metadata = {
  title: "Shared Project",
  description: "View a shared ColorArchive project palette and design critique.",
};

export default function SharedProjectRoute() {
  return (
    <>
      <SiteHeader currentPath="/projects" />
      <SharedProjectPage />
    </>
  );
}
