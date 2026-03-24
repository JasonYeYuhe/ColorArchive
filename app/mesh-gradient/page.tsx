import type { Metadata } from "next";
import { SiteHeader } from "@/src/components/site-header";
import { MeshGradientPage } from "@/src/components/mesh-gradient-page";

export const metadata: Metadata = {
  title: { absolute: "Mesh Gradient Generator | ColorArchive" },
  description:
    "Create beautiful CSS mesh gradients with multiple color stops. Export as CSS code or download as PNG. Free online mesh gradient maker.",
  alternates: { canonical: "/mesh-gradient/" },
  openGraph: {
    title: "Mesh Gradient Generator | ColorArchive",
    description: "Create stunning mesh gradients and export as CSS or PNG.",
    images: ["https://colorarchive.me/og-image-v1.png"],
  },
};

export default function MeshGradientRoute() {
  return (
    <>
      <SiteHeader currentPath="/mesh-gradient" />
      <MeshGradientPage />
    </>
  );
}
