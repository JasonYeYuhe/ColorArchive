"use client";

import Link from "next/link";
import { useLocale } from "@/src/components/locale-provider";
import { AppStoreLink } from "@/src/components/app-store-link";
import { IOS_APP } from "@/src/lib/app-store";

/**
 * The App Store landing page.
 *
 * Copy rule for this file: the app has **0 ratings** and roughly one download a week, so
 * there is no social proof to cite and none is invented here. Every claim below is a
 * feature that exists in the shipped build (v1.4), and the "web only" list is deliberate —
 * most visitors reach this page from /word-to-color/, which the app does NOT have. Telling
 * them up front costs a few installs and avoids the one-star review that says "it doesn't
 * do the thing I came for".
 */
export function IosPage() {
  const { locale } = useLocale();
  const zh = locale === "zh";

  const features = [
    {
      t: zh ? "5,446 种颜色,离线可用" : "All 5,446 colors, offline",
      d: zh
        ? "整个色库随 app 一起打包,没有网络也能浏览 —— 颜色是算法生成的,不依赖任何服务器。"
        : "The whole library ships inside the app. The colors are generated algorithmically, not fetched, so browsing works with no connection at all.",
    },
    {
      t: zh ? "按名称、HEX 或情绪搜索" : "Search by name, HEX, or mood",
      d: zh
        ? "输入 ocean、autumn 这类词也能搜 —— 语义搜索会展开成对应的色系。"
        : "Type a word like “ocean” or “autumn” and semantic search expands it into the matching color families.",
    },
    {
      t: zh ? "长按任意色块复制" : "Copy from any swatch",
      d: zh
        ? "在网格里长按一张卡就能复制 HEX / RGB / HSL,不用先进详情页。"
        : "Long-press a card in the grid to copy HEX, RGB or HSL without opening it first.",
    },
    {
      t: zh ? "收藏与最近浏览" : "Favorites and recents",
      d: zh
        ? "收藏保存在设备上。对比度检查、色盲预览、色彩搭配等工具也都在 app 里。"
        : "Favorites are stored on device. Contrast checking, colorblind preview and harmony tools are in the app too.",
    },
  ];

  const webOnly = zh
    ? ["文字转配色生成器", "品牌配色生成器", "调色板导出为 Figma / Tailwind token"]
    : ["The word-to-color generator", "The brand palette generator", "Figma and Tailwind token exports"];

  return (
    <main className="px-4 py-4 sm:px-6 sm:py-6">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6">
        <section className="rounded-[2rem] border border-black/6 bg-white/80 px-6 py-14 text-center shadow-[0_18px_48px_rgba(15,23,42,0.05)] backdrop-blur-xl sm:px-12 sm:py-20 dark:border-white/10 dark:bg-neutral-900/80">
          <p className="text-xs uppercase tracking-[0.18em] text-neutral-400 dark:text-neutral-500">
            {zh ? "iPhone 与 iPad" : "iPhone and iPad"}
          </p>
          <h1 className="mt-4 font-display text-4xl font-light tracking-[-0.03em] text-neutral-950 sm:text-5xl dark:text-white">
            {zh ? "把整个色库装进口袋" : "The whole archive, in your pocket"}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-neutral-600 dark:text-neutral-400">
            {zh
              ? "ColorArchive 的 iOS app 免费、无需注册,把全部 5,446 种颜色带到线下 —— 浏览、搜索、复制色号、收藏。"
              : "The ColorArchive iOS app is free and needs no account. It puts all 5,446 colors on your phone — browse, search, copy, and save them, online or off."}
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <AppStoreLink
              surface="ios_page"
              label={zh ? "在 App Store 下载" : "Download on the App Store"}
              className="rounded-full bg-neutral-900 px-8 py-3 text-sm font-medium text-white transition hover:bg-neutral-700 focus:outline-none focus:ring-4 focus:ring-neutral-900/10 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
            />
            <Link
              href="/#archive"
              className="px-3 py-3 text-sm font-medium text-neutral-500 transition hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
            >
              {zh ? "先在网页里用" : "Use it on the web first"} &rarr;
            </Link>
          </div>
          <p className="mt-8 text-xs uppercase tracking-[0.18em] text-neutral-400 dark:text-neutral-500">
            {IOS_APP.price} · {IOS_APP.minimumOS}
            {zh ? " 或更高" : " or later"} · {IOS_APP.category}
          </p>
        </section>

        <section className="grid gap-4 sm:grid-cols-2">
          {features.map((f) => (
            <div
              key={f.t}
              className="rounded-[1.75rem] border border-black/6 bg-white/80 p-6 shadow-[0_18px_48px_rgba(15,23,42,0.05)] dark:border-white/10 dark:bg-neutral-900/80"
            >
              <h2 className="text-base font-semibold tracking-[-0.02em] text-neutral-950 dark:text-white">{f.t}</h2>
              <p className="mt-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">{f.d}</p>
            </div>
          ))}
        </section>

        <section className="rounded-[1.75rem] border border-black/6 bg-neutral-50 p-6 sm:p-8 dark:border-white/10 dark:bg-white/8">
          <h2 className="text-xl font-semibold tracking-[-0.03em] text-neutral-950 dark:text-white">
            {zh ? "这些只在网页版有" : "These stay on the web"}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
            {zh
              ? "如果你是为下面这些功能来的,请直接用网页版 —— app 里没有它们。"
              : "If you came for one of these, use the site instead — the app does not have them."}
          </p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {webOnly.map((w) => (
              <li
                key={w}
                className="rounded-full border border-black/8 bg-white px-3 py-1.5 text-xs uppercase tracking-[0.14em] text-neutral-500 dark:border-white/10 dark:bg-white/8 dark:text-neutral-400"
              >
                {w}
              </li>
            ))}
          </ul>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/word-to-color/"
              className="rounded-full border border-black/8 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-600 transition hover:bg-neutral-950 hover:text-white dark:border-white/10 dark:bg-white/8 dark:text-neutral-400 dark:hover:bg-white dark:hover:text-neutral-950"
            >
              {zh ? "文字转配色" : "Word to color"}
            </Link>
            <Link
              href="/tools/"
              className="rounded-full border border-black/8 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-600 transition hover:bg-neutral-950 hover:text-white dark:border-white/10 dark:bg-white/8 dark:text-neutral-400 dark:hover:bg-white dark:hover:text-neutral-950"
            >
              {zh ? "全部工具" : "All tools"}
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
