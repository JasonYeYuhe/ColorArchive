import { Suspense } from "react";
import { ColorArchivePage } from "@/src/components/color-archive-page";
import { SiteHeader } from "@/src/components/site-header";
import { StructuredDataScript } from "@/src/components/structured-data-script";
import { colors } from "@/src/data/colors";

const homepageStructuredData = [
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "ColorArchive",
    url: "https://colorarchive.me",
    description:
      "A searchable archive of 2016 curated hex colors with palette tools and design token exports.",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://colorarchive.me/search?q={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "ColorArchive",
    url: "https://colorarchive.me",
    logo: "https://colorarchive.me/og-image-v1.png",
    contactPoint: {
      "@type": "ContactPoint",
      email: "hello@colorarchive.me",
      contactType: "customer support",
    },
  },
];

export default function HomePage() {
  return (
    <>
      <SiteHeader currentPath="/" />
      <StructuredDataScript data={homepageStructuredData} />
      <Suspense fallback={null}>
        <ColorArchivePage colors={colors} />
      </Suspense>
    </>
  );
}
