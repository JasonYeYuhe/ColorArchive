"use client";

import Link from "next/link";
import { useLocale } from "@/src/components/locale-provider";

interface Tool {
  href: string;
  icon: string;
  nameKey: string;
  descKey: string;
  categoryKey: string;
  badgeKey?: string;
  accent: string; // tailwind bg color class for icon bg
}

const TOOLS: Tool[] = [
  // Accessibility
  {
    href: "/contrast/",
    icon: "◑",
    nameKey: "tools.contrast.name",
    descKey: "tools.contrast.desc",
    categoryKey: "tools.cat.accessibility",
    accent: "bg-violet-100 text-violet-700",
  },
  {
    href: "/colorblind/",
    icon: "◎",
    nameKey: "tools.colorblind.name",
    descKey: "tools.colorblind.desc",
    categoryKey: "tools.cat.accessibility",
    badgeKey: "tools.badge.new",
    accent: "bg-indigo-100 text-indigo-700",
  },
  // Color Analysis
  {
    href: "/convert/",
    icon: "⇄",
    nameKey: "tools.convert.name",
    descKey: "tools.convert.desc",
    categoryKey: "tools.cat.analysis",
    accent: "bg-sky-100 text-sky-700",
  },
  {
    href: "/compare/",
    icon: "≡",
    nameKey: "tools.compare.name",
    descKey: "tools.compare.desc",
    categoryKey: "tools.cat.analysis",
    accent: "bg-cyan-100 text-cyan-700",
  },
  {
    href: "/harmonies/",
    icon: "◇",
    nameKey: "tools.harmonies.name",
    descKey: "tools.harmonies.desc",
    categoryKey: "tools.cat.analysis",
    accent: "bg-teal-100 text-teal-700",
  },
  // Creative Tools
  {
    href: "/gradient/",
    icon: "▣",
    nameKey: "tools.gradient.name",
    descKey: "tools.gradient.desc",
    categoryKey: "tools.cat.creative",
    accent: "bg-rose-100 text-rose-700",
  },
  {
    href: "/palette/",
    icon: "▤",
    nameKey: "tools.palette.name",
    descKey: "tools.palette.desc",
    categoryKey: "tools.cat.creative",
    accent: "bg-amber-100 text-amber-700",
  },
  // Exploration
  {
    href: "/word-to-color/",
    icon: "Aa",
    nameKey: "tools.wordToColor.name",
    descKey: "tools.wordToColor.desc",
    categoryKey: "tools.cat.explore",
    accent: "bg-emerald-100 text-emerald-700",
  },
  {
    href: "/spectrum/",
    icon: "≈",
    nameKey: "tools.spectrum.name",
    descKey: "tools.spectrum.desc",
    categoryKey: "tools.cat.explore",
    accent: "bg-green-100 text-green-700",
  },
  {
    href: "/tints/",
    icon: "▥",
    nameKey: "tools.tints.name",
    descKey: "tools.tints.desc",
    categoryKey: "tools.cat.creative",
    badgeKey: "tools.badge.new",
    accent: "bg-blue-100 text-blue-700",
  },
  {
    href: "/all-colors/",
    icon: "✦",
    nameKey: "tools.surprise.name",
    descKey: "tools.surprise.desc",
    categoryKey: "tools.cat.explore",
    accent: "bg-lime-100 text-lime-700",
  },
];

const CATEGORIES = [
  "tools.cat.accessibility",
  "tools.cat.analysis",
  "tools.cat.creative",
  "tools.cat.explore",
] as const;

