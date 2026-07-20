"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
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
  {
    href: "/wcag-audit/",
    icon: "AA",
    nameKey: "tools.wcagAudit.name",
    descKey: "tools.wcagAudit.desc",
    categoryKey: "tools.cat.accessibility",
    badgeKey: "tools.badge.new",
    accent: "bg-fuchsia-100 text-fuchsia-700",
  },
  {
    href: "/palette-audit/",
    icon: "✓",
    nameKey: "tools.paletteAudit.name",
    descKey: "tools.paletteAudit.desc",
    categoryKey: "tools.cat.accessibility",
    accent: "bg-emerald-100 text-emerald-700",
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
    href: "/mixer/",
    icon: "⊕",
    nameKey: "tools.mixer.name",
    descKey: "tools.mixer.desc",
    categoryKey: "tools.cat.creative",
    badgeKey: "tools.badge.new",
    accent: "bg-pink-100 text-pink-700",
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
    href: "/brand/",
    icon: "◈",
    nameKey: "tools.brand.name",
    descKey: "tools.brand.desc",
    categoryKey: "tools.cat.creative",
    badgeKey: "tools.badge.new",
    accent: "bg-orange-100 text-orange-700",
  },
  {
    href: "/identify/",
    icon: "◉",
    nameKey: "tools.colorFinder.name",
    descKey: "tools.colorFinder.desc",
    categoryKey: "tools.cat.analysis",
    badgeKey: "tools.badge.new",
    accent: "bg-violet-100 text-violet-700",
  },
  {
    href: "/image-palette/",
    icon: "⬒",
    nameKey: "tools.imagePalette.name",
    descKey: "tools.imagePalette.desc",
    categoryKey: "tools.cat.analysis",
    badgeKey: "tools.badge.new",
    accent: "bg-pink-100 text-pink-700",
  },
  {
    href: "/color-quiz/",
    icon: "◐",
    nameKey: "tools.colorQuiz.name",
    descKey: "tools.colorQuiz.desc",
    categoryKey: "tools.cat.analysis",
    badgeKey: "tools.badge.new",
    accent: "bg-purple-100 text-purple-700",
  },
  {
    href: "/pick-for-me/",
    icon: "✦",
    nameKey: "tools.pickForMe.name",
    descKey: "tools.pickForMe.desc",
    categoryKey: "tools.cat.creative",
    badgeKey: "tools.badge.new",
    accent: "bg-amber-100 text-amber-700",
  },
  {
    href: "/mood-palette/",
    icon: "✿",
    nameKey: "tools.moodPalette.name",
    descKey: "tools.moodPalette.desc",
    categoryKey: "tools.cat.creative",
    badgeKey: "tools.badge.new",
    accent: "bg-pink-100 text-pink-700",
  },
  {
    href: "/preview/",
    icon: "▣",
    nameKey: "tools.preview.name",
    descKey: "tools.preview.desc",
    categoryKey: "tools.cat.creative",
    badgeKey: "tools.badge.new",
    accent: "bg-sky-100 text-sky-700",
  },
  {
    href: "/mesh-gradient/",
    icon: "◉",
    nameKey: "tools.meshGradient.name",
    descKey: "tools.meshGradient.desc",
    categoryKey: "tools.cat.creative",
    badgeKey: "tools.badge.new",
    accent: "bg-violet-100 text-violet-700",
  },
  {
    href: "/brand-generator/",
    icon: "✦",
    nameKey: "tools.brandGenerator.name",
    descKey: "tools.brandGenerator.desc",
    categoryKey: "tools.cat.creative",
    badgeKey: "tools.badge.new",
    accent: "bg-amber-100 text-amber-700",
  },
  {
    href: "/combinations/",
    icon: "◈",
    nameKey: "tools.combinations.name",
    descKey: "tools.combinations.desc",
    categoryKey: "tools.cat.creative",
    badgeKey: "tools.badge.new",
    accent: "bg-teal-100 text-teal-700",
  },
  {
    href: "/analyze/",
    icon: "◎",
    nameKey: "tools.analyze.name",
    descKey: "tools.analyze.desc",
    categoryKey: "tools.cat.creative",
    badgeKey: "tools.badge.new",
    accent: "bg-rose-100 text-rose-700",
  },
  {
    href: "/name/",
    icon: "Aa",
    nameKey: "tools.colorNamer.name",
    descKey: "tools.colorNamer.desc",
    categoryKey: "tools.cat.creative",
    badgeKey: "tools.badge.new",
    accent: "bg-rose-100 text-rose-700",
  },
  {
    href: "/tokens/",
    icon: "⬡",
    nameKey: "tools.tokens.name",
    descKey: "tools.tokens.desc",
    categoryKey: "tools.cat.creative",
    badgeKey: "tools.badge.new",
    accent: "bg-indigo-100 text-indigo-700",
  },
  {
    href: "/surprise/",
    icon: "✦",
    nameKey: "tools.surprise.name",
    descKey: "tools.surprise.desc",
    categoryKey: "tools.cat.explore",
    accent: "bg-lime-100 text-lime-700",
  },
  {
    href: "/famous-palettes/",
    icon: "★",
    nameKey: "tools.famousPalettes.name",
    descKey: "tools.famousPalettes.desc",
    categoryKey: "tools.cat.explore",
    badgeKey: "tools.badge.new",
    accent: "bg-amber-100 text-amber-700",
  },
  {
    href: "/decades/",
    icon: "◷",
    nameKey: "tools.decades.name",
    descKey: "tools.decades.desc",
    categoryKey: "tools.cat.explore",
    badgeKey: "tools.badge.new",
    accent: "bg-stone-100 text-stone-700",
  },
  {
    href: "/trends/",
    icon: "◈",
    nameKey: "tools.trends.name",
    descKey: "tools.trends.desc",
    categoryKey: "tools.cat.explore",
    badgeKey: "tools.badge.new",
    accent: "bg-rose-100 text-rose-700",
  },
  // Developer
  {
    href: "/api-docs/",
    icon: "{ }",
    nameKey: "tools.apiDocs.name",
    descKey: "tools.apiDocs.desc",
    categoryKey: "tools.cat.developer",
    badgeKey: "tools.badge.new",
    accent: "bg-slate-100 text-slate-700",
  },
  {
    href: "/css-colors/",
    icon: "</>",
    nameKey: "tools.cssColors.name",
    descKey: "tools.cssColors.desc",
    categoryKey: "tools.cat.developer",
    badgeKey: "tools.badge.new",
    accent: "bg-cyan-100 text-cyan-700",
  },
  // Display Testing
  {
    href: "/screen-test/",
    icon: "▣",
    nameKey: "tools.screenTest.name",
    descKey: "tools.screenTest.desc",
    categoryKey: "tools.cat.display",
    badgeKey: "tools.badge.new",
    accent: "bg-zinc-100 text-zinc-700",
  },
  {
    href: "/screen-test/dead-pixel/",
    icon: "•",
    nameKey: "tools.deadPixel.name",
    descKey: "tools.deadPixel.desc",
    categoryKey: "tools.cat.display",
    badgeKey: "tools.badge.new",
    accent: "bg-stone-100 text-stone-700",
  },
  {
    href: "/screen-test/color-screens/",
    icon: "▢",
    nameKey: "tools.colorScreens.name",
    descKey: "tools.colorScreens.desc",
    categoryKey: "tools.cat.display",
    badgeKey: "tools.badge.new",
    accent: "bg-neutral-100 text-neutral-700",
  },
  // Analysis (registry-drift fix: existed as a route, was never listed here)
  {
    href: "/validate/",
    icon: "☑",
    nameKey: "tools.validate.name",
    descKey: "tools.validate.desc",
    categoryKey: "tools.cat.analysis",
    accent: "bg-lime-100 text-lime-700",
  },
  // Integrations
  {
    href: "https://www.figma.com/community/plugin/1616829363158218051",
    icon: "◆",
    nameKey: "tools.figmaPlugin.name",
    descKey: "tools.figmaPlugin.desc",
    categoryKey: "tools.cat.integrations",
    badgeKey: "tools.badge.new",
    accent: "bg-purple-100 text-purple-700",
  },
];

