import Link from "next/link";
import type { CheckoutFlowConfig } from "@/src/lib/checkout-config";
import type { PalettePack } from "@/src/lib/palette-packs";

interface CancelPageProps {
  checkoutFlow: CheckoutFlowConfig;
  starterPack?: PalettePack;
}

export function CancelPage({ checkoutFlow, starterPack }: CancelPageProps) {
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
              No purchase was completed
            </h1>
            <p className="mt-4 max-w-2xl text-balance text-base leading-7 text-neutral-600 sm:text-lg">
              This static route is the cancel return page for off-site checkout. It gives users a
              clean way back into the product instead of dropping them on a generic provider page.
            </p>
            <div className="mt-5 rounded-[1.2rem] border border-black/6 bg-white/85 px-4 py-4 text-sm leading-6 text-neutral-600">
              Configure checkout cancellation to return users to
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
                  at checkout. Works on any pack.
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap gap-2">
                <a
                  href={starterPack.checkoutUrl}
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

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(20rem,0.9fr)]">
          <div className="rounded-[1.75rem] border border-black/6 bg-white/82 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
            <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
              Next actions
            </div>
            <div className="mt-4 grid gap-3">
              {[
                "Review the pack details again before buying.",
                "Download the free preview assets first if you want more confidence.",
                "Use the waitlist page if you want launch updates instead of purchasing today.",
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
              Go next
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href="/packs/"
                className="rounded-full border border-black/8 bg-neutral-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800"
              >
                Back to packs
              </Link>
              <Link
                href="/waitlist/"
                className="rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
              >
                Join waitlist
              </Link>
              <Link
                href="/product-examples/"
                className="rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
              >
                Product proof
              </Link>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
