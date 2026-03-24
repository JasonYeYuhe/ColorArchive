import type { Metadata } from "next";
import { SiteHeader } from "@/src/components/site-header";
import { ProjectsPage } from "@/src/components/projects-page";

export const metadata: Metadata = {
  title: "Projects",
  description: "Save and manage your color palettes, design tokens, and brand systems in the cloud.",
  alternates: { canonical: "/projects/" },
};

export default function ProjectsRoute() {
  return (
    <>
      <SiteHeader currentPath="/projects" />
      <ProjectsPage />
    </>
  );
}
