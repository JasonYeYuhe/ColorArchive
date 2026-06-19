"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useDeferredValue, useEffect, useMemo, useState } from "react";
import { ArchiveEmptyState } from "@/src/components/archive-empty-state";
import { ColorGrid } from "@/src/components/color-grid";
import { ColorSpectrum } from "@/src/components/color-spectrum";
import { FilterToolbar } from "@/src/components/filter-toolbar";
import { SelectedColorPanel } from "@/src/components/selected-color-panel";
import { ShareLinkButton } from "@/src/components/share-link-button";
import { useLocale } from "@/src/components/locale-provider";
import { COLOR_FAMILIES, filterColors, sortColors } from "@/src/lib/color-utils";
import { findNearestArchiveColor } from "@/src/lib/color-relationships";
import { colors } from "@/src/data/colors";
import type { ColorFamily, ColorRecord, SortOption } from "@/src/types/color";

type AllColorsPageProps = Record<string, never>;

type DensityMode = "compact" | "comfortable" | "expanded";
type HueBand = "all" | "warm" | "fresh" | "cool" | "violet";
type ToneBand = "all" | "light" | "mid" | "dark";

const SORT_VALUES: SortOption[] = ["hue", "lightness", "name"];
const DENSITY_VALUES: DensityMode[] = ["compact", "comfortable", "expanded"];

const MOOD_PRESETS: { label: string; hueBand: HueBand; toneBand: ToneBand }[] = [
  { label: "Calm", hueBand: "cool", toneBand: "light" },
  { label: "Energetic", hueBand: "warm", toneBand: "mid" },
  { label: "Luxury", hueBand: "all", toneBand: "dark" },
  { label: "Fresh", hueBand: "fresh", toneBand: "light" },
  { label: "Moody", hueBand: "violet", toneBand: "dark" },
];

function clampToRange(value: number, min: number, max: number, fallback: number) {
  if (!Number.isFinite(value)) return fallback;
  return Math.min(max, Math.max(min, value));
}

function matchesHueBand(color: ColorRecord, hueBand: HueBand) {
  if (hueBand === "all") return true;
  if (hueBand === "warm") return color.hue < 70 || color.hue >= 330;
  if (hueBand === "fresh") return color.hue >= 70 && color.hue < 170;
  if (hueBand === "cool") return color.hue >= 170 && color.hue < 250;
  return color.hue >= 250 && color.hue < 330;
}

function matchesToneBand(color: ColorRecord, toneBand: ToneBand) {
  if (toneBand === "all") return true;
  if (toneBand === "light") return color.lightness >= 72;
  if (toneBand === "mid") return color.lightness >= 38 && color.lightness < 72;
  return color.lightness < 38;
}

