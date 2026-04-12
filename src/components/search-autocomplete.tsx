"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import Link from "next/link";
import { colors } from "@/src/data/colors";

interface Suggestion {
  id: string;
  name: string;
  hex: string;
  type: "name" | "hex";
}

/**
 * Build prefix-match suggestions from the color archive.
 * - For text queries: match color name prefixes (case-insensitive)
 * - For hex queries (starts with #): match hex prefixes
 * Returns up to `limit` results sorted by relevance.
 */
function getSuggestions(query: string, limit = 8): Suggestion[] {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];

  // Hex query mode
  if (q.startsWith("#") || /^[0-9a-f]{2,6}$/i.test(q)) {
    const hexQ = q.replace("#", "").toLowerCase();
    return colors
      .filter((c) => c.hex.toLowerCase().replace("#", "").startsWith(hexQ))
      .slice(0, limit)
      .map((c) => ({ id: c.id, name: c.name, hex: c.hex, type: "hex" as const }));
  }

  // Name prefix match
  const results: Suggestion[] = [];
  const qParts = q.split(/\s+/);

  for (const c of colors) {
    if (results.length >= limit) break;
    const nameLower = c.name.toLowerCase();
    // Match if all query parts appear as prefixes of words in the name
    const matches = qParts.every((part) =>
      nameLower.includes(part),
    );
    if (matches) {
      results.push({ id: c.id, name: c.name, hex: c.hex, type: "name" });
    }
  }

  // If no prefix results, try "starts with" on hue root names
  if (results.length === 0) {
    for (const c of colors) {
      if (results.length >= limit) break;
      if (c.id.startsWith(q)) {
        results.push({ id: c.id, name: c.name, hex: c.hex, type: "name" });
      }
    }
  }

  return results;
}

/**
 * Get "did you mean" suggestion when there are 0 filter results.
 * Returns the single best prefix match, or null.
 */
export function getDidYouMean(query: string): Suggestion | null {
  const suggestions = getSuggestions(query, 1);
  return suggestions[0] ?? null;
}

interface SearchAutocompleteProps {
  query: string;
  onSelect: (term: string) => void;
  inputRef?: React.RefObject<HTMLInputElement | null>;
}

/**
 * Autocomplete dropdown that appears below the search input.
 * Shows color name + hex swatch suggestions as the user types.
 */
export function SearchAutocomplete({ query, onSelect, inputRef }: SearchAutocompleteProps) {
  const [focused, setFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(-1);

  const suggestions = useMemo(() => getSuggestions(query), [query]);

  // Reset active index when suggestions change
  useEffect(() => setActiveIndex(-1), [suggestions]);

  // Focus tracking
  useEffect(() => {
    const input = inputRef?.current;
    if (!input) return;
    const onFocus = () => setFocused(true);
    const onBlur = () => setTimeout(() => setFocused(false), 150);
    input.addEventListener("focus", onFocus);
    input.addEventListener("blur", onBlur);
    return () => {
      input.removeEventListener("focus", onFocus);
      input.removeEventListener("blur", onBlur);
    };
  }, [inputRef]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!suggestions.length) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => (i + 1) % suggestions.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
      } else if (e.key === "Enter" && activeIndex >= 0) {
        e.preventDefault();
        onSelect(suggestions[activeIndex].name);
      } else if (e.key === "Escape") {
        setFocused(false);
      }
    },
    [suggestions, activeIndex, onSelect],
  );

  useEffect(() => {
    const input = inputRef?.current;
    if (!input) return;
    input.addEventListener("keydown", handleKeyDown);
    return () => input.removeEventListener("keydown", handleKeyDown);
  }, [inputRef, handleKeyDown]);

  if (!focused || suggestions.length === 0 || query.length < 2) return null;

  return (
    <div
      ref={containerRef}
      className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-xl border border-black/8 bg-white shadow-xl dark:border-white/10 dark:bg-neutral-900"
      role="listbox"
    >
      {suggestions.map((s, i) => (
        <button
          key={s.id}
          type="button"
          role="option"
          aria-selected={i === activeIndex}
          onMouseDown={(e) => {
            e.preventDefault();
            onSelect(s.name);
          }}
          className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition ${
            i === activeIndex
              ? "bg-neutral-100 dark:bg-white/10"
              : "hover:bg-neutral-50 dark:hover:bg-white/5"
          }`}
        >
          <div
            className="h-6 w-6 shrink-0 rounded-md ring-1 ring-inset ring-black/10 dark:ring-white/10"
            style={{ backgroundColor: s.hex }}
          />
          <div className="min-w-0 flex-1">
            <span className="font-medium text-neutral-900 dark:text-white">{s.name}</span>
          </div>
          <span className="shrink-0 font-mono text-xs text-neutral-400 dark:text-neutral-500">
            {s.hex}
          </span>
        </button>
      ))}
    </div>
  );
}
