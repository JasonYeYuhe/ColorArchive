"use client";

import Link from "next/link";
import type { ColorCollection } from "@/src/lib/collections";
import { SITE_URL, SITE_DOMAIN } from "@/src/lib/site-config";

interface ProductExamplesPageProps {
  collections: readonly ColorCollection[];
}

export function ProductExamplesPage({ collections }: ProductExamplesPageProps) {
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
              This route exists as a public proof page. It shows what ColorArchive offers:
              curated collections, export-ready assets, and live palette previews.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Link
                href="/collections/"
                className="rounded-full border border-black/8 bg-neutral-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800"
              >
                Browse collections
              </Link>
              <Link
                href="/pro/"
                className="rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
              >
                Upgrade to Pro
              </Link>
              <a
                href={`${SITE_URL}/product-examples`}
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
                ColorArchive is a public static website at <span className="font-medium text-neutral-950">{SITE_DOMAIN}</span>.
                The site already contains the underlying archive, curated collections, and export
                flows used to shape these paid digital products.
              </p>
              <p>
                The paid offers are not generic placeholders. Each product is derived from live
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
                href="/collections/"
                className="rounded-full border border-black/8 bg-neutral-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800"
              >
                Live collections
              </Link>
              <Link
                href="/support/"
                className="rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
              >
                Offer framing
              </Link>
              <Link
                href="/word-to-color/"
                className="rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
              >
                Generator demo
              </Link>
              <Link
                href="/pro/"
                className="rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
              >
                Pro membership
              </Link>
            </div>
          </aside>
        </section>

        <section className="rounded-[1.75rem] border border-black/6 bg-white/82 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)] sm:p-6">
          <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
            Visual preview — what Pro members get
          </div>
          <p className="mt-2 text-sm leading-6 text-neutral-500">
            Every collection ships as live color tokens you can drop straight into your project.
          </p>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {collections.slice(0, 3).map((collection) => {
              const [c1, c2, c3, c4, c5] = collection.palette;
              if (!c1 || !c2 || !c3) return null;
              const accent = c4 ?? c3;
              const bg = c5 ?? c1;
              const isLight = (bg.lightness ?? 50) > 65;
              return (
                <div key={collection.id} className="overflow-hidden rounded-[1.3rem] border border-black/6">
                  {/* Simulated landing page hero */}
                  <div
                    className="relative flex flex-col justify-between p-4"
                    style={{ backgroundColor: bg.hex, minHeight: "9rem" }}
                  >
                    <div
                      className="inline-self-start rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]"
                      style={{ backgroundColor: `${accent.hex}33`, color: accent.hex }}
                    >
                      {collection.tags[0]}
                    </div>
                    <div>
                      <div
                        className="text-base font-semibold leading-tight tracking-[-0.02em]"
                        style={{ color: isLight ? "#0f172a" : "#f8fafc" }}
                      >
                        {collection.title}
                      </div>
                      <div
                        className="mt-2 inline-block rounded-full px-3 py-1 text-xs font-semibold"
                        style={{ backgroundColor: accent.hex, color: isLight ? "#f8fafc" : "#0f172a" }}
                      >
                        Explore palette
                      </div>
                    </div>
                  </div>
                  {/* Brand swatch row */}
                  <div className="flex border-t border-black/6">
                    {collection.palette.map((c) => (
                      <div
                        key={c.id}
                        className="flex-1 py-3"
                        style={{ backgroundColor: c.hex }}
                        title={`${c.name} ${c.hex}`}
                      />
                    ))}
                  </div>
                  {/* CSS snippet */}
                  <div className="border-t border-black/6 bg-neutral-50 px-3 py-2">
                    <div className="font-mono text-[10px] leading-5 text-neutral-500">
                      <span className="text-violet-600">:root</span> {"{"}
                      {collection.palette.slice(0, 3).map((c, i) => (
                        <div key={c.id} className="pl-3">
                          <span className="text-sky-600">--{collection.id}-{i + 1}</span>: {c.hex};
                        </div>
                      ))}
                      {"}"}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

      </div>
    </main>
  );
}