const CATEGORIES = [
  "tools.cat.accessibility",
  "tools.cat.analysis",
  "tools.cat.creative",
  "tools.cat.explore",
  "tools.cat.developer",
  "tools.cat.display",
  "tools.cat.integrations",
] as const;

export function ToolsPage() {
  const { t } = useLocale();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filteredTools = useMemo(() => {
    let result = TOOLS;
    if (activeCategory) {
      result = result.filter((tool) => tool.categoryKey === activeCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (tool) =>
          t(tool.nameKey).toLowerCase().includes(q) ||
          t(tool.descKey).toLowerCase().includes(q),
      );
    }
    return result;
  }, [search, activeCategory, t]);

  // Group filtered tools by category
  const groupedTools = useMemo(() => {
    const groups: Array<{ category: string; tools: Tool[] }> = [];
    for (const cat of CATEGORIES) {
      const catTools = filteredTools.filter((tool) => tool.categoryKey === cat);
      if (catTools.length > 0) groups.push({ category: cat, tools: catTools });
    }
    return groups;
  }, [filteredTools]);

  return (
    <main id="main-content" className="px-4 pb-20 pt-6 sm:px-6 sm:pt-8">
      <div className="mx-auto max-w-5xl space-y-8">
        {/* Header */}
        <section className="relative overflow-hidden rounded-[2rem] border border-black/6 bg-white/72 px-6 py-10 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/8 dark:bg-white/5 sm:px-10 sm:py-14">
          <div className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-black/10 to-transparent dark:via-white/10" />

          <div className="relative">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-black/8 bg-white/85 px-3 py-1 text-xs font-medium tracking-[0.22em] text-neutral-500 uppercase dark:border-white/10 dark:bg-white/10 dark:text-neutral-400">
              <span className="inline-block h-2 w-2 rounded-full bg-neutral-900 dark:bg-white" />
              {t("tools.badge")}
            </div>

            <h1 className="font-display text-4xl font-light tracking-[-0.04em] text-neutral-950 dark:text-white sm:text-5xl">
              {t("tools.heading")}
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-7 text-neutral-600 dark:text-neutral-400 sm:text-lg">
              {t("tools.subheading")}
            </p>

            {/* Search box */}
            <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="relative flex-1 max-w-md">
                <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t("tools.searchPlaceholder") || "Search tools..."}
                  className="w-full rounded-xl border border-black/8 bg-white py-2.5 pl-10 pr-4 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:ring-2 focus:ring-blue-500 dark:border-white/10 dark:bg-white/10 dark:text-white dark:placeholder:text-neutral-500"
                />
                {search && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400">
                    {filteredTools.length} {filteredTools.length === 1 ? "tool" : "tools"}
                  </span>
                )}
              </div>
            </div>

            {/* Category filter tabs */}
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setActiveCategory(null)}
                aria-pressed={activeCategory === null}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                  activeCategory === null
                    ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                    : "border border-black/8 bg-white/85 text-neutral-600 hover:bg-white dark:border-white/10 dark:bg-white/10 dark:text-neutral-300 dark:hover:bg-white/15"
                }`}
              >
                {t("tools.allCategories") || "All"}
                <span className="ml-1.5 text-xs opacity-60">{filteredTools.length}</span>
              </button>
              {CATEGORIES.map((cat) => {
                const count = filteredTools.filter((tool) => tool.categoryKey === cat).length;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
                    aria-pressed={activeCategory === cat}
                    className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                      activeCategory === cat
                        ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                        : "border border-black/8 bg-white/85 text-neutral-600 hover:bg-white dark:border-white/10 dark:bg-white/10 dark:text-neutral-300 dark:hover:bg-white/15"
                    }`}
                  >
                    {t(cat)}
                    <span className="ml-1.5 text-xs opacity-60">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* No results */}
        {groupedTools.length === 0 && (
          <div className="flex h-32 items-center justify-center rounded-2xl border border-dashed border-black/10 dark:border-white/10">
            <p className="text-sm text-neutral-400 dark:text-neutral-500">
              No tools match &quot;{search}&quot;
            </p>
          </div>
        )}

        {/* Tool categories */}
        {groupedTools.map(({ category, tools: catTools }) => {
          const catId = category.replace("tools.cat.", "");

          return (
            <section key={category} id={catId}>
              <div className="mb-4 flex items-center gap-3">
                <div className="text-xs font-semibold uppercase tracking-[0.22em] text-neutral-400 dark:text-neutral-500">
                  {t(category)}
                </div>
                <div className="h-px flex-1 bg-black/6 dark:bg-white/8" />
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {catTools.map((tool) => {
                  const isExternal = tool.href.startsWith("http");
                  const Comp = isExternal ? "a" : Link;
                  const extraProps = isExternal ? { target: "_blank" as const, rel: "noopener noreferrer" } : {};
                  return (
                  <Comp
                    key={tool.href}
                    href={tool.href}
                    {...extraProps}
                    className="group relative flex flex-col gap-4 rounded-[1.5rem] border border-black/6 bg-white/80 p-5 shadow-[0_8px_32px_rgba(15,23,42,0.05)] transition hover:shadow-[0_12px_40px_rgba(15,23,42,0.10)] hover:bg-white backdrop-blur-sm dark:border-white/8 dark:bg-white/5 dark:hover:bg-white/8 sm:p-6"
                  >
                    {tool.badgeKey ? (
                      <div className="absolute right-4 top-4 rounded-full bg-neutral-950 px-2.5 py-0.5 text-[10px] font-semibold tracking-[0.14em] text-white uppercase dark:bg-white dark:text-neutral-900">
                        {t(tool.badgeKey)}
                      </div>
                    ) : null}

                    <div className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl text-lg font-bold ${tool.accent}`}>
                      {tool.icon}
                    </div>

                    <div className="flex-1">
                      <h2 className="text-base font-semibold text-neutral-950 group-hover:text-neutral-700 transition dark:text-white dark:group-hover:text-neutral-200">
                        {t(tool.nameKey)}
                      </h2>
                      <p className="mt-1.5 text-sm leading-6 text-neutral-500 dark:text-neutral-400">
                        {t(tool.descKey)}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 text-xs font-medium text-neutral-400 transition group-hover:text-neutral-600 dark:text-neutral-500 dark:group-hover:text-neutral-300">
                      <span>{t("tools.openTool")}</span>
                      <span className="transition group-hover:translate-x-0.5">→</span>
                    </div>
                  </Comp>
                  );
                })}
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
