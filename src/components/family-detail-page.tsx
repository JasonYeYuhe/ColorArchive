import Link from "next/link";
import type { ColorRecord, ColorFamily } from "@/src/types/color";
import type { ColorCollection } from "@/src/lib/collections";
import type { ColorFamilyPageData } from "@/src/lib/color-family-pages";

interface FamilyDetailPageProps {
  family: ColorFamily;
  familyPage: ColorFamilyPageData;
  familyColors: readonly ColorRecord[];
  relatedCollections: Array<{
    collection: ColorCollection;
    matchingColors: ColorRecord[];
  }>;
}

export function FamilyDetailPage({
  family,
  familyPage,
  familyColors,
  relatedCollections,
}: FamilyDetailPageProps) {
  const featuredColors = familyColors.slice(0, 24);
  const primaryCollection = relatedCollections[0]?.collection ?? null;

  return (
    <main className="px-4 py-4 sm:px-6 sm:py-6">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6">
        <section className="relative overflow-hidden rounded-[2rem] border border-black/6 bg-white/74 px-6 py-10 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:px-10 sm:py-14">
          <div className="relative mx-auto max-w-5xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-black/8 bg-white/85 px-3 py-1 text-xs font-medium uppercase tracking-[0.22em] text-neutral-500">
              <span className="inline-block h-2 w-2 rounded-full bg-neutral-900" />
              {family} family
            </div>
            <h1 className="font-display max-w-4xl text-4xl font-light tracking-[-0.04em] text-neutral-950 sm:text-6xl">
              {familyPage.title}
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-neutral-600 sm:text-lg">
              {familyPage.description}
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              {familyPage.useCases.map((useCase) => (
                <span
                  key={useCase}
                  className="rounded-full border border-black/8 bg-white/88 px-3 py-1.5 text-xs font-medium uppercase tracking-[0.14em] text-neutral-500"
                >
                  {useCase}
                </span>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              <Link
                href={`/all-colors?family=${encodeURIComponent(family)}`}
                className="rounded-full border border-black/8 bg-neutral-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800"
              >
                Search this family
              </Link>
              <Link
                href={`/all-colors?family=${encodeURIComponent(family)}`}
                className="rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
              >
                Dense family view
              </Link>
              <Link
                href="/families/"
                className="rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
              >
                All families
              </Link>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <article className="rounded-[1.7rem] border border-black/6 bg-white/82 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
            <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
              Archive count
            </div>
            <div className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-neutral-950">
              {familyColors.length}
            </div>
            <div className="mt-2 text-sm text-neutral-500">
              Colors currently classified under the {family.toLowerCase()} family.
            </div>
          </article>
          <article className="rounded-[1.7rem] border border-black/6 bg-white/82 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
            <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
              Related collections
            </div>
            <div className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-neutral-950">
              {relatedCollections.length}
            </div>
            <div className="mt-2 text-sm text-neutral-500">
              Editorial collections with at least one strong {family.toLowerCase()} anchor.
            </div>
          </article>
          <article className="rounded-[1.7rem] border border-black/6 bg-white/82 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
            <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
              Export formats
            </div>
            <div className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-neutral-950">
              7+
            </div>
            <div className="mt-2 text-sm text-neutral-500">
              CSS, Tailwind, Figma JSON, SCSS, Style Dictionary, Procreate, and more with Pro.
            </div>
          </article>
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(20rem,0.9fr)]">
          <div className="rounded-[1.75rem] border border-black/6 bg-white/82 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
            <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
              Recommended upgrade path
            </div>
            <div className="mt-4 space-y-3">
              <div className="rounded-[1.2rem] border border-black/6 bg-neutral-50 px-4 py-4">
                <div className="text-sm font-semibold text-neutral-950">1. Start in the archive</div>
                <div className="mt-2 text-sm leading-6 text-neutral-600">
                  Browse the strongest {family.toLowerCase()} lane in search or dense view, then
                  save the colors that feel closest to your project.
                </div>
              </div>
              <div className="rounded-[1.2rem] border border-black/6 bg-neutral-50 px-4 py-4">
                <div className="text-sm font-semibold text-neutral-950">2. Move into a collection</div>
                <div className="mt-2 text-sm leading-6 text-neutral-600">
                  {primaryCollection
                    ? `${primaryCollection.title} is the cleanest editorial collection to prove this family in a more intentional five-color set.`
                    : `Open one of the matching collections to move from a family lane into a more intentional five-color set.`}
                </div>
              </div>
              <div className="rounded-[1.2rem] border border-black/6 bg-neutral-50 px-4 py-4">
                <div className="text-sm font-semibold text-neutral-950">3. Upgrade to Pro</div>
                <div className="mt-2 text-sm leading-6 text-neutral-600">
                  Pro members get advanced token exports, downloadable assets, and usage guidance to take this family direction into production.
                </div>
              </div>
            </div>
          </div>

          <aside className="rounded-[1.75rem] border border-black/6 bg-white/82 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
            <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
              Next step links
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {primaryCollection ? (
                <Link
                  href={`/collections/${primaryCollection.id}`}
                  className="rounded-full border border-black/8 bg-neutral-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800"
                >
                  Open {primaryCollection.title}
                </Link>
              ) : null}
              <Link
                href="/pro/"
                className="rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
              >
                Upgrade to Pro
              </Link>
              <Link
                href={`/palette?ids=${featuredColors.slice(0, 6).map((color) => color.id).join(",")}`}
                className="rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
              >
                Load sample palette
              </Link>
            </div>
          </aside>
        </section>

        {familyPage.culturalBackground && (
          <section className="rounded-[1.75rem] border border-black/6 bg-white/82 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
            <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
              Cultural significance
            </div>
            <div className="mt-4 grid gap-6 lg:grid-cols-2">
              <div>
                <p className="text-sm leading-7 text-neutral-600">
                  {familyPage.culturalBackground}
                </p>
              </div>
              {familyPage.culturalBackgroundJa && (
                <div className="rounded-2xl border border-black/6 bg-neutral-50 p-4">
                  <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-400">
                    Japanese · 日本語
                  </div>
                  <p className="text-sm leading-7 text-neutral-600" lang="ja">
                    {familyPage.culturalBackgroundJa}
                  </p>
                </div>
              )}
            </div>
          </section>
        )}

        <section className="rounded-[1.75rem] border border-black/6 bg-white/82 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
                Featured archive colors
              </div>
              <p className="mt-1 text-sm text-neutral-500">
                A first pass through the {family.toLowerCase()} lane. Open any swatch for full relationships and exports.
              </p>
            </div>
            <Link
              href={`/all-colors?family=${encodeURIComponent(family)}`}
              className="rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
            >
              Open search
            </Link>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {featuredColors.map((color) => (
              <Link
                key={color.id}
                href={`/colors/${color.id}/`}
                className="overflow-hidden rounded-[1.3rem] border border-black/6 bg-white shadow-[0_12px_32px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_36px_rgba(15,23,42,0.08)]"
              >
                <div className="h-32 border-b border-black/6" style={{ backgroundColor: color.hex }} />
                <div className="p-4">
                  <div className="text-base font-semibold tracking-[-0.02em] text-neutral-950">
                    {color.name}
                  </div>
                  <div className="mt-1 text-sm text-neutral-500">{color.hex}</div>
                  <div className="mt-2 text-xs uppercase tracking-[0.16em] text-neutral-400">
                    H {color.hue} · S {color.saturation}% · L {color.lightness}%
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(20rem,0.9fr)]">
          <div className="rounded-[1.75rem] border border-black/6 bg-white/82 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
            <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
              Best matching collections
            </div>
            <div className="mt-4 space-y-4">
              {relatedCollections.slice(0, 6).map(({ collection, matchingColors }) => (
                <article
                  key={collection.id}
                  className="rounded-[1.3rem] border border-black/6 bg-neutral-50 px-4 py-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-lg font-semibold tracking-[-0.02em] text-neutral-950">
                        {collection.title}
                      </div>
                      <div className="mt-2 text-sm leading-6 text-neutral-600">{collection.summary}</div>
                    </div>
                    <Link
                      href={`/collections/${collection.id}`}
                      className="rounded-full border border-black/8 bg-white px-3 py-1.5 text-xs font-medium uppercase tracking-[0.14em] text-neutral-500 transition hover:bg-neutral-100"
                    >
                      Open
                    </Link>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {matchingColors.map((color) => (
                      <Link
                        key={color.id}
                        href={`/colors/${color.id}/`}
                        className="rounded-full border border-black/8 bg-white px-3 py-1.5 text-xs font-medium text-neutral-600 transition hover:bg-neutral-100"
                      >
                        {color.name}
                      </Link>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>

          <aside className="rounded-[1.75rem] border border-black/6 bg-white/82 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
            <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
              Go further
            </div>
            <div className="mt-4 rounded-[1.2rem] border border-black/6 bg-neutral-50 px-4 py-4">
              <div className="text-sm font-semibold text-neutral-950">Unlock Pro</div>
              <div className="mt-2 text-sm leading-6 text-neutral-600">
                Pro members get unlimited exports, advanced token formats, and priority access to new collections in the {family.toLowerCase()} family.
              </div>
              <div className="mt-3">
                <Link
                  href="/pro/"
                  className="rounded-full bg-neutral-950 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-neutral-800"
                >
                  Learn about Pro
                </Link>
              </div>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
