"use client";

import { useEffect, useMemo, useState } from "react";
import { ArchiveEmptyState } from "@/src/components/archive-empty-state";
import { ColorGrid } from "@/src/components/color-grid";
import { FamilyOverview } from "@/src/components/family-overview";
import { FilterToolbar } from "@/src/components/filter-toolbar";
import { HeroSection } from "@/src/components/hero-section";
import { LocalArchiveHub } from "@/src/components/local-archive-hub";
import { SelectedColorPanel } from "@/src/components/selected-color-panel";
import { COLOR_FAMILIES, filterColors, sortColors } from "@/src/lib/color-utils";
import type { ColorFamily, ColorRecord, SortOption } from "@/src/types/color";

interface ColorArchivePageProps {
  colors: readonly ColorRecord[];
}

export function ColorArchivePage({ colors }: ColorArchivePageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("hue");
  const [activeFamily, setActiveFamily] = useState<ColorFamily | "All">("All");
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

    return sortColors(filtered, sortBy);
  }, [activeFamily, searchResults, sortBy]);

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
          colors={visibleColors}
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
      </div>
    </main>
  );
}
