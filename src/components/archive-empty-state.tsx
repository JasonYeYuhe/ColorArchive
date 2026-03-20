"use client";

import Link from "next/link";
import { useLocale } from "@/src/components/locale-provider";

interface ArchiveEmptyStateProps {
  title?: string;
  description?: string;
  searchQuery?: string;
  activeFamily?: string;
  onClearSearch?: () => void;
  onClearFamily?: () => void;
  onReset?: () => void;
}

export function ArchiveEmptyState({
  title,
  description,
  searchQuery,
  activeFamily,
  onClearSearch,
  onClearFamily,
  onReset,
}: ArchiveEmptyStateProps) {
  const { t } = useLocale();
  const resolvedTitle = title ?? t("empty.noResults");
  const resolvedDescription = description ?? t("empty.description");

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
        <h2 className="mt-4 text-xl font-semibold tracking-[-0.03em] text-neutral-950">{resolvedTitle}</h2>
        <p className="mt-2 text-sm leading-6 text-neutral-500">{resolvedDescription}</p>

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
