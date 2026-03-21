"use client";

import Image from "next/image";
import Link from "next/link";
import { useLocale } from "@/src/components/locale-provider";

export function SiteFooter() {
  const { t } = useLocale();
  return (
    <footer className="px-4 pb-4 pt-2 sm:px-6 sm:pb-6">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-4 rounded-[1.75rem] border border-black/6 bg-white/66 px-5 py-5 text-sm text-neutral-500 shadow-[0_18px_48px_rgba(15,23,42,0.04)] backdrop-blur-xl dark:border-white/10 dark:bg-neutral-900/66 dark:text-neutral-400 dark:shadow-[0_18px_48px_rgba(0,0,0,0.2)] sm:flex-row sm:items-end sm:justify-between sm:px-6">
        <div className="space-y-3">
          <Link href="/" className="inline-flex items-center">
            <Image
              src="/logo-v1.png"
              alt="ColorArchive"
              width={512}
              height={341}
              className="h-auto w-[160px] dark:invert"
              priority
            />
          </Link>
          <p className="max-w-2xl leading-6">
            {t("footer.description")}
          </p>
          <div className="flex flex-wrap gap-2 text-xs uppercase tracking-[0.16em] text-neutral-400">
            <Link href="/collections/" className="rounded-full border border-black/8 bg-white px-3 py-1.5 transition hover:bg-neutral-50 dark:border-white/10 dark:bg-white/8 dark:hover:bg-white/14">
              {t("nav.collections")}
            </Link>
            <Link href="/families/" className="rounded-full border border-black/8 bg-white px-3 py-1.5 transition hover:bg-neutral-50 dark:border-white/10 dark:bg-white/8 dark:hover:bg-white/14">
              {t("nav.families")}
            </Link>
            <Link href="/packs/" className="rounded-full border border-black/8 bg-white px-3 py-1.5 transition hover:bg-neutral-50 dark:border-white/10 dark:bg-white/8 dark:hover:bg-white/14">
              {t("nav.packs")}
            </Link>
            <Link href="/notes/" className="rounded-full border border-black/8 bg-white px-3 py-1.5 transition hover:bg-neutral-50 dark:border-white/10 dark:bg-white/8 dark:hover:bg-white/14">
              {t("nav.notes")}
            </Link>
            <Link href="/guides/" className="rounded-full border border-black/8 bg-white px-3 py-1.5 transition hover:bg-neutral-50 dark:border-white/10 dark:bg-white/8 dark:hover:bg-white/14">
              {t("nav.guides")}
            </Link>
            <Link href="/free-pack/" className="rounded-full border border-black/8 bg-white px-3 py-1.5 transition hover:bg-neutral-50 dark:border-white/10 dark:bg-white/8 dark:hover:bg-white/14">
              {t("nav.freePack")}
            </Link>
            <Link href="/convert/" className="rounded-full border border-black/8 bg-white px-3 py-1.5 transition hover:bg-neutral-50 dark:border-white/10 dark:bg-white/8 dark:hover:bg-white/14">
              {t("nav.convert")}
            </Link>
            <Link href="/packs/quiz/" className="rounded-full border border-black/8 bg-white px-3 py-1.5 transition hover:bg-neutral-50 dark:border-white/10 dark:bg-white/8 dark:hover:bg-white/14">
              {t("packs.whichPack")}
            </Link>
            <Link href="/about/" className="rounded-full border border-black/8 bg-white px-3 py-1.5 transition hover:bg-neutral-50 dark:border-white/10 dark:bg-white/8 dark:hover:bg-white/14">
              {t("nav.about")}
            </Link>
            <Link href="/support/" className="rounded-full border border-black/8 bg-white px-3 py-1.5 transition hover:bg-neutral-50 dark:border-white/10 dark:bg-white/8 dark:hover:bg-white/14">
              {t("nav.support")}
            </Link>
            <Link href="/updates/" className="rounded-full border border-black/8 bg-white px-3 py-1.5 transition hover:bg-neutral-50 dark:border-white/10 dark:bg-white/8 dark:hover:bg-white/14">
              {t("nav.updates")}
            </Link>
          </div>
        </div>

        <div className="space-y-2 text-left sm:text-right">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-neutral-400 sm:justify-end">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
            {t("footer.readyForExport")}
          </div>
          <div className="text-xs uppercase tracking-[0.16em] text-neutral-400">
            colorarchive.me · © 2026 ColorArchive
          </div>
        </div>
      </div>
    </footer>
  );
}
