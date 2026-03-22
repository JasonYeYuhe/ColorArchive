"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArchiveEmptyState } from "@/src/components/archive-empty-state";
import { ColorGrid } from "@/src/components/color-grid";
import { FamilyOverview } from "@/src/components/family-overview";
import { FilterToolbar } from "@/src/components/filter-toolbar";
import { HeroSection } from "@/src/components/hero-section";
import { LocalArchiveHub } from "@/src/components/local-archive-hub";
import { SelectedColorPanel } from "@/src/components/selected-color-panel";
import { useLocale } from "@/src/components/locale-provider";
import { COLOR_FAMILIES, filterColors, sortColors } from "@/src/lib/color-utils";
import type { ColorFamily, ColorRecord, SortOption } from "@/src/types/color";

interface ColorArchivePageProps {
  colors: readonly ColorRecord[];
}

function buildArchiveStateParams({
  searchQuery,
  sortBy,
  activeFamily,
  selectedColorId,
}: {
  searchQuery: string;
  sortBy: SortOption;
  activeFamily: ColorFamily | "All";
  selectedColorId: string | null;
}) {
  const params = new URLSearchParams();

  if (searchQuery.trim()) {
    params.set("q", searchQuery.trim());
  }

  if (sortBy !== "hue") {
    params.set("sort", sortBy);
  }

  if (activeFamily !== "All") {
    params.set("family", activeFamily);
  }

  if (selectedColorId) {
    params.set("selected", selectedColorId);
  }

  return params;
}

export function ColorArchivePage({ colors }: ColorArchivePageProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { t } = useLocale();
  const initialQuery = searchParams.get("q") ?? "";
  const initialSort = (searchParams.get("sort") as SortOption | null) ?? "hue";
  const initialFamily = (searchParams.get("family") as ColorFamily | null) ?? "All";
  const initialSelected = searchParams.get("selected");

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [sortBy, setSortBy] = useState<SortOption>(
    initialSort === "lightness" || initialSort === "name" ? initialSort : "hue",
  );
  const [activeFamily, setActiveFamily] = useState<ColorFamily | "All">(
    initialFamily === "All" || COLOR_FAMILIES.includes(initialFamily) ? initialFamily : "All",
  );
  const [selectedColorId, setSelectedColorId] = useState<string | null>(
    initialSelected && colors.some((color) => color.id === initialSelected)
      ? initialSelected
      : colors[0]?.id ?? null,
  );

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

    return sortColors(filtered, sortBy);
  }, [activeFamily, searchResults, sortBy]);

  const PAGE_SIZE = 120;
  const [displayLimit, setDisplayLimit] = useState(PAGE_SIZE);

  useEffect(() => {
    setDisplayLimit(PAGE_SIZE);
  }, [activeFamily, searchQuery, sortBy]);

  useEffect(() => {
    if (visibleColors.length === 0) {
      setSelectedColorId(null);
      return;
    }

    const hasSelectedColor = visibleColors.some((color) => color.id === selectedColorId);

    if (!hasSelectedColor) {
      setSelectedColorId(visibleColors[0].id);
    }
  }, [selectedColorId, visibleColors]);

  const selectedColor = useMemo(
    () => visibleColors.find((color) => color.id === selectedColorId) ?? visibleColors[0] ?? null,
    [selectedColorId, visibleColors],
  );
  const shareHref = useMemo(() => {
    const params = buildArchiveStateParams({
      searchQuery,
      sortBy,
      activeFamily,
      selectedColorId: selectedColorId,
    });
    const queryString = params.toString();

    return queryString ? `/?${queryString}` : "/";
  }, [activeFamily, searchQuery, selectedColorId, sortBy]);

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

  useEffect(() => {
    const params = buildArchiveStateParams({
      searchQuery,
      sortBy,
      activeFamily,
      selectedColorId: selectedColorId,
    });
    const queryString = params.toString();
    router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
  }, [activeFamily, pathname, router, searchQuery, selectedColorId, sortBy]);

  const handleReset = () => {
    setSearchQuery("");
    setSortBy("hue");
    setActiveFamily("All");
  };

  return (
    <main className="px-4 py-4 sm:px-6 sm:py-6">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6">
        <HeroSection
          activeFamily={activeFamily}
          searchQuery={searchQuery}
          totalColors={colors.length}
          visibleColors={visibleColors.length}
        />

        <LocalArchiveHub colors={colors} />

        <FilterToolbar
          activeFamily={activeFamily}
          familyCounts={familyCounts}
          searchQuery={searchQuery}
          shareHref={shareHref}
          sortBy={sortBy}
          totalColors={colors.length}
          visibleColors={visibleColors.length}
          onFamilyChange={setActiveFamily}
          onSearchChange={setSearchQuery}
          onSortChange={setSortBy}
          onReset={handleReset}
        />

        <FamilyOverview
          activeFamily={activeFamily}
          colors={searchResults}
          onFamilySelect={setActiveFamily}
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
              searchQuery={searchQuery}
              activeFamily={activeFamily}
              onClearSearch={() => setSearchQuery("")}
              onClearFamily={() => setActiveFamily("All")}
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
      </div>
    </main>
  );
}
