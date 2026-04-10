import type { Metadata } from "next";
import { SiteHeader } from "@/src/components/site-header";
import { StructuredDataScript } from "@/src/components/structured-data-script";
import { ColorFinderPage } from "@/src/components/color-finder-page";
import { SITE_URL } from "@/src/lib/site-config";

export const metadata: Metadata = {
  title: { absolute: "Color Finder — Identify Any Color from Photo or Camera | ColorArchive" },
  description:
    "Identify any color instantly. Upload a photo and click to identify pixels, use your camera to scan real-world colors, or pick from anywhere on your screen. Get the color name, hex, RGB, and closest archive match.",
  alternates: { canonical: "/identify/" },
  openGraph: {
    title: "Color Finder — Identify Any Color | ColorArchive",
    description:
      "Upload an image, use your camera, or use the eyedropper to identify any color. Get the name, hex/RGB/HSL values, and closest archive match instantly.",
    images: [`${SITE_URL}/og-image-v1.png`],
  },
  twitter: {
    title: "Color Finder | ColorArchive",
    description:
      "Identify any color from a photo, your camera, or your screen. Free, private, runs entirely in your browser.",
    images: [`${SITE_URL}/og-image-v1.png`],
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Color Finder",
  applicationCategory: "DesignApplication",
  operatingSystem: "Any",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  url: `${SITE_URL}/identify/`,
  description:
    "Identify any color from a photo, camera, or screen. Get hex, RGB, HSL values and the closest ColorArchive name match.",
};

const breadcrumbData = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "ColorArchive", item: `${SITE_URL}/` },
    { "@type": "ListItem", position: 2, name: "Tools", item: `${SITE_URL}/tools/` },
    { "@type": "ListItem", position: 3, name: "Color Finder", item: `${SITE_URL}/identify/` },
  ],
};

export default function IdentifyRoute() {
  return (
    <>
      <SiteHeader currentPath="/identify" />
      <StructuredDataScript data={[structuredData, breadcrumbData]} />
      <ColorFinderPage />
    </>
  );
}
