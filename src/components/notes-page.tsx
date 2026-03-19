import { Suspense } from "react";
import Link from "next/link";
import { EmailCaptureForm } from "@/src/components/email-capture-form";
import type { NewsletterIssue } from "@/src/lib/newsletter-issues";
import { tagToSlug } from "@/src/lib/newsletter-issues";

export function NotesPage({ issues }: { issues: NewsletterIssue[] }) {
  const latestIssue = issues[0];

  return (
    <main className="px-4 py-4 sm:px-6 sm:py-6">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6">
        <section className="relative overflow-hidden rounded-[2rem] border border-black/6 bg-white/74 px-6 py-10 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:px-10 sm:py-14">
          <div className="pointer-events-none absolute left-0 top-8 h-52 w-52 rounded-full bg-emerald-200/28 blur-3xl" />
          <div className="pointer-events-none absolute right-0 top-0 h-64 w-64 rounded-full bg-amber-200/24 blur-3xl" />
          <div className="relative mx-auto max-w-5xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-black/8 bg-white/85 px-3 py-1 text-xs font-medium tracking-[0.22em] text-neutral-500 uppercase">
              <span className="inline-block h-2 w-2 rounded-full bg-neutral-900" />
              Monthly notes
            </div>
            <h1 className="max-w-4xl text-4xl font-semibold tracking-[-0.04em] text-neutral-950 sm:text-6xl">
              Public notes for palette direction, product updates, and release context
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-neutral-600 sm:text-lg">
              This is the public layer behind the updates email. Each issue ties one featured
              palette direction to one concrete product or tooling change.
            </p>

            {latestIssue ? (
              <div className="mt-8 rounded-[1.5rem] border border-black/6 bg-white/86 px-5 py-5">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
                  Latest issue
                </div>
                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-neutral-950">
                  {latestIssue.title}
                </h2>
                <p className="mt-3 text-sm leading-6 text-neutral-600">{latestIssue.summary}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    href={`/notes/${latestIssue.slug}`}
                    className="rounded-full border border-black/8 bg-neutral-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800"
                  >
                    Read latest issue
                  </Link>
                  <Link
                    href="/waitlist/"
                    className="rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
                  >
                    Join email updates
                  </Link>
                </div>
              </div>
            ) : null}
          </div>
        </section>

        <section className="rounded-[1.75rem] border border-black/6 bg-white/82 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
                Issue archive
              </div>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-neutral-600">
                Treat these notes as a public monthly archive rather than one-off announcements.
                Each issue links one palette direction, one concrete ship, and one next step.
              </p>
            </div>
            <Link
              href="/waitlist/"
              className="rounded-full border border-black/8 bg-neutral-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800"
            >
              Join email updates
            </Link>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {issues.map((issue) => (
              <div
                key={`${issue.slug}-archive`}
                className="rounded-[1rem] border border-black/6 bg-neutral-50 px-4 py-4"
              >
                <div className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-400">
                  {issue.eyebrow}
                </div>
                <div className="mt-2 text-lg font-semibold tracking-[-0.02em] text-neutral-950">
                  {issue.title}
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {issue.tags.map((tag) => (
                    <Link
                      key={tag}
                      href={`/notes/tags/${tagToSlug(tag)}`}
                      className="rounded-full border border-black/8 bg-white px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-[0.14em] text-neutral-500 transition hover:bg-neutral-50 hover:text-neutral-900"
                    >
                      {tag}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-2">
          {issues.map((issue) => (
            <article
              key={issue.slug}
              className="rounded-[1.75rem] border border-black/6 bg-white/82 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)]"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-400">
                  {issue.eyebrow}
                </span>
                <span className="rounded-full border border-black/8 bg-neutral-50 px-2.5 py-0.5 text-xs font-medium uppercase tracking-[0.14em] text-neutral-500">
                  {issue.date}
                </span>
              </div>
              <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-neutral-950">
                {issue.title}
              </h2>
              <p className="mt-3 text-sm leading-6 text-neutral-600">{issue.summary}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {issue.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-black/8 bg-white px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-[0.14em] text-neutral-500"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div className="mt-5 grid gap-2">
                {issue.highlights.map((highlight) => (
                  <div
                    key={highlight}
                    className="rounded-[1rem] border border-black/6 bg-neutral-50 px-4 py-3 text-sm leading-6 text-neutral-600"
                  >
                    {highlight}
                  </div>
                ))}
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                <Link
                  href={`/notes/${issue.slug}`}
                  className="rounded-full border border-black/8 bg-neutral-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800"
                >
                  Read issue
                </Link>
                {issue.links[0] ? (
                  <Link
                    href={issue.links[0].href}
                    className="rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
                  >
                    {issue.links[0].label}
                  </Link>
                ) : null}
              </div>
            </article>
          ))}
        </section>

        <section className="rounded-[1.75rem] border border-black/6 bg-neutral-950 p-5 text-white shadow-[0_18px_48px_rgba(15,23,42,0.05)] dark:border-white/10 dark:bg-white dark:text-neutral-950">
          <div className="text-xs font-medium uppercase tracking-[0.18em] text-white/40 dark:text-neutral-400">
            Stay in the loop
          </div>
          <p className="mt-2 text-lg font-semibold tracking-[-0.02em]">
            Get new issues by email
          </p>
          <p className="mt-2 max-w-xl text-sm leading-6 text-white/60 dark:text-neutral-500">
            New palette directions, product updates, and archive notes — delivered when they land.
          </p>
          <div className="mt-4 max-w-sm">
            <Suspense fallback={null}>
              <EmailCaptureForm
                source="notes-list"
                placeholder="your@email.com"
                buttonLabel="Subscribe"
                successMessage="You're in — we'll email you about new issues."
              />
            </Suspense>
          </div>
        </section>
      </div>
    </main>
  );
}
