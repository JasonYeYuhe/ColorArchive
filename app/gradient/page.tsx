import type { Metadata } from "next";
import { SiteHeader } from "@/src/components/site-header";
import { StructuredDataScript } from "@/src/components/structured-data-script";
import { GradientGeneratorPage } from "@/src/components/gradient-generator-page";

export const metadata: Metadata = {
  title: { absolute: "CSS Gradient Generator — Linear & Radial | ColorArchive" },
  description: "Create beautiful CSS gradients with a visual editor. Adjust colors, angle, and type. Copy production-ready CSS code instantly.",
  alternates: { canonical: "/gradient/" },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "CSS Gradient Generator",
  applicationCategory: "DesignApplication",
  operatingSystem: "Any",
  offers: { "@type": "Offer", price: "0", priceCurrency: "JPY" },
  url: "https://colorarchive.me/gradient/",
  description: "Create beautiful CSS gradients with a visual editor. Copy production-ready CSS code instantly.",
  breadcrumb: {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://colorarchive.me" },
      { "@type": "ListItem", position: 2, name: "Gradient Generator", item: "https://colorarchive.me/gradient/" },
    ],
  },
};

export default function GradientRoute() {
  return (
    <>
      <StructuredDataScript data={structuredData} />
      <SiteHeader currentPath="/gradient" />
      <GradientGeneratorPage />
    </>
  );
}
