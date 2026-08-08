import { Suspense } from "react";
import type { Metadata } from "next";
import { ColorArchivePage } from "@/src/components/color-archive-page";
import { OnboardingTour } from "@/src/components/onboarding-tour";
import { SiteHeader } from "@/src/components/site-header";
import { StructuredDataScript } from "@/src/components/structured-data-script";
import { landingGuides } from "@/src/lib/guides";
import { newsletterIssues } from "@/src/lib/newsletter-issues";
import { SITE_URL, CONTACT_EMAIL } from "@/src/lib/site-config";

// The homepage's own canonical. It used to come from app/layout.tsx, which set
// `canonical: "/"` for the whole site — correct here and wrong everywhere else,
// since every page that forgot to override it claimed to be a duplicate of this
// one. The layout no longer sets it; this does, for the one page it was ever
// right for.
export const metadata: Metadata = {
  alternates: { canonical: "/" },
  // NO openGraph key here. Next REPLACES this object rather than merging it
  // (resolve-metadata: case 'openGraph'), so declaring `{ url }` here silently
  // discarded the layout's og:image, og:site_name and og:type — on the single
  // most-shared URL on the site. Inheriting the layout block whole and simply
  // having no og:url is correct: consumers fall back to the fetched URL.
};

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
        <ColorArchivePage featuredGuides={featuredGuides} recentNotes={recentNotes} />
      </Suspense>
    </>
  );
}
