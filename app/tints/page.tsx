import type { Metadata } from "next";
import { SiteHeader } from "@/src/components/site-header";
import { StructuredDataScript } from "@/src/components/structured-data-script";
import { TintsShadesPage } from "@/src/components/tints-shades-page";

export const metadata: Metadata = {
  title: { absolute: "Tints & Shades Generator — Color Scale Builder | ColorArchive" },
  description:
    "Generate a complete 11-step tonal color scale (50–950) from any hex color. Export as CSS custom properties, Tailwind config, Sass variables, or JSON. Free, instant, no sign-up.",
  alternates: { canonical: "/tints/" },
  openGraph: {
    title: "Tints & Shades Generator — Color Scale Builder | ColorArchive",
    description:
      "Generate a full 11-step tonal scale from any color. Export as CSS vars, Tailwind config, Sass, or JSON instantly.",
    images: ["https://colorarchive.me/og-image-v1.png"],
  },
  twitter: {
    title: "Tints & Shades Generator | ColorArchive",
    description:
      "Generate a complete 11-step tonal color scale (50–950) from any hex. Export CSS, Tailwind, Sass, or JSON.",
    images: ["https://colorarchive.me/og-image-v1.png"],
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Tints & Shades Generator",
  applicationCategory: "DesignApplication",
  operatingSystem: "Any",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  url: "https://colorarchive.me/tints/",
  description:
    "Generate a complete 11-step tonal color scale from any hex color. Export as CSS custom properties, Tailwind config, Sass variables, or JSON.",
};

const breadcrumbData = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "ColorArchive", item: "https://colorarchive.me/" },
    { "@type": "ListItem", position: 2, name: "Tools", item: "https://colorarchive.me/tools/" },
    { "@type": "ListItem", position: 3, name: "Tints & Shades Generator", item: "https://colorarchive.me/tints/" },
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
