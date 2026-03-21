"use client";

import Link from "next/link";
import { CopyActionButton } from "@/src/components/copy-action-button";
import { EmailCaptureForm } from "@/src/components/email-capture-form";
import { useLocale } from "@/src/components/locale-provider";
import type { ColorCollection } from "@/src/lib/collections";
import { checkoutConfig, type WaitlistConfig } from "@/src/lib/checkout-config";
import { getGuidesForCollection, getGuidesForPack } from "@/src/lib/guides";
import { computeBundleSavings, type PalettePack } from "@/src/lib/palette-packs";

interface FreePackPageProps {
  featuredCollection: ColorCollection;
  pack: PalettePack;
  waitlist: WaitlistConfig;
}

export function FreePackPage({
  featuredCollection,
  pack,
  waitlist,
}: FreePackPageProps) {
  const { t } = useLocale();
  const { individualTotal, bundlePrice, savingsPct } = computeBundleSavings();
  const emailHref = `mailto:${waitlist.contactEmail}?subject=ColorArchive%20free%20sample`;
  const requestTemplate = [
    "Hi,",
    "",
    "I downloaded the free ColorArchive sample pack and want updates when the paid catalog is available for direct purchase.",
    "",
    `Most interested in: ${pack.title}`,
    "Please send updates on new packs and seasonal releases when available.",
    "",
    `Preferred contact path: ${waitlist.provider}`,
  ].join("\n");
  const comparisonRows = [
    {
      label: "Price",
      freeValue: "Free",
      paidValue: pack.priceHint,
    },
    {
      label: "Formats",
      freeValue: `${pack.sampleDownloads.map((sample) => sample.format).join(" · ")}`,
      paidValue: pack.formatList.join(" · "),
    },
    {
      label: "Scope",
      freeValue: "Preview files and one featured collection",
      paidValue: pack.deliverables.slice(0, 2).join(" · "),
    },
    {
      label: "Use case",
      freeValue: "Try the style and export shape",
      paidValue: "Ship a fuller palette system into a real project",
    },
  ] as const;
  const relatedGuides = [
    ...getGuidesForPack(pack.id, 2),
    ...getGuidesForCollection(featuredCollection.id, 1),
  ].filter((guide, index, array) => array.findIndex((entry) => entry.slug === guide.slug) === index);

  return (
    <main className="px-4 py-4 sm:px-6 sm:py-6">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6">
        <section className="relative overflow-hidden rounded-[2rem] border border-black/6 bg-white/74 px-6 py-10 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:px-10 sm:py-14">
          <div className="pointer-events-none absolute left-0 top-0 h-56 w-56 rounded-full bg-emerald-200/28 blur-3xl" />
          <div className="pointer-events-none absolute right-0 top-8 h-64 w-64 rounded-full bg-violet-200/24 blur-3xl" />
          <div className="relative mx-auto max-w-5xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-black/8 bg-white/85 px-3 py-1 text-xs font-medium tracking-[0.22em] text-neutral-500 uppercase">
              <span className="inline-block h-2 w-2 rounded-full bg-neutral-900" />
              {t("freePack.badge")}
            </div>
            <h1 className="max-w-4xl text-4xl font-semibold tracking-[-0.04em] text-neutral-950 sm:text-6xl">
              {t("freePack.title")}
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-neutral-600 sm:text-lg">
              {t("freePack.description")}
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-2">
              {pack.sampleDownloads.map((sample, index) => (
                <a
                  key={sample.href}
                  href={sample.href}
                  target="_blank"
                  rel="noreferrer"
                  className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                    index === 0
                      ? "border-black/8 bg-neutral-950 text-white hover:bg-neutral-800"
                      : "border-black/8 bg-white text-neutral-700 hover:bg-neutral-50"
                  }`}
                >
                  {sample.label}
                </a>
              ))}
              <CopyActionButton label={t("freePack.copyRequestNote")} value={requestTemplate} />
            </div>

            <div className="mt-5">
              <p className="mb-2 text-sm text-neutral-500">
                {t("freePack.emailHint")}
              </p>
              <EmailCaptureForm />
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(20rem,0.95fr)]">
          <div className="rounded-[1.75rem] border border-black/6 bg-white/82 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
            <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
              {t("freePack.whatIncluded")}
            </div>
            <div className="mt-4 grid gap-2">
              {pack.sampleDownloads.map((sample) => (
                <a
                  key={sample.href}
                  href={sample.href}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-[1rem] border border-black/6 bg-neutral-50 px-4 py-3 text-sm leading-6 text-neutral-600 transition hover:bg-white"
                >
                  {sample.label} · {sample.format}
                </a>
              ))}
              <div className="rounded-[1rem] border border-black/6 bg-neutral-50 px-4 py-3 text-sm leading-6 text-neutral-600">
                {t("freePack.curatedCollection")} {featuredCollection.title}
              </div>
            </div>
          </div>

          <aside className="rounded-[1.75rem] border border-black/6 bg-white/82 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
            <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
              {t("freePack.whyExists")}
            </div>
            <div className="mt-4 space-y-3 text-sm leading-6 text-neutral-600">
              <p>
                The free sample gives you the exact file shapes used in the paid packs — CSS
                variables, JSON color data, and a featured palette — so you can decide whether the
                format fits your project before buying.
              </p>
              <p>
                This now stays in place as a permanent free tier. The full packs add more
                collections, deeper exports, and structured usage guidance on top of what you see here.
              </p>
            </div>

            <div className="mt-5 rounded-[1.2rem] border border-black/6 bg-neutral-50 px-4 py-4">
              <div className="text-xs font-medium uppercase tracking-[0.16em] text-neutral-400">
                {t("freePack.claimFlow")}
              </div>
              <div className="mt-3 space-y-2 text-sm leading-6 text-neutral-600">
                <div className="rounded-[1rem] border border-black/6 bg-white px-3 py-3">
                  {t("freePack.step1")}
                </div>
                <div className="rounded-[1rem] border border-black/6 bg-white px-3 py-3">
                  {t("freePack.step2")}
                </div>
                <div className="rounded-[1rem] border border-black/6 bg-white px-3 py-3">
                  {t("freePack.step3")}
                </div>
              </div>
            </div>
          </aside>
        </section>

        <section className="rounded-[1.75rem] border border-black/6 bg-white/82 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
                {t("freePack.freeVsPaid")}
              </div>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-neutral-950">
                {t("freePack.upgradeTitle")}
              </h2>
            </div>
            <Link
              href={`/packs/${pack.id}`}
              className="rounded-full border border-black/8 bg-neutral-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800"
            >
              {t("freePack.openPaidPack")}
            </Link>
          </div>

          <div className="mt-5 overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-0 text-left text-sm text-neutral-600">
              <thead>
                <tr>
                  <th className="rounded-l-[1rem] border border-black/6 bg-neutral-50 px-4 py-3 font-medium text-neutral-500">
                    {t("freePack.tableLayer")}
                  </th>
                  <th className="border border-black/6 bg-neutral-50 px-4 py-3 font-medium text-neutral-500">
                    {t("freePack.tableFreeSample")}
                  </th>
                  <th className="rounded-r-[1rem] border border-black/6 bg-neutral-50 px-4 py-3 font-medium text-neutral-500">
                    {t("freePack.tablePaidPack")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row) => (
                  <tr key={row.label}>
                    <td className="border border-black/6 bg-white px-4 py-4 align-top font-medium text-neutral-950">
                      {row.label}
                    </td>
                    <td className="border border-black/6 bg-white px-4 py-4 align-top">
                      {row.freeValue}
                    </td>
                    <td className="border border-black/6 bg-white px-4 py-4 align-top">
                      {row.paidValue}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-[1.75rem] border border-black/6 bg-neutral-950 p-5 text-white shadow-[0_18px_48px_rgba(15,23,42,0.05)] dark:border-white/10 dark:bg-white dark:text-neutral-950">
          <div className="text-xs font-medium uppercase tracking-[0.18em] text-white/40 dark:text-neutral-400">
            {t("freePack.ctaLabel")}
          </div>
          <p className="mt-2 text-lg font-semibold tracking-[-0.02em]">
            {t("freePack.ctaTitle")}
          </p>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/60 dark:text-neutral-500">
            {t("freePack.ctaDesc")}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/packs/"
              className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-neutral-950 transition hover:bg-neutral-200 dark:bg-neutral-950 dark:text-white dark:hover:bg-neutral-800"
            >
              {t("freePack.browseAllPacks")}
            </Link>
            <Link
              href="/collections/"
              className="rounded-full border border-white/16 px-5 py-2.5 text-sm font-semibold text-white/80 transition hover:border-white/30 hover:text-white dark:border-black/16 dark:text-neutral-600 dark:hover:border-black/30 dark:hover:text-neutral-950"
            >
              {t("freePack.exploreCollections")}
            </Link>
            <Link
              href="/product-examples/"
              className="rounded-full border border-white/16 px-5 py-2.5 text-sm font-semibold text-white/80 transition hover:border-white/30 hover:text-white dark:border-black/16 dark:text-neutral-600 dark:hover:border-black/30 dark:hover:text-neutral-950"
            >
              {t("freePack.seeWhatsInside")}
            </Link>
          </div>
        </section>

        <section className="rounded-[1.75rem] border border-black/6 bg-white/82 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
                {t("freePack.featuredCollection")}
              </div>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-neutral-950">
                {featuredCollection.title}
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-neutral-600">
                {featuredCollection.summary}
              </p>
            </div>
            <Link
              href={`/collections/${featuredCollection.id}`}
              className="rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
            >
              {t("freePack.openCollection")}
            </Link>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {featuredCollection.palette.map((color) => (
              <Link
                key={color.id}
                href={`/colors/${color.id}/`}
                className="overflow-hidden rounded-[1.3rem] border border-black/6 bg-white shadow-[0_12px_32px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_36px_rgba(15,23,42,0.08)]"
              >
                <div className="h-36 border-b border-black/6" style={{ backgroundColor: color.hex }} />
                <div className="p-4">
                  <div className="text-base font-semibold tracking-[-0.02em] text-neutral-950">
                    {color.name}
                  </div>
                  <div className="mt-1 text-sm text-neutral-500">{color.hex}</div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {relatedGuides.length > 0 ? (
          <section className="rounded-[1.75rem] border border-black/6 bg-white/82 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
                  {t("freePack.relatedGuides")}
                </div>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-neutral-600">
                  {t("freePack.relatedGuidesDesc")}
                </p>
              </div>
              <Link
                href="/guides/"
                className="rounded-full border border-black/8 bg-neutral-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800"
              >
                {t("freePack.openGuides")}
              </Link>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-3">
              {relatedGuides.map((guide) => (
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
        ) : null}

        {checkoutConfig["all-access-bundle"].url && (
          <section className="rounded-[1.75rem] border border-emerald-300/40 bg-gradient-to-br from-emerald-50/80 to-white/90 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.06)] dark:from-emerald-950/30 dark:to-neutral-900/80 dark:border-emerald-700/30">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-400">
                  {t("freePack.wantEverything")}
                </div>
                <p className="mt-1 text-lg font-semibold tracking-[-0.02em] text-neutral-950 dark:text-white">
                  All Access Bundle — <span className="line-through text-neutral-400">¥{individualTotal.toLocaleString()}</span>{" "}¥{bundlePrice.toLocaleString()}
                </p>
                <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                  Save {savingsPct}% vs individual packs
                </p>
              </div>
              <a
                href={checkoutConfig["all-access-bundle"].url}
                target="_blank"
                rel="noreferrer"
                className="shrink-0 rounded-full bg-neutral-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-800"
              >
                {t("freePack.getAllAccess")}
              </a>
            </div>
          </section>
        )}

        <section className="rounded-[1.75rem] border border-black/6 bg-white/82 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
          <div className="flex flex-wrap gap-2">
            <Link
              href="/packs/"
              className="rounded-full border border-black/8 bg-neutral-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800"
            >
              {t("freePack.viewPaidPacks")}
            </Link>
            <Link
              href="/waitlist/"
              className="rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
            >
              {t("freePack.productUpdates")}
            </Link>
            <Link
              href="/product-examples/"
              className="rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
            >
              {t("freePack.productProof")}
            </Link>
            <a
              href={waitlist.url ?? emailHref}
              target={waitlist.url ? "_blank" : undefined}
              rel={waitlist.url ? "noreferrer" : undefined}
              className="rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
            >
              {waitlist.url ? t("freePack.joinWaitlist") : t("freePack.emailForLaunch")}
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}