export function ToolsPage() {
  const { t } = useLocale();

  return (
    <main id="main-content" className="px-4 pb-20 pt-6 sm:px-6 sm:pt-8">
      <div className="mx-auto max-w-5xl space-y-8">
        {/* Header */}
        <section className="relative overflow-hidden rounded-[2rem] border border-black/6 bg-white/72 px-6 py-10 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:px-10 sm:py-14">
          <div className="pointer-events-none absolute -left-16 top-8 h-48 w-48 rounded-full bg-violet-200/40 blur-3xl" />
          <div className="pointer-events-none absolute right-0 top-0 h-64 w-64 rounded-full bg-sky-200/35 blur-3xl" />
          <div className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-black/10 to-transparent" />

          <div className="relative">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-black/8 bg-white/85 px-3 py-1 text-xs font-medium tracking-[0.22em] text-neutral-500 uppercase">
              <span className="inline-block h-2 w-2 rounded-full bg-neutral-900" />
              {t("tools.badge")}
            </div>

            <h1 className="text-4xl font-semibold tracking-[-0.04em] text-neutral-950 sm:text-5xl">
              {t("tools.heading")}
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-7 text-neutral-600 sm:text-lg">
              {t("tools.subheading")}
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <a
                  key={cat}
                  href={`#${cat.replace("tools.cat.", "")}`}
                  className="rounded-full border border-black/8 bg-white/85 px-4 py-1.5 text-sm font-medium text-neutral-600 transition hover:bg-white"
                >
                  {t(cat)}
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* Tool categories */}
        {CATEGORIES.map((category) => {
          const catTools = TOOLS.filter((tool) => tool.categoryKey === category);
          const catId = category.replace("tools.cat.", "");

          return (
            <section key={category} id={catId}>
              <div className="mb-4 flex items-center gap-3">
                <div className="text-xs font-semibold uppercase tracking-[0.22em] text-neutral-400">
                  {t(category)}
                </div>
                <div className="h-px flex-1 bg-black/6" />
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {catTools.map((tool) => (
                  <Link
                    key={tool.href}
                    href={tool.href}
                    className="group relative flex flex-col gap-4 rounded-[1.5rem] border border-black/6 bg-white/80 p-6 shadow-[0_8px_32px_rgba(15,23,42,0.05)] transition hover:shadow-[0_12px_40px_rgba(15,23,42,0.10)] hover:bg-white backdrop-blur-sm"
                  >
                    {tool.badgeKey ? (
                      <div className="absolute right-4 top-4 rounded-full bg-neutral-950 px-2.5 py-0.5 text-[10px] font-semibold tracking-[0.14em] text-white uppercase">
                        {t(tool.badgeKey)}
                      </div>
                    ) : null}

                    <div className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl text-lg font-bold ${tool.accent}`}>
                      {tool.icon}
                    </div>

                    <div className="flex-1">
                      <h2 className="text-base font-semibold text-neutral-950 group-hover:text-neutral-700 transition">
                        {t(tool.nameKey)}
                      </h2>
                      <p className="mt-1.5 text-sm leading-6 text-neutral-500">
                        {t(tool.descKey)}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 text-xs font-medium text-neutral-400 transition group-hover:text-neutral-600">
                      <span>{t("tools.openTool")}</span>
                      <span className="transition group-hover:translate-x-0.5">→</span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}

        {/* Bottom CTA */}
        <section className="rounded-[2rem] border border-black/6 bg-white/72 px-6 py-8 text-center shadow-[0_24px_80px_rgba(15,23,42,0.06)] backdrop-blur-xl sm:px-10 sm:py-10">
          <div className="mx-auto max-w-xl">
            <div className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-neutral-400">
              {t("tools.ctaBadge")}
            </div>
            <h2 className="text-2xl font-semibold tracking-[-0.03em] text-neutral-950">
              {t("tools.ctaHeading")}
            </h2>
            <p className="mt-3 text-sm leading-6 text-neutral-500">
              {t("tools.ctaDesc")}
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link
                href="/"
                className="rounded-full bg-neutral-950 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-neutral-800"
              >
                {t("tools.ctaBrowseArchive")}
              </Link>
              <Link
                href="/guides/"
                className="rounded-full border border-black/8 bg-white/85 px-6 py-2.5 text-sm font-semibold text-neutral-700 shadow-sm transition hover:bg-white"
              >
                {t("tools.ctaReadGuides")}
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
