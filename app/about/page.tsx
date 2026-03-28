import type { Metadata } from "next";
import { AboutPage } from "@/src/components/about-page";
import { SiteHeader } from "@/src/components/site-header";
import { StructuredDataScript } from "@/src/components/structured-data-script";

const structuredData = [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "ColorArchive",
    url: "https://colorarchive.me",
    logo: "https://colorarchive.me/og-image-v1.png",
    description:
      "ColorArchive is a curated library of 3,000+ hex color codes for designers and developers. Learn how the archive works, how colors are generated, and what the product layer offers.",
    contactPoint: {
      "@type": "ContactPoint",
      email: "hello@colorarchive.me",
      contactType: "customer support",
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "ColorArchive", item: "https://colorarchive.me/" },
      { "@type": "ListItem", position: 2, name: "About", item: "https://colorarchive.me/about/" },
    ],
  },
];

export const metadata: Metadata = {
  title: "About ColorArchive",
  description:
    "ColorArchive is a curated library of 3,000+ hex color codes for designers and developers. Learn how the archive works, how colors are generated, and what the product layer offers.",
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
