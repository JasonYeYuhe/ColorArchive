"use client";

import Image from "next/image";
import Link from "next/link";
import { useLocale } from "@/src/components/locale-provider";
import { SITE_DOMAIN } from "@/src/lib/site-config";
import { useIsBareRoute } from "@/src/lib/bare-routes";

export function SiteFooter() {
  const isBare = useIsBareRoute();
  const { t } = useLocale();

  // Chrome stays off the bare routes — see src/lib/bare-routes.ts.
  //
  // THIS RETURN MUST STAY BELOW EVERY HOOK. This component is mounted by the root
  // layout, so navigating between a bare route and a normal one RE-RENDERS it
  // rather than remounting it. Returning above a hook would make the hook count
  // differ between two renders of the same component instance, and React responds
  // by throwing "Rendered fewer hooks than expected" — which takes down the whole
  // app, on every page, not just the bare one.
  if (isBare) return null;
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
            <Link href="/brands/" className="rounded-full border border-black/8 bg-white px-3 py-1.5 transition hover:bg-neutral-50 dark:border-white/10 dark:bg-white/8 dark:hover:bg-white/14">
              Brands
            </Link>
            <Link href="/regions/" className="rounded-full border border-black/8 bg-white px-3 py-1.5 transition hover:bg-neutral-50 dark:border-white/10 dark:bg-white/8 dark:hover:bg-white/14">
              Regions
            </Link>
            <Link href="/journal/" className="rounded-full border border-black/8 bg-white px-3 py-1.5 transition hover:bg-neutral-50 dark:border-white/10 dark:bg-white/8 dark:hover:bg-white/14">
              Journal
            </Link>
            <Link href="/notes/" className="rounded-full border border-black/8 bg-white px-3 py-1.5 transition hover:bg-neutral-50 dark:border-white/10 dark:bg-white/8 dark:hover:bg-white/14">
              {t("nav.notes")}
            </Link>
            <Link href="/guides/" className="rounded-full border border-black/8 bg-white px-3 py-1.5 transition hover:bg-neutral-50 dark:border-white/10 dark:bg-white/8 dark:hover:bg-white/14">
              {t("nav.guides")}
            </Link>
            <Link href="/free-resources/" className="rounded-full border border-black/8 bg-white px-3 py-1.5 transition hover:bg-neutral-50 dark:border-white/10 dark:bg-white/8 dark:hover:bg-white/14">
              {t("nav.freeResources")}
            </Link>
            <Link href="/embed/embed-code/" className="rounded-full border border-black/8 bg-white px-3 py-1.5 transition hover:bg-neutral-50 dark:border-white/10 dark:bg-white/8 dark:hover:bg-white/14">
              Embed widget
            </Link>
            <Link href="/convert/" className="rounded-full border border-black/8 bg-white px-3 py-1.5 transition hover:bg-neutral-50 dark:border-white/10 dark:bg-white/8 dark:hover:bg-white/14">
              {t("nav.convert")}
            </Link>
            <Link href="/colorblind/" className="rounded-full border border-black/8 bg-white px-3 py-1.5 transition hover:bg-neutral-50 dark:border-white/10 dark:bg-white/8 dark:hover:bg-white/14">
              {t("nav.colorblind")}
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
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs uppercase tracking-[0.16em] text-neutral-400 sm:justify-end">
            <Link href="/privacy/" className="transition hover:text-neutral-600 dark:hover:text-neutral-300">Privacy</Link>
            <span>·</span>
            <Link href="/terms/" className="transition hover:text-neutral-600 dark:hover:text-neutral-300">Terms</Link>
            <span>·</span>
            <Link href="/refund-policy/" className="transition hover:text-neutral-600 dark:hover:text-neutral-300">Refunds</Link>
            <span>·</span>
            <Link href="/cookie-policy/" className="transition hover:text-neutral-600 dark:hover:text-neutral-300">Cookies</Link>
            <span>·</span>
            <Link href="/commerce-disclosure/" className="transition hover:text-neutral-600 dark:hover:text-neutral-300">Commerce Disclosure</Link>
          </div>
          <div className="text-xs uppercase tracking-[0.16em] text-neutral-400">
            {SITE_DOMAIN} · © 2026 ColorArchive
          </div>
        </div>
      </div>
    </footer>
  );
}
