"use client";

import type { MouseEvent } from "react";
import { useEffect, useState } from "react";
import { useLocale } from "@/src/components/locale-provider";
import { isFavoriteColor, subscribeToFavorites, toggleFavoriteColor } from "@/src/lib/favorites";
import { track } from "@/src/lib/track";

interface FavoriteButtonProps {
  colorId: string;
  className?: string;
}

export function FavoriteButton({ colorId, className }: FavoriteButtonProps) {
  const { t } = useLocale();
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    setIsFavorite(isFavoriteColor(colorId));

    return subscribeToFavorites((colorIds) => {
      setIsFavorite(colorIds.includes(colorId));
    });
  }, [colorId]);

  const handleToggle = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    const nextIds = toggleFavoriteColor(colorId);
    const nowFavorite = nextIds.includes(colorId);
    setIsFavorite(nowFavorite);
    track("favorite_toggled", { action: nowFavorite ? "add" : "remove", color_id: colorId });
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-pressed={isFavorite}
      className={
        className ??
        `rounded-full border px-3 py-1.5 text-xs font-medium uppercase tracking-[0.14em] transition ${
          isFavorite
            ? "border-neutral-950/10 bg-neutral-950 text-white dark:border-white/20 dark:bg-white dark:text-neutral-950"
            : "border-black/8 bg-white text-neutral-600 hover:bg-neutral-950 hover:text-white dark:border-white/10 dark:bg-white/8 dark:text-neutral-400 dark:hover:bg-white dark:hover:text-neutral-950"
        }`
      }
    >
      {isFavorite ? t("favorite.saved") : t("favorite.save")}
    </button>
  );
}
