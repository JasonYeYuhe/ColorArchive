"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ArchiveEmptyState } from "@/src/components/archive-empty-state";
import { ShareLinkButton } from "@/src/components/share-link-button";
import { COLOR_FAMILIES, filterColors, sortColors } from "@/src/lib/color-utils";
import type { ColorFamily, ColorRecord, SortOption } from "@/src/types/color";

interface AllColorsPageProps {
  colors: readonly ColorRecord[];
}

type DensityMode = "compact" | "comfortable" | "expanded";

const PAGE_SORT_OPTIONS: { label: string; value: SortOption }[] = [
  { label: "Hue", value: "hue" },
  { label: "Lightness", value: "lightness" },
  { label: "Name", value: "name" },
];

const DENSITY_OPTIONS: { label: string; value: DensityMode }[] = [
  { label: "Compact", value: "compact" },
  { label: "Comfortable", value: "comfortable" },
  { label: "Expanded", value: "expanded" },
];

export function AllColorsPage({ colors }: AllColorsPageProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initialSort = (searchParams.get("sort") as SortOption | null) ?? "hue";
  const initialFamily = (searchParams.get("family") as ColorFamily | null) ?? "All";
  const initialDensity = (searchParams.get("density") as DensityMode | null) ?? "compact";
  const initialQuery = searchParams.get("q") ?? "";

  const [sortBy, setSortBy] = useState<SortOption>(
    initialSort === "name" || initialSort === "lightness" || initialSort === "hue"
      ? initialSort
      : "hue",
  );
  const [activeFamily, setActiveFamily] = useState<ColorFamily | "All">(
    initialFamily === "All" || COLOR_FAMILIES.includes(initialFamily) ? initialFamily : "All",
  );
  const [density, setDensity] = useState<DensityMode>(
    initialDensity === "comfortable" || initialDensity === "expanded" ? initialDensity : "compact",
  );
  const [searchQuery, setSearchQuery] = useState(initialQuery);

  const searchResults = useMemo(
    () => filterColors(colors, searchQuery, "All"),
    [colors, searchQuery],
  );

  const visibleColors = useMemo(() => {
    const filtered =
      activeFamily === "All"
        ? searchResults
        : searchResults.filter((color) => color.family === activeFamily);

    return sortColors(filtered, sortBy);
  }, [activeFamily, searchResults, sortBy]);

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
  const shareHref = useMemo(() => {
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

    if (density !== "compact") {
      params.set("density", density);
    }

    const queryString = params.toString();
    return queryString ? `/all-colors?${queryString}` : "/all-colors";
  }, [activeFamily, density, searchQuery, sortBy]);

  useEffect(() => {
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

    if (density !== "compact") {
      params.set("density", density);
    }

    const queryString = params.toString();
    router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
  }, [activeFamily, density, pathname, router, searchQuery, sortBy]);

  const densityGridClass =
    density === "expanded"
      ? "grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7"
      : density === "comfortable"
        ? "grid-cols-3 gap-3 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 2xl:grid-cols-12"
        : "grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 2xl:grid-cols-14";

  return (
    <main className="px-4 py-4 sm:px-6 sm:py-6">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6">
        <section className="relative overflow-hidden rounded-[2rem] border border-black/6 bg-white/74 px-6 py-10 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:px-10 sm:py-14">
          <div className="pointer-events-none absolute left-0 top-8 h-52 w-52 rounded-full bg-rose-200/28 blur-3xl" />
          <div className="pointer-events-none absolute right-0 top-0 h-64 w-64 rounded-full bg-sky-200/28 blur-3xl" />
          <div className="relative mx-auto max-w-4xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-black/8 bg-white/85 px-3 py-1 text-xs font-medium tracking-[0.22em] text-neutral-500 uppercase">
              <span className="inline-block h-2 w-2 rounded-full bg-neutral-900" />
              Full archive view
            </div>

            <h1 className="max-w-3xl text-4xl font-semibold tracking-[-0.04em] text-neutral-950 sm:text-6xl">
              All archive colors
            </h1>

            <p className="mt-4 max-w-2xl text-balance text-base leading-7 text-neutral-600 sm:text-lg">
              A dense view of the full curated archive. This page is optimized for broad scanning,
              comparison, and jumping into individual color detail pages.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <div className="rounded-2xl border border-black/6 bg-white/85 px-4 py-3">
                <div className="text-xs uppercase tracking-[0.18em] text-neutral-400">Archive</div>
                <div className="mt-1 text-lg font-semibold text-neutral-950">{colors.length} colors</div>
              </div>
              <div className="rounded-2xl border border-black/6 bg-white/85 px-4 py-3">
                <div className="text-xs uppercase tracking-[0.18em] text-neutral-400">Visible</div>
                <div className="mt-1 text-lg font-semibold text-neutral-950">
                  {visibleColors.length} colors
                </div>
              </div>
              <div className="rounded-2xl border border-black/6 bg-white/85 px-4 py-3">
                <div className="text-xs uppercase tracking-[0.18em] text-neutral-400">Use case</div>
                <div className="mt-1 text-lg font-semibold text-neutral-950">
                  {density === "expanded"
                    ? "Closer look"
                    : density === "comfortable"
                      ? "Balanced scan"
                      : "Dense scan"}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[1.75rem] border border-black/6 bg-white/78 p-4 shadow-[0_18px_48px_rgba(15,23,42,0.04)] sm:p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
                Display controls
              </div>
              <div className="mt-1 text-sm text-neutral-600">
                Switch sort order or isolate a family without leaving the dense overview.
              </div>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row">
              <label className="flex min-w-[16rem] flex-col gap-2">
                <span className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
                  Search
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search name or hex"
                  className="rounded-2xl border border-black/8 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-neutral-900/20 focus:ring-4 focus:ring-neutral-900/8"
                />
              </label>

              <label className="flex min-w-[12rem] flex-col gap-2">
                <span className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
                  Sort
                </span>
                <select
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value as SortOption)}
                  className="rounded-2xl border border-black/8 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-neutral-900/20 focus:ring-4 focus:ring-neutral-900/8"
                >
                  {PAGE_SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex min-w-[12rem] flex-col gap-2">
                <span className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
                  Density
                </span>
                <select
                  value={density}
                  onChange={(event) => setDensity(event.target.value as DensityMode)}
                  className="rounded-2xl border border-black/8 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-neutral-900/20 focus:ring-4 focus:ring-neutral-900/8"
                >
                  {DENSITY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <button
                type="button"
                onClick={() => {
                  setSortBy("hue");
                  setActiveFamily("All");
                  setDensity("compact");
                  setSearchQuery("");
                }}
                className="rounded-2xl border border-black/8 bg-white px-4 py-3 text-sm font-medium text-neutral-900 transition hover:bg-neutral-50"
              >
                Reset
              </button>

              <div className="flex items-end">
                <ShareLinkButton href={shareHref} />
              </div>
            </div>
          </div>

          <div className="-mx-1 mt-4 overflow-x-auto pb-1 sm:overflow-visible">
            <div className="flex min-w-max gap-2 px-1 sm:min-w-0 sm:flex-wrap sm:px-0">
              <button
                type="button"
                onClick={() => setActiveFamily("All")}
                className={`shrink-0 rounded-full px-3 py-1.5 text-sm transition ${
                  activeFamily === "All"
                    ? "bg-neutral-950 text-white"
                    : "border border-black/8 bg-white text-neutral-700 hover:bg-neutral-50"
                }`}
              >
                All families
              </button>

              {COLOR_FAMILIES.map((family) => {
                const isActive = activeFamily === family;

                return (
                  <button
                    key={family}
                    type="button"
                    onClick={() => setActiveFamily(family)}
                    className={`shrink-0 rounded-full px-3 py-1.5 text-sm transition ${
                      isActive
                        ? "bg-neutral-950 text-white"
                        : "border border-black/8 bg-white text-neutral-700 hover:bg-neutral-50"
                    }`}
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
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <div>
              <h2 className="text-xl font-semibold tracking-[-0.03em] text-neutral-950">
                Dense spectrum
              </h2>
              <p className="mt-1 text-sm text-neutral-500">
                Each tile opens a full detail page for that color.
              </p>
            </div>
            <Link
              href="/search"
              className="rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
            >
              Open search
            </Link>
          </div>

          {visibleColors.length === 0 ? (
            <ArchiveEmptyState
              title="No dense results for this view"
              description="The current search, family, and density settings resolve to an empty all-colors view. Clear one of them and reopen the full archive."
              searchQuery={searchQuery}
              activeFamily={activeFamily}
              onClearSearch={() => setSearchQuery("")}
              onClearFamily={() => setActiveFamily("All")}
              onReset={() => {
                setSortBy("hue");
                setActiveFamily("All");
                setDensity("compact");
                setSearchQuery("");
              }}
            />
          ) : (
            <div className={`grid ${densityGridClass}`}>
              {visibleColors.map((color) => (
                <Link
                  key={color.id}
                  href={`/colors/${color.id}/`}
                  className="group overflow-hidden rounded-[1.05rem] border border-black/6 bg-white shadow-[0_12px_32px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_36px_rgba(15,23,42,0.08)]"
                  aria-label={`Open ${color.name}`}
                >
                  <div
                    className="h-18 border-b border-black/6 sm:h-20"
                    style={{ backgroundColor: color.hex }}
                  />
                  <div className="space-y-1 p-2.5">
                    <div className="truncate text-[11px] font-semibold tracking-[-0.01em] text-neutral-950">
                      {color.name}
                    </div>
                    <div className="truncate text-[10px] uppercase tracking-[0.12em] text-neutral-400">
                      {color.hex}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
