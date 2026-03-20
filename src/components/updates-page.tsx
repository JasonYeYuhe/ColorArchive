import Link from "next/link";
import type { ProjectUpdateEntry } from "@/src/lib/project-updates";

interface UpdatesPageProps {
  updates: readonly ProjectUpdateEntry[];
}

function groupByPhase(updates: readonly ProjectUpdateEntry[]) {
  const map = new Map<string, ProjectUpdateEntry[]>();
  for (const entry of updates) {
    const list = map.get(entry.phase) ?? [];
    list.push(entry);
    map.set(entry.phase, list);
  }
  return map;
}

export function UpdatesPage({ updates }: UpdatesPageProps) {
  const shipped = updates.filter((u) => u.status === "shipped");
  const planned = updates.filter((u) => u.status === "planned");
  const plannedByPhase = groupByPhase(planned);

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
              Changelog and roadmap for ColorArchive. Shipped entries track completed work;
              planned entries show the next commerce, content, and account milestones.
            </p>
          </div>
        </section>

        {/* Shipped changelog */}
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-black/6" />
          <div className="rounded-full border border-black/8 bg-white px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-neutral-500">
            Shipped
          </div>
          <div className="h-px flex-1 bg-black/6" />
        </div>

        <section className="space-y-4">
          {shipped.map((update) => (
            <article
              key={update.id}
              className="rounded-[1.75rem] border border-black/6 bg-white/82 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)]"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="max-w-3xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
                      {update.date}
                    </span>
                    <span className="rounded-full border border-black/6 bg-emerald-50 px-2.5 py-0.5 text-xs font-medium uppercase tracking-[0.14em] text-emerald-700">
                      {update.phase}
                    </span>
                  </div>
                  <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-neutral-950">
                    {update.title}
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-neutral-600">{update.summary}</p>
                </div>
                <div className="shrink-0 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-emerald-700">
                  Shipped
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

        {/* Roadmap */}
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-black/6" />
          <div className="rounded-full border border-black/8 bg-white px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-neutral-500">
            Roadmap
          </div>
          <div className="h-px flex-1 bg-black/6" />
        </div>

        <section className="space-y-6">
          {[...plannedByPhase.entries()].map(([phase, entries]) => (
            <div key={phase}>
              <div className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
                {phase}
              </div>
              <div className="space-y-4">
                {entries.map((update) => (
                  <article
                    key={update.id}
                    className="rounded-[1.75rem] border border-dashed border-black/10 bg-white/60 p-5"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="max-w-3xl">
                        <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
                          {update.date}
                        </div>
                        <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-neutral-950">
                          {update.title}
                        </h2>
                        <p className="mt-3 text-sm leading-6 text-neutral-500">{update.summary}</p>
                      </div>
                      <div className="shrink-0 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-amber-700">
                        Planned
                      </div>
                    </div>

                    <div className="mt-5 grid gap-2">
                      {update.bullets.map((bullet) => (
                        <div
                          key={bullet}
                          className="rounded-[1rem] border border-black/6 bg-white/70 px-4 py-3 text-sm leading-6 text-neutral-500"
                        >
                          {bullet}
                        </div>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ))}
        </section>

        <section className="rounded-[1.75rem] border border-black/6 bg-white/82 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
          <div className="flex flex-wrap gap-2">
            <Link
              href="/about/"
              className="rounded-full border border-black/8 bg-neutral-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800"
            >
              About the project
            </Link>
            <Link
              href="/support/"
              className="rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
            >
              Support
            </Link>
            <Link
              href="/login?next=/login"
              className="rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
            >
              Account & orders
            </Link>
            <Link
              href="/notes/"
              className="rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
            >
              Notes
            </Link>
            <Link
              href="/free-pack/"
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
