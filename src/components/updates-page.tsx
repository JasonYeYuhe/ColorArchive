import Link from "next/link";
import type { ProjectUpdateEntry } from "@/src/lib/project-updates";

interface UpdatesPageProps {
  updates: readonly ProjectUpdateEntry[];
}

export function UpdatesPage({ updates }: UpdatesPageProps) {
  return (
    <main className="px-4 py-4 sm:px-6 sm:py-6">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6">
        <section className="relative overflow-hidden rounded-[2rem] border border-black/6 bg-white/74 px-6 py-10 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:px-10 sm:py-14">
          <div className="pointer-events-none absolute left-0 top-0 h-56 w-56 rounded-full bg-violet-200/28 blur-3xl" />
          <div className="pointer-events-none absolute right-0 top-8 h-64 w-64 rounded-full bg-amber-200/24 blur-3xl" />
          <div className="relative mx-auto max-w-5xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-black/8 bg-white/85 px-3 py-1 text-xs font-medium tracking-[0.22em] text-neutral-500 uppercase">
              <span className="inline-block h-2 w-2 rounded-full bg-neutral-900" />
              Project updates
            </div>
            <h1 className="max-w-4xl text-4xl font-semibold tracking-[-0.04em] text-neutral-950 sm:text-6xl">
              What changed in the archive
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-neutral-600 sm:text-lg">
              A static changelog for route additions, product-layer changes, and major archive
              improvements. This gives the site a visible shipping history.
            </p>
          </div>
        </section>

        <section className="space-y-4">
          {updates.map((update) => (
            <article
              key={update.id}
              className="rounded-[1.75rem] border border-black/6 bg-white/82 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)]"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="max-w-3xl">
                  <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
                    {update.date}
                  </div>
                  <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-neutral-950">
                    {update.title}
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-neutral-600">{update.summary}</p>
                </div>
                <div className="rounded-full border border-black/6 bg-neutral-50 px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-neutral-500">
                  Update
                </div>
              </div>

              <div className="mt-5 grid gap-2">
                {update.bullets.map((bullet) => (
                  <div
                    key={bullet}
                    className="rounded-[1rem] border border-black/6 bg-neutral-50 px-4 py-3 text-sm leading-6 text-neutral-600"
                  >
                    {bullet}
                  </div>
                ))}
              </div>
            </article>
          ))}
        </section>

        <section className="rounded-[1.75rem] border border-black/6 bg-white/82 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
          <div className="flex flex-wrap gap-2">
            <Link
              href="/about"
              className="rounded-full border border-black/8 bg-neutral-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800"
            >
              About the project
            </Link>
            <Link
              href="/support"
              className="rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
            >
              Support
            </Link>
            <Link
              href="/free-pack"
              className="rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
            >
              Free sample
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
