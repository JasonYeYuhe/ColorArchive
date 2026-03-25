"use client";

import Link from "next/link";
import { useCases } from "@/src/lib/use-cases";
import { t, getLocaleFromStorage } from "@/src/lib/i18n";
import { useState, useEffect } from "react";
import type { Locale } from "@/src/lib/i18n";

export function UseCasesPage() {
  const [locale, setLocale] = useState<Locale>("en");

  useEffect(() => {
    setLocale(getLocaleFromStorage());
    const handler = () => setLocale(getLocaleFromStorage());
    window.addEventListener("colorarchive-locale-change", handler);
    return () => window.removeEventListener("colorarchive-locale-change", handler);
  }, []);

  return (
    <main className="min-h-screen bg-white dark:bg-neutral-950">
      <section className="max-w-2xl mx-auto px-4 pt-12 pb-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 mb-3">
          {t("useCases.eyebrow", locale)}
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900 dark:text-white mb-4">
          {t("useCases.title", locale)}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm max-w-lg mx-auto leading-relaxed">
          {t("useCases.subtitle", locale)}
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {useCases.map((uc) => (
            <Link key={uc.id} href={`/use-cases/${uc.id}/`} className="group block">
              <div className="rounded-2xl border border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 hover:border-neutral-300 dark:hover:border-neutral-600 hover:shadow-md transition-all">
                <div className="flex items-start gap-4">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                    style={{ backgroundColor: uc.primaryColor + "20", color: uc.primaryColor }}
                  >
                    {uc.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-base font-semibold text-neutral-900 dark:text-white mb-1 group-hover:text-neutral-700 dark:group-hover:text-neutral-200 transition-colors">
                      {uc.title}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      {uc.tagline}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {uc.colorFamilies.slice(0, 3).map((family) => (
                    <span
                      key={family}
                      className="rounded-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700 px-2.5 py-0.5 text-[10px] font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide"
                    >
                      {family}
                    </span>
                  ))}
                </div>

                <div className="mt-4 flex items-center text-xs text-neutral-400 dark:text-neutral-500 group-hover:text-neutral-600 dark:group-hover:text-neutral-400 transition-colors">
                  <span>{uc.keyPrinciples.length} {t("useCases.designPrinciples", locale)}</span>
                  <span className="mx-2">·</span>
                  <span>{uc.collectionIds.length} {t("useCases.curatedPalettes", locale)}</span>
                  <span className="ml-auto">→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
