import type { Metadata } from "next";
import { SiteHeader } from "@/src/components/site-header";
import { StructuredDataScript } from "@/src/components/structured-data-script";
import { ProPage } from "@/src/components/pro-page";

const structuredData = [
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "ColorArchive Pro",
    description:
      "Unlock unlimited AI palette generations, full exports, WCAG reports, and more with ColorArchive Pro.",
    url: "https://colorarchive.me/pro/",
    applicationCategory: "DesignApplication",
    operatingSystem: "Web",
    offers: [
      {
        "@type": "Offer",
        price: "499",
        priceCurrency: "JPY",
        name: "Monthly",
        url: "https://colorarchive.me/pro/",
      },
      {
        "@type": "Offer",
        price: "3999",
        priceCurrency: "JPY",
        name: "Yearly",
        url: "https://colorarchive.me/pro/",
      },
      {
        "@type": "Offer",
        price: "9800",
        priceCurrency: "JPY",
        name: "Lifetime",
        url: "https://colorarchive.me/pro/",
      },
    ],
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "ColorArchive", item: "https://colorarchive.me/" },
      { "@type": "ListItem", position: 2, name: "Pro", item: "https://colorarchive.me/pro/" },
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
