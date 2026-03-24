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
              Payment received. Your download email is on the way.
            </h1>
            <p className="mt-4 max-w-2xl text-balance text-base leading-7 text-neutral-600 sm:text-lg">
              Your receipt and secure download link should arrive in the same inbox you used at
              checkout. If nothing shows up within 10 minutes, check Promotions or Spam, then open
              your account page or email support.
            </p>
            <div className="mt-6 grid gap-3 md:grid-cols-3">
              {[
                {
                  title: "1. Check your inbox",
                  body: "Look for a receipt and a download email from ColorArchive shortly after payment.",
                },
                {
                  title: "2. Open the files",
                  body: "Start with the overview, then move into the token exports, boards, and usage notes.",
                },
                {
                  title: "3. Need a resend?",
                  body: "Open your account page for order history and resend help, or contact hello@colorarchive.me.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-[1.2rem] border border-black/6 bg-white/86 px-4 py-4"
                >
                  <div className="text-sm font-semibold text-neutral-950">{item.title}</div>
                  <p className="mt-2 text-sm leading-6 text-neutral-600">{item.body}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 rounded-[1.2rem] border border-black/6 bg-white/85 px-4 py-4 text-sm leading-6 text-neutral-600">
              This page is the intended post-purchase hub for ColorArchive. Buyers should be able
              to reach
              {" "}
              <span className="font-medium text-neutral-950">{checkoutFlow.successPath}</span>
              {" "}from the hosted confirmation flow, receipt CTA, or account area.
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
                "Open the download email first so you confirm receipt, file access, and order details in one pass.",
                "Start from the pack overview or usage notes before digging into raw token files.",
                "Use the archive, collections, and favorites pages as your second layer when you need adjacent colors.",
                "If you bought for implementation, move straight from the preview files into CSS, Tailwind, JSON, or Figma tokens.",
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

          <div className="flex flex-col gap-6">
            <aside className="rounded-[1.75rem] border border-black/6 bg-white/82 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
              <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
                Go next
              </div>
              <div className="mt-4 grid gap-3">
                <Link
                  href="/login?next=/login"
                  className="flex items-center gap-3 rounded-[1.2rem] border border-black/6 bg-neutral-50 px-4 py-3.5 text-sm leading-6 text-neutral-600 transition hover:bg-white"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-950 text-sm text-white">
                    A
                  </span>
                  <span>
                    <span className="font-medium text-neutral-950">Open account</span>
                    {" "}- order history, resend support, and sync status
                  </span>
                </Link>
                <Link
                  href="/collections/"
                  className="flex items-center gap-3 rounded-[1.2rem] border border-black/6 bg-neutral-50 px-4 py-3.5 text-sm leading-6 text-neutral-600 transition hover:bg-white"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-950 text-sm text-white">
                    C
                  </span>
                  <span>
                    <span className="font-medium text-neutral-950">Browse collections</span>
                    {" "}- curated palette directions to pair with your new files
                  </span>
                </Link>
                <Link
                  href="/notes/"
                  className="flex items-center gap-3 rounded-[1.2rem] border border-black/6 bg-neutral-50 px-4 py-3.5 text-sm leading-6 text-neutral-600 transition hover:bg-white"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-950 text-sm text-white">
                    N
                  </span>
                  <span>
                    <span className="font-medium text-neutral-950">Read the notes archive</span>
                    {" "}- usage context, product updates, and palette direction
                  </span>
                </Link>
              </div>
            </aside>

            <aside className="relative overflow-hidden rounded-[1.75rem] border border-black/6 bg-white/82 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
              <div className="pointer-events-none absolute -right-6 -top-6 h-32 w-32 rounded-full bg-emerald-200/20 blur-2xl" />
              <div className="relative">
                <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">Need help</div>
                <p className="mt-3 text-sm leading-6 text-neutral-600">
                  If your download email does not arrive, open your account page first. If that
                  still does not solve it, email hello@colorarchive.me and include the address used
                  at checkout.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    href="/account"
                    className="inline-flex items-center gap-2 rounded-full border border-black/8 bg-neutral-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800"
                  >
                    Open account
                  </Link>
                  <Link
                    href="/account"
                    className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700 transition hover:bg-indigo-100"
                  >
                    Refer a friend &amp; earn credits
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
}
