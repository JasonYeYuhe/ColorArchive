"use client";

import Link from "next/link";
import type { ColorCollection } from "@/src/lib/collections";
import type { PalettePack } from "@/src/lib/palette-packs";

interface ProductExamplesPageProps {
  collections: readonly ColorCollection[];
  packs: readonly PalettePack[];
}

function buildSampleExport(collection: ColorCollection): string {
  return collection.palette
    .map((color, index) => `--${collection.id}-${index + 1}: ${color.hex};`)
    .join("\n");
}

export function ProductExamplesPage({ collections, packs }: ProductExamplesPageProps) {
  const collectionMap = new Map(collections.map((collection) => [collection.id, collection]));

  return (
    <main className="px-4 py-4 sm:px-6 sm:py-6">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6">
        <section className="relative overflow-hidden rounded-[2rem] border border-black/6 bg-white/74 px-6 py-10 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:px-10 sm:py-14">
          <div className="pointer-events-none absolute left-0 top-0 h-56 w-56 rounded-full bg-violet-200/30 blur-3xl" />
          <div className="pointer-events-none absolute right-0 top-12 h-60 w-60 rounded-full bg-amber-200/24 blur-3xl" />
          <div className="relative mx-auto max-w-4xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-black/8 bg-white/85 px-3 py-1 text-xs font-medium tracking-[0.22em] text-neutral-500 uppercase">
              <span className="inline-block h-2 w-2 rounded-full bg-neutral-900" />
              Product proof
            </div>
            <h1 className="max-w-3xl text-4xl font-semibold tracking-[-0.04em] text-neutral-950 sm:text-6xl">
              Concrete product examples built from the live archive
            </h1>
            <p className="mt-4 max-w-2xl text-balance text-base leading-7 text-neutral-600 sm:text-lg">
              This route exists as a public proof page. It shows what ColorArchive actually sells:
              curated palette packs, export-ready assets, and live collection previews.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Link
                href="/packs"
                className="rounded-full border border-black/8 bg-neutral-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800"
              >
                Back to packs
              </Link>
              <Link
                href="/free-pack"
                className="rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
              >
                Free sample pack
              </Link>
              <a
                href="https://colorarchive.me/product-examples"
                className="rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
              >
                Public URL
              </a>
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(20rem,0.8fr)]">
          <div className="rounded-[1.75rem] border border-black/6 bg-white/82 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
            <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
              Business context
            </div>
            <div className="mt-4 space-y-3 text-sm leading-6 text-neutral-600">
              <p>
                ColorArchive is a public static website at <span className="font-medium text-neutral-950">colorarchive.me</span>.
                The site already contains the underlying archive, curated collections, and export
                flows used to shape these paid digital products.
              </p>
              <p>
                The paid offers are not generic placeholders. Each pack below is derived from live
                collections, existing color relationships, and export formats already visible on the
                site.
              </p>
            </div>
          </div>

          <aside className="rounded-[1.75rem] border border-black/6 bg-white/82 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
            <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
              Useful links
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href="/collections"
                className="rounded-full border border-black/8 bg-neutral-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800"
              >
                Live collections
              </Link>
              <Link
                href="/support"
                className="rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
              >
                Offer framing
              </Link>
              <Link
                href="/word-to-color"
                className="rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
              >
                Generator demo
              </Link>
              <Link
                href="/free-pack"
                className="rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
              >
                Free sample
              </Link>
            </div>
          </aside>
        </section>

        <section className="space-y-6">
          {packs.map((pack) => {
            const relatedCollections = pack.previewCollectionIds
              .map((collectionId) => collectionMap.get(collectionId))
              .filter((collection): collection is ColorCollection => Boolean(collection));
            const sampleCollection = relatedCollections[0];
            const sampleExport = sampleCollection ? buildSampleExport(sampleCollection) : "";

            return (
              <article
                key={pack.id}
                id={pack.id}
                className="rounded-[1.9rem] border border-black/6 bg-white/82 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)] sm:p-6"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="max-w-3xl">
                    <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
                      Product example
                    </div>
                    <Link
                      href={`/packs/${pack.id}`}
                      className="mt-2 block text-3xl font-semibold tracking-[-0.04em] text-neutral-950 transition hover:text-neutral-700"
                    >
                      {pack.title}
                    </Link>
                    <p className="mt-3 text-sm leading-6 text-neutral-600">{pack.detail}</p>
                    <p className="mt-3 text-sm leading-6 text-neutral-500">{pack.reviewNote}</p>
                  </div>

                  <div className="rounded-[1.2rem] border border-black/6 bg-neutral-50 px-4 py-4">
                    <div className="text-xs font-medium uppercase tracking-[0.16em] text-neutral-400">
                      Pricing lane
                    </div>
                    <div className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-neutral-950">
                      {pack.priceHint}
                    </div>
                    <div className="mt-2 text-sm leading-6 text-neutral-600">{pack.audience}</div>
                  </div>
                </div>

                <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(22rem,0.9fr)]">
                  <div className="space-y-5">
                    <div className="rounded-[1.3rem] border border-black/6 bg-neutral-50 px-4 py-4">
                      <div className="text-xs font-medium uppercase tracking-[0.16em] text-neutral-400">
                        Included deliverables
                      </div>
                      <div className="mt-3 grid gap-2">
                        {pack.deliverables.map((item) => (
                          <div
                            key={item}
                            className="rounded-[1rem] border border-black/6 bg-white px-3 py-3 text-sm leading-6 text-neutral-600"
                          >
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-[1.3rem] border border-black/6 bg-neutral-50 px-4 py-4">
                      <div className="text-xs font-medium uppercase tracking-[0.16em] text-neutral-400">
                        Launch assets already live
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {pack.launchAssets.map((asset) => (
                          <span
                            key={asset}
                            className="rounded-full border border-black/8 bg-white px-3 py-1.5 text-xs font-medium uppercase tracking-[0.14em] text-neutral-500"
                          >
                            {asset}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-[1.3rem] border border-black/6 bg-neutral-50 px-4 py-4">
                      <div className="text-xs font-medium uppercase tracking-[0.16em] text-neutral-400">
                        Downloadable samples
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {pack.sampleDownloads.map((sample) => (
                          <a
                            key={sample.href}
                            href={sample.href}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
                          >
                            {sample.label} · {sample.format}
                          </a>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-[1.3rem] border border-black/6 bg-neutral-50 px-4 py-4">
                      <div className="text-xs font-medium uppercase tracking-[0.16em] text-neutral-400">
                        Why this is a real product
                      </div>
                      <div className="mt-3 space-y-2">
                        {pack.proofPoints.map((point) => (
                          <div
                            key={point}
                            className="rounded-[1rem] border border-black/6 bg-white px-3 py-3 text-sm leading-6 text-neutral-600"
                          >
                            {point}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div className="rounded-[1.3rem] border border-black/6 bg-neutral-50 px-4 py-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-xs font-medium uppercase tracking-[0.16em] text-neutral-400">
                          Source collections
                        </div>
                        <Link href="/collections" className="text-sm font-medium text-neutral-600 transition hover:text-neutral-950">
                          Open all
                        </Link>
                      </div>

                      <div className="mt-4 space-y-4">
                        {relatedCollections.map((collection) => (
                          <div key={collection.id} className="rounded-[1rem] border border-black/6 bg-white px-3 py-3">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <div className="text-sm font-semibold text-neutral-950">{collection.title}</div>
                                <div className="mt-1 text-sm leading-6 text-neutral-600">
                                  {collection.summary}
                                </div>
                              </div>
                              <Link
                                href={`/collections#${collection.id}`}
                                className="shrink-0 rounded-full border border-black/8 bg-neutral-50 px-3 py-1.5 text-xs font-medium uppercase tracking-[0.14em] text-neutral-500 transition hover:bg-neutral-100"
                              >
                                View
                              </Link>
                            </div>
                            <div className="mt-3 grid grid-cols-5 overflow-hidden rounded-[0.9rem] border border-black/6">
                              {collection.palette.map((color) => (
                                <div
                                  key={color.id}
                                  title={`${color.name} ${color.hex}`}
                                  className="h-12"
                                  style={{ backgroundColor: color.hex }}
                                />
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {sampleCollection ? (
                      <div className="rounded-[1.3rem] border border-black/6 bg-neutral-50 px-4 py-4">
                        <div className="text-xs font-medium uppercase tracking-[0.16em] text-neutral-400">
                          Sample export
                        </div>
                        <div className="mt-2 text-sm text-neutral-600">
                          Example CSS variables generated from {sampleCollection.title}.
                        </div>
                        <pre className="mt-4 overflow-x-auto whitespace-pre-wrap rounded-[1rem] border border-black/6 bg-white px-4 py-4 text-sm leading-6 text-neutral-600">
                          {sampleExport}
                        </pre>
                      </div>
                    ) : null}
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
