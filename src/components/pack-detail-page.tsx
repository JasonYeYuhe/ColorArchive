import Link from "next/link";
import type { ColorCollection } from "@/src/lib/collections";
import type { PalettePack } from "@/src/lib/palette-packs";

interface PackDetailPageProps {
  pack: PalettePack;
  relatedCollections: ColorCollection[];
}

function buildSampleExport(collection: ColorCollection): string {
  return collection.palette
    .map((color, index) => `--${collection.id}-${index + 1}: ${color.hex};`)
    .join("\n");
}

export function PackDetailPage({ pack, relatedCollections }: PackDetailPageProps) {
  const sampleCollection = relatedCollections[0];

  return (
    <main className="px-4 py-4 sm:px-6 sm:py-6">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6">
        <section className="relative overflow-hidden rounded-[2rem] border border-black/6 bg-white/74 px-6 py-10 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:px-10 sm:py-14">
          <div className="pointer-events-none absolute left-0 top-8 h-52 w-52 rounded-full bg-pink-200/28 blur-3xl" />
          <div className="pointer-events-none absolute right-0 top-0 h-64 w-64 rounded-full bg-sky-200/24 blur-3xl" />
          <div className="relative mx-auto flex max-w-5xl flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-black/8 bg-white/85 px-3 py-1 text-xs font-medium tracking-[0.22em] text-neutral-500 uppercase">
                <span className="inline-block h-2 w-2 rounded-full bg-neutral-900" />
                Pack detail
              </div>
              <h1 className="text-4xl font-semibold tracking-[-0.04em] text-neutral-950 sm:text-6xl">
                {pack.title}
              </h1>
              <p className="mt-4 text-base leading-7 text-neutral-600 sm:text-lg">{pack.detail}</p>
              <p className="mt-3 text-sm leading-6 text-neutral-500">{pack.reviewNote}</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-[1.25rem] border border-black/6 bg-white/86 px-4 py-4">
                <div className="text-xs uppercase tracking-[0.16em] text-neutral-400">Pricing lane</div>
                <div className="mt-2 text-2xl font-semibold text-neutral-950">{pack.priceHint}</div>
              </div>
              <div className="rounded-[1.25rem] border border-black/6 bg-white/86 px-4 py-4">
                <div className="text-xs uppercase tracking-[0.16em] text-neutral-400">Checkout</div>
                <div className="mt-2 text-sm leading-6 text-neutral-600">{pack.checkoutProvider}</div>
                <div className="mt-1 text-xs uppercase tracking-[0.14em] text-neutral-400">
                  {pack.checkoutStatus}
                </div>
              </div>
              {pack.checkoutUrl ? (
                <a
                  href={pack.checkoutUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="sm:col-span-2 flex items-center justify-center gap-2 rounded-[1.25rem] bg-neutral-950 px-6 py-4 text-sm font-semibold text-white transition hover:bg-neutral-800"
                >
                  Buy {pack.title}
                </a>
              ) : null}
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(20rem,0.95fr)]">
          <div className="rounded-[1.75rem] border border-black/6 bg-white/82 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
            <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
              What this pack is for
            </div>
            <p className="mt-4 text-sm leading-6 text-neutral-600">{pack.audience}</p>

            <div className="mt-5 grid gap-2">
              {pack.deliverables.map((deliverable) => (
                <div
                  key={deliverable}
                  className="rounded-[1rem] border border-black/6 bg-neutral-50 px-4 py-3 text-sm leading-6 text-neutral-600"
                >
                  {deliverable}
                </div>
              ))}
            </div>
          </div>

          <aside className="rounded-[1.75rem] border border-black/6 bg-white/82 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
            <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
              Sample files
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {pack.sampleDownloads.map((sample) => (
                <a
                  key={sample.href}
                  href={sample.href}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-black/8 bg-neutral-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800"
                >
                  {sample.label}
                </a>
              ))}
            </div>
            <div className="mt-5 rounded-[1.2rem] border border-black/6 bg-neutral-50 px-4 py-4 text-sm leading-6 text-neutral-600">
              These files are public preview assets. They make the product concrete before checkout
              links are wired.
            </div>
            <div className="mt-4 rounded-[1.2rem] border border-black/6 bg-neutral-50 px-4 py-4 text-sm leading-6 text-neutral-600">
              {pack.checkoutNote}
            </div>
          </aside>
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(22rem,0.9fr)]">
          <div className="rounded-[1.75rem] border border-black/6 bg-white/82 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
            <div className="flex items-center justify-between gap-3">
              <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
                Source collections
              </div>
              <Link href="/collections" className="text-sm font-medium text-neutral-600 transition hover:text-neutral-950">
                Open all collections
              </Link>
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              {relatedCollections.map((collection) => (
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
                      href={`/collections#${collection.id}`}
                      className="shrink-0 rounded-full border border-black/8 bg-white px-3 py-1.5 text-xs font-medium uppercase tracking-[0.14em] text-neutral-500 transition hover:bg-neutral-100"
                    >
                      View
                    </Link>
                  </div>
                  <div className="mt-4 grid grid-cols-5 overflow-hidden rounded-[0.9rem] border border-black/6">
                    {collection.palette.map((color) => (
                      <div
                        key={color.id}
                        title={`${color.name} ${color.hex}`}
                        className="h-16"
                        style={{ backgroundColor: color.hex }}
                      />
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>

          <aside className="space-y-6">
            {sampleCollection ? (
              <div className="rounded-[1.75rem] border border-black/6 bg-white/82 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
                <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
                  Sample token export
                </div>
                <div className="mt-2 text-sm text-neutral-600">
                  Generated from {sampleCollection.title}.
                </div>
                <pre className="mt-4 overflow-x-auto whitespace-pre-wrap rounded-[1.2rem] border border-black/6 bg-neutral-50 px-4 py-4 text-sm leading-6 text-neutral-600">
                  {buildSampleExport(sampleCollection)}
                </pre>
              </div>
            ) : null}

            {/* Fulfillment */}
            <div className="rounded-[1.75rem] border border-black/6 bg-white/82 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
              <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
                After you buy
              </div>
              <div className="mt-1 text-xs uppercase tracking-[0.14em] text-neutral-400">
                {pack.fulfillment.method} · {pack.fulfillment.timeline}
              </div>
              <ol className="mt-4 space-y-2">
                {pack.fulfillment.steps.map((step, i) => (
                  <li key={step} className="flex gap-3">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-black/8 bg-neutral-100 text-xs font-semibold text-neutral-500">
                      {i + 1}
                    </span>
                    <span className="text-sm leading-6 text-neutral-600">{step}</span>
                  </li>
                ))}
              </ol>
              <div className="mt-4 rounded-[1.2rem] border border-black/6 bg-neutral-50 px-4 py-4 text-sm leading-6 text-neutral-600">
                {pack.fulfillment.fileNote}
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-black/6 bg-white/82 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
              <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
                FAQ
              </div>
              <div className="mt-4 space-y-3">
                {pack.faqs.map((item) => (
                  <div key={item.question} className="rounded-[1.2rem] border border-black/6 bg-neutral-50 px-4 py-4">
                    <div className="text-sm font-semibold text-neutral-950">{item.question}</div>
                    <div className="mt-2 text-sm leading-6 text-neutral-600">{item.answer}</div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </section>

        {pack.checkoutUrl ? (
          <section className="rounded-[1.75rem] border border-black/6 bg-neutral-950 p-5 text-white shadow-[0_18px_48px_rgba(15,23,42,0.05)] dark:border-white/10 dark:bg-white dark:text-neutral-950">
            <div className="text-xs font-medium uppercase tracking-[0.18em] text-white/40 dark:text-neutral-400">
              Ready to download
            </div>
            <p className="mt-2 text-lg font-semibold tracking-[-0.02em]">{pack.title}</p>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/60 dark:text-neutral-500">
              {pack.priceHint} · {pack.checkoutProvider} · Instant download after payment.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <a
                href={pack.checkoutUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-neutral-950 transition hover:bg-neutral-200 dark:bg-neutral-950 dark:text-white dark:hover:bg-neutral-800"
              >
                Buy now
              </a>
              <Link
                href="/free-pack/"
                className="rounded-full border border-white/16 px-5 py-2.5 text-sm font-semibold text-white/80 transition hover:border-white/30 hover:text-white dark:border-black/16 dark:text-neutral-600 dark:hover:border-black/30 dark:hover:text-neutral-950"
              >
                Try free layer first
              </Link>
            </div>
          </section>
        ) : null}

        <section className="rounded-[1.75rem] border border-black/6 bg-white/82 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
          <div className="flex flex-wrap gap-2">
            <Link
              href="/packs"
              className="rounded-full border border-black/8 bg-neutral-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800"
            >
              Back to packs
            </Link>
            <Link
              href="/product-examples"
              className="rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
            >
              Product examples
            </Link>
            <Link
              href="/support"
              className="rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
            >
              Support
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
