import Link from "next/link";
import type { CheckoutFlowConfig } from "@/src/lib/checkout-config";
import type { PalettePack } from "@/src/lib/palette-packs";

interface CancelPageProps {
  checkoutFlow: CheckoutFlowConfig;
  bundlePack?: PalettePack;
  starterPack?: PalettePack;
}

export function CancelPage({ checkoutFlow, bundlePack, starterPack }: CancelPageProps) {
  return (
    <main className="px-4 py-4 sm:px-6 sm:py-6">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6">
        <section className="relative overflow-hidden rounded-[2rem] border border-black/6 bg-white/74 px-6 py-10 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:px-10 sm:py-14">
          <div className="pointer-events-none absolute left-0 top-8 h-48 w-48 rounded-full bg-amber-200/28 blur-3xl" />
          <div className="pointer-events-none absolute right-0 top-0 h-64 w-64 rounded-full bg-rose-200/24 blur-3xl" />
          <div className="relative mx-auto max-w-4xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-black/8 bg-white/85 px-3 py-1 text-xs font-medium tracking-[0.22em] text-neutral-500 uppercase">
              <span className="inline-block h-2 w-2 rounded-full bg-neutral-900" />
              Checkout cancelled
            </div>
            <h1 className="max-w-3xl text-4xl font-semibold tracking-[-0.04em] text-neutral-950 sm:text-6xl">
              No charge went through. You still have three strong paths.
            </h1>
            <p className="mt-4 max-w-2xl text-balance text-base leading-7 text-neutral-600 sm:text-lg">
              If price, timing, or uncertainty stopped the order, do not start over from zero. You
              can come back lighter with the starter pack, use the free layer first, or jump
              straight to the best-value bundle.
            </p>
            <div className="mt-5 rounded-[1.2rem] border border-black/6 bg-white/85 px-4 py-4 text-sm leading-6 text-neutral-600">
              Lemon Squeezy or Stripe should return cancelled checkouts to
              {" "}
              <span className="font-medium text-neutral-950">{checkoutFlow.cancelPath}</span>.
            </div>
          </div>
        </section>

        {starterPack?.checkoutUrl ? (
          <section className="rounded-[1.75rem] border border-amber-200/60 bg-amber-50/60 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
                  Still thinking? Here's a discount
                </div>
                <p className="mt-2 text-lg font-semibold tracking-[-0.02em] text-neutral-950">
                  10% off your first pack
                </p>
                <p className="mt-1.5 text-sm leading-6 text-neutral-600">
                  Use code{" "}
                  <span className="rounded-lg border border-amber-300 bg-white px-2.5 py-1 font-mono text-sm font-bold tracking-widest text-amber-800">
                    FIRSTPACK
                  </span>{" "}
                  at checkout. The button below preloads it for the starter pack, and the same code
                  works on any other pack too.
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap gap-2">
                <a
                  href={`${starterPack.checkoutUrl}?discount=FIRSTPACK`}
                  className="rounded-full bg-neutral-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-800"
                >
                  Try {starterPack.title} — {starterPack.priceHint}
                </a>
                <Link
                  href="/packs/"
                  className="rounded-full border border-black/8 bg-white px-5 py-2.5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
                >
                  Browse all packs
                </Link>
              </div>
            </div>
          </section>
        ) : null}

        <section className="grid gap-4 lg:grid-cols-3">
          {starterPack ? (
            <article className="rounded-[1.75rem] border border-black/6 bg-white/82 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-400">
                Lowest-friction paid path
              </div>
              <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-neutral-950">
                {starterPack.title}
              </h2>
              <div className="mt-2 text-sm font-medium text-neutral-500">{starterPack.priceHint}</div>
              <p className="mt-3 text-sm leading-6 text-neutral-600">{starterPack.detail}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <a
                  href={`${starterPack.checkoutUrl}?discount=FIRSTPACK`}
                  className="rounded-full border border-black/8 bg-neutral-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800"
                >
                  Buy with FIRSTPACK
                </a>
                <Link
                  href={`/packs/${starterPack.id}/`}
                  className="rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
                >
                  Review details
                </Link>
              </div>
            </article>
          ) : null}

          <article className="rounded-[1.75rem] border border-black/6 bg-white/82 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-400">
              Zero-risk path
            </div>
            <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-neutral-950">
              Free Sample Pack
            </h2>
            <div className="mt-2 text-sm font-medium text-neutral-500">Free</div>
            <p className="mt-3 text-sm leading-6 text-neutral-600">
              If you need proof before paying, start with the free layer. It shows the file style,
              product quality, and the free-to-paid upgrade path without asking for money first.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href="/free-pack/"
                className="rounded-full border border-black/8 bg-neutral-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800"
              >
                Get the free pack
              </Link>
              <Link
                href="/product-examples/"
                className="rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
              >
                View product proof
              </Link>
            </div>
          </article>

          {bundlePack ? (
            <article className="rounded-[1.75rem] border border-emerald-300/40 bg-gradient-to-br from-emerald-50/80 to-white/90 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.06)]">
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
                Best value
              </div>
              <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-neutral-950">
                {bundlePack.title}
              </h2>
              <div className="mt-2 text-sm font-medium text-emerald-700">{bundlePack.priceHint}</div>
              <p className="mt-3 text-sm leading-6 text-neutral-600">{bundlePack.detail}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {bundlePack.checkoutUrl ? (
                  <a
                    href={bundlePack.checkoutUrl}
                    className="rounded-full border border-emerald-700/10 bg-neutral-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800"
                  >
                    Get the bundle
                  </a>
                ) : null}
                <Link
                  href={`/packs/${bundlePack.id}/`}
                  className="rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
                >
                  See what is inside
                </Link>
              </div>
            </article>
          ) : null}
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(20rem,0.9fr)]">
          <div className="rounded-[1.75rem] border border-black/6 bg-white/82 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
            <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
              Next actions
            </div>
            <div className="mt-4 grid gap-3">
              {[
                "Review one pack page carefully instead of reopening the whole catalog without context.",
                "Use the free sample if trust is the blocker, not the product itself.",
                "Use FIRSTPACK on the starter lane if price is the blocker and you want the fastest paid path.",
                "Open the bundle page if you were comparing multiple packs and decision fatigue slowed you down.",
              ].map((step, index) => (
                <div
                  key={step}
                  className="flex gap-3 rounded-[1.2rem] border border-black/6 bg-neutral-50 px-4 py-4"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-950 text-sm font-medium text-white">
                    {index + 1}
                  </div>
                  <div className="text-sm leading-6 text-neutral-600">{step}</div>
                </div>
              ))}
            </div>
          </div>

          <aside className="rounded-[1.75rem] border border-black/6 bg-white/82 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
            <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
              Questions before buying
            </div>
            <p className="mt-3 text-sm leading-6 text-neutral-600">
              If something felt unclear, the fastest way to fix drop-off is to answer the exact
              objection: file contents, use case, license, or support expectations.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href="/packs/"
                className="rounded-full border border-black/8 bg-neutral-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800"
              >
                Compare all packs
              </Link>
              <Link
                href="/free-pack/"
                className="rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
              >
                Free sample
              </Link>
              <Link
                href="/product-examples/"
                className="rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
              >
                Product proof
              </Link>
              <Link
                href="/support/"
                className="rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
              >
                Support & licensing
              </Link>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
