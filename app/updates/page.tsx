import type { Metadata } from "next";
import { SiteHeader } from "@/src/components/site-header";
import { UpdatesPage } from "@/src/components/updates-page";
import { projectUpdates } from "@/src/lib/project-updates";

export const metadata: Metadata = {
  title: "ColorArchive Updates",
  description:
    "Changelog and release notes for ColorArchive — new colors, export formats, design token improvements, and product launches.",
  alternates: {
    canonical: "/updates/",
  },
};

export default function UpdatesRoute() {
  return (
    <>
      <SiteHeader currentPath="/updates" />
      <UpdatesPage updates={projectUpdates} />
    </>
  );
}
