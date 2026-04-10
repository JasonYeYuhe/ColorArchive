import type { Metadata } from "next";
import { SiteHeader } from "@/src/components/site-header";
import { StructuredDataScript } from "@/src/components/structured-data-script";
import { TokenGeneratorPage } from "@/src/components/token-generator-page";
import { SITE_URL } from "@/src/lib/site-config";

export const metadata: Metadata = {
  title: { absolute: "Design Token Generator — CSS, Tailwind, SCSS & JSON Export | ColorArchive" },
  description:
    "Generate a complete design token system from any brand color. Get primary, neutral, and semantic color scales (success, warning, error, info) with 11 steps each. Export as CSS custom properties, Tailwind config, SCSS variables, or JSON (W3C format). Free, instant, no sign-up.",
  alternates: { canonical: "/tokens/" },
  openGraph: {
    title: "Design Token Generator — CSS, Tailwind, SCSS & JSON | ColorArchive",
    description:
      "Generate a complete design token system from your brand color. Primary, neutral, and semantic scales. Export as CSS vars, Tailwind, SCSS, or JSON instantly.",
    images: [`${SITE_URL}/og-image-v1.png`],
  },
  twitter: {
    title: "Design Token Generator | ColorArchive",
    description:
      "Generate primary, neutral, and semantic color token scales from any brand color. Export CSS, Tailwind, SCSS, or JSON.",
    images: [`${SITE_URL}/og-image-v1.png`],
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Design Token Generator",
  applicationCategory: "DesignApplication",
  operatingSystem: "Any",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  url: `${SITE_URL}/tokens/`,
  description:
    "Generate a complete design token system from any brand color — primary, neutral, success, warning, error, and info scales. Export as CSS custom properties, Tailwind config, SCSS variables, or JSON.",
};

const breadcrumbData = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "ColorArchive", item: `${SITE_URL}/` },
    { "@type": "ListItem", position: 2, name: "Tools", item: `${SITE_URL}/tools/` },
    { "@type": "ListItem", position: 3, name: "Design Token Generator", item: `${SITE_URL}/tokens/` },
  ],
};

export default function TokensPage() {
  return (
    <>
      <SiteHeader currentPath="/tokens" />
      <StructuredDataScript data={[structuredData, breadcrumbData]} />
      <TokenGeneratorPage />
    </>
  );
}
