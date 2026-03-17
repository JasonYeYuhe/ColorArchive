import { COLOR_FAMILIES } from "@/src/lib/color-utils";
import type { ColorFamily, SortOption } from "@/src/types/color";

interface FilterToolbarProps {
  activeFamily: ColorFamily | "All";
  searchQuery: string;
  sortBy: SortOption;
  onFamilyChange: (family: ColorFamily | "All") => void;
  onSearchChange: (value: string) => void;
  onSortChange: (value: SortOption) => void;
  onReset: () => void;
}

export function FilterToolbar({
  activeFamily,
  searchQuery,
  sortBy,
  onFamilyChange,
  onSearchChange,
  onSortChange,
  onReset,
}: FilterToolbarProps) {
  const hasActiveFilters = activeFamily !== "All" || searchQuery.length > 0 || sortBy !== "hue";

  return (
    <section className="glass-panel sticky top-4 z-10 rounded-[1.75rem] p-4 sm:p-5">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <label className="relative flex-1">
            <span className="sr-only">Search colors by name or hex</span>
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search by color name or hex value"
              className="w-full rounded-2xl border border-black/8 bg-white/85 px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-neutral-900/20 focus:ring-4 focus:ring-neutral-900/8"
            />
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
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onFamilyChange("All")}
            className={`rounded-full px-3 py-1.5 text-sm transition ${
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
                className={`rounded-full px-3 py-1.5 text-sm transition ${
                  isActive
                    ? "bg-neutral-950 text-white"
                    : "border border-black/8 bg-white/85 text-neutral-700 hover:bg-white"
                }`}
                aria-pressed={isActive}
              >
                {family}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
