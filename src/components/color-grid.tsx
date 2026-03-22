"use client";

import type { ReactNode } from "react";
import { ArchiveEmptyState } from "@/src/components/archive-empty-state";
import { ColorCard } from "@/src/components/color-card";
import { useLocale } from "@/src/components/locale-provider";
import type { ColorRecord } from "@/src/types/color";

interface ColorGridProps {
  colors: readonly ColorRecord[];
  selectedColorId?: string | null;
  onSelectColor?: (colorId: string) => void;
  emptyState?: ReactNode;
}

export function ColorGrid({ colors, selectedColorId, onSelectColor, emptyState }: ColorGridProps) {
  const { t } = useLocale();

  if (colors.length === 0) {
    return emptyState ?? <ArchiveEmptyState />;
  }

  return (
    <section className="space-y-4" aria-label="Color archive">
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="text-xl font-semibold tracking-[-0.03em] text-neutral-950 dark:text-white">{t("grid.archiveTitle")}</h2>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            {t("grid.archiveDesc")}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5" role="list">
        {colors.map((color) => (
          <div key={color.id} role="listitem">
            <ColorCard
              color={color}
              isSelected={selectedColorId === color.id}
              onSelect={onSelectColor}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
