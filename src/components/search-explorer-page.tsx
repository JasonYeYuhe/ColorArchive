"use client";

import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArchiveEmptyState } from "@/src/components/archive-empty-state";
import { ColorGrid } from "@/src/components/color-grid";
import { FilterToolbar } from "@/src/components/filter-toolbar";
import { SelectedColorPanel } from "@/src/components/selected-color-panel";
import { ShareLinkButton } from "@/src/components/share-link-button";
import { useLocale } from "@/src/components/locale-provider";
import { COLOR_FAMILIES, filterColorsWithCounts, sortColors } from "@/src/lib/color-utils";
import { SEARCH_CHIPS } from "@/src/lib/color-search";
import { colors } from "@/src/data/colors";
import type { ColorFamily, ColorRecord, SortOption } from "@/src/types/color";

const SEARCH_PROMPTS = ["moss", "rose", "#7F", "azure", "velvet"] as const;

const MOOD_PRESETS: { labels: Record<string, string>; query: string; hueBand: string; toneBand: string }[] = [
  { labels: { en: "Calm", ja: "穏やか", zh: "平静", ko: "차분한", es: "Calma", fr: "Calme" }, query: "", hueBand: "cool", toneBand: "light" },
  { labels: { en: "Energetic", ja: "エネルギッシュ", zh: "活力", ko: "에너지", es: "Enérgico", fr: "Énergique" }, query: "", hueBand: "warm", toneBand: "mid" },
  { labels: { en: "Luxury", ja: "高級感", zh: "奢华", ko: "럭셔리", es: "Lujo", fr: "Luxe" }, query: "", hueBand: "all", toneBand: "dark" },
  { labels: { en: "Fresh", ja: "フレッシュ", zh: "清新", ko: "청량", es: "Fresco", fr: "Frais" }, query: "", hueBand: "fresh", toneBand: "light" },
  { labels: { en: "Moody", ja: "ムーディ", zh: "暗调", ko: "무디", es: "Sombrío", fr: "Sombre" }, query: "", hueBand: "violet", toneBand: "dark" },
];
type HueBand = "all" | "warm" | "fresh" | "cool" | "violet";
type ToneBand = "all" | "light" | "mid" | "dark";

interface SearchState {
  searchQuery: string;
  sortBy: SortOption;
  activeFamily: ColorFamily | "All";
  hueBand: HueBand;
  toneBand: ToneBand;
  minSaturation: number;
  maxSaturation: number;
  minLightness: number;
  maxLightness: number;
  exactHex: string;
}

function clampToRange(value: number, min: number, max: number, fallback: number) {
  if (!Number.isFinite(value)) {
    return fallback;
  }

  return Math.min(max, Math.max(min, value));
}

function createSearchStateParams({
  searchQuery,
  sortBy,
  activeFamily,
  hueBand,
  toneBand,
  minSaturation,
  maxSaturation,
  minLightness,
  maxLightness,
  exactHex,
}: SearchState) {
  const params = new URLSearchParams();

  if (searchQuery.trim()) {
    params.set("q", searchQuery.trim());
  }

  if (sortBy !== "name") {
    params.set("sort", sortBy);
  }

  if (activeFamily !== "All") {
    params.set("family", activeFamily);
  }

  if (hueBand !== "all") {
    params.set("hueBand", hueBand);
  }

  if (toneBand !== "all") {
    params.set("tone", toneBand);
  }

  if (minSaturation > 0) {
    params.set("minSat", String(minSaturation));
  }

  if (maxSaturation < 100) {
    params.set("maxSat", String(maxSaturation));
  }

  if (minLightness > 0) {
    params.set("minLight", String(minLightness));
  }

  if (maxLightness < 100) {
    params.set("maxLight", String(maxLightness));
  }

  if (exactHex.trim()) {
    params.set("hex", exactHex.trim().toUpperCase());
  }

  return params;
}

function matchesHueBand(color: ColorRecord, hueBand: HueBand) {
  if (hueBand === "all") {
    return true;
  }
  if (hueBand === "warm") {
    return color.hue < 70 || color.hue >= 330;
  }
  if (hueBand === "fresh") {
    return color.hue >= 70 && color.hue < 170;
  }
  if (hueBand === "cool") {
    return color.hue >= 170 && color.hue < 250;
  }
  return color.hue >= 250 && color.hue < 330;
}

