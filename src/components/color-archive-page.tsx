"use client";

import { useMemo, useState } from "react";
import { ColorGrid } from "@/src/components/color-grid";
import { FilterToolbar } from "@/src/components/filter-toolbar";
import { HeroSection } from "@/src/components/hero-section";
import { filterColors, sortColors } from "@/src/lib/color-utils";
import type { ColorFamily, ColorRecord, SortOption } from "@/src/types/color";

interface ColorArchivePageProps {
  colors: readonly ColorRecord[];
}

export function ColorArchivePage({ colors }: ColorArchivePageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("hue");
  const [activeFamily, setActiveFamily] = useState<ColorFamily | "All">("All");

  const visibleColors = useMemo(() => {
    const filtered = filterColors(colors, searchQuery, activeFamily);
    return sortColors(filtered, sortBy);
  }, [activeFamily, colors, searchQuery, sortBy]);

  const handleReset = () => {
    setSearchQuery("");
    setSortBy("hue");
    setActiveFamily("All");
  };

  return (
    <main className="px-4 py-4 sm:px-6 sm:py-6">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6">
        <HeroSection totalColors={colors.length} visibleColors={visibleColors.length} />

        <FilterToolbar
          activeFamily={activeFamily}
          searchQuery={searchQuery}
          sortBy={sortBy}
          onFamilyChange={setActiveFamily}
          onSearchChange={setSearchQuery}
          onSortChange={setSortBy}
          onReset={handleReset}
        />

        <ColorGrid colors={visibleColors} />
      </div>
    </main>
  );
}
