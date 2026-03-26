"use client";

import { COLOR_FAMILIES } from "@/src/lib/color-utils";
import { ShareLinkButton } from "@/src/components/share-link-button";
import { useLocale } from "@/src/components/locale-provider";
import type { ColorFamily, SortOption } from "@/src/types/color";

interface FilterToolbarProps {
  activeFamily: ColorFamily | "All";
  familyCounts: Record<ColorFamily, number>;
  searchQuery: string;
  sortBy: SortOption;
  shareHref?: string;
  totalColors: number;
  visibleColors: number;
  onFamilyChange: (family: ColorFamily | "All") => void;
  onSearchChange: (value: string) => void;
  onSortChange: (value: SortOption) => void;
  onReset: () => void;
}

export function FilterToolbar({
  activeFamily,
  familyCounts,
  searchQuery,
  sortBy,
  shareHref,
  totalColors,
  visibleColors,
  onFamilyChange,
  onSearchChange,
  onSortChange,
  onReset,
}: FilterToolbarProps) {
  const { t } = useLocale();
  const hasActiveFilters = activeFamily !== "All" || searchQuery.length > 0 || sortBy !== "hue";

  return (
    <section
      id="archive"
      className="glass-panel rounded-[1.75rem] p-4 sm:p-5 lg:sticky lg:top-4 lg:z-10"
      role="region"
      aria-label="Color filters"
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
              {t("filter.archiveControls")}
            </div>
            <div className="mt-1 text-sm text-neutral-600">
              {visibleColors === totalColors
                ? `${t("filter.showingAll")} ${totalColors} ${t("hero.colors")}`
                : `${t("hero.showing")} ${visibleColors} ${t("filter.showingOf")} ${totalColors} ${t("hero.colors")}`}
            </div>
          </div>
          <div className="text-xs uppercase tracking-[0.18em] text-neutral-400">
            {t("filter.searchSortNarrow")}
          </div>
        </div>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <label className="relative flex-1">
            <span className="sr-only">Search colors by name or hex</span>
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400">
              ⌕
            </span>
            <input
              type="search"
              id="color-search"
              name="color-search"
              data-search-input
              value={searchQuery}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder={t("filter.searchPlaceholder")}
              className="w-full rounded-2xl border border-black/8 bg-white/85 px-11 py-3 text-sm text-neutral-900 outline-none transition focus:border-neutral-900/20 focus:ring-4 focus:ring-neutral-900/8 dark:border-white/10 dark:bg-white/8 dark:text-white dark:placeholder-neutral-500 dark:focus:border-white/20 dark:focus:ring-white/8"
            />
            {searchQuery.length > 0 ? (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                className="absolute right-3 top-1/2 rounded-full px-2 py-1 text-xs font-medium text-neutral-500 transition hover:bg-neutral-900/5 hover:text-neutral-900"
                aria-label="Clear search"
              >
                {t("filter.clear")}
              </button>
            ) : null}
          </label>

          <label className="flex min-w-[12rem] flex-col gap-2">
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
              {t("filter.sort")}
            </span>
            <select
              id="color-sort"
              name="color-sort"
              value={sortBy}
              onChange={(event) => onSortChange(event.target.value as SortOption)}
              className="rounded-2xl border border-black/8 bg-white/85 px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-neutral-900/20 focus:ring-4 focus:ring-neutral-900/8 dark:border-white/10 dark:bg-white/8 dark:text-white dark:focus:border-white/20 dark:focus:ring-white/8"
              aria-label="Sort colors"
            >
              <option value="hue">{t("filter.sortHue")}</option>
              <option value="lightness">{t("filter.sortLightness")}</option>
              <option value="name">{t("filter.sortName")}</option>
            </select>
          </label>

          <button
            type="button"
            onClick={onReset}
            disabled={!hasActiveFilters}
            className="rounded-2xl border border-black/8 bg-white/85 px-4 py-3 text-sm font-medium text-neutral-900 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-white/8 dark:text-white dark:hover:bg-white/14"
          >
            {t("filter.reset")}
          </button>

          {shareHref ? <ShareLinkButton href={shareHref} label={t("filter.shareView")} /> : null}
        </div>

        <div className="-mx-1 overflow-x-auto pb-1 sm:mx-0 sm:overflow-visible">
          <div className="flex min-w-max gap-2 px-1 sm:min-w-0 sm:flex-wrap sm:px-0" role="group" aria-label="Color family filter">
            <button
              type="button"
              onClick={() => onFamilyChange("All")}
              className={`shrink-0 rounded-full px-3 py-1.5 text-sm transition ${
                activeFamily === "All"
                  ? "bg-neutral-950 text-white dark:bg-white dark:text-neutral-950"
                  : "border border-black/8 bg-white/85 text-neutral-700 hover:bg-white dark:border-white/10 dark:bg-white/8 dark:text-neutral-300 dark:hover:bg-white/14"
              }`}
              aria-pressed={activeFamily === "All"}
            >
              {t("filter.allFamilies")}
            </button>

            {COLOR_FAMILIES.map((family) => {
              const isActive = activeFamily === family;

              return (
                <button
                  key={family}
                  type="button"
                  onClick={() => onFamilyChange(family)}
                  className={`shrink-0 rounded-full px-3 py-1.5 text-sm transition ${
                    isActive
                      ? "bg-neutral-950 text-white dark:bg-white dark:text-neutral-950"
                      : "border border-black/8 bg-white/85 text-neutral-700 hover:bg-white dark:border-white/10 dark:bg-white/8 dark:text-neutral-300 dark:hover:bg-white/14"
                  }`}
                  aria-pressed={isActive}
                >
                  {family}
                  <span className={`ml-2 text-xs ${isActive ? "text-white/70" : "text-neutral-400"}`}>
                    {familyCounts[family]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
