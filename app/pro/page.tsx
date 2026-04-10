import type { Metadata } from "next";
import { SiteHeader } from "@/src/components/site-header";
import { StructuredDataScript } from "@/src/components/structured-data-script";
import { ProPage } from "@/src/components/pro-page";
import { SITE_URL } from "@/src/lib/site-config";

const structuredData = [
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "ColorArchive Pro",
    description:
      "Unlock unlimited AI palette generations, full exports, WCAG reports, and more with ColorArchive Pro.",
    url: `${SITE_URL}/pro/`,
    applicationCategory: "DesignApplication",
    operatingSystem: "Web",
    offers: [
      {
        "@type": "Offer",
        price: "499",
        priceCurrency: "JPY",
        name: "Monthly",
        url: `${SITE_URL}/pro/`,
      },
      {
        "@type": "Offer",
        price: "3999",
        priceCurrency: "JPY",
        name: "Yearly",
        url: `${SITE_URL}/pro/`,
      },
      {
        "@type": "Offer",
        price: "9999",
        priceCurrency: "JPY",
        name: "Lifetime",
        url: `${SITE_URL}/pro/`,
      },
    ],
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "ColorArchive", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "Pro", item: `${SITE_URL}/pro/` },
    ],
  },
];

export const metadata: Metadata = {
  title: "Pro",
  description:
    "Unlock unlimited AI palette generations, full exports, WCAG reports, and more with ColorArchive Pro.",
  alternates: { canonical: "/pro/" },
};

export default function ProRoute() {
  return (
    <>
      <SiteHeader currentPath="/pro" />
      <StructuredDataScript data={structuredData} />
      <ProPage />
    </>
  );
}
