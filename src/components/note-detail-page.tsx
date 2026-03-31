"use client";

import { Suspense } from "react";
import Link from "next/link";
import { EmailCaptureForm } from "@/src/components/email-capture-form";
import { useLocale } from "@/src/components/locale-provider";
import type { ColorCollection } from "@/src/lib/collections";
import { getGuidesForCollection, getGuidesForPack } from "@/src/lib/guides";
import { palettePacks } from "@/src/lib/palette-packs";
import type { NewsletterIssue } from "@/src/lib/newsletter-issues";
import { tagToSlug } from "@/src/lib/newsletter-issues";

export function NoteDetailPage({
  issue,
  previousIssue,
  nextIssue,
  featuredCollection,
}: {
  issue: NewsletterIssue;
  previousIssue: NewsletterIssue | null;
  nextIssue: NewsletterIssue | null;
  featuredCollection: ColorCollection | null;
}) {
  const { t } = useLocale();
  const featuredPack = issue.featuredPackId
    ? palettePacks.find((pack) => pack.id === issue.featuredPackId) ?? null
    : null;
  const relatedGuides = [
    ...getGuidesForCollection(issue.featuredCollectionId, 2),
    ...getGuidesForPack(issue.featuredPackId, 2),
  ].filter((guide, index, array) => array.findIndex((entry) => entry.slug === guide.slug) === index);

  return (
    <main className="px-4 py-4 sm:px-6 sm:py-6">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <section className="rounded-[2rem] border border-black/6 bg-white/80 px-6 py-10 shadow-[0_24px_80px_rgba(15,23,42,0.08)] sm:px-10 sm:py-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-black/8 bg-white/90 px-3 py-1 text-xs font-medium uppercase tracking-[0.22em] text-neutral-500">
            <span className="inline-block h-2 w-2 rounded-full bg-neutral-900" />
            {issue.eyebrow ?? "ColorArchive Notes"}
          </div>
          <div className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
            {issue.date}
          </div>
          <h1 className="mt-3 max-w-4xl text-4xl font-semibold tracking-[-0.04em] text-neutral-950 sm:text-6xl">
            {issue.title}
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-neutral-600 sm:text-lg">
            {issue.summary}
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {issue.tags.map((tag) => (
              <Link
                key={tag}
                href={`/notes/tags/${tagToSlug(tag)}`}
                className="rounded-full border border-black/8 bg-white px-3 py-1.5 text-xs font-medium uppercase tracking-[0.14em] text-neutral-500 transition hover:bg-neutral-50 hover:text-neutral-900"
              >
                {tag}
              </Link>
            ))}
          </div>
        </section>

        {issue.highlights && issue.highlights.length > 0 && (
          <section className="rounded-[1.75rem] border border-black/6 bg-white/82 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
            <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
              {t("note.highlights")}
            </div>
            <div className="mt-4 grid gap-3">
              {issue.highlights.map((highlight) => (
                <div
                  key={highlight}
                  className="rounded-[1rem] border border-black/6 bg-neutral-50 px-4 py-3 text-sm leading-6 text-neutral-600"
                >
                  {highlight}
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(18rem,0.85fr)]">
          <div className="space-y-4">
            {issue.sections && issue.sections.length > 0 ? (
              issue.sections.map((section) => (
                <article
                  key={section.heading}
                  className="rounded-[1.75rem] border border-black/6 bg-white/82 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)]"
                >
                  <h2 className="text-2xl font-semibold tracking-[-0.03em] text-neutral-950">
                    {section.heading}
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-neutral-600">{section.body}</p>
                </article>
              ))
            ) : issue.body ? (
              <article className="rounded-[1.75rem] border border-black/6 bg-white/82 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
                <div className="prose prose-neutral max-w-none text-sm leading-7 text-neutral-600 [&_strong]:text-neutral-950 [&_p]:mb-4 whitespace-pre-line">
                  {issue.body}
                </div>
              </article>
            ) : null}
          </div>

          <div className="space-y-4">
            {featuredCollection ? (
              <aside className="rounded-[1.75rem] border border-black/6 bg-white/82 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
                <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
                  {t("note.featuredCollection")}
                </div>
                <div className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-neutral-950">
                  {featuredCollection.title}
                </div>
                <p className="mt-3 text-sm leading-6 text-neutral-600">{featuredCollection.summary}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    href={`/collections/${featuredCollection.id}`}
                    className="rounded-full border border-black/8 bg-neutral-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800"
                  >
                    {t("note.openCollection")}
                  </Link>
                  <Link
                    href={`/all-colors?family=${encodeURIComponent(featuredCollection.palette[0]?.family ?? "Green")}`}
                    className="rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
                  >
                    {t("note.searchFamily")}
                  </Link>
                </div>
              </aside>
            ) : null}

            {featuredPack ? (
              <aside className="rounded-[1.75rem] border border-black/6 bg-white/82 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
                <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
                  {t("note.featuredPack")}
                </div>
                <div className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-neutral-950">
                  {featuredPack.title}
                </div>
                <div className="mt-2 text-sm font-medium text-neutral-500">{featuredPack.priceHint}</div>
                <p className="mt-3 text-sm leading-6 text-neutral-600">{featuredPack.detail}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    href={`/packs/${featuredPack.id}`}
                    className="rounded-full border border-black/8 bg-neutral-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800"
                  >
                    {t("note.openPack")}
                  </Link>
                  <Link
                    href="/free-pack/"
                    className="rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
                  >
                    {t("note.tryFreeLayer")}
                  </Link>
                </div>
              </aside>
            ) : null}

            <aside className="rounded-[1.75rem] border border-black/6 bg-white/82 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
              <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
                {t("note.openNext")}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {(issue.links ?? []).map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="rounded-full border border-black/8 bg-neutral-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800"
                  >
                    {link.label}
                  </Link>
                ))}
                <Link
                  href="/"
                  className="rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
                >
                  {t("note.joinUpdates")}
                </Link>
              </div>
            </aside>

            {relatedGuides.length > 0 ? (
              <aside className="rounded-[1.75rem] border border-black/6 bg-white/82 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
                <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
                  {t("note.relatedGuides")}
                </div>
                <div className="mt-4 space-y-3">
                  {relatedGuides.map((guide) => (
                    <Link
                      key={guide.slug}
                      href={`/guides/${guide.slug}/`}
                      className="block rounded-[1.2rem] border border-black/6 bg-neutral-50 px-4 py-4 transition hover:bg-white"
                    >
                      <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-400">
                        {guide.searchIntent}
                      </div>
                      <div className="mt-2 text-sm font-semibold text-neutral-950">{guide.title}</div>
                      <div className="mt-2 text-sm leading-6 text-neutral-600">{guide.summary}</div>
                    </Link>
                  ))}
                </div>
              </aside>
            ) : null}
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          {nextIssue ? (
            <Link
              href={`/notes/${nextIssue.slug}`}
              className="rounded-[1.5rem] border border-black/6 bg-white/82 px-5 py-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)] transition hover:-translate-y-0.5"
            >
              <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
                {t("note.newerIssue")}
              </div>
              <div className="mt-2 text-xl font-semibold tracking-[-0.03em] text-neutral-950">
                {nextIssue.title}
              </div>
              <div className="mt-2 text-sm text-neutral-500">{nextIssue.date}</div>
            </Link>
          ) : (
            <div className="rounded-[1.5rem] border border-black/6 bg-neutral-950 px-5 py-6 text-white dark:border-white/10 dark:bg-white dark:text-neutral-950">
              <div className="text-xs font-medium uppercase tracking-[0.18em] text-white/40 dark:text-neutral-400">
                {t("note.stayInLoop")}
              </div>
              <p className="mt-2 text-lg font-semibold tracking-[-0.02em]">
                {t("note.latestIssue")}
              </p>
              <p className="mt-2 text-sm leading-6 text-white/60 dark:text-neutral-500">
                {t("note.notifyDesc")}
              </p>
              <div className="mt-4">
                <Suspense fallback={null}>
                  <EmailCaptureForm
                    source="notes-latest"
                    placeholder="your@email.com"
                    buttonLabel={t("note.subscribe")}
                    successMessage={t("note.successMessage")}
                  />
                </Suspense>
              </div>
            </div>
          )}

          {previousIssue ? (
            <Link
              href={`/notes/${previousIssue.slug}`}
              className="rounded-[1.5rem] border border-black/6 bg-white/82 px-5 py-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)] transition hover:-translate-y-0.5"
            >
              <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
                {t("note.olderIssue")}
              </div>
              <div className="mt-2 text-xl font-semibold tracking-[-0.03em] text-neutral-950">
                {previousIssue.title}
              </div>
              <div className="mt-2 text-sm text-neutral-500">{previousIssue.date}</div>
            </Link>
          ) : (
            <div className="rounded-[1.5rem] border border-dashed border-black/10 bg-white/60 px-5 py-5 text-sm text-neutral-500">
              {t("note.oldestIssue")}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
