"use client";

import type { MouseEvent } from "react";
import { useEffect, useState } from "react";
import { isFavoriteColor, subscribeToFavorites, toggleFavoriteColor } from "@/src/lib/favorites";

interface FavoriteButtonProps {
  colorId: string;
  className?: string;
}

export function FavoriteButton({ colorId, className }: FavoriteButtonProps) {
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
    setIsFavorite(nextIds.includes(colorId));
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
            ? "border-neutral-950/10 bg-neutral-950 text-white"
            : "border-black/8 bg-white text-neutral-600 hover:bg-neutral-950 hover:text-white"
        }`
      }
    >
      {isFavorite ? "Saved" : "Save"}
    </button>
  );
}
