import Link from "next/link";
import type { CheckoutFlowConfig } from "@/src/lib/checkout-config";

interface ThanksPageProps {
  checkoutFlow: CheckoutFlowConfig;
}

export function ThanksPage({ checkoutFlow }: ThanksPageProps) {
  return (
    <main className="px-4 py-4 sm:px-6 sm:py-6">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6">
        <section className="relative overflow-hidden rounded-[2rem] border border-black/6 bg-white/74 px-6 py-10 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:px-10 sm:py-14">
          <div className="pointer-events-none absolute left-0 top-8 h-48 w-48 rounded-full bg-emerald-200/30 blur-3xl" />
          <div className="pointer-events-none absolute right-0 top-0 h-64 w-64 rounded-full bg-sky-200/24 blur-3xl" />
          <div className="relative mx-auto max-w-4xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-black/8 bg-white/85 px-3 py-1 text-xs font-medium tracking-[0.22em] text-neutral-500 uppercase">
              <span className="inline-block h-2 w-2 rounded-full bg-neutral-900" />
              Purchase success
            </div>
            <h1 className="max-w-3xl text-4xl font-semibold tracking-[-0.04em] text-neutral-950 sm:text-6xl">
              Thanks. Your ColorArchive purchase is complete.
            </h1>
            <p className="mt-4 max-w-2xl text-balance text-base leading-7 text-neutral-600 sm:text-lg">
              This route is meant to be the static return page for Lemon Squeezy or Stripe after a
              successful payment. It keeps the commerce flow simple and brand-consistent.
            </p>
            <div className="mt-5 rounded-[1.2rem] border border-black/6 bg-white/85 px-4 py-4 text-sm leading-6 text-neutral-600">
              Configure your checkout provider to redirect successful payments to
              {" "}
              <span className="font-medium text-neutral-950">{checkoutFlow.successPath}</span>.
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(20rem,0.9fr)]">
          <div className="rounded-[1.75rem] border border-black/6 bg-white/82 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
            <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
              Suggested next steps
            </div>
            <div className="mt-4 grid gap-3">
              {[
                "Open your downloaded files and start with the palette overview first.",
                "Use the sample exports and token files to map colors into your own design system.",
                "Return to the archive if you want more adjacent or complementary colors.",
                "Save favorite colors locally to build a second working set.",
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
              Continue exploring
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href="/favorites"
                className="rounded-full border border-black/8 bg-neutral-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800"
              >
                Favorites
              </Link>
              <Link
                href="/collections"
                className="rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
              >
                Collections
              </Link>
              <Link
                href="/search"
                className="rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
              >
                Search
              </Link>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
