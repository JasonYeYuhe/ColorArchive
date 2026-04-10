import type { Metadata } from "next";
import { SiteHeader } from "@/src/components/site-header";
import { StructuredDataScript } from "@/src/components/structured-data-script";
import { MeshGradientPage } from "@/src/components/mesh-gradient-page";
import { SITE_URL } from "@/src/lib/site-config";

export const metadata: Metadata = {
  title: { absolute: "Mesh Gradient Generator | ColorArchive" },
  description:
    "Create beautiful CSS mesh gradients with multiple color stops. Export as CSS code or download as PNG. Free online mesh gradient maker.",
  alternates: { canonical: "/mesh-gradient/" },
  openGraph: {
    title: "Mesh Gradient Generator | ColorArchive",
    description: "Create stunning mesh gradients and export as CSS or PNG.",
    images: [`${SITE_URL}/og-image-v1.png`],
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Mesh Gradient Generator",
  applicationCategory: "DesignApplication",
  operatingSystem: "Any",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  url: `${SITE_URL}/mesh-gradient/`,
  description:
    "Create beautiful CSS mesh gradients with multiple color stops. Export as CSS code or download as PNG. Free online mesh gradient maker.",
};

const breadcrumbData = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "ColorArchive", item: `${SITE_URL}/` },
    { "@type": "ListItem", position: 2, name: "Mesh Gradient", item: `${SITE_URL}/mesh-gradient/` },
  ],
};

export default function MeshGradientRoute() {
  return (
    <>
      <SiteHeader currentPath="/mesh-gradient" />
      <StructuredDataScript data={[structuredData, breadcrumbData]} />
      <MeshGradientPage />
    </>
  );
}
