import { Suspense } from "react";
import { ColorArchivePage } from "@/src/components/color-archive-page";
import { OnboardingBanner } from "@/src/components/onboarding-banner";
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
      "A searchable archive of 5,400+ curated hex colors with palette tools and design token exports.",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://colorarchive.me/all-colors?q={search_term_string}",
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
      <OnboardingBanner />
      <Suspense fallback={
        <div className="px-4 py-4 sm:px-6 sm:py-6">
          <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6">
            <div className="animate-pulse space-y-3 py-8">
              <div className="mx-auto h-8 w-64 rounded-lg bg-neutral-200 dark:bg-neutral-800" />
              <div className="mx-auto h-4 w-96 rounded bg-neutral-100 dark:bg-neutral-800/60" />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
              {Array.from({ length: 20 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[4/3] rounded-2xl bg-neutral-200 dark:bg-neutral-800" />
                  <div className="mt-2 h-4 w-24 rounded bg-neutral-100 dark:bg-neutral-800/60" />
                </div>
              ))}
            </div>
          </div>
        </div>
      }>
        <ColorArchivePage colors={colors} />
      </Suspense>
    </>
  );
}
