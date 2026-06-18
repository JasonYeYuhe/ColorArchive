"use client";

import Link from "next/link";
import type { NewsletterIssue } from "@/src/lib/newsletter-issues";
import { tagToSlug } from "@/src/lib/newsletter-slug";

interface TagNotesPageProps {
  tag: string;
  issues: NewsletterIssue[];
}

export function TagNotesPage({ tag, issues }: TagNotesPageProps) {
  return (
    <main className="px-4 py-4 sm:px-6 sm:py-6">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6">
        <section className="rounded-[2rem] border border-black/6 bg-white/80 px-6 py-10 shadow-[0_24px_80px_rgba(15,23,42,0.08)] sm:px-10 sm:py-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-black/8 bg-white/90 px-3 py-1 text-xs font-medium uppercase tracking-[0.22em] text-neutral-500">
            <span className="inline-block h-2 w-2 rounded-full bg-neutral-900" />
            Notes · {tag}
          </div>
          <h1 className="mt-6 max-w-4xl font-display text-4xl font-light tracking-[-0.04em] text-neutral-950 sm:text-6xl">
            {tag}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-neutral-500">
            {issues.length} {issues.length === 1 ? "issue" : "issues"} tagged with this topic.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Link
              href="/notes/"
              className="rounded-full border border-black/8 bg-neutral-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800"
            >
              All notes
            </Link>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {issues.map((issue) => (
            <Link
              key={issue.slug}
              href={`/notes/${issue.slug}`}
              className="group flex flex-col gap-4 rounded-[1.75rem] border border-black/6 bg-white/82 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)] transition hover:shadow-[0_24px_64px_rgba(15,23,42,0.1)]"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
                  {issue.eyebrow}
                </span>
                <span className="text-xs text-neutral-400">{issue.date}</span>
              </div>
              <h2 className="text-base font-semibold leading-snug tracking-[-0.02em] text-neutral-950 transition group-hover:text-neutral-700">
                {issue.title}
              </h2>
              <p className="text-sm leading-6 text-neutral-500">{issue.summary}</p>
              <div className="mt-auto flex flex-wrap gap-1.5">
                {issue.tags.map((t) => (
                  <span
                    key={t}
                    className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium tracking-[0.1em] ${
                      t === tag
                        ? "border-neutral-900/20 bg-neutral-900 text-white"
                        : "border-black/8 bg-neutral-50 text-neutral-500"
                    }`}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </section>

        <section className="rounded-[1.75rem] border border-black/6 bg-white/82 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
          <div className="mb-4 text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
            Browse other topics
          </div>
          <div className="flex flex-wrap gap-2">
            {Array.from(new Set(issues.flatMap((i) => i.tags)))
              .filter((t) => t !== tag)
              .map((t) => (
                <Link
                  key={t}
                  href={`/notes/tags/${tagToSlug(t)}`}
                  className="rounded-full border border-black/8 bg-neutral-50 px-3 py-1.5 text-xs text-neutral-600 transition hover:bg-neutral-100"
                >
                  {t}
                </Link>
              ))}
            <Link
              href="/notes/"
              className="rounded-full border border-black/8 bg-neutral-50 px-3 py-1.5 text-xs text-neutral-600 transition hover:bg-neutral-100"
            >
              All notes →
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
