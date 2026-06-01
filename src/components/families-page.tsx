import Link from "next/link";
import type { ColorRecord } from "@/src/types/color";
import type { ColorCollection } from "@/src/lib/collections";
import {
  COLOR_FAMILY_PAGES,
  getColorsForFamily,
  getCollectionsForFamily,
} from "@/src/lib/color-family-pages";

interface FamiliesPageProps {
  colors: readonly ColorRecord[];
  collections: readonly ColorCollection[];
}

export function FamiliesPage({ colors, collections }: FamiliesPageProps) {
  return (
    <main className="px-4 py-4 sm:px-6 sm:py-6">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6">
        <section className="relative overflow-hidden rounded-[2rem] border border-black/6 bg-white/74 px-6 py-10 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:px-10 sm:py-14">
          <div className="relative mx-auto max-w-5xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-black/8 bg-white/85 px-3 py-1 text-xs font-medium uppercase tracking-[0.22em] text-neutral-500">
              <span className="inline-block h-2 w-2 rounded-full bg-neutral-900" />
              Family directory
            </div>
            <h1 className="max-w-4xl font-display text-4xl font-light tracking-[-0.04em] text-neutral-950 sm:text-6xl">
              Explore ColorArchive by hue family
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-neutral-600 sm:text-lg">
              Each family page acts like a micro landing page for one hue cluster, with related
              archive colors, matching collections, and links into packs and search.
            </p>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {COLOR_FAMILY_PAGES.map((entry) => {
            const familyColors = getColorsForFamily(colors, entry.family);
            const familyCollections = getCollectionsForFamily(collections, entry.family).slice(0, 3);
            const swatches = [
              familyColors[1]?.hex ?? "#F5F2EB",
              familyColors[Math.floor(familyColors.length / 2)]?.hex ?? "#DDD7CC",
              familyColors[familyColors.length - 2]?.hex ?? "#B8B1A4",
            ];

            return (
              <article
                key={entry.family}
                className="overflow-hidden rounded-[1.75rem] border border-black/6 bg-white/82 shadow-[0_18px_48px_rgba(15,23,42,0.05)]"
              >
                <div
                  className="h-28 border-b border-black/6"
                  style={{
                    background: `linear-gradient(135deg, ${swatches[0]} 0%, ${swatches[1]} 50%, ${swatches[2]} 100%)`,
                  }}
                />
                <div className="p-5">
                  <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
                    {familyColors.length} colors
                  </div>
                  <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-neutral-950">
                    {entry.title}
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-neutral-600">{entry.summary}</p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {entry.useCases.map((useCase) => (
                      <span
                        key={useCase}
                        className="rounded-full border border-black/8 bg-neutral-50 px-3 py-1.5 text-xs font-medium uppercase tracking-[0.14em] text-neutral-500"
                      >
                        {useCase}
                      </span>
                    ))}
                  </div>

                  <div className="mt-5 rounded-[1.2rem] border border-black/6 bg-neutral-50 px-4 py-4">
                    <div className="text-xs font-medium uppercase tracking-[0.16em] text-neutral-400">
                      Related collections
                    </div>
                    <div className="mt-3 space-y-2">
                      {familyCollections.map(({ collection, matchingColors }) => (
                        <div
                          key={collection.id}
                          className="rounded-[1rem] border border-black/6 bg-white px-3 py-3 text-sm text-neutral-600"
                        >
                          <div className="font-medium text-neutral-950">{collection.title}</div>
                          <div className="mt-1 text-neutral-500">
                            {matchingColors.length} matching family color
                            {matchingColors.length === 1 ? "" : "s"}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    <Link
                      href={`/families/${entry.slug}`}
                      className="rounded-full border border-black/8 bg-neutral-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800"
                    >
                      Open family page
                    </Link>
                    <Link
                      href={`/all-colors?family=${encodeURIComponent(entry.family)}`}
                      className="rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
                    >
                      Search this family
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      </div>
    </main>
  );
}
