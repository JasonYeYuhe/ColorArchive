"use client";

import Link from "next/link";
import type { ColorCollection } from "@/src/lib/collections";
import type { LandingGuide } from "@/src/lib/guides";
import type { UseCase } from "@/src/lib/use-cases";
import { useCases } from "@/src/lib/use-cases";
import { t, getLocaleFromStorage } from "@/src/lib/i18n";
import { useState, useEffect } from "react";
import type { Locale } from "@/src/lib/i18n";

interface UseCaseDetailPageProps {
  useCase: UseCase;
  relatedCollections: ColorCollection[];
  relatedGuides: Pick<LandingGuide, "slug" | "title" | "eyebrow">[];
}

export function UseCaseDetailPage({ useCase, relatedCollections, relatedGuides }: UseCaseDetailPageProps) {
  const [locale, setLocale] = useState<Locale>("en");

  useEffect(() => {
    setLocale(getLocaleFromStorage());
    const handler = () => setLocale(getLocaleFromStorage());
    window.addEventListener("colorarchive-locale-change", handler);
    return () => window.removeEventListener("colorarchive-locale-change", handler);
  }, []);

  const otherUseCases = useCases.filter((uc) => uc.id !== useCase.id).slice(0, 4);

  return (
    <main className="min-h-screen bg-white dark:bg-neutral-950">
      {/* Hero */}
      <section className="max-w-3xl mx-auto px-4 pt-12 pb-10">
        <Link
          href="/use-cases/"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors mb-6"
        >
          ← {t("useCases.allUseCases", locale)}
        </Link>

        <div className="flex items-center gap-4 mb-5">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
            style={{ backgroundColor: useCase.primaryColor + "20" }}
          >
            {useCase.icon}
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 mb-1">
              {t("useCases.industryGuide", locale)}
            </p>
            <h1 className="font-display text-2xl sm:text-3xl font-light tracking-tight text-neutral-900 dark:text-white">
              {useCase.title}
            </h1>
          </div>
        </div>

        <p className="text-lg font-medium text-neutral-700 dark:text-neutral-300 mb-4 leading-snug">
          {useCase.tagline}
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          {useCase.description}
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          {useCase.colorFamilies.map((family) => (
            <span
              key={family}
              className="rounded-full border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 px-3 py-1 text-xs font-medium text-neutral-600 dark:text-neutral-300"
            >
              {family}
            </span>
          ))}
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 pb-20 space-y-12">
        {/* Key Principles */}
        <section>
          <h2 className="text-base font-semibold text-neutral-800 dark:text-neutral-200 mb-4 uppercase tracking-wide text-xs">
            {t("useCases.keyPrinciples", locale)}
          </h2>
          <div className="space-y-3">
            {useCase.keyPrinciples.map((principle, i) => (
              <div
                key={i}
                className="flex gap-3 rounded-xl border border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4"
              >
                <div
                  className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-white mt-0.5"
                  style={{ backgroundColor: useCase.primaryColor }}
                >
                  {i + 1}
                </div>
                <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
                  {principle}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* What to Avoid */}
        <section>
          <h2 className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 mb-4 uppercase tracking-wide">
            Families to Approach Carefully
          </h2>
          <div className="flex flex-wrap gap-2">
            {useCase.avoidFamilies.map((family) => (
              <span
                key={family}
                className="rounded-full border border-red-100 dark:border-red-900/30 bg-red-50 dark:bg-red-950/20 px-3 py-1 text-xs font-medium text-red-600 dark:text-red-400"
              >
                ⚠ {family}
              </span>
            ))}
          </div>
        </section>

        {/* Tone Summary */}
        <section className="rounded-2xl border-l-4 pl-5 py-4 bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700"
          style={{ borderLeftColor: useCase.primaryColor }}>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Tone in three words
          </p>
          <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            {useCase.toneSummary}
          </p>
        </section>

        {/* Curated Collections */}
        {relatedCollections.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 uppercase tracking-wide">
                {t("useCases.relatedCollections", locale)}
              </h2>
              <Link
                href="/collections/"
                className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                {t("useCases.exploreCollections", locale)} →
              </Link>
            </div>
            <div className="space-y-3">
              {relatedCollections.map((collection) => {
                if (!collection) return null;
                return (
                  <Link
                    key={collection.id}
                    href={`/collections/${collection.id}/`}
                    className="block group rounded-xl border border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 hover:border-neutral-300 dark:hover:border-neutral-600 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex gap-1 flex-shrink-0">
                        {collection.palette.slice(0, 5).map((color) => (
                          <div
                            key={color.id}
                            className="w-7 h-7 rounded-md"
                            style={{ backgroundColor: color.hex }}
                          />
                        ))}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200 group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition-colors">
                          {collection.title}
                        </p>
                        <p className="text-xs text-slate-400 truncate mt-0.5">{collection.summary.slice(0, 80)}…</p>
                      </div>
                      <span className="text-slate-300 dark:text-slate-600 group-hover:text-slate-500 transition-colors text-sm">
                        →
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* Related Guides */}
        {relatedGuides.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 uppercase tracking-wide">
                {t("useCases.relatedGuides", locale)}
              </h2>
              <Link
                href="/guides/"
                className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                {t("useCases.readGuide", locale)} →
              </Link>
            </div>
            <div className="space-y-2">
              {relatedGuides.map((guide) => (
                <Link
                  key={guide.slug}
                  href={`/guides/${guide.slug}/`}
                  className="flex items-center justify-between rounded-xl border border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 hover:border-neutral-300 dark:hover:border-neutral-600 transition-colors group"
                >
                  <div>
                    <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200 group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition-colors">
                      {guide.title}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">{guide.eyebrow}</p>
                  </div>
                  <span className="text-slate-300 dark:text-slate-600 group-hover:text-slate-500 transition-colors text-sm ml-3">
                    →
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Other Use Cases */}
        <section>
          <h2 className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 uppercase tracking-wide mb-4">
            {t("useCases.moreUseCases", locale)}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {otherUseCases.map((uc) => (
              <Link
                key={uc.id}
                href={`/use-cases/${uc.id}/`}
                className="rounded-xl border border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-3 hover:border-neutral-300 dark:hover:border-neutral-600 transition-colors text-center group"
              >
                <div className="text-xl mb-1.5">{uc.icon}</div>
                <p className="text-xs font-medium text-neutral-700 dark:text-neutral-300 group-hover:text-neutral-500 transition-colors leading-tight">
                  {uc.title}
                </p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
