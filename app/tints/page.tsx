import type { Metadata } from "next";
import { SiteHeader } from "@/src/components/site-header";
import { StructuredDataScript } from "@/src/components/structured-data-script";
import { TintsShadesPage } from "@/src/components/tints-shades-page";
import { SITE_URL } from "@/src/lib/site-config";

export const metadata: Metadata = {
  title: { absolute: "Tints & Shades Generator — Color Scale Builder | ColorArchive" },
  description:
    "Generate a complete 11-step tonal color scale (50–950) from any hex color. Export as CSS custom properties, Tailwind config, Sass variables, or JSON. Free, instant, no sign-up.",
  alternates: { canonical: "/tints/" },
  openGraph: {
    title: "Tints & Shades Generator — Color Scale Builder | ColorArchive",
    description:
      "Generate a full 11-step tonal scale from any color. Export as CSS vars, Tailwind config, Sass, or JSON instantly.",
    images: [`${SITE_URL}/og-image-v1.png`],
  },
  twitter: {
    title: "Tints & Shades Generator | ColorArchive",
    description:
      "Generate a complete 11-step tonal color scale (50–950) from any hex. Export CSS, Tailwind, Sass, or JSON.",
    images: [`${SITE_URL}/og-image-v1.png`],
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Tints & Shades Generator",
  applicationCategory: "DesignApplication",
  operatingSystem: "Any",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  url: `${SITE_URL}/tints/`,
  description:
    "Generate a complete 11-step tonal color scale from any hex color. Export as CSS custom properties, Tailwind config, Sass variables, or JSON.",
};

const breadcrumbData = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "ColorArchive", item: `${SITE_URL}/` },
    { "@type": "ListItem", position: 2, name: "Tools", item: `${SITE_URL}/tools/` },
    { "@type": "ListItem", position: 3, name: "Tints & Shades Generator", item: `${SITE_URL}/tints/` },
  ],
};

export default function TintsPage() {
  return (
    <>
      <SiteHeader currentPath="/tints" />
      <StructuredDataScript data={[structuredData, breadcrumbData]} />
      <TintsShadesPage />
    </>
  );
}
