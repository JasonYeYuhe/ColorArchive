"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { LandingGuide } from "@/src/lib/guides";

export function GuidesPage({ guides }: { guides: LandingGuide[] }) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const categories = useMemo(() => {
    const cats = new Set<string>();
    for (const g of guides) cats.add(g.category);
    return [...cats];
  }, [guides]);

  const filteredGuides = useMemo(() => {
    let result = guides;
    if (activeCategory) result = result.filter((g) => g.category === activeCategory);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (g) =>
          g.title.toLowerCase().includes(q) ||
          g.summary.toLowerCase().includes(q) ||
          g.tags.some((t) => t.toLowerCase().includes(q)) ||
          g.searchIntent.toLowerCase().includes(q),
      );
    }
    return result;
  }, [guides, search, activeCategory]);

  const featuredGuide = [...guides].sort((a, b) => b.priority - a.priority)[0];
  const popularGuides = [...guides].sort((a, b) => b.priority - a.priority).slice(0, 4);

  const groupedFiltered = useMemo(() => {
    return Object.entries(
      filteredGuides.reduce<Record<string, LandingGuide[]>>((groups, guide) => {
        groups[guide.category] ??= [];
        groups[guide.category].push(guide);
        return groups;
      }, {}),
    );
  }, [filteredGuides]);

  const showPopular = !search.trim() && !activeCategory;

  return (
    <main className="px-4 py-4 sm:px-6 sm:py-6">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6">
        <section className="relative overflow-hidden rounded-[2rem] border border-black/6 bg-white/74 px-6 py-10 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:px-10 sm:py-14">
          <div className="pointer-events-none absolute left-0 top-8 h-56 w-56 rounded-full bg-sky-200/28 blur-3xl" />
          <div className="pointer-events-none absolute right-0 top-0 h-64 w-64 rounded-full bg-amber-200/24 blur-3xl" />
          <div className="relative mx-auto max-w-5xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-black/8 bg-white/85 px-3 py-1 text-xs font-medium tracking-[0.22em] text-neutral-500 uppercase">
              <span className="inline-block h-2 w-2 rounded-full bg-neutral-900" />
              Practical guides
            </div>
            <h1 className="max-w-4xl text-4xl font-semibold tracking-[-0.04em] text-neutral-950 sm:text-6xl">
              Search-intent guides built from the live archive
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-neutral-600 sm:text-lg">
              These pages connect common color questions to concrete ColorArchive routes: collections,
              packs, free downloads, notes, and implementation assets.
            </p>

            {/* Search + category filter */}
            <div className="mt-6 flex flex-col gap-3">
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search guides by keyword, tag, or topic..."
                className="w-full max-w-lg rounded-2xl border border-black/8 bg-white/85 px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-neutral-900/20 focus:ring-4 focus:ring-neutral-900/8"
              />
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setActiveCategory(null)}
                  className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] transition ${!activeCategory ? "bg-neutral-950 text-white" : "border border-black/8 bg-white text-neutral-500 hover:bg-neutral-50"}`}
                >
                  All ({guides.length})
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
                    className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] transition ${activeCategory === cat ? "bg-neutral-950 text-white" : "border border-black/8 bg-white text-neutral-500 hover:bg-neutral-50"}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {showPopular && featuredGuide ? (
              <div className="mt-8 rounded-[1.5rem] border border-black/6 bg-white/86 px-5 py-5">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
                  Featured guide
                </div>
                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-neutral-950">
                  {featuredGuide.title}
                </h2>
                <p className="mt-3 text-sm leading-6 text-neutral-600">{featuredGuide.summary}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    href={`/guides/${featuredGuide.slug}/`}
                    className="rounded-full border border-black/8 bg-neutral-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800"
                  >
                    Read featured guide
                  </Link>
                  <Link
                    href="/packs/"
                    className="rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
                  >
                    Browse packs
                  </Link>
                </div>
              </div>
            ) : null}
          </div>
        </section>

        {showPopular && (
          <section className="rounded-[1.75rem] border border-black/6 bg-white/82 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
                  Popular guides
                </div>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-neutral-600">
                  These are the strongest entry points for people looking for a practical palette,
                  token, or download decision rather than browsing the archive cold.
                </p>
              </div>
              <Link
                href="/packs/"
                className="rounded-full border border-black/8 bg-neutral-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800"
              >
                Browse packs
              </Link>
            </div>

            <div className="mt-5 grid gap-4 xl:grid-cols-2">
              {popularGuides.map((guide) => (
                <article
                  key={guide.slug}
                  className="rounded-[1.5rem] border border-black/6 bg-neutral-50 p-5"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-400">
                      {guide.eyebrow}
                    </span>
                    <span className="rounded-full border border-black/8 bg-white px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-[0.14em] text-neutral-500">
                      {guide.searchIntent}
                    </span>
                  </div>
                  <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-neutral-950">
                    {guide.title}
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-neutral-600">{guide.summary}</p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <Link
                      href={`/guides/${guide.slug}/`}
                      className="rounded-full border border-black/8 bg-neutral-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800"
                    >
                      Read guide
                    </Link>
                    {guide.links[0] ? (
                      <Link
                        href={guide.links[0].href}
                        className="rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
                      >
                        {guide.links[0].label}
                      </Link>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {filteredGuides.length === 0 ? (
          <section className="rounded-[1.75rem] border border-black/6 bg-white/82 p-8 text-center shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
            <h2 className="text-xl font-semibold text-neutral-950">No guides match your search</h2>
            <p className="mt-2 text-sm text-neutral-500">Try a different keyword or clear the filter.</p>
            <button
              type="button"
              onClick={() => { setSearch(""); setActiveCategory(null); }}
              className="mt-4 rounded-full bg-neutral-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800"
            >
              Clear filters
            </button>
          </section>
        ) : (
          <section className="space-y-6">
            {groupedFiltered.map(([category, items]) => (
              <div
                key={category}
                className="rounded-[1.75rem] border border-black/6 bg-white/82 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)]"
              >
                <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
                  {category}
                </div>
                <div className="mt-5 grid gap-4 xl:grid-cols-2">
                  {items.map((guide) => (
                    <article
                      key={guide.slug}
                      className="rounded-[1.5rem] border border-black/6 bg-neutral-50 p-5"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-400">
                          {guide.eyebrow}
                        </span>
                        <span className="rounded-full border border-black/8 bg-white px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-[0.14em] text-neutral-500">
                          {guide.searchIntent}
                        </span>
                      </div>
                      <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-neutral-950">
                        {guide.title}
                      </h2>
                      <p className="mt-3 text-sm leading-6 text-neutral-600">{guide.summary}</p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {guide.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full border border-black/8 bg-white px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-[0.14em] text-neutral-500"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="mt-5 grid gap-2">
                        {guide.highlights.slice(0, 2).map((highlight) => (
                          <div
                            key={highlight}
                            className="rounded-[1rem] border border-black/6 bg-white px-4 py-3 text-sm leading-6 text-neutral-600"
                          >
                            {highlight}
                          </div>
                        ))}
                      </div>
                      <div className="mt-5 flex flex-wrap gap-2">
                        <Link
                          href={`/guides/${guide.slug}/`}
                          className="rounded-full border border-black/8 bg-neutral-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800"
                        >
                          Read guide
                        </Link>
                        {guide.links[0] ? (
                          <Link
                            href={guide.links[0].href}
                            className="rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
                          >
                            {guide.links[0].label}
                          </Link>
                        ) : null}
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            ))}
          </section>
        )}

        <section className="rounded-[1.75rem] border border-black/6 bg-neutral-950 p-5 text-white shadow-[0_18px_48px_rgba(15,23,42,0.05)] dark:border-white/10 dark:bg-white dark:text-neutral-950">
          <div className="text-xs font-medium uppercase tracking-[0.18em] text-white/40 dark:text-neutral-400">
            Next step
          </div>
          <p className="mt-2 text-lg font-semibold tracking-[-0.02em]">
            Guides are the bridge. Packs are the implementation layer.
          </p>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/60 dark:text-neutral-500">
            If one of these guides matches your use case, move directly into the related collection,
            free pack, or paid pack while the context is still clear.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/packs/"
              className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-neutral-950 transition hover:bg-neutral-200 dark:bg-neutral-950 dark:text-white dark:hover:bg-neutral-800"
            >
              Browse packs
            </Link>
            <Link
              href="/free-pack/"
              className="rounded-full border border-white/16 px-4 py-2 text-sm font-semibold text-white/80 transition hover:border-white/30 hover:text-white dark:border-black/16 dark:text-neutral-600 dark:hover:border-black/30 dark:hover:text-neutral-950"
            >
              Get free pack
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
