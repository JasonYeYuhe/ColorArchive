import Link from "next/link";
import type { NewsletterIssue } from "@/src/lib/newsletter-issues";

export function NoteDetailPage({ issue }: { issue: NewsletterIssue }) {
  return (
    <main className="px-4 py-4 sm:px-6 sm:py-6">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <section className="rounded-[2rem] border border-black/6 bg-white/80 px-6 py-10 shadow-[0_24px_80px_rgba(15,23,42,0.08)] sm:px-10 sm:py-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-black/8 bg-white/90 px-3 py-1 text-xs font-medium uppercase tracking-[0.22em] text-neutral-500">
            <span className="inline-block h-2 w-2 rounded-full bg-neutral-900" />
            {issue.eyebrow}
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
        </section>

        <section className="rounded-[1.75rem] border border-black/6 bg-white/82 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
          <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
            Highlights
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

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(18rem,0.85fr)]">
          <div className="space-y-4">
            {issue.sections.map((section) => (
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

          <aside className="rounded-[1.75rem] border border-black/6 bg-white/82 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
            <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
              Open next
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {issue.links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-full border border-black/8 bg-neutral-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/waitlist"
                className="rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
              >
                Join updates
              </Link>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
