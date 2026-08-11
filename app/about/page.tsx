import type { Metadata } from "next";
import { AboutPage } from "@/src/components/about-page";
import { SiteHeader } from "@/src/components/site-header";
import { StructuredDataScript } from "@/src/components/structured-data-script";
import { SITE_URL, CONTACT_EMAIL } from "@/src/lib/site-config";

const structuredData = [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "ColorArchive",
    url: SITE_URL,
    logo: `${SITE_URL}/og-image-v1.png`,
    description:
      "ColorArchive is a curated library of 5,446 hex color codes for designers and developers. Learn how the archive works, how colors are generated, and what the product layer offers.",
    contactPoint: {
      "@type": "ContactPoint",
      email: CONTACT_EMAIL,
      contactType: "customer support",
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "ColorArchive", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "About", item: `${SITE_URL}/about/` },
    ],
  },
];

export const metadata: Metadata = {
  title: "About ColorArchive",
  description:
    "ColorArchive is a curated library of 5,446 hex color codes for designers and developers. Learn how the archive works, how colors are generated, and what the product layer offers.",
  alternates: {
    canonical: "/about/",
  },
};

export default function AboutRoute() {
  return (
    <>
      <SiteHeader currentPath="/about" />
      <StructuredDataScript data={structuredData} />
      <AboutPage />
    </>
  );
}
