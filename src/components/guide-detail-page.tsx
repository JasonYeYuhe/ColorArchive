"use client";

import Link from "next/link";
import { useLocale } from "@/src/components/locale-provider";
import { CotdSubscribeForm } from "@/src/components/cotd-subscribe-form";
import { track } from "@/src/lib/track";
import type { ColorCollection } from "@/src/lib/collections";
import type { LandingGuide } from "@/src/lib/guides";

export function GuideDetailPage({
  guide,
  relatedGuides,
  featuredCollection,
  faqs = [],
}: {
  guide: LandingGuide;
  relatedGuides: LandingGuide[];
  featuredCollection: ColorCollection | null;
  // Hand-written FAQ for high-traffic guides (src/lib/guide-seo.ts); plain data
  // so the module never reaches the client bundle. Empty for most guides.
  faqs?: { question: string; answer: string }[];
}) {
  const { t } = useLocale();

  return (
    <main className="px-4 py-4 sm:px-6 sm:py-6">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <section className="rounded-[2rem] border border-black/6 bg-white/80 px-6 py-10 shadow-[0_24px_80px_rgba(15,23,42,0.08)] sm:px-10 sm:py-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-black/8 bg-white/90 px-3 py-1 text-xs font-medium uppercase tracking-[0.22em] text-neutral-500">
            <span className="inline-block h-2 w-2 rounded-full bg-neutral-900" />
            {guide.eyebrow}
          </div>
          <div className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
            {t("guide.searchIntent")} {guide.searchIntent}
          </div>
          <h1 className="mt-3 max-w-4xl font-display text-4xl font-light tracking-[-0.04em] text-neutral-950 sm:text-6xl">
            {guide.title}
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-neutral-600 sm:text-lg">
            {guide.summary}
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {guide.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-black/8 bg-white px-3 py-1.5 text-xs font-medium uppercase tracking-[0.14em] text-neutral-500"
              >
                {tag}
              </span>
            ))}
          </div>
        </section>

        <section className="rounded-[1.75rem] border border-black/6 bg-white/82 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
          <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
            {t("guide.keyPoints")}
          </div>
          <div className="mt-4 grid gap-3">
            {guide.highlights.map((highlight) => (
              <div
                key={highlight}
                className="rounded-[1rem] border border-black/6 bg-neutral-50 px-4 py-3 text-sm leading-6 text-neutral-600"
              >
                {highlight}
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(18rem,0.85fr)]">
          <div className="space-y-4">
            {guide.sections.map((section) => (
              <article
                key={section.heading}
                className="rounded-[1.75rem] border border-black/6 bg-white/82 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)]"
              >
                <h2 className="text-2xl font-semibold tracking-[-0.03em] text-neutral-950">
                  {section.heading}
                </h2>
                <p className="mt-3 text-sm leading-7 text-neutral-600">{section.body}</p>
              </article>
            ))}
          </div>

          <div className="space-y-4">
            {featuredCollection ? (
              <aside className="rounded-[1.75rem] border border-black/6 bg-white/82 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
                <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
                  {t("guide.featuredCollection")}
                </div>
                <div className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-neutral-950">
                  {featuredCollection.title}
                </div>
                <p className="mt-3 text-sm leading-6 text-neutral-600">{featuredCollection.summary}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    href={`/collections/${featuredCollection.id}/`}
                    className="rounded-full border border-black/8 bg-neutral-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800"
                  >
                    {t("guide.openCollection")}
                  </Link>
                  <Link
                    href="/collections/"
                    className="rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
                  >
                    {t("guide.allCollections")}
                  </Link>
                </div>
              </aside>
            ) : null}

            <aside className="rounded-[1.75rem] border border-black/6 bg-white/82 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
              <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
                {t("guide.openNext")}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {guide.links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    // Content → tool is the whole thesis of the guides library,
                    // and until now it was entirely uninstrumented: we could not
                    // tell whether 8,398 monthly guide reads produce any tool use.
                    onClick={() =>
                      track("guide_tool_click", { guide: guide.slug, target: link.href })
                    }
                    className="rounded-full border border-black/8 bg-neutral-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </aside>
          </div>
        </section>

        {faqs.length > 0 ? (
          <section className="rounded-[1.75rem] border border-black/6 bg-white/82 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)] sm:p-6">
            <h2 className="text-2xl font-semibold tracking-[-0.03em] text-neutral-950">
              Frequently asked questions
            </h2>
            <dl className="mt-5 grid gap-4 md:grid-cols-2">
              {faqs.map((item) => (
                <div key={item.question} className="rounded-[1.2rem] border border-black/6 bg-neutral-50/70 p-5">
                  <dt className="text-base font-semibold text-neutral-900">{item.question}</dt>
                  <dd className="mt-2 text-sm leading-6 text-neutral-600">{item.answer}</dd>
                </div>
              ))}
            </dl>
          </section>
        ) : null}

        <section className="rounded-[1.75rem] border border-black/6 bg-neutral-950 p-5 text-white shadow-[0_18px_48px_rgba(15,23,42,0.05)] dark:border-white/10 dark:bg-white dark:text-neutral-950">
          <div className="text-xs font-medium uppercase tracking-[0.18em] text-white/40 dark:text-neutral-400">
            {t("guide.ctaLabel")}
          </div>
          <p className="mt-2 text-lg font-semibold tracking-[-0.02em]">
            {t("guide.ctaTitle")}
          </p>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/60 dark:text-neutral-500">
            {t("guide.ctaDesc")}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/pro/"
              onClick={() => track("pro_cta_click", { surface: "guide", guide: guide.slug })}
              className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-neutral-950 transition hover:bg-neutral-200 dark:bg-neutral-950 dark:text-white dark:hover:bg-neutral-800"
            >
              {t("guide.browsePacks")}
            </Link>
            <Link
              href="/guides/"
              className="rounded-full border border-white/16 px-5 py-2.5 text-sm font-semibold text-white/80 transition hover:border-white/30 hover:text-white dark:border-black/16 dark:text-neutral-600 dark:hover:border-black/30 dark:hover:text-neutral-950"
            >
              {t("guide.moreGuides")}
            </Link>
          </div>
        </section>

        {/* Design Notes capture. Placed AFTER the article body on purpose: it
            never interrupts the read (and never as a popup — an intrusive
            interstitial would penalise the organic search that brings these
            readers in the first place). The hook is deliberately technical:
            someone here is mid-research on contrast or OKLCH, so a daily color
            is the wrong promise — they get the weekly working note instead. */}
        <section className="rounded-[1.75rem] border border-black/6 bg-white/82 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)] sm:p-6">
          <div className="mx-auto max-w-xl text-center">
            <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
              Design Notes
            </div>
            <p className="mt-3 text-lg font-semibold tracking-[-0.02em] text-neutral-950">
              One practical color note a week
            </p>
            <p className="mt-2 text-sm leading-6 text-neutral-600">
              Contrast and accessibility, color spaces like OKLCH, palette structure, design
              tokens — written for people who build things. No daily noise.
            </p>
            <div className="mt-4 text-left">
              <CotdSubscribeForm
                source="guide"
                heading="Get Design Notes weekly"
                cotd={false}
                notes
                successNote="You're on the list — the next Design Notes lands in your inbox."
                footnote="One email a week. Unsubscribe anytime."
                // Route them into the tool this very guide is about, rather than
                // ending on a confirmation. guide.links is the curated mapping
                // that already exists (317 entries), so this stays contextual.
                successCta={
                  guide.links[0]
                    ? { href: guide.links[0].href, label: `Try it: ${guide.links[0].label} →` }
                    : undefined
                }
              />
            </div>
          </div>
        </section>

        {relatedGuides.length > 0 ? (
          <section className="rounded-[1.75rem] border border-black/6 bg-white/82 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
            <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
              {t("guide.relatedGuides")}
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {relatedGuides.map((relatedGuide) => (
                <Link
                  key={relatedGuide.slug}
                  href={`/guides/${relatedGuide.slug}/`}
                  className="rounded-[1.2rem] border border-black/6 bg-neutral-50 px-4 py-4 transition hover:bg-white"
                >
                  <div className="text-xs font-medium uppercase tracking-[0.16em] text-neutral-400">
                    {relatedGuide.eyebrow}
                  </div>
                  <div className="mt-2 text-lg font-semibold tracking-[-0.02em] text-neutral-950">
                    {relatedGuide.title}
                  </div>
                  <div className="mt-2 text-sm leading-6 text-neutral-600">{relatedGuide.summary}</div>
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}
