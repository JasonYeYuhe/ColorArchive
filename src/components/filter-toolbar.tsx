import { COLOR_FAMILIES } from "@/src/lib/color-utils";
import { ShareLinkButton } from "@/src/components/share-link-button";
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
  const hasActiveFilters = activeFamily !== "All" || searchQuery.length > 0 || sortBy !== "hue";

  return (
    <section
      id="archive"
      className="glass-panel rounded-[1.75rem] p-4 sm:p-5 lg:sticky lg:top-4 lg:z-10"
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
              Archive controls
            </div>
            <div className="mt-1 text-sm text-neutral-600">
              {visibleColors === totalColors
                ? `Showing all ${totalColors} colors`
                : `Showing ${visibleColors} of ${totalColors} colors`}
            </div>
          </div>
          <div className="text-xs uppercase tracking-[0.18em] text-neutral-400">
            Search, sort, and narrow by family
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
              value={searchQuery}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search by color name or hex value"
              className="w-full rounded-2xl border border-black/8 bg-white/85 px-11 py-3 text-sm text-neutral-900 outline-none transition focus:border-neutral-900/20 focus:ring-4 focus:ring-neutral-900/8"
            />
            {searchQuery.length > 0 ? (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                className="absolute right-3 top-1/2 rounded-full px-2 py-1 text-xs font-medium text-neutral-500 transition hover:bg-neutral-900/5 hover:text-neutral-900"
                aria-label="Clear search"
              >
                Clear
              </button>
            ) : null}
          </label>

          <label className="flex min-w-[12rem] flex-col gap-2">
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
              Sort
            </span>
            <select
              value={sortBy}
              onChange={(event) => onSortChange(event.target.value as SortOption)}
              className="rounded-2xl border border-black/8 bg-white/85 px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-neutral-900/20 focus:ring-4 focus:ring-neutral-900/8"
              aria-label="Sort colors"
            >
              <option value="hue">Hue</option>
              <option value="lightness">Lightness</option>
              <option value="name">Name</option>
            </select>
          </label>

          <button
            type="button"
            onClick={onReset}
            disabled={!hasActiveFilters}
            className="rounded-2xl border border-black/8 bg-white/85 px-4 py-3 text-sm font-medium text-neutral-900 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            Reset
          </button>

          {shareHref ? <ShareLinkButton href={shareHref} label="Share view" /> : null}
        </div>

        <div className="-mx-1 overflow-x-auto pb-1 sm:mx-0 sm:overflow-visible">
          <div className="flex min-w-max gap-2 px-1 sm:min-w-0 sm:flex-wrap sm:px-0">
            <button
              type="button"
              onClick={() => onFamilyChange("All")}
              className={`shrink-0 rounded-full px-3 py-1.5 text-sm transition ${
                activeFamily === "All"
                  ? "bg-neutral-950 text-white"
                  : "border border-black/8 bg-white/85 text-neutral-700 hover:bg-white"
              }`}
              aria-pressed={activeFamily === "All"}
            >
              All families
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
                      ? "bg-neutral-950 text-white"
                      : "border border-black/8 bg-white/85 text-neutral-700 hover:bg-white"
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