function matchesToneBand(color: ColorRecord, toneBand: ToneBand) {
  if (toneBand === "all") {
    return true;
  }
  if (toneBand === "light") {
    return color.lightness >= 72;
  }
  if (toneBand === "mid") {
    return color.lightness >= 38 && color.lightness < 72;
  }
  return color.lightness < 38;
}

export function SearchExplorerPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { t, locale } = useLocale();
  const initialQuery = searchParams.get("q") ?? "";
  const initialSort = (searchParams.get("sort") as SortOption | null) ?? "name";
  const initialFamily = (searchParams.get("family") as ColorFamily | null) ?? "All";
  const initialHueBand = (searchParams.get("hueBand") as HueBand | null) ?? "all";
  const initialToneBand = (searchParams.get("tone") as ToneBand | null) ?? "all";
  const initialMinSaturation = Number(searchParams.get("minSat") ?? "0");
  const initialMaxSaturation = Number(searchParams.get("maxSat") ?? "100");
  const initialMinLightness = Number(searchParams.get("minLight") ?? "0");
  const initialMaxLightness = Number(searchParams.get("maxLight") ?? "100");
  const initialExactHex = searchParams.get("hex") ?? "";

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [sortBy, setSortBy] = useState<SortOption>(
    initialSort === "hue" || initialSort === "lightness" || initialSort === "name"
      ? initialSort
      : "name",
  );
  const [activeFamily, setActiveFamily] = useState<ColorFamily | "All">(
    initialFamily === "All" || COLOR_FAMILIES.includes(initialFamily) ? initialFamily : "All",
  );
  const [hueBand, setHueBand] = useState<HueBand>(
    initialHueBand === "warm" ||
      initialHueBand === "fresh" ||
      initialHueBand === "cool" ||
      initialHueBand === "violet"
      ? initialHueBand
      : "all",
  );
  const [toneBand, setToneBand] = useState<ToneBand>(
    initialToneBand === "light" || initialToneBand === "mid" || initialToneBand === "dark"
      ? initialToneBand
      : "all",
  );
  const [minSaturation, setMinSaturation] = useState(clampToRange(initialMinSaturation, 0, 100, 0));
  const [maxSaturation, setMaxSaturation] = useState(clampToRange(initialMaxSaturation, 0, 100, 100));
  const [minLightness, setMinLightness] = useState(clampToRange(initialMinLightness, 0, 100, 0));
  const [maxLightness, setMaxLightness] = useState(clampToRange(initialMaxLightness, 0, 100, 100));
  const [exactHex, setExactHex] = useState(initialExactHex);
  const [selectedColorId, setSelectedColorId] = useState<string | null>(colors[0]?.id ?? null);
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try { return JSON.parse(localStorage.getItem("colorarchive-search-history") || "[]"); } catch { return []; }
  });

  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) return;
    const timeout = setTimeout(() => {
      setSearchHistory((prev) => {
        const next = [searchQuery.trim(), ...prev.filter((q) => q !== searchQuery.trim())].slice(0, 8);
        try { localStorage.setItem("colorarchive-search-history", JSON.stringify(next)); } catch {}
        return next;
      });
    }, 1500);
    return () => clearTimeout(timeout);
  }, [searchQuery]);

  // Keyboard shortcut: press "/" to focus search input
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "/" && !["INPUT", "TEXTAREA", "SELECT"].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault();
        const input = document.querySelector<HTMLInputElement>("[data-search-input]");
        input?.focus();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const deferredQuery = useDeferredValue(searchQuery);

  const { results: searchResults, familyCounts } = useMemo(() => {
    const { results, familyCounts: counts } = filterColorsWithCounts(colors, deferredQuery, "All");
    return {
      results,
      familyCounts: Object.fromEntries(
        COLOR_FAMILIES.map((family) => [family, counts[family] || 0]),
      ) as Record<ColorFamily, number>,
    };
  }, [colors, deferredQuery]);

  const visibleColors = useMemo(() => {
    const filtered =
      activeFamily === "All"
        ? searchResults
        : searchResults.filter((color) => color.family === activeFamily);

    return sortColors(
      filtered.filter(
        (color) =>
          matchesHueBand(color, hueBand) &&
          matchesToneBand(color, toneBand) &&
          color.saturation >= minSaturation &&
          color.saturation <= maxSaturation &&
          color.lightness >= minLightness &&
          color.lightness <= maxLightness &&
          (exactHex.trim().length === 0 || color.hex.toLowerCase() === exactHex.trim().toLowerCase()),
      ),
      sortBy,
    );
  }, [
    activeFamily,
    exactHex,
    hueBand,
    maxLightness,
    maxSaturation,
    minLightness,
    minSaturation,
    searchResults,
    sortBy,
    toneBand,
  ]);

  useEffect(() => {
    const params = createSearchStateParams({
      searchQuery,
      sortBy,
      activeFamily,
      hueBand,
      toneBand,
      minSaturation,
      maxSaturation,
      minLightness,
      maxLightness,
      exactHex,
    });
    const queryString = params.toString();
    router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
  }, [
    activeFamily,
    exactHex,
    hueBand,
    maxLightness,
    maxSaturation,
    minLightness,
    minSaturation,
    pathname,
    router,
    searchQuery,
    sortBy,
    toneBand,
  ]);

  useEffect(() => {
    if (visibleColors.length === 0) {
      setSelectedColorId(null);
      return;
    }

    if (!visibleColors.some((color) => color.id === selectedColorId)) {
      setSelectedColorId(visibleColors[0].id);
    }
  }, [selectedColorId, visibleColors]);

  const selectedColor = useMemo(
    () => visibleColors.find((color) => color.id === selectedColorId) ?? visibleColors[0] ?? null,
    [selectedColorId, visibleColors],
  );
  const shareHref = useMemo(() => {
    const params = createSearchStateParams({
      searchQuery,
      sortBy,
      activeFamily,
      hueBand,
      toneBand,
      minSaturation,
      maxSaturation,
      minLightness,
      maxLightness,
      exactHex,
    });
    const queryString = params.toString();

    return queryString ? `/all-colors?${queryString}` : "/search";
  }, [
    activeFamily,
    exactHex,
    hueBand,
    maxLightness,
    maxSaturation,
    minLightness,
    minSaturation,
    searchQuery,
    sortBy,
    toneBand,
  ]);

  const nearbyColors = useMemo(() => {
    if (!selectedColor) {
      return [];
    }

    const related = sortColors(
      searchResults.filter((color) => color.family === selectedColor.family),
      "hue",
    );
    const selectedIndex = related.findIndex((color) => color.id === selectedColor.id);

    if (selectedIndex === -1) {
      return related.slice(0, 4);
    }

    return related.slice(Math.max(0, selectedIndex - 1), selectedIndex + 3);
  }, [searchResults, selectedColor]);

  const handleReset = () => {
    setSearchQuery("");
    setSortBy("name");
    setActiveFamily("All");
    setHueBand("all");
    setToneBand("all");
    setMinSaturation(0);
    setMaxSaturation(100);
    setMinLightness(0);
    setMaxLightness(100);
    setExactHex("");
  };

  const PAGE_SIZE = 120;
  const [displayLimit, setDisplayLimit] = useState(PAGE_SIZE);

  useEffect(() => {
    setDisplayLimit(PAGE_SIZE);
  }, [searchQuery, sortBy, activeFamily, hueBand, toneBand, minSaturation, maxSaturation, minLightness, maxLightness, exactHex]);

  return (
    <main className="px-4 py-4 sm:px-6 sm:py-6">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6">
        <section className="relative overflow-hidden rounded-[2rem] border border-black/6 bg-white/74 px-6 py-10 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:px-10 sm:py-14">
          <div className="relative mx-auto max-w-4xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-black/8 bg-white/85 px-3 py-1 text-xs font-medium tracking-[0.22em] text-neutral-500 uppercase">
              <span className="inline-block h-2 w-2 rounded-full bg-neutral-900" />
              {t("search.badge")}
            </div>

            <h1 className="font-display max-w-3xl text-4xl font-light tracking-[-0.04em] text-neutral-950 sm:text-6xl">
              {t("search.title")}
            </h1>

            <p className="mt-4 max-w-2xl text-balance text-base leading-7 text-neutral-600 sm:text-lg">
              {t("search.description")}
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              {SEARCH_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => setSearchQuery(prompt)}
                  className="rounded-full border border-black/8 bg-white/88 px-3 py-1.5 text-sm text-neutral-700 transition hover:bg-neutral-950 hover:text-white"
                >
                  {prompt}
                </button>
              ))}
              <ShareLinkButton href={shareHref} />
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-neutral-400">
                {t("search.mood")}
              </span>
              {MOOD_PRESETS.map((mood) => (
                <button
                  key={mood.labels.en}
                  type="button"
                  onClick={() => {
                    setSearchQuery(mood.query);
                    setHueBand(mood.hueBand as "all" | "warm" | "cool" | "fresh" | "violet");
                    setToneBand(mood.toneBand as ToneBand);
                  }}
                  className="rounded-full border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-xs text-neutral-600 transition hover:bg-neutral-100"
                >
                  {mood.labels[locale] ?? mood.labels.en}
                </button>
              ))}
            </div>

            <div className="mt-4 space-y-2">
              {SEARCH_CHIPS.map(({ group, terms }) => (
                <div key={group} className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-neutral-400 w-16 shrink-0">
                    {group}
                  </span>
                  {terms.map((term) => (
                    <button
                      key={term}
                      type="button"
                      onClick={() => setSearchQuery(term)}
                      className={`rounded-full border px-2.5 py-1 text-xs transition ${searchQuery === term ? "border-neutral-900 bg-neutral-900 text-white" : "border-neutral-200 bg-neutral-50 text-neutral-600 hover:bg-neutral-100"}`}
                    >
                      {term}
                    </button>
                  ))}
                </div>
              ))}
            </div>

            {searchHistory.length > 0 && !searchQuery.trim() ? (
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-neutral-400">
                  {t("search.recent")}
                </span>
                {searchHistory.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => setSearchQuery(q)}
                    className="rounded-full border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-xs text-neutral-600 transition hover:bg-neutral-100"
                  >
                    {q}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </section>

        <section className="rounded-[1.75rem] border border-black/6 bg-white/78 p-4 shadow-[0_18px_48px_rgba(15,23,42,0.04)] sm:p-5">
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
            <label className="flex flex-col gap-2">
              <span className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
                {t("search.hueBand")}
              </span>
              <select
                value={hueBand}
                onChange={(event) => setHueBand(event.target.value as HueBand)}
                className="rounded-2xl border border-black/8 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-neutral-900/20 focus:ring-4 focus:ring-neutral-900/8"
              >
                <option value="all">{t("search.allHues")}</option>
                <option value="warm">{t("search.warm")}</option>
                <option value="fresh">{t("search.fresh")}</option>
                <option value="cool">{t("search.cool")}</option>
                <option value="violet">{t("search.violet")}</option>
              </select>
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
                {t("search.tone")}
              </span>
              <select
                value={toneBand}
                onChange={(event) => setToneBand(event.target.value as ToneBand)}
                className="rounded-2xl border border-black/8 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-neutral-900/20 focus:ring-4 focus:ring-neutral-900/8"
              >
                <option value="all">{t("search.allTones")}</option>
                <option value="light">{t("search.light")}</option>
                <option value="mid">{t("search.mid")}</option>
                <option value="dark">{t("search.dark")}</option>
              </select>
            </label>

            <div className="rounded-2xl border border-black/6 bg-neutral-50 px-4 py-3">
              <div className="text-xs uppercase tracking-[0.16em] text-neutral-400">{t("search.currentQuery")}</div>
              <div className="mt-2 text-sm font-medium text-neutral-950">
                {searchQuery.trim().length > 0 ? searchQuery.trim() : t("search.noKeyword")}
              </div>
            </div>

            <div className="rounded-2xl border border-black/6 bg-neutral-50 px-4 py-3">
              <div className="text-xs uppercase tracking-[0.16em] text-neutral-400">{t("search.currentLens")}</div>
              <div className="mt-2 text-sm font-medium text-neutral-950">
                {hueBand === "all" ? t("search.allHues") : hueBand} · {toneBand === "all" ? t("search.allTones") : toneBand}
              </div>
            </div>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <label className="flex flex-col gap-2">
              <span className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
                {t("search.satRange")}
              </span>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  min={0}
                  max={maxSaturation}
                  value={minSaturation}
                  onChange={(event) =>
                    setMinSaturation(clampToRange(Number(event.target.value), 0, maxSaturation, 0))
                  }
                  className="rounded-2xl border border-black/8 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-neutral-900/20 focus:ring-4 focus:ring-neutral-900/8"
                  aria-label="Minimum saturation"
                />
                <input
                  type="number"
                  min={minSaturation}
                  max={100}
                  value={maxSaturation}
                  onChange={(event) =>
                    setMaxSaturation(clampToRange(Number(event.target.value), minSaturation, 100, 100))
                  }
                  className="rounded-2xl border border-black/8 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-neutral-900/20 focus:ring-4 focus:ring-neutral-900/8"
                  aria-label="Maximum saturation"
                />
              </div>
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
                {t("search.lightRange")}
              </span>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  min={0}
                  max={maxLightness}
                  value={minLightness}
                  onChange={(event) =>
                    setMinLightness(clampToRange(Number(event.target.value), 0, maxLightness, 0))
                  }
                  className="rounded-2xl border border-black/8 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-neutral-900/20 focus:ring-4 focus:ring-neutral-900/8"
                  aria-label="Minimum lightness"
                />
                <input
                  type="number"
                  min={minLightness}
                  max={100}
                  value={maxLightness}
                  onChange={(event) =>
                    setMaxLightness(clampToRange(Number(event.target.value), minLightness, 100, 100))
                  }
                  className="rounded-2xl border border-black/8 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-neutral-900/20 focus:ring-4 focus:ring-neutral-900/8"
                  aria-label="Maximum lightness"
                />
              </div>
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
                {t("search.exactHex")}
              </span>
              <input
                type="text"
                value={exactHex}
                onChange={(event) => setExactHex(event.target.value)}
                placeholder="#AABBCC"
                className="rounded-2xl border border-black/8 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-neutral-900/20 focus:ring-4 focus:ring-neutral-900/8"
              />
            </label>
          </div>
        </section>

        <FilterToolbar
          activeFamily={activeFamily}
          familyCounts={familyCounts}
          searchQuery={searchQuery}
          sortBy={sortBy}
          totalColors={colors.length}
          visibleColors={visibleColors.length}
          onFamilyChange={setActiveFamily}
          onSearchChange={setSearchQuery}
          onSortChange={setSortBy}
          onReset={handleReset}
        />

        <SelectedColorPanel
          color={selectedColor}
          nearbyColors={nearbyColors}
          onSelectColor={setSelectedColorId}
        />

        <ColorGrid
          colors={visibleColors.slice(0, displayLimit)}
          selectedColorId={selectedColorId}
          onSelectColor={setSelectedColorId}
          emptyState={
            <ArchiveEmptyState
              title="No matching search results"
              description="This combination of keyword, family, hue band, tone, or numeric ranges does not currently resolve to a color in the archive."
              searchQuery={searchQuery || exactHex}
              activeFamily={activeFamily}
              onClearSearch={() => {
                setSearchQuery("");
                setExactHex("");
              }}
              onClearFamily={() => setActiveFamily("All")}
              onSuggest={(term) => { setSearchQuery(term); setExactHex(""); }}
              onReset={handleReset}
            />
          }
        />

        {displayLimit < visibleColors.length && (
          <div className="flex items-center justify-center gap-4 py-2">
            <span className="text-sm text-neutral-400">
              {t("pagination.showing")} {displayLimit} {t("pagination.of")} {visibleColors.length}
            </span>
            <button
              type="button"
              onClick={() => setDisplayLimit((prev) => prev + PAGE_SIZE)}
              className="rounded-full border border-black/8 bg-white px-5 py-2.5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-950 hover:text-white"
            >
              {t("pagination.showMore")}
            </button>
          </div>
        )}

        <div className="rounded-[1.75rem] border border-black/6 bg-neutral-950 p-5 text-white shadow-[0_18px_48px_rgba(15,23,42,0.05)] dark:border-white/10 dark:bg-white dark:text-neutral-950">
          <div className="text-xs font-medium uppercase tracking-[0.18em] text-white/40 dark:text-neutral-400">
            {t("search.ctaLabel")}
          </div>
          <p className="mt-2 text-lg font-semibold tracking-[-0.02em]">
            {t("search.ctaTitle")}
          </p>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/60 dark:text-neutral-500">
            {t("search.ctaDesc")}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/pro/"
              className="rounded-full bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-950 transition hover:bg-neutral-200 dark:bg-neutral-950 dark:text-white dark:hover:bg-neutral-800"
            >
              {t("search.browsePacks")}
            </Link>
            <Link
              href="/collections/"
              className="rounded-full border border-white/16 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white/80 transition hover:border-white/30 hover:text-white dark:border-black/16 dark:text-neutral-600 dark:hover:border-black/30 dark:hover:text-neutral-950"
            >
              {t("search.viewCollections")}
            </Link>
            <Link
              href="/free-resources/"
              className="rounded-full border border-white/16 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white/80 transition hover:border-white/30 hover:text-white dark:border-black/16 dark:text-neutral-600 dark:hover:border-black/30 dark:hover:text-neutral-950"
            >
              {t("search.freeDownload")}
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
