import type { Metadata } from "next";
import { SiteHeader } from "@/src/components/site-header";
import { StructuredDataScript } from "@/src/components/structured-data-script";
import { GradientGeneratorPage } from "@/src/components/gradient-generator-page";
import { SITE_URL } from "@/src/lib/site-config";

export const metadata: Metadata = {
  title: { absolute: "CSS Gradient Generator — Linear & Radial Gradients | ColorArchive" },
  description: "Create CSS gradients visually. Adjust colors, angle, and type. Copy production-ready linear-gradient or radial-gradient CSS code instantly. Free tool.",
  alternates: { canonical: "/gradient/" },
  keywords: ["CSS gradient generator", "linear gradient", "radial gradient", "CSS gradient maker", "gradient tool"],
  openGraph: {
    title: "CSS Gradient Generator — Linear & Radial Gradients | ColorArchive",
    description: "Create CSS gradients visually. Adjust colors, angle, and type. Copy production-ready linear-gradient or radial-gradient CSS code instantly. Free tool.",
    images: [`${SITE_URL}/og-image-v1.png`],
  },
  twitter: {
    title: "CSS Gradient Generator — Linear & Radial Gradients | ColorArchive",
    description: "Create CSS gradients visually. Adjust colors, angle, and type. Copy production-ready linear-gradient or radial-gradient CSS code instantly. Free tool.",
    images: [`${SITE_URL}/og-image-v1.png`],
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "CSS Gradient Generator",
  applicationCategory: "DesignApplication",
  operatingSystem: "Any",
  offers: { "@type": "Offer", price: "0", priceCurrency: "JPY" },
  url: `${SITE_URL}/gradient/`,
  description: "Create beautiful CSS gradients with a visual editor. Copy production-ready CSS code instantly.",
  breadcrumb: {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Gradient Generator", item: `${SITE_URL}/gradient/` },
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
