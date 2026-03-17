"use client";

import { useMemo, useState } from "react";
import { ColorGrid } from "@/src/components/color-grid";
import { FamilyOverview } from "@/src/components/family-overview";
import { FilterToolbar } from "@/src/components/filter-toolbar";
import { HeroSection } from "@/src/components/hero-section";
import { COLOR_FAMILIES, filterColors, sortColors } from "@/src/lib/color-utils";
import type { ColorFamily, ColorRecord, SortOption } from "@/src/types/color";

interface ColorArchivePageProps {
  colors: readonly ColorRecord[];
}

export function ColorArchivePage({ colors }: ColorArchivePageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("hue");
  const [activeFamily, setActiveFamily] = useState<ColorFamily | "All">("All");

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

        <ColorGrid colors={visibleColors} />

        <footer className="px-1 pb-4">
          <div className="flex flex-col gap-3 rounded-[1.75rem] border border-black/6 bg-white/66 px-5 py-5 text-sm text-neutral-500 shadow-[0_18px_48px_rgba(15,23,42,0.04)] sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p className="max-w-2xl leading-6">
              Static, local-only archive built for GitHub Pages. All colors are generated from a
              typed local dataset and sorted client-side with no backend dependencies.
            </p>
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
              Ready for static export
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}
