"use client";

import Link from "next/link";
import { useLocale } from "@/src/components/locale-provider";
import type { CheckoutFlowConfig } from "@/src/lib/checkout-config";
import type { PalettePack } from "@/src/lib/palette-packs";

interface CancelPageProps {
  checkoutFlow: CheckoutFlowConfig;
  bundlePack?: PalettePack;
  starterPack?: PalettePack;
}

export function CancelPage({ checkoutFlow, bundlePack, starterPack }: CancelPageProps) {
  const { t } = useLocale();
  return (
    <main className="px-4 py-4 sm:px-6 sm:py-6">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6">
        <section className="relative overflow-hidden rounded-[2rem] border border-black/6 bg-white/74 px-6 py-10 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:px-10 sm:py-14">
          <div className="pointer-events-none absolute left-0 top-8 h-48 w-48 rounded-full bg-amber-200/28 blur-3xl" />
          <div className="pointer-events-none absolute right-0 top-0 h-64 w-64 rounded-full bg-rose-200/24 blur-3xl" />
          <div className="relative mx-auto max-w-4xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-black/8 bg-white/85 px-3 py-1 text-xs font-medium tracking-[0.22em] text-neutral-500 uppercase">
              <span className="inline-block h-2 w-2 rounded-full bg-neutral-900" />
              {t("cancel.badge")}
            </div>
            <h1 className="max-w-3xl text-4xl font-semibold tracking-[-0.04em] text-neutral-950 sm:text-6xl">
              {t("cancel.title")}
            </h1>
            <p className="mt-4 max-w-2xl text-balance text-base leading-7 text-neutral-600 sm:text-lg">
              {t("cancel.subtitle")}
            </p>
            <div className="mt-5 rounded-[1.2rem] border border-black/6 bg-white/85 px-4 py-4 text-sm leading-6 text-neutral-600">
              If a hosted checkout is closed or cancelled before payment, this
              {" "}
              <span className="font-medium text-neutral-950">{checkoutFlow.cancelPath}</span>
              {" "}route is the intended recovery page. Actual hosted-provider behavior should be
              verified during the first smoke test.
            </div>
          </div>
        </section>

        {starterPack?.checkoutUrl ? (
          <section className="rounded-[1.75rem] border border-amber-200/60 bg-amber-50/60 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
                  {t("cancel.discount.label")}
                </div>
                <p className="mt-2 text-lg font-semibold tracking-[-0.02em] text-neutral-950">
                  {t("cancel.discount.title")}
                </p>
                <p className="mt-1.5 text-sm leading-6 text-neutral-600">
                  {t("cancel.discount.useCode")}{" "}
                  <span className="rounded-lg border border-amber-300 bg-white px-2.5 py-1 font-mono text-sm font-bold tracking-widest text-amber-800">
                    FIRSTPACK
                  </span>{" "}
                  {t("cancel.discount.note")}
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
                  {t("cancel.discount.cta")}
                </Link>
              </div>
            </div>
          </section>
        ) : null}

        <section className="grid gap-4 lg:grid-cols-3">
          {starterPack ? (
            <article className="rounded-[1.75rem] border border-black/6 bg-white/82 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-400">
                {t("cancel.starter.label")}
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
                  {t("cancel.starter.cta")}
                </Link>
              </div>
            </article>
          ) : null}

          <article className="rounded-[1.75rem] border border-black/6 bg-white/82 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-400">
              {t("cancel.free.label")}
            </div>
            <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-neutral-950">
              {t("cancel.free.title")}
            </h2>
            <div className="mt-2 text-sm font-medium text-neutral-500">{t("cancel.free.price")}</div>
            <p className="mt-3 text-sm leading-6 text-neutral-600">
              {t("cancel.free.desc")}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href="/free-pack/"
                className="rounded-full border border-black/8 bg-neutral-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800"
              >
                {t("cancel.free.cta")}
              </Link>
              <Link
                href="/collections/"
                className="rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
              >
                {t("cancel.free.proof")}
              </Link>
            </div>
          </article>

          {bundlePack ? (
            <article className="rounded-[1.75rem] border border-emerald-300/40 bg-gradient-to-br from-emerald-50/80 to-white/90 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.06)]">
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
                {t("cancel.bundle.label")}
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
                    {t("cancel.bundle.cta")}
                  </a>
                ) : null}
                <Link
                  href={`/packs/${bundlePack.id}/`}
                  className="rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
                >
                  {t("cancel.bundle.details")}
                </Link>
              </div>
            </article>
          ) : null}
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(20rem,0.9fr)]">
          <div className="rounded-[1.75rem] border border-black/6 bg-white/82 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
            <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
              {t("cancel.nextSteps.label")}
            </div>
            <div className="mt-4 grid gap-3">
              {([
                t("cancel.nextSteps.1"),
                t("cancel.nextSteps.2"),
                t("cancel.nextSteps.3"),
                t("cancel.nextSteps.4"),
              ] as string[]).map((step, index) => (
                <div
                  key={index}
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
              {t("cancel.questions.label")}
            </div>
            <p className="mt-3 text-sm leading-6 text-neutral-600">
              {t("cancel.questions.desc")}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href="/packs/"
                className="rounded-full border border-black/8 bg-neutral-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800"
              >
                {t("cancel.questions.compareAll")}
              </Link>
              <Link
                href="/free-pack/"
                className="rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
              >
                {t("cancel.questions.freeSample")}
              </Link>
              <Link
                href="/collections/"
                className="rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
              >
                {t("cancel.questions.proof")}
              </Link>
              <Link
                href="/support/"
                className="rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
              >
                {t("cancel.questions.support")}
              </Link>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
