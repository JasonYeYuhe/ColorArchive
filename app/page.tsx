import { Suspense } from "react";
import { ColorArchivePage } from "@/src/components/color-archive-page";
import { OnboardingTour } from "@/src/components/onboarding-tour";
import { SiteHeader } from "@/src/components/site-header";
import { StructuredDataScript } from "@/src/components/structured-data-script";
import { colors } from "@/src/data/colors";
import { landingGuides } from "@/src/lib/guides";
import { newsletterIssues } from "@/src/lib/newsletter-issues";
import { SITE_URL, CONTACT_EMAIL } from "@/src/lib/site-config";

// Pre-trim the two 1.4MB content datasets to only the fields the below-fold
// hero renders, so the full datasets never leak into the client/RSC payload.
const featuredGuides = landingGuides.slice(0, 4).map((g) => ({
  slug: g.slug,
  eyebrow: g.eyebrow,
  searchIntent: g.searchIntent,
  title: g.title,
  summary: g.summary,
}));

const recentNotes = newsletterIssues.slice(0, 3).map((n) => ({
  slug: n.slug,
  eyebrow: n.eyebrow,
  title: n.title,
  summary: n.summary,
}));

const homepageStructuredData = [
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "ColorArchive",
    url: SITE_URL,
    description:
      "A searchable archive of 5,400+ curated hex colors with palette tools and design token exports.",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/all-colors?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "ColorArchive",
    url: SITE_URL,
    logo: `${SITE_URL}/og-image-v1.png`,
    contactPoint: {
      "@type": "ContactPoint",
      email: CONTACT_EMAIL,
      contactType: "customer support",
    },
  },
];

export default function HomePage() {
  return (
    <>
      <SiteHeader currentPath="/" />
      <StructuredDataScript data={homepageStructuredData} />
      <OnboardingTour />
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
        <ColorArchivePage colors={colors} featuredGuides={featuredGuides} recentNotes={recentNotes} />
      </Suspense>
    </>
  );
}
