"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { fetchSession, type AuthSession } from "@/src/lib/auth-client";
import { proSubscriptionConfig, preorderConfig } from "@/src/lib/checkout-config";
import { useLocale } from "@/src/components/locale-provider";
import { CheckoutButton } from "@/src/components/checkout-button";

const FEATURE_ICONS = [
  (
    <svg key="ai" className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
    </svg>
  ),
  (
    <svg key="export" className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
  ),
  (
    <svg key="wcag" className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  ),
  (
    <svg key="token" className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.098 19.902a3.75 3.75 0 005.304 0l6.401-6.402M6.75 21A3.75 3.75 0 013 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 003.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008z" />
    </svg>
  ),
];

const FEATURE_KEYS = [
  { titleKey: "pro.feature1.title", descKey: "pro.feature1.desc" },
  { titleKey: "pro.feature2.title", descKey: "pro.feature2.desc" },
  { titleKey: "pro.feature3.title", descKey: "pro.feature3.desc" },
  { titleKey: "pro.feature4.title", descKey: "pro.feature4.desc" },
];

export function ProPage() {
  const { t } = useLocale();
  const [session, setSession] = useState<AuthSession | null>(null);

  useEffect(() => {
    fetchSession().then(setSession).catch(() => {});
  }, []);

  const isPro = session?.auth.tier === "pro";

  const COMPARISON: { featureKey: string; free: boolean | string; pro: boolean | string }[] = [
    { featureKey: "pro.comparison.row1", free: true, pro: true },
    { featureKey: "pro.comparison.row2", free: true, pro: true },
    { featureKey: "pro.comparison.row3", free: t("pro.comparison.row3free"), pro: t("pro.comparison.row3pro") },
    { featureKey: "pro.comparison.row4", free: t("pro.comparison.row4free"), pro: t("pro.comparison.row4pro") },
    { featureKey: "pro.comparison.row5", free: false, pro: true },
    { featureKey: "pro.comparison.row6", free: t("pro.comparison.row6free"), pro: t("pro.comparison.row6pro") },
    { featureKey: "pro.comparison.row7", free: false, pro: true },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-neutral-950 dark:to-neutral-900 pb-24">
      {/* Hero */}
      <section className="max-w-3xl mx-auto px-4 pt-12 pb-10 text-center">
        <span className="inline-block px-3 py-1 text-xs font-semibold bg-black/5 dark:bg-white/10 text-slate-700 dark:text-slate-300 rounded-full mb-4">
          {t("pro.badge")}
        </span>
        <h1 className="text-3xl sm:text-4xl font-display font-light text-slate-900 dark:text-white leading-tight mb-3">
          {t("pro.heroTitle")}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base max-w-lg mx-auto">
          {t("pro.heroDesc")}
        </p>
      </section>

      <div className="max-w-4xl mx-auto px-4 space-y-10">
        {/* Pricing cards — 3 tiers */}
        {isPro ? (
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-100 dark:border-white/10 shadow-sm p-8 text-center">
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-semibold">
              <span>&#10003;</span> {t("pro.youreOnPro")}
            </div>
          </div>
        ) : (
          <div className="grid sm:grid-cols-3 gap-4">
            {/* Monthly */}
            <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-100 dark:border-white/10 shadow-sm p-6 text-center flex flex-col">
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">
                {t("pro.monthly")}
              </p>
              <div className="mb-4">
                <span className="text-3xl font-bold text-slate-900 dark:text-white">JP{proSubscriptionConfig.monthly.price}</span>
                <span className="text-slate-500 dark:text-slate-400 text-sm ml-1">/ {proSubscriptionConfig.monthly.period}</span>
                <p className="text-[11px] text-slate-400 mt-1">≈ {proSubscriptionConfig.monthly.priceUsd} USD · billed in Japanese yen</p>
              </div>
              <p className="text-xs text-slate-400 mb-1">{t("pro.cancelAnytime")}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-5">3-day free trial</p>
              <div className="mt-auto">
                <CheckoutButton
                  plan="monthly"
                  className="w-full px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-semibold rounded-xl hover:bg-slate-700 dark:hover:bg-slate-100 transition-colors"
                >
                  {t("pro.subscribeToPro")}
                </CheckoutButton>
              </div>
            </div>

            {/* Yearly — recommended */}
            <div className="bg-white dark:bg-neutral-900 rounded-2xl border-2 border-neutral-900 dark:border-white/40 shadow-sm p-6 text-center flex flex-col relative">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-semibold rounded-full">
                {t("pro.yearlySave")}
              </span>
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">
                {t("pro.yearly")}
              </p>
              <div className="mb-4">
                <span className="text-3xl font-bold text-slate-900 dark:text-white">JP{proSubscriptionConfig.yearly.price}</span>
                <span className="text-slate-500 dark:text-slate-400 text-sm ml-1">/ {proSubscriptionConfig.yearly.period}</span>
                <p className="text-[11px] text-slate-400 mt-1">≈ {proSubscriptionConfig.yearly.priceUsd} USD · billed in Japanese yen</p>
              </div>
              <p className="text-xs text-slate-400 mb-1">{t("pro.cancelAnytime")}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-5">3-day free trial</p>
              <div className="mt-auto">
                <CheckoutButton
                  plan="yearly"
                  className="w-full px-6 py-3 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-sm font-semibold rounded-xl hover:bg-neutral-700 dark:hover:bg-slate-100 transition-colors"
                >
                  {t("pro.subscribeToPro")}
                </CheckoutButton>
              </div>
            </div>

            {/* Lifetime */}
            <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-100 dark:border-white/10 shadow-sm p-6 text-center flex flex-col relative">
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">
                Lifetime
              </p>
              <div className="mb-2">
                <span className="text-3xl font-bold text-slate-900 dark:text-white">JP{proSubscriptionConfig.lifetime.price}</span>
                <p className="text-[11px] text-slate-400 mt-1">≈ {proSubscriptionConfig.lifetime.priceUsd} USD · billed in Japanese yen</p>
              </div>
              <p className="text-xs text-amber-600 dark:text-amber-400 font-medium mb-1">Pay once, keep forever*</p>
              <p className="text-[10px] text-slate-400 mb-5">*Lifetime of the ColorArchive product</p>
              <div className="mt-auto">
                <CheckoutButton
                  plan="lifetime"
                  className="w-full px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-semibold rounded-xl hover:bg-slate-700 dark:hover:bg-slate-100 transition-colors"
                >
                  Get Lifetime Access
                </CheckoutButton>
              </div>
            </div>
          </div>
        )}

        {/* Features grid */}
        <div className="grid sm:grid-cols-2 gap-4">
          {FEATURE_KEYS.map((f, i) => (
            <div key={f.titleKey} className="bg-white dark:bg-neutral-900 rounded-xl border border-slate-100 dark:border-white/10 shadow-sm p-5 flex gap-4">
              <div className="w-10 h-10 rounded-lg bg-black/5 dark:bg-white/10 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0">
                {FEATURE_ICONS[i]}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-white mb-1">{t(f.titleKey)}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{t(f.descKey)}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Comparison table */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-100 dark:border-white/10 shadow-sm overflow-hidden">
          <div className="grid grid-cols-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-white/10 px-6 py-3">
            <span>{t("pro.comparison.feature")}</span>
            <span className="text-center">{t("pro.comparison.free")}</span>
            <span className="text-center">{t("pro.comparison.pro")}</span>
          </div>
          {COMPARISON.map((row) => (
            <div key={row.featureKey} className="grid grid-cols-3 text-sm px-6 py-3 border-b border-slate-50 dark:border-white/10 last:border-0">
              <span className="text-slate-700 dark:text-slate-200">{t(row.featureKey)}</span>
              <span className="text-center text-slate-500 dark:text-slate-400">
                {row.free === true ? (
                  <span className="text-emerald-500">&#10003;</span>
                ) : row.free === false ? (
                  <span className="text-slate-300 dark:text-slate-600">&mdash;</span>
                ) : (
                  row.free
                )}
              </span>
              <span className="text-center text-slate-700 dark:text-slate-200 font-medium">
                {row.pro === true ? (
                  <span className="text-emerald-500">&#10003;</span>
                ) : (
                  row.pro
                )}
              </span>
            </div>
          ))}
        </div>

        {/* Trust row — honest, verifiable guarantees (no fabricated testimonial) */}
        <div className="bg-black/[0.03] dark:bg-white/[0.04] rounded-2xl border border-black/8 dark:border-white/10 p-6">
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-medium text-slate-600 dark:text-slate-400">
            <span>&#10003; 3-day free trial</span>
            <span>&#10003; 7-day money-back guarantee</span>
            <span>&#10003; Cancel anytime</span>
            <span>&#10003; No credit card for the free tier</span>
          </div>
        </div>

        {/* Pre-order promo — WTP experiment entry point */}
        <Link
          href="/preorder/"
          className="block rounded-2xl border border-amber-200 bg-amber-50/60 p-6 transition hover:border-amber-300 dark:border-amber-900/50 dark:bg-amber-950/20"
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                Coming soon · pre-order
              </span>
              <p className="mt-1 text-base font-semibold text-slate-900 dark:text-white">Accessibility Auditor</p>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                Audit a whole palette for WCAG + color-blindness and export accessible fixes. Founder price JP{preorderConfig.price} (≈ {preorderConfig.priceUsd}).
              </p>
            </div>
            <span className="shrink-0 text-sm font-semibold text-amber-700 dark:text-amber-400">Pre-order &rarr;</span>
          </div>
        </Link>

        {/* FAQ */}
        <section>
          <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">{t("pro.faqTitle")}</h2>
          <div className="space-y-4">
            {[
              { q: t("pro.faq.q1"), a: t("pro.faq.a1") },
              { q: t("pro.faq.q2"), a: t("pro.faq.a2") },
              { q: t("pro.faq.q3"), a: t("pro.faq.a3") },
            ].map(({ q, a }) => (
              <div key={q} className="bg-white dark:bg-neutral-900 rounded-xl border border-slate-100 dark:border-white/10 shadow-sm p-5">
                <p className="text-sm font-semibold text-slate-800 dark:text-white mb-1">{q}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{a}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
