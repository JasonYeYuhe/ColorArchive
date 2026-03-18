import Link from "next/link";

const principles = [
  {
    title: "Static by design",
    detail:
      "The archive is built to run from local data only, with no backend, database, auth, or server rendering requirement.",
  },
  {
    title: "Curated, not exhaustive",
    detail:
      "ColorArchive does not try to dump the entire RGB universe into one page. It focuses on a large but navigable archive with structure.",
  },
  {
    title: "Useful, not ornamental",
    detail:
      "Every route should either help someone find, compare, export, reuse, or eventually buy a color system.",
  },
] as const;

const routeGroups = [
  {
    title: "Archive",
    items: ["Main archive", "All Colors", "Color detail pages", "Spectrum"],
  },
  {
    title: "Workflow",
    items: ["Search", "Favorites", "Recent", "Word → Color"],
  },
  {
    title: "Product",
    items: ["Collections", "Packs", "Product Examples", "Free Sample Pack"],
  },
] as const;

export function AboutPage() {
  return (
    <main className="px-4 py-4 sm:px-6 sm:py-6">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6">
        <section className="relative overflow-hidden rounded-[2rem] border border-black/6 bg-white/74 px-6 py-10 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:px-10 sm:py-14">
          <div className="pointer-events-none absolute left-0 top-0 h-56 w-56 rounded-full bg-sky-200/28 blur-3xl" />
          <div className="pointer-events-none absolute right-0 top-8 h-64 w-64 rounded-full bg-rose-200/24 blur-3xl" />
          <div className="relative mx-auto max-w-5xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-black/8 bg-white/85 px-3 py-1 text-xs font-medium tracking-[0.22em] text-neutral-500 uppercase">
              <span className="inline-block h-2 w-2 rounded-full bg-neutral-900" />
              About ColorArchive
            </div>
            <h1 className="max-w-4xl text-4xl font-semibold tracking-[-0.04em] text-neutral-950 sm:text-6xl">
              A static color library with product intent
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-neutral-600 sm:text-lg">
              ColorArchive started as a color archive and expanded into a lightweight static product:
              discovery routes, reusable palette exports, and product layers that can later support
              off-site checkout.
            </p>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          {principles.map((principle) => (
            <article
              key={principle.title}
              className="rounded-[1.7rem] border border-black/6 bg-white/82 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)]"
            >
              <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
                Principle
              </div>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-neutral-950">
                {principle.title}
              </h2>
              <p className="mt-3 text-sm leading-6 text-neutral-600">{principle.detail}</p>
            </article>
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(20rem,0.9fr)]">
          <div className="rounded-[1.75rem] border border-black/6 bg-white/82 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
            <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
              Why it is static
            </div>
            <div className="mt-4 space-y-3 text-sm leading-6 text-neutral-600">
              <p>
                The project is intentionally compatible with GitHub Pages. That forces discipline:
                local data only, no backend dependency, no auth wall, and no server-side runtime
                assumptions.
              </p>
              <p>
                That constraint is useful. It keeps the product lightweight, cheap to host, and
                easy to reason about while still leaving room for off-site commerce and email tools.
              </p>
              <p>
                If the product later needs accounts, API logic, or licensed downloads, the archive
                can move to a richer host. Until then, static is the right default.
              </p>
            </div>
          </div>

          <aside className="rounded-[1.75rem] border border-black/6 bg-white/82 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
            <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
              Route groups
            </div>
            <div className="mt-4 space-y-4">
              {routeGroups.map((group) => (
                <div
                  key={group.title}
                  className="rounded-[1.2rem] border border-black/6 bg-neutral-50 px-4 py-4"
                >
                  <div className="text-sm font-semibold text-neutral-950">{group.title}</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {group.items.map((item) => (
                      <span
                        key={item}
                        className="rounded-full border border-black/8 bg-white px-3 py-1.5 text-xs font-medium uppercase tracking-[0.14em] text-neutral-500"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </section>

        <section className="rounded-[1.75rem] border border-black/6 bg-white/82 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
          <div className="flex flex-wrap gap-2">
            <Link
              href="/updates"
              className="rounded-full border border-black/8 bg-neutral-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800"
            >
              Open updates
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
