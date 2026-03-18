"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ColorGrid } from "@/src/components/color-grid";
import { FilterToolbar } from "@/src/components/filter-toolbar";
import { SelectedColorPanel } from "@/src/components/selected-color-panel";
import { ShareLinkButton } from "@/src/components/share-link-button";
import { COLOR_FAMILIES, filterColors, sortColors } from "@/src/lib/color-utils";
import type { ColorFamily, ColorRecord, SortOption } from "@/src/types/color";

interface SearchExplorerPageProps {
  colors: readonly ColorRecord[];
}

const SEARCH_PROMPTS = ["moss", "rose", "#7F", "azure", "velvet"] as const;
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

export function SearchExplorerPage({ colors }: SearchExplorerPageProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
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

  const searchResults = useMemo(() => filterColors(colors, searchQuery, "All"), [colors, searchQuery]);

  const familyCounts = useMemo(
    () =>
      Object.fromEntries(
        COLOR_FAMILIES.map((family) => [
          family,
          searchResults.filter((color) => color.family === family).length,
        ]),
      ) as Record<ColorFamily, number>,
    [searchResults],
  );

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

    return queryString ? `/search?${queryString}` : "/search";
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

  return (
    <main className="px-4 py-4 sm:px-6 sm:py-6">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6">
        <section className="relative overflow-hidden rounded-[2rem] border border-black/6 bg-white/74 px-6 py-10 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:px-10 sm:py-14">
          <div className="pointer-events-none absolute right-0 top-0 h-64 w-64 rounded-full bg-sky-200/35 blur-3xl" />
          <div className="pointer-events-none absolute left-0 top-10 h-48 w-48 rounded-full bg-emerald-200/28 blur-3xl" />
          <div className="relative mx-auto max-w-4xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-black/8 bg-white/85 px-3 py-1 text-xs font-medium tracking-[0.22em] text-neutral-500 uppercase">
              <span className="inline-block h-2 w-2 rounded-full bg-neutral-900" />
              Search the archive
            </div>

            <h1 className="max-w-3xl text-4xl font-semibold tracking-[-0.04em] text-neutral-950 sm:text-6xl">
              Find colors fast
            </h1>

            <p className="mt-4 max-w-2xl text-balance text-base leading-7 text-neutral-600 sm:text-lg">
              Search by name, family, or hex fragment. This page is optimized for quick lookup
              rather than browsing the full archive.
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
          </div>
        </section>

        <section className="rounded-[1.75rem] border border-black/6 bg-white/78 p-4 shadow-[0_18px_48px_rgba(15,23,42,0.04)] sm:p-5">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <label className="flex flex-col gap-2">
              <span className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
                Hue band
              </span>
              <select
                value={hueBand}
                onChange={(event) => setHueBand(event.target.value as HueBand)}
                className="rounded-2xl border border-black/8 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-neutral-900/20 focus:ring-4 focus:ring-neutral-900/8"
              >
                <option value="all">All hues</option>
                <option value="warm">Warm</option>
                <option value="fresh">Fresh</option>
                <option value="cool">Cool</option>
                <option value="violet">Violet / Pink</option>
              </select>
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
                Tone
              </span>
              <select
                value={toneBand}
                onChange={(event) => setToneBand(event.target.value as ToneBand)}
                className="rounded-2xl border border-black/8 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-neutral-900/20 focus:ring-4 focus:ring-neutral-900/8"
              >
                <option value="all">All tones</option>
                <option value="light">Light</option>
                <option value="mid">Mid</option>
                <option value="dark">Dark</option>
              </select>
            </label>

            <div className="rounded-2xl border border-black/6 bg-neutral-50 px-4 py-3">
              <div className="text-xs uppercase tracking-[0.16em] text-neutral-400">Current query</div>
              <div className="mt-2 text-sm font-medium text-neutral-950">
                {searchQuery.trim().length > 0 ? searchQuery.trim() : "No keyword"}
              </div>
            </div>

            <div className="rounded-2xl border border-black/6 bg-neutral-50 px-4 py-3">
              <div className="text-xs uppercase tracking-[0.16em] text-neutral-400">Current lens</div>
              <div className="mt-2 text-sm font-medium text-neutral-950">
                {hueBand === "all" ? "All hues" : hueBand} · {toneBand === "all" ? "All tones" : toneBand}
              </div>
            </div>
          </div>

          <div className="mt-4 grid gap-4 xl:grid-cols-3">
            <label className="flex flex-col gap-2">
              <span className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
                Saturation range
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
                Lightness range
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
                Exact hex
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
          colors={visibleColors}
          selectedColorId={selectedColorId}
          onSelectColor={setSelectedColorId}
        />
      </div>
    </main>
  );
}
