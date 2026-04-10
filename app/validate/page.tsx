import type { Metadata } from "next";
import { SiteHeader } from "@/src/components/site-header";
import { StructuredDataScript } from "@/src/components/structured-data-script";
import { ValidatePage } from "@/src/components/validate-page";
import { SITE_URL } from "@/src/lib/site-config";

export const metadata: Metadata = {
  title: { absolute: "Palette Validator — Check Contrast & Accessibility | ColorArchive" },
  description:
    "Validate any color palette: contrast matrix, harmony detection, colorblind simulation, and quality score. Comprehensive palette accessibility checker. Free.",
  alternates: {
    canonical: "/validate/",
  },
  keywords: ["color palette checker", "palette accessibility", "contrast matrix", "palette validator", "color quality score"],
  openGraph: {
    title: "Palette Validator — Check Contrast & Accessibility | ColorArchive",
    description:
      "Validate any color palette: contrast matrix, harmony detection, colorblind simulation, and quality score. Comprehensive palette accessibility checker. Free.",
    images: [`${SITE_URL}/og-image-v1.png`],
  },
  twitter: {
    title: "Palette Validator — Check Contrast & Accessibility | ColorArchive",
    description:
      "Validate any color palette: contrast matrix, harmony detection, colorblind simulation, and quality score. Comprehensive palette accessibility checker. Free.",
    images: [`${SITE_URL}/og-image-v1.png`],
  },
};

const breadcrumbData = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "ColorArchive", item: `${SITE_URL}/` },
    { "@type": "ListItem", position: 2, name: "Tools", item: `${SITE_URL}/tools/` },
    { "@type": "ListItem", position: 3, name: "Palette Validator", item: `${SITE_URL}/validate/` },
  ],
};

const webAppData = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Palette Validator",
  url: `${SITE_URL}/validate/`,
  applicationCategory: "DesignApplication",
  operatingSystem: "Any",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  description:
    "Comprehensive palette analysis: contrast matrix, harmony detection, colorblind simulation, and quality scoring for any set of hex colors.",
};

export default function ValidateRoute() {
  return (
    <>
      <SiteHeader currentPath="/validate" />
      <StructuredDataScript data={[breadcrumbData, webAppData]} />
      <ValidatePage />
    </>
  );
}
