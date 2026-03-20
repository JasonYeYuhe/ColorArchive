import Link from "next/link";
import { SeasonalCountdown } from "@/src/components/seasonal-countdown";
import { landingGuides } from "@/src/lib/guides";
import type { PalettePack } from "@/src/lib/palette-packs";

interface PalettePacksPageProps {
  packs: readonly PalettePack[];
}

export function PalettePacksPage({ packs }: PalettePacksPageProps) {
  const popularGuides = [...landingGuides].sort((a, b) => b.priority - a.priority).slice(0, 4);

  return (
    <main className="px-4 py-4 sm:px-6 sm:py-6">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6">
        <section className="relative overflow-hidden rounded-[2rem] border border-black/6 bg-white/74 px-6 py-10 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:px-10 sm:py-14">
          <div className="pointer-events-none absolute left-0 top-10 h-52 w-52 rounded-full bg-amber-200/28 blur-3xl" />
          <div className="pointer-events-none absolute right-0 top-0 h-64 w-64 rounded-full bg-rose-200/26 blur-3xl" />
          <div className="relative mx-auto max-w-4xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-black/8 bg-white/85 px-3 py-1 text-xs font-medium tracking-[0.22em] text-neutral-500 uppercase">
              <span className="inline-block h-2 w-2 rounded-full bg-neutral-900" />
              Productized color assets
            </div>
            <h1 className="max-w-3xl text-4xl font-semibold tracking-[-0.04em] text-neutral-950 sm:text-6xl">
              Explore the paid palette catalog, token exports, and the full bundle
            </h1>
            <p className="mt-4 max-w-2xl text-balance text-base leading-7 text-neutral-600 sm:text-lg">
              Start with the free sample, review the paid catalog, and use the hosted checkout
              links once the Lemon Squeezy store activation is complete. The product structure is
              ready even while the store review is still pending.
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              <Link
                href="/free-pack/"
                className="rounded-full border border-black/8 bg-neutral-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800"
              >
                Get free sample
              </Link>
              <Link
                href="/product-examples/"
                className="rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
              >
                Open product examples
              </Link>
              <Link
                href="/support/"
                className="rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
              >
                Pricing &amp; support
              </Link>
            </div>
          </div>
        </section>

        {(() => {
          const bundle = packs.find((p) => p.id === "all-access-bundle");
          if (!bundle) return null;
          const individualTotal = "¥4,095";
          return (
            <section className="rounded-[1.75rem] border border-emerald-300/40 bg-gradient-to-br from-emerald-50/80 to-white/90 p-6 shadow-[0_18px_48px_rgba(15,23,42,0.06)] backdrop-blur-xl dark:from-emerald-950/30 dark:to-neutral-900/80 dark:border-emerald-700/30">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-700 dark:border-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
                      Save 32%
                    </span>
                    <span className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
                      Best value
                    </span>
                  </div>
                  <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-neutral-950 dark:text-white sm:text-3xl">
                    {bundle.title}
                  </h2>
                  <p className="mt-2 max-w-xl text-sm leading-6 text-neutral-600 dark:text-neutral-400">
                    One checkout, every paid pack included. Individual total: <span className="line-through">{individualTotal}</span>{" → "}
                    <span className="font-semibold text-emerald-700 dark:text-emerald-400">{bundle.priceHint}</span>
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  {bundle.checkoutUrl ? (
                    <a
                      href={bundle.checkoutUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full bg-neutral-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-800"
                    >
                      Buy All Access — {bundle.priceHint}
                    </a>
                  ) : (
                    <Link
                      href={`/packs/${bundle.id}/`}
                      className="rounded-full bg-neutral-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-800"
                    >
                      View bundle details
                    </Link>
                  )}
                  <Link
                    href={`/packs/${bundle.id}/`}
                    className="rounded-full border border-black/8 bg-white px-5 py-2.5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50 dark:border-white/10 dark:bg-white/10 dark:text-neutral-300"
                  >
                    What's included
                  </Link>
                </div>
              </div>
            </section>
          );
        })()}

        <section className="rounded-[1.75rem] border border-black/6 bg-white/82 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
                Buying guides
              </div>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-neutral-600">
                If you know the problem but not the right pack yet, start from the guide that
                matches your use case, then come back to the checkout lane that fits.
              </p>
            </div>
            <Link
              href="/guides/"
              className="rounded-full border border-black/8 bg-neutral-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800"
            >
              All guides
            </Link>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {popularGuides.map((guide) => (
              <Link
                key={guide.slug}
                href={`/guides/${guide.slug}/`}
                className="rounded-[1rem] border border-black/6 bg-neutral-50 px-4 py-4 transition hover:bg-white"
              >
                <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-400">
                  {guide.searchIntent}
                </div>
                <div className="mt-2 text-lg font-semibold tracking-[-0.02em] text-neutral-950">
                  {guide.title}
                </div>
                <div className="mt-2 text-sm leading-6 text-neutral-600">{guide.summary}</div>
              </Link>
            ))}
          </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-3">
          {packs.filter((p) => p.id !== "all-access-bundle").map((pack) => (
            <article
              key={pack.id}
              className="rounded-[1.75rem] border border-black/6 bg-white/82 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)]"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
                      {pack.ctaLabel}
                    </div>
                    {pack.tierBadge ? (
                      <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-700">
                        {pack.tierBadge}
                      </span>
                    ) : null}
                    {pack.seasonEnds ? (
                      <SeasonalCountdown endDate={pack.seasonEnds} />
                    ) : null}
                  </div>
                  <Link href={`/packs/${pack.id}/`} className="mt-2 block text-2xl font-semibold tracking-[-0.03em] text-neutral-950 transition hover:text-neutral-700">
                    {pack.title}
                  </Link>
                </div>
                <div className="rounded-full border border-black/6 bg-neutral-50 px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-neutral-500">
                  {pack.priceHint}
                </div>
              </div>

              <p className="mt-4 text-sm leading-6 text-neutral-600">{pack.detail}</p>

              <div className="mt-4 rounded-[1.2rem] border border-black/6 bg-neutral-50 px-4 py-4">
                <div className="text-xs font-medium uppercase tracking-[0.16em] text-neutral-400">
                  Audience
                </div>
                <p className="mt-2 text-sm leading-6 text-neutral-600">{pack.audience}</p>
              </div>

              <div className="mt-5 rounded-[1.2rem] border border-black/6 bg-neutral-50 px-4 py-4">
                <div className="text-xs font-medium uppercase tracking-[0.16em] text-neutral-400">
                  Includes
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {pack.formatList.map((format) => (
                    <span
                      key={format}
                      className="rounded-full border border-black/8 bg-white px-3 py-1.5 text-xs font-medium uppercase tracking-[0.14em] text-neutral-500"
                    >
                      {format}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-5">
                <div className="text-xs font-medium uppercase tracking-[0.16em] text-neutral-400">
                  Preview collections
                </div>
                <div className="mt-3 space-y-2 text-sm text-neutral-600">
                  {pack.previewCollections.map((collection) => (
                    <div key={collection} className="rounded-full border border-black/6 bg-neutral-50 px-3 py-2">
                      {collection}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-5 rounded-[1.2rem] border border-black/6 bg-neutral-50 px-4 py-4">
                <div className="text-xs font-medium uppercase tracking-[0.16em] text-neutral-400">
                  Deliverables
                </div>
                <div className="mt-3 space-y-2 text-sm text-neutral-600">
                  {pack.deliverables.map((deliverable) => (
                    <div key={deliverable} className="rounded-[1rem] border border-black/6 bg-white px-3 py-3">
                      {deliverable}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-5 rounded-[1.2rem] border border-black/6 bg-neutral-50 px-4 py-4">
                <div className="text-xs font-medium uppercase tracking-[0.16em] text-neutral-400">
                  Why it is credible
                </div>
                <div className="mt-3 space-y-2 text-sm text-neutral-600">
                  {pack.proofPoints.map((point) => (
                    <div key={point} className="rounded-[1rem] border border-black/6 bg-white px-3 py-3">
                      {point}
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-sm leading-6 text-neutral-500">{pack.reviewNote}</p>
              </div>

              <div className="mt-5 rounded-[1.2rem] border border-black/6 bg-neutral-50 px-4 py-4">
                <div className="text-xs font-medium uppercase tracking-[0.16em] text-neutral-400">
                  Checkout
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {pack.checkoutUrl ? (
                    <a
                      href={pack.checkoutUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full border border-neutral-950/10 bg-neutral-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800"
                    >
                      Buy now
                    </a>
                  ) : (
                    <button
                      type="button"
                      disabled
                      className="cursor-not-allowed rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-neutral-400"
                    >
                      {pack.checkoutProvider} link pending
                    </button>
                  )}
                  <span className="text-xs uppercase tracking-[0.14em] text-neutral-400">
                    {pack.checkoutStatus === "ready" ? "Checkout ready" : "Update in `src/lib/checkout-config.ts`"}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-6 text-neutral-500">{pack.checkoutNote}</p>
              </div>

              <div className="mt-5 rounded-[1.2rem] border border-black/6 bg-neutral-50 px-4 py-4">
                <div className="text-xs font-medium uppercase tracking-[0.16em] text-neutral-400">
                  Free sample files
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

              <div className="mt-5 flex flex-wrap gap-2">
                <Link
                  href={`/product-examples#${pack.id}`}
                  className="rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
                >
                  View product proof
                </Link>
                <Link
                  href={`/packs/${pack.id}`}
                  className="rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
                >
                  Pack details
                </Link>
                <Link
                  href="/collections/"
                  className="rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
                >
                  Open source collections
                </Link>
              </div>
            </article>
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(20rem,0.9fr)]">
          <div className="rounded-[1.75rem] border border-black/6 bg-white/82 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
            <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
              Why this page exists
            </div>
            <div className="mt-4 space-y-3 text-sm leading-6 text-neutral-600">
              <p>
                A static product site does not need a full commerce backend on day one. It needs a
                concrete product surface, clear offers, and a clean way to link out to checkout.
              </p>
              <p>
                This page is now the bridge between the archive and hosted checkout. Each pack
                already points to Lemon Squeezy while keeping the core site static.
              </p>
              <p>
                If a payment provider asks for concrete product examples, use the dedicated product
                examples page and the public collections as proof of what the digital goods
                contain.
              </p>
            </div>
          </div>

          <aside className="rounded-[1.75rem] border border-black/6 bg-white/82 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
            <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
              Related routes
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href="/collections/"
                className="rounded-full border border-black/8 bg-neutral-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800"
              >
                Browse collections
              </Link>
              <Link
                href="/support/"
                className="rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
              >
                Open support page
              </Link>
              <Link
                href="/product-examples/"
                className="rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
              >
                Product examples
              </Link>
              <Link
                href="/free-pack/"
                className="rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
              >
                Free sample pack
              </Link>
              <Link
                href="/guides/"
                className="rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
              >
                Use-case guides
              </Link>
            </div>
          </aside>
        </section>

        <section className="rounded-[1.75rem] border border-black/6 bg-white/82 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
          <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
            Compare offers
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-0 text-left text-sm text-neutral-600">
              <thead>
                <tr>
                  <th className="rounded-l-[1rem] border border-black/6 bg-neutral-50 px-4 py-3 font-medium text-neutral-500">
                    Pack
                  </th>
                  <th className="border border-black/6 bg-neutral-50 px-4 py-3 font-medium text-neutral-500">
                    Price
                  </th>
                  <th className="border border-black/6 bg-neutral-50 px-4 py-3 font-medium text-neutral-500">
                    Best for
                  </th>
                  <th className="border border-black/6 bg-neutral-50 px-4 py-3 font-medium text-neutral-500">
                    Fulfillment
                  </th>
                  <th className="rounded-r-[1rem] border border-black/6 bg-neutral-50 px-4 py-3 font-medium text-neutral-500">
                    Checkout
                  </th>
                </tr>
              </thead>
              <tbody>
                {packs.map((pack) => (
                  <tr key={pack.id}>
                    <td className="border border-black/6 bg-white px-4 py-4 align-top">
                      <Link href={`/packs/${pack.id}`} className="font-semibold text-neutral-950 transition hover:text-neutral-700">
                        {pack.title}
                      </Link>
                    </td>
                    <td className="border border-black/6 bg-white px-4 py-4 align-top">{pack.priceHint}</td>
                    <td className="border border-black/6 bg-white px-4 py-4 align-top">{pack.audience}</td>
                    <td className="border border-black/6 bg-white px-4 py-4 align-top">
                      <span className="block text-neutral-600">{pack.fulfillment.method}</span>
                      <span className="mt-1 block text-xs uppercase tracking-[0.12em] text-neutral-400">
                        {pack.fulfillment.timeline}
                      </span>
                    </td>
                    <td className="border border-black/6 bg-white px-4 py-4 align-top">
                      {pack.checkoutProvider}
                      <div className="mt-1 text-xs uppercase tracking-[0.14em] text-neutral-400">
                        {pack.checkoutStatus === "ready" ? "Checkout ready" : pack.checkoutStatus}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
