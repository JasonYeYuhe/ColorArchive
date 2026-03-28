import type { Metadata } from "next";
import { SiteHeader } from "@/src/components/site-header";
import { StructuredDataScript } from "@/src/components/structured-data-script";
import { ValidatePage } from "@/src/components/validate-page";

export const metadata: Metadata = {
  title: { absolute: "Palette Validator — ColorArchive" },
  description:
    "Paste your hex colors and get a full palette analysis: contrast matrix, harmony detection, colorblind simulation, and an overall quality score. Free, instant, no sign-up.",
  alternates: {
    canonical: "/validate/",
  },
  openGraph: {
    title: "Palette Validator — ColorArchive",
    description:
      "Comprehensive palette analysis tool. Check contrast, detect color harmony, preview colorblind simulations, and get a quality score for any set of hex colors.",
    images: ["https://colorarchive.me/og-image-v1.png"],
  },
  twitter: {
    title: "Palette Validator — ColorArchive",
    description:
      "Free palette validator: paste hex colors, get contrast matrix, harmony analysis, colorblind preview, and overall quality score. Instant results.",
    images: ["https://colorarchive.me/og-image-v1.png"],
  },
};

const breadcrumbData = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "ColorArchive", item: "https://colorarchive.me/" },
    { "@type": "ListItem", position: 2, name: "Tools", item: "https://colorarchive.me/tools/" },
    { "@type": "ListItem", position: 3, name: "Palette Validator", item: "https://colorarchive.me/validate/" },
  ],
};

const webAppData = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Palette Validator",
  url: "https://colorarchive.me/validate/",
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
