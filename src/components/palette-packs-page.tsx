import Link from "next/link";
import type { PalettePack } from "@/src/lib/palette-packs";

interface PalettePacksPageProps {
  packs: readonly PalettePack[];
}

export function PalettePacksPage({ packs }: PalettePacksPageProps) {
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
              Palette packs ready to become products
            </h1>
            <p className="mt-4 max-w-2xl text-balance text-base leading-7 text-neutral-600 sm:text-lg">
              These packs turn the archive into something directly sellable: curated sets, exports,
              and usage notes rather than loose swatches.
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              <Link
                href="/free-pack"
                className="rounded-full border border-black/8 bg-neutral-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800"
              >
                Free sample pack
              </Link>
              <Link
                href="/product-examples"
                className="rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
              >
                Open product examples
              </Link>
              <Link
                href="/support"
                className="rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
              >
                Pricing &amp; support
              </Link>
            </div>
          </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-3">
          {packs.map((pack) => (
            <article
              key={pack.id}
              className="rounded-[1.75rem] border border-black/6 bg-white/82 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)]"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
                    {pack.ctaLabel}
                  </div>
                  <Link href={`/packs/${pack.id}`} className="mt-2 block text-2xl font-semibold tracking-[-0.03em] text-neutral-950 transition hover:text-neutral-700">
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
                      Buy via {pack.checkoutProvider}
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
                    {pack.checkoutStatus === "live" ? "Checkout live" : "Update in `src/lib/checkout-config.ts`"}
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
                  href="/collections"
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
                This page is the bridge between the archive and those future checkouts. When you
                are ready, each pack can point to Lemon Squeezy, Stripe Payment Links, or a similar
                off-site checkout without changing the core architecture.
              </p>
              <p>
                If a payment provider asks for concrete product examples, use the dedicated product
                examples page and the live collections as public proof of what the digital goods
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
                href="/collections"
                className="rounded-full border border-black/8 bg-neutral-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800"
              >
                Browse collections
              </Link>
              <Link
                href="/support"
                className="rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
              >
                Open support page
              </Link>
              <Link
                href="/product-examples"
                className="rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
              >
                Product examples
              </Link>
              <Link
                href="/free-pack"
                className="rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
              >
                Free sample pack
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
                        {pack.checkoutStatus}
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