export function AllColorsPage({}: AllColorsPageProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { t, locale } = useLocale();

  // Basic state
  const [sortBy, setSortBy] = useState<SortOption>(() => {
    const v = searchParams.get("sort") as SortOption | null;
    return v === "name" || v === "lightness" || v === "hue" ? v : "hue";
  });
  const [activeFamily, setActiveFamily] = useState<ColorFamily | "All">(() => {
    const v = searchParams.get("family") as ColorFamily | null;
    return v && COLOR_FAMILIES.includes(v) ? v : "All";
  });
  const [density, setDensity] = useState<DensityMode>(() => {
    const v = searchParams.get("density") as DensityMode | null;
    return v === "comfortable" || v === "expanded" ? v : "compact";
  });
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") ?? "");
  const deferredQuery = useDeferredValue(searchQuery);

  // Advanced filter state
  const [hueBand, setHueBand] = useState<HueBand>(() => {
    const v = searchParams.get("hueBand") as HueBand | null;
    return v === "warm" || v === "fresh" || v === "cool" || v === "violet" ? v : "all";
  });
  const [toneBand, setToneBand] = useState<ToneBand>(() => {
    const v = searchParams.get("tone") as ToneBand | null;
    return v === "light" || v === "mid" || v === "dark" ? v : "all";
  });
  const [minSaturation, setMinSaturation] = useState(() => clampToRange(Number(searchParams.get("minSat") ?? "0"), 0, 100, 0));
  const [maxSaturation, setMaxSaturation] = useState(() => clampToRange(Number(searchParams.get("maxSat") ?? "100"), 0, 100, 100));
  const [minLightness, setMinLightness] = useState(() => clampToRange(Number(searchParams.get("minLight") ?? "0"), 0, 100, 0));
  const [maxLightness, setMaxLightness] = useState(() => clampToRange(Number(searchParams.get("maxLight") ?? "100"), 0, 100, 100));

  // UI state
  const [showAdvanced, setShowAdvanced] = useState(() => {
    return !!(searchParams.get("hueBand") || searchParams.get("tone") || searchParams.get("minSat") || searchParams.get("maxSat") || searchParams.get("minLight") || searchParams.get("maxLight"));
  });
  const [selectedColorId, setSelectedColorId] = useState<string | null>(null);
  const [hexInput, setHexInput] = useState("");
  const nearestToHex = useMemo(
    () => hexInput.length === 6 ? findNearestArchiveColor(colors, `#${hexInput}`) : null,
    [colors, hexInput],
  );

  const hasAdvancedFilters = hueBand !== "all" || toneBand !== "all" || minSaturation > 0 || maxSaturation < 100 || minLightness > 0 || maxLightness < 100;

  // Keyboard shortcut: "/" to focus search
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

  // Filtering
  const searchResults = useMemo(() => filterColors(colors, deferredQuery, "All"), [colors, deferredQuery]);

  const familyCounts = useMemo(() => {
    const counts = Object.fromEntries(COLOR_FAMILIES.map((family) => [family, 0])) as Record<ColorFamily, number>;
    for (const color of searchResults) {
      if (
        matchesHueBand(color, hueBand) &&
        matchesToneBand(color, toneBand) &&
        color.saturation >= minSaturation &&
        color.saturation <= maxSaturation &&
        color.lightness >= minLightness &&
        color.lightness <= maxLightness
      ) {
        counts[color.family] += 1;
      }
    }
    return counts;
  }, [searchResults, hueBand, toneBand, minSaturation, maxSaturation, minLightness, maxLightness]);

  const visibleColors = useMemo(() => {
    const filtered = activeFamily === "All" ? searchResults : searchResults.filter((color) => color.family === activeFamily);

    return sortColors(
      filtered.filter(
        (color) =>
          matchesHueBand(color, hueBand) &&
          matchesToneBand(color, toneBand) &&
          color.saturation >= minSaturation &&
          color.saturation <= maxSaturation &&
          color.lightness >= minLightness &&
          color.lightness <= maxLightness,
      ),
      sortBy,
    );
  }, [activeFamily, hueBand, maxLightness, maxSaturation, minLightness, minSaturation, searchResults, sortBy, toneBand]);

  // Pagination
  const PAGE_SIZE = 240;
  const MAX_DISPLAY = colors.length;
  const [displayLimit, setDisplayLimit] = useState(PAGE_SIZE);

  useEffect(() => {
    setDisplayLimit(PAGE_SIZE);
  }, [activeFamily, searchQuery, sortBy, density, hueBand, toneBand, minSaturation, maxSaturation, minLightness, maxLightness]);

  // Selected color panel
  useEffect(() => {
    if (visibleColors.length === 0) {
      setSelectedColorId(null);
      return;
    }
    if (selectedColorId && !visibleColors.some((c) => c.id === selectedColorId)) {
      setSelectedColorId(visibleColors[0].id);
    }
  }, [selectedColorId, visibleColors]);

  const selectedColor = useMemo(
    () => (selectedColorId ? visibleColors.find((c) => c.id === selectedColorId) ?? null : null),
    [selectedColorId, visibleColors],
  );

  const nearbyColors = useMemo(() => {
    if (!selectedColor) return [];
    const related = sortColors(
      searchResults.filter((c) => c.family === selectedColor.family),
      "hue",
    );
    const idx = related.findIndex((c) => c.id === selectedColor.id);
    if (idx === -1) return related.slice(0, 4);
    return related.slice(Math.max(0, idx - 1), idx + 3);
  }, [searchResults, selectedColor]);

  // URL sync
  const shareHref = useMemo(() => {
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set("q", searchQuery.trim());
    if (sortBy !== "hue") params.set("sort", sortBy);
    if (activeFamily !== "All") params.set("family", activeFamily);
    if (density !== "compact") params.set("density", density);
    if (hueBand !== "all") params.set("hueBand", hueBand);
    if (toneBand !== "all") params.set("tone", toneBand);
    if (minSaturation > 0) params.set("minSat", String(minSaturation));
    if (maxSaturation < 100) params.set("maxSat", String(maxSaturation));
    if (minLightness > 0) params.set("minLight", String(minLightness));
    if (maxLightness < 100) params.set("maxLight", String(maxLightness));
    const qs = params.toString();
    return qs ? `/all-colors?${qs}` : "/all-colors";
  }, [activeFamily, density, hueBand, maxLightness, maxSaturation, minLightness, minSaturation, searchQuery, sortBy, toneBand]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set("q", searchQuery.trim());
    if (sortBy !== "hue") params.set("sort", sortBy);
    if (activeFamily !== "All") params.set("family", activeFamily);
    if (density !== "compact") params.set("density", density);
    if (hueBand !== "all") params.set("hueBand", hueBand);
    if (toneBand !== "all") params.set("tone", toneBand);
    if (minSaturation > 0) params.set("minSat", String(minSaturation));
    if (maxSaturation < 100) params.set("maxSat", String(maxSaturation));
    if (minLightness > 0) params.set("minLight", String(minLightness));
    if (maxLightness < 100) params.set("maxLight", String(maxLightness));
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [activeFamily, density, hueBand, maxLightness, maxSaturation, minLightness, minSaturation, pathname, router, searchQuery, sortBy, toneBand]);

  // Random color
  const handleRandomize = useCallback(() => {
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    if (randomColor) {
      setSelectedColorId(randomColor.id);
      router.push(`/colors/${randomColor.id}/`);
    }
  }, [colors, router]);

  const handleReset = useCallback(() => {
    setSortBy("hue");
    setActiveFamily("All");
    setDensity("compact");
    setSearchQuery("");
    setHueBand("all");
    setToneBand("all");
    setMinSaturation(0);
    setMaxSaturation(100);
    setMinLightness(0);
    setMaxLightness(100);
  }, []);

  const densityGridClass =
    density === "expanded"
      ? "grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7"
      : density === "comfortable"
        ? "grid-cols-3 gap-3 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 2xl:grid-cols-12"
        : "grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 2xl:grid-cols-14";

  return (
    <main className="px-4 py-4 sm:px-6 sm:py-6">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-[2rem] border border-black/6 bg-white/74 px-6 py-10 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-neutral-900/74 sm:px-10 sm:py-14">
          <div className="relative mx-auto max-w-4xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-black/8 bg-white/85 px-3 py-1 text-xs font-medium tracking-[0.22em] text-neutral-500 uppercase dark:border-white/10 dark:bg-white/10 dark:text-neutral-400">
              <span className="inline-block h-2 w-2 rounded-full bg-neutral-900 dark:bg-white" />
              {t("allColors.badge")}
            </div>

            <h1 className="max-w-3xl font-display text-4xl font-light tracking-[-0.04em] text-neutral-950 dark:text-white sm:text-6xl">
              {t("allColors.title")}
            </h1>

            <p className="mt-4 max-w-2xl text-balance text-base leading-7 text-neutral-600 dark:text-neutral-400 sm:text-lg">
              {t("allColors.description")}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <div className="rounded-2xl border border-black/6 bg-white/85 px-4 py-3 dark:border-white/10 dark:bg-white/8">
                <div className="text-xs uppercase tracking-[0.18em] text-neutral-400">{t("allColors.archiveLabel")}</div>
                <div className="mt-1 text-lg font-semibold text-neutral-950 dark:text-white">{colors.length} {t("hero.colors")}</div>
              </div>
              <div className="rounded-2xl border border-black/6 bg-white/85 px-4 py-3 dark:border-white/10 dark:bg-white/8">
                <div className="text-xs uppercase tracking-[0.18em] text-neutral-400">{t("allColors.visibleLabel")}</div>
                <div className="mt-1 text-lg font-semibold text-neutral-950 dark:text-white">
                  {visibleColors.length} {t("hero.colors")}
                </div>
              </div>
            </div>

            {/* Mood presets */}
            <div className="mt-5 flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-neutral-400">
                {t("search.mood")}
              </span>
              {MOOD_PRESETS.map((mood) => (
                <button
                  key={mood.label}
                  type="button"
                  onClick={() => {
                    setHueBand(mood.hueBand);
                    setToneBand(mood.toneBand);
                    setShowAdvanced(true);
                  }}
                  className="rounded-full border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-xs text-neutral-600 transition hover:bg-neutral-100 dark:border-white/10 dark:bg-white/8 dark:text-neutral-400 dark:hover:bg-white/14"
                >
                  {mood.label}
                </button>
              ))}
              <button
                type="button"
                onClick={handleRandomize}
                className="rounded-full border border-neutral-200 bg-neutral-950 px-2.5 py-1 text-xs font-medium text-white transition hover:bg-neutral-800 dark:border-white/20 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200"
              >
                {t("allColors.randomColor") || "Random Color"}
              </button>
            </div>

            {/* Hex input */}
            <div className="mt-4 flex items-center gap-2">
              <div className="flex items-center rounded-xl border border-black/8 bg-white/85 px-3 py-2 dark:border-white/10 dark:bg-white/8">
                <span className="mr-0.5 select-none text-neutral-400">#</span>
                <input
                  type="text"
                  value={hexInput}
                  onChange={(e) => setHexInput(e.target.value.replace(/[^0-9a-fA-F]/g, "").slice(0, 6))}
                  onKeyDown={(e) => { if (e.key === "Enter" && hexInput.length === 6) router.push(`/colors/hex/?c=${hexInput.toLowerCase()}`); }}
                  maxLength={6}
                  spellCheck={false}
                  placeholder="Type any hex"
                  className="w-24 bg-transparent text-sm uppercase text-neutral-900 outline-none placeholder:normal-case placeholder:text-neutral-400 dark:text-white"
                />
              </div>
              <button
                type="button"
                onClick={() => { if (hexInput.length === 6) router.push(`/colors/hex/?c=${hexInput.toLowerCase()}`); }}
                disabled={hexInput.length !== 6}
                className="rounded-xl border border-black/8 bg-neutral-950 px-3 py-2 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:opacity-40 dark:border-white/20 dark:bg-white dark:text-neutral-950"
              >
                Go
              </button>
            </div>
            {nearestToHex && (
              <Link
                href={`/colors/${nearestToHex.id}/`}
                className="mt-2 inline-flex items-center gap-2 rounded-xl border border-black/8 bg-white/85 px-3 py-1.5 text-xs text-neutral-700 transition hover:bg-neutral-50 dark:border-white/10 dark:bg-white/8 dark:text-neutral-300"
              >
                <span
                  className="h-4 w-4 flex-none rounded-full border border-black/8"
                  style={{ backgroundColor: nearestToHex.hex }}
                />
                <span>Nearest: <span className="font-medium">{nearestToHex.name}</span> {nearestToHex.hex}</span>
                <span className="text-neutral-400">→</span>
              </Link>
            )}
          </div>
        </section>

        <ColorSpectrum />

        {/* Controls */}
        <section className="rounded-[1.75rem] border border-black/6 bg-white/78 p-4 shadow-[0_18px_48px_rgba(15,23,42,0.04)] dark:border-white/10 dark:bg-neutral-900/78 sm:p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
                {t("allColors.displayControls")}
              </div>
              <div className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                {t("allColors.displayControlsDesc")}
              </div>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row">
              <label className="flex min-w-[16rem] flex-col gap-2">
                <span className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
                  {t("allColors.searchLabel")}
                </span>
                <input
                  type="text"
                  data-search-input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder={t("allColors.searchPlaceholder")}
                  className="rounded-2xl border border-black/8 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-neutral-900/20 focus:ring-4 focus:ring-neutral-900/8 dark:border-white/10 dark:bg-white/8 dark:text-white"
                />
              </label>

              <label className="flex min-w-[12rem] flex-col gap-2">
                <span className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
                  {t("allColors.sortLabel")}
                </span>
                <select
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value as SortOption)}
                  className="rounded-2xl border border-black/8 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-neutral-900/20 focus:ring-4 focus:ring-neutral-900/8 dark:border-white/10 dark:bg-white/8 dark:text-white"
                >
                  {SORT_VALUES.map((value) => (
                    <option key={value} value={value}>
                      {t(`filter.sort${value.charAt(0).toUpperCase()}${value.slice(1)}` as Parameters<typeof t>[0])}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex min-w-[12rem] flex-col gap-2">
                <span className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
                  {t("allColors.densityLabel")}
                </span>
                <select
                  value={density}
                  onChange={(event) => setDensity(event.target.value as DensityMode)}
                  className="rounded-2xl border border-black/8 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-neutral-900/20 focus:ring-4 focus:ring-neutral-900/8 dark:border-white/10 dark:bg-white/8 dark:text-white"
                >
                  {DENSITY_VALUES.map((value) => (
                    <option key={value} value={value}>
                      {t(`allColors.${value}` as Parameters<typeof t>[0])}
                    </option>
                  ))}
                </select>
              </label>

              <div className="flex items-end gap-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="rounded-2xl border border-black/8 bg-white px-4 py-3 text-sm font-medium text-neutral-900 transition hover:bg-neutral-50 dark:border-white/10 dark:bg-white/8 dark:text-white dark:hover:bg-white/14"
                >
                  {t("allColors.reset")}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAdvanced((v) => !v)}
                  className={`rounded-2xl border px-4 py-3 text-sm font-medium transition ${
                    showAdvanced || hasAdvancedFilters
                      ? "border-neutral-950 bg-neutral-950 text-white dark:border-white dark:bg-white dark:text-neutral-950"
                      : "border-black/8 bg-white text-neutral-900 hover:bg-neutral-50 dark:border-white/10 dark:bg-white/8 dark:text-white dark:hover:bg-white/14"
                  }`}
                >
                  {t("search.advancedFilters") || "Filters"}
                </button>
                <ShareLinkButton href={shareHref} />
              </div>
            </div>
          </div>

          {/* Family pills */}
          <div className="-mx-1 mt-4 overflow-x-auto pb-1 sm:overflow-visible">
            <div className="flex min-w-max gap-2 px-1 sm:min-w-0 sm:flex-wrap sm:px-0">
              <button
                type="button"
                onClick={() => setActiveFamily("All")}
                className={`shrink-0 rounded-full px-3 py-1.5 text-sm transition ${
                  activeFamily === "All"
                    ? "bg-neutral-950 text-white dark:bg-white dark:text-neutral-950"
                    : "border border-black/8 bg-white text-neutral-700 hover:bg-neutral-50 dark:border-white/10 dark:bg-white/8 dark:text-neutral-300 dark:hover:bg-white/14"
                }`}
              >
                {t("allColors.allFamilies")}
              </button>

              {COLOR_FAMILIES.map((family) => (
                <button
                  key={family}
                  type="button"
                  onClick={() => setActiveFamily(family)}
                  className={`shrink-0 rounded-full px-3 py-1.5 text-sm transition ${
                    activeFamily === family
                      ? "bg-neutral-950 text-white dark:bg-white dark:text-neutral-950"
                      : "border border-black/8 bg-white text-neutral-700 hover:bg-neutral-50 dark:border-white/10 dark:bg-white/8 dark:text-neutral-300 dark:hover:bg-white/14"
                  }`}
                >
                  {family}
                  <span className={`ml-2 text-xs ${activeFamily === family ? "text-white/70 dark:text-neutral-950/70" : "text-neutral-400"}`}>
                    {familyCounts[family]}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Advanced filters (collapsible) */}
        {showAdvanced && (
          <section className="rounded-[1.75rem] border border-black/6 bg-white/78 p-4 shadow-[0_18px_48px_rgba(15,23,42,0.04)] dark:border-white/10 dark:bg-neutral-900/78 sm:p-5">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <label className="flex flex-col gap-2">
                <span className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
                  {t("search.hueBand")}
                </span>
                <select
                  value={hueBand}
                  onChange={(e) => setHueBand(e.target.value as HueBand)}
                  className="rounded-2xl border border-black/8 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-neutral-900/20 focus:ring-4 focus:ring-neutral-900/8 dark:border-white/10 dark:bg-white/8 dark:text-white"
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
                  onChange={(e) => setToneBand(e.target.value as ToneBand)}
                  className="rounded-2xl border border-black/8 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-neutral-900/20 focus:ring-4 focus:ring-neutral-900/8 dark:border-white/10 dark:bg-white/8 dark:text-white"
                >
                  <option value="all">{t("search.allTones")}</option>
                  <option value="light">{t("search.light")}</option>
                  <option value="mid">{t("search.mid")}</option>
                  <option value="dark">{t("search.dark")}</option>
                </select>
              </label>

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
                    onChange={(e) => setMinSaturation(clampToRange(Number(e.target.value), 0, maxSaturation, 0))}
                    className="rounded-2xl border border-black/8 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-neutral-900/20 focus:ring-4 focus:ring-neutral-900/8 dark:border-white/10 dark:bg-white/8 dark:text-white"
                    aria-label="Minimum saturation"
                  />
                  <input
                    type="number"
                    min={minSaturation}
                    max={100}
                    value={maxSaturation}
                    onChange={(e) => setMaxSaturation(clampToRange(Number(e.target.value), minSaturation, 100, 100))}
                    className="rounded-2xl border border-black/8 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-neutral-900/20 focus:ring-4 focus:ring-neutral-900/8 dark:border-white/10 dark:bg-white/8 dark:text-white"
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
                    onChange={(e) => setMinLightness(clampToRange(Number(e.target.value), 0, maxLightness, 0))}
                    className="rounded-2xl border border-black/8 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-neutral-900/20 focus:ring-4 focus:ring-neutral-900/8 dark:border-white/10 dark:bg-white/8 dark:text-white"
                    aria-label="Minimum lightness"
                  />
                  <input
                    type="number"
                    min={minLightness}
                    max={100}
                    value={maxLightness}
                    onChange={(e) => setMaxLightness(clampToRange(Number(e.target.value), minLightness, 100, 100))}
                    className="rounded-2xl border border-black/8 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-neutral-900/20 focus:ring-4 focus:ring-neutral-900/8 dark:border-white/10 dark:bg-white/8 dark:text-white"
                    aria-label="Maximum lightness"
                  />
                </div>
              </label>
            </div>
          </section>
        )}

        {/* Selected color panel (shown when a color is clicked in the grid) */}
        {selectedColor && (
          <SelectedColorPanel
            color={selectedColor}
            nearbyColors={nearbyColors}
            onSelectColor={setSelectedColorId}
          />
        )}

        {/* Color grid */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <div>
              <h2 className="text-xl font-semibold tracking-[-0.03em] text-neutral-950 dark:text-white">
                {t("allColors.denseSpectrum")}
              </h2>
              <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                {t("allColors.denseDesc")}
              </p>
            </div>
          </div>

          {visibleColors.length === 0 ? (
            <ArchiveEmptyState
              title="No results for this view"
              description="The current filters resolve to an empty view. Clear a filter or reset all to see colors."
              searchQuery={searchQuery}
              activeFamily={activeFamily}
              onClearSearch={() => setSearchQuery("")}
              onClearFamily={() => setActiveFamily("All")}
              onReset={handleReset}
              onSuggest={(term) => setSearchQuery(term)}
            />
          ) : (
            <>
              <div className={`grid ${densityGridClass}`} style={{ contentVisibility: "auto", containIntrinsicSize: "auto 500px" }}>
                {visibleColors.slice(0, displayLimit).map((color) => (
                  <button
                    key={color.id}
                    type="button"
                    onClick={() => setSelectedColorId(color.id)}
                    className="group overflow-hidden rounded-[1.05rem] border border-black/6 bg-white text-left shadow-[0_12px_32px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_36px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-neutral-900"
                    aria-label={`Select ${color.name}`}
                  >
                    <div
                      className="h-18 border-b border-black/6 dark:border-white/10 sm:h-20"
                      style={{ backgroundColor: color.hex }}
                    />
                    <div className="space-y-1 p-2.5">
                      <div className="truncate text-[11px] font-semibold tracking-[-0.01em] text-neutral-950 dark:text-white">
                        {color.name}
                      </div>
                      <div className="truncate text-[10px] uppercase tracking-[0.12em] text-neutral-400">
                        {color.hex}
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {displayLimit < visibleColors.length && (
                <div className="flex items-center justify-center gap-4 py-2">
                  <span className="text-sm text-neutral-400">
                    {t("pagination.showing")} {displayLimit} {t("pagination.of")} {visibleColors.length}
                  </span>
                  <button
                    type="button"
                    onClick={() => setDisplayLimit((prev) => Math.min(prev + PAGE_SIZE, MAX_DISPLAY))}
                    className="rounded-full border border-black/8 bg-white px-5 py-2.5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-950 hover:text-white dark:border-white/10 dark:bg-white/8 dark:text-neutral-300 dark:hover:bg-white dark:hover:text-neutral-950"
                  >
                    {t("pagination.showMore")}
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </main>
  );
}
