import type { Metadata } from "next";
import { SiteHeader } from "@/src/components/site-header";
import { UpdatesPage } from "@/src/components/updates-page";
import { projectUpdates } from "@/src/lib/project-updates";

export const metadata: Metadata = {
  title: "Updates",
  description:
    "A static changelog for ColorArchive covering archive improvements, product-layer changes, and new routes.",
  alternates: {
    canonical: "/updates",
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
