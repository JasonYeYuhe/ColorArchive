"use client";

import { Fragment } from "react";
import Link from "next/link";
import { useLocale } from "@/src/components/locale-provider";
import { GuideWordCard } from "@/src/components/guide-word-card";
import { track } from "@/src/lib/track";
import type { ColorCollection } from "@/src/lib/collections";
import type { LandingGuide } from "@/src/lib/guides";

export function GuideDetailPage({
  guide,
  relatedGuides,
  featuredCollection,
  seedWord,
  faqs = [],
}: {
  guide: LandingGuide;
  relatedGuides: LandingGuide[];
  featuredCollection: ColorCollection | null;
  // Prefill for the W1 card, derived in the Server Component. Passed as a plain
  // string rather than computed here on purpose: deriving it needs the guide's
  // tags, and reaching for those from a "use client" file means a value import of
  // src/lib/guides.ts — 1.42MB that does not tree-shake (see 96ff99e).
  seedWord: string;
  // Hand-written FAQ for high-traffic guides (src/lib/guide-seo.ts); plain data
  // so the module never reaches the client bundle. Empty for most guides.
  faqs?: { question: string; answer: string }[];
}) {
  const { t } = useLocale();

  return (
    <main className="px-4 py-4 sm:px-6 sm:py-6">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <section className="rounded-[2rem] border border-black/6 bg-white/80 dark:border-white/10 dark:bg-neutral-900/80 px-6 py-10 shadow-[0_24px_80px_rgba(15,23,42,0.08)] sm:px-10 sm:py-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-black/8 bg-white/90 px-3 py-1 text-xs font-medium uppercase tracking-[0.22em] text-neutral-500 dark:text-neutral-500">
            <span className="inline-block h-2 w-2 rounded-full bg-neutral-900" />
            {guide.eyebrow}
          </div>
          {/* The "Search intent: <raw keyword>" row that used to sit here is gone.
              `searchIntent` is the SEO keyword a guide was written to rank for —
              "brand color palette ideas", "figma color tokens" — and it was the
              reader's second line of text on all 333 guides, stacked as a second
              small-caps line before the title. The field still does real work
              invisibly in the /guides/ index search filter, which is where
              keyword data belongs.

              (Removed once already in the low-severity batch; a revert during the
              medium batch undid it and it went unnoticed until the slot below was
              being rebuilt.) */}
          <h1 className="mt-4 max-w-4xl font-display text-4xl font-light tracking-[-0.04em] text-neutral-950 dark:text-white sm:text-6xl">
            {guide.title}
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-neutral-600 dark:text-neutral-300 sm:text-lg">
            {guide.summary}
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {guide.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-black/8 bg-white px-3 py-1.5 text-xs font-medium uppercase tracking-[0.14em] text-neutral-500 dark:text-neutral-500"
              >
                {tag}
              </span>
            ))}
          </div>
        </section>

        <section className="rounded-[1.75rem] border border-black/6 bg-white/82 dark:border-white/10 dark:bg-neutral-900/80 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
          <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400 dark:text-neutral-500">
            {t("guide.keyPoints")}
          </div>
          <div className="mt-4 grid gap-3">
            {guide.highlights.map((highlight) => (
              <div
                key={highlight}
                className="rounded-[1rem] border border-black/6 bg-neutral-50 px-4 py-3 text-sm leading-6 text-neutral-600 dark:text-neutral-300"
              >
                {highlight}
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(18rem,0.85fr)]">
          <div className="space-y-4">
            {guide.sections.map((section, index) => (
              <Fragment key={section.heading}>
                <article
                  className="rounded-[1.75rem] border border-black/6 bg-white/82 dark:border-white/10 dark:bg-neutral-900/80 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)]"
                >
                  <h2 className="text-2xl font-semibold tracking-[-0.03em] text-neutral-950 dark:text-white">
                    {section.heading}
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-neutral-600 dark:text-neutral-300">{section.body}</p>
                </article>
                {/* W1 (dev-plan-2026-08-31-next §5). Renders in the treatment arm
                    only; the component itself is mounted in both and is what
                    emits the experiment's denominator. AFTER the first section on
                    purpose — the hero and key-points panels above it clear one
                    viewport on every breakpoint, so the post-hydration insert is
                    off-screen and scores no CLS. Every guide has ≥2 sections, so
                    this is never the last thing in the column. */}
                {index === 0 ? (
                  // `key` is load-bearing, not tidiness. On a client-side nav from
                  // guide A to guide B React reconciles by position, and the card's
                  // `useState(seedWord)` initialiser only runs on MOUNT — so a
                  // reused instance would keep showing A's word on B's page, and
                  // carry A's emitted-words and depth sets into B's measurements.
                  // It happens to remount today only because all 333 first-section
                  // headings are distinct, which makes the enclosing Fragment's key
                  // change. That is a property of the CONTENT, not of this code, and
                  // autopilot writes new guides into src/lib/guides.ts unattended.
                  // Keying on the slug makes the remount say so.
                  <GuideWordCard key={guide.slug} seedWord={seedWord} slug={guide.slug} />
                ) : null}
              </Fragment>
            ))}
          </div>

          <div className="space-y-4">
            {featuredCollection ? (
              <aside className="rounded-[1.75rem] border border-black/6 bg-white/82 dark:border-white/10 dark:bg-neutral-900/80 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
                <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400 dark:text-neutral-500">
                  {t("guide.featuredCollection")}
                </div>
                <div className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-neutral-950 dark:text-white">
                  {featuredCollection.title}
                </div>
                <p className="mt-3 text-sm leading-6 text-neutral-600 dark:text-neutral-300">{featuredCollection.summary}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    href={`/collections/${featuredCollection.id}/`}
                    className="rounded-full border border-black/8 bg-neutral-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800"
                  >
                    {t("guide.openCollection")}
                  </Link>
                  <Link
                    href="/collections/"
                    className="rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-200 transition hover:bg-neutral-50"
                  >
                    {t("guide.allCollections")}
                  </Link>
                </div>
              </aside>
            ) : null}

            <aside className="rounded-[1.75rem] border border-black/6 bg-white/82 dark:border-white/10 dark:bg-neutral-900/80 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
              <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400 dark:text-neutral-500">
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
          <section className="rounded-[1.75rem] border border-black/6 bg-white/82 dark:border-white/10 dark:bg-neutral-900/80 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)] sm:p-6">
            <h2 className="text-2xl font-semibold tracking-[-0.03em] text-neutral-950 dark:text-white">
              Frequently asked questions
            </h2>
            <dl className="mt-5 grid gap-4 md:grid-cols-2">
              {faqs.map((item) => (
                <div key={item.question} className="rounded-[1.2rem] border border-black/6 bg-neutral-50/70 p-5">
                  <dt className="text-base font-semibold text-neutral-900 dark:text-neutral-100">{item.question}</dt>
                  <dd className="mt-2 text-sm leading-6 text-neutral-600 dark:text-neutral-300">{item.answer}</dd>
                </div>
              ))}
            </dl>
          </section>
        ) : null}

        <section className="rounded-[1.75rem] border border-black/6 bg-neutral-950 p-5 text-white shadow-[0_18px_48px_rgba(15,23,42,0.05)] dark:border-white/10 dark:bg-white dark:text-neutral-950">
          <div className="text-xs font-medium uppercase tracking-[0.18em] text-white/40 dark:text-neutral-600">
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
              className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-neutral-950 dark:text-white transition hover:bg-neutral-200 dark:bg-neutral-950 dark:hover:bg-neutral-800"
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
        {/* This slot used to ask for an email — "Design Notes, one practical color
            note a week". It was measured over the full 14-day clean window:
            292 sessions had the form in view for a continuous second, and 0
            subscribed. Rule of three puts the true rate under 1.0% at 95%
            confidence, so this was not a headline that needed rewriting.

            What these readers DO do is open the tool a guide is about. So the
            space now carries that, contextually, using the same curated
            guide.links mapping the sidebar uses — and unlike the sidebar, it sits
            in the main column, which is where a reader on anything narrower than
            1280px actually ends up.

            Precedent for reclaiming rather than refilling with another ask: the
            recruitment banner on /word-to-color/ was retired the same way after
            3,857 impressions produced ~0 responses. */}
        <section className="rounded-[1.75rem] border border-black/6 bg-white/82 dark:border-white/10 dark:bg-neutral-900/80 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)] sm:p-6">
          <div className="mx-auto max-w-xl text-center">
            <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400 dark:text-neutral-500">
              {t("guide.putItToWork")}
            </div>
            <p className="mt-3 text-lg font-semibold tracking-[-0.02em] text-neutral-950 dark:text-white">
              {guide.links[0].label}
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              <Link
                href={guide.links[0].href}
                onClick={() =>
                  track("guide_tool_click", {
                    guide: guide.slug,
                    target: guide.links[0].href,
                    placement: "main",
                  })
                }
                className="rounded-full border border-black/8 bg-neutral-950 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-800"
              >
                {guide.links[0].label}
              </Link>
              {guide.links[1] ? (
                <Link
                  href={guide.links[1].href}
                  onClick={() =>
                    track("guide_tool_click", {
                      guide: guide.slug,
                      target: guide.links[1].href,
                      placement: "main",
                    })
                  }
                  className="rounded-full border border-black/8 bg-white px-5 py-2.5 text-sm font-medium text-neutral-700 dark:border-white/10 dark:bg-white/8 dark:text-neutral-200 dark:hover:bg-white/15 transition hover:bg-neutral-50"
                >
                  {guide.links[1].label}
                </Link>
              ) : null}
            </div>
          </div>
        </section>

        {relatedGuides.length > 0 ? (
          <section className="rounded-[1.75rem] border border-black/6 bg-white/82 dark:border-white/10 dark:bg-neutral-900/80 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
            <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400 dark:text-neutral-500">
              {t("guide.relatedGuides")}
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {relatedGuides.map((relatedGuide) => (
                <Link
                  key={relatedGuide.slug}
                  href={`/guides/${relatedGuide.slug}/`}
                  className="rounded-[1.2rem] border border-black/6 bg-neutral-50 px-4 py-4 transition hover:bg-white"
                >
                  <div className="text-xs font-medium uppercase tracking-[0.16em] text-neutral-400 dark:text-neutral-500">
                    {relatedGuide.eyebrow}
                  </div>
                  <div className="mt-2 text-lg font-semibold tracking-[-0.02em] text-neutral-950 dark:text-white">
                    {relatedGuide.title}
                  </div>
                  <div className="mt-2 text-sm leading-6 text-neutral-600 dark:text-neutral-300">{relatedGuide.summary}</div>
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}
