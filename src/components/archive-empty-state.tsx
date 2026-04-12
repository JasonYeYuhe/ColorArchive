"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useLocale } from "@/src/components/locale-provider";
import { getDidYouMean } from "@/src/components/search-autocomplete";

const SEARCH_SUGGESTIONS = [
  "sunset", "ocean", "forest", "blush", "midnight",
  "coral", "amber", "emerald", "lavender", "slate",
];

interface ArchiveEmptyStateProps {
  title?: string;
  description?: string;
  searchQuery?: string;
  activeFamily?: string;
  onClearSearch?: () => void;
  onClearFamily?: () => void;
  onReset?: () => void;
  onSuggest?: (term: string) => void;
}

export function ArchiveEmptyState({
  title,
  description,
  searchQuery,
  activeFamily,
  onClearSearch,
  onClearFamily,
  onReset,
  onSuggest,
}: ArchiveEmptyStateProps) {
  const { t } = useLocale();
  const resolvedTitle = title ?? t("empty.noResults");
  const resolvedDescription = description ?? t("empty.description");
  const didYouMean = useMemo(
    () => (searchQuery?.trim() ? getDidYouMean(searchQuery.trim()) : null),
    [searchQuery],
  );

  const hasSearch = Boolean(searchQuery?.trim());
  const hasFamily = Boolean(activeFamily && activeFamily !== "All");
  const hasCustomFilters = hasSearch || hasFamily || Boolean(onReset);

  return (
    <section className="glass-panel rounded-[1.75rem] px-6 py-12 text-center">
      <div className="mx-auto max-w-2xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-black/8 bg-white/82 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-neutral-500">
          <span className="inline-block h-2 w-2 rounded-full bg-neutral-900" />
          {t("empty.recovery")}
        </div>
        <h2 className="mt-4 text-xl font-semibold tracking-[-0.03em] text-neutral-950 dark:text-white">{resolvedTitle}</h2>
        <p className="mt-2 text-sm leading-6 text-neutral-500 dark:text-neutral-400">{resolvedDescription}</p>

        {didYouMean && onSuggest && (
          <div className="mt-4">
            <button
              type="button"
              onClick={() => onSuggest(didYouMean.name)}
              className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm transition hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-950/30 dark:hover:bg-blue-900/40"
            >
              <span className="text-blue-600 dark:text-blue-400">Did you mean</span>
              <span
                className="inline-block h-5 w-5 rounded-md ring-1 ring-inset ring-black/10"
                style={{ backgroundColor: didYouMean.hex }}
              />
              <span className="font-semibold text-blue-800 dark:text-blue-300">{didYouMean.name}</span>
              <span className="font-mono text-xs text-blue-500 dark:text-blue-400">{didYouMean.hex}</span>
              <span className="text-blue-600 dark:text-blue-400">?</span>
            </button>
          </div>
        )}

        {(hasSearch || hasFamily) && (
          <div className="mt-4 flex flex-wrap justify-center gap-2 text-sm text-neutral-500">
            {hasSearch ? (
              <span className="rounded-full border border-black/6 bg-neutral-50 px-3 py-1.5">
                {t("empty.queryLabel")} &ldquo;{searchQuery?.trim()}&rdquo;
              </span>
            ) : null}
            {hasFamily ? (
              <span className="rounded-full border border-black/6 bg-neutral-50 px-3 py-1.5">
                {t("empty.familyLabel")} {activeFamily}
              </span>
            ) : null}
          </div>
        )}

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {hasSearch && onClearSearch ? (
            <button
              type="button"
              onClick={onClearSearch}
              className="rounded-full border border-black/8 bg-neutral-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800"
            >
              {t("empty.clearSearch")}
            </button>
          ) : null}

          {hasFamily && onClearFamily ? (
            <button
              type="button"
              onClick={onClearFamily}
              className="rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
            >
              {t("empty.showAllFamilies")}
            </button>
          ) : null}

          {hasCustomFilters && onReset ? (
            <button
              type="button"
              onClick={onReset}
              className="rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
            >
              {t("empty.resetEverything")}
            </button>
          ) : null}

          {onSuggest && hasSearch && (
            <div className="mt-2 flex w-full flex-wrap justify-center gap-1.5">
              <span className="w-full text-[10px] font-medium uppercase tracking-[0.18em] text-neutral-400">
                {t("empty.trySuggestions")}
              </span>
              {SEARCH_SUGGESTIONS.filter((s) => s !== searchQuery?.trim().toLowerCase()).slice(0, 6).map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => onSuggest(term)}
                  className="rounded-full border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-xs text-neutral-600 transition hover:bg-neutral-100"
                >
                  {term}
                </button>
              ))}
            </div>
          )}

          <Link
            href="/all-colors/"
            className="rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
          >
            {t("empty.openAllColors")}
          </Link>
          <Link
            href="/recent/"
            className="rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
          >
            {t("empty.openRecent")}
          </Link>
        </div>
      </div>
    </section>
  );
}
