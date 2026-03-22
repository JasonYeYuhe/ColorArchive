import type { ColorFamily, ColorRecord, SortOption } from "@/src/types/color";
import { compareHueSort } from "./color-relationships";

export const COLOR_FAMILIES: readonly ColorFamily[] = [
  "Red",
  "Orange",
  "Yellow",
  "Lime",
  "Green",
  "Teal",
  "Blue",
  "Purple",
  "Pink",
] as const;

export function getColorFamily(hue: number): ColorFamily {
  if (hue < 15 || hue >= 345) {
    return "Red";
  }
  if (hue < 45) {
    return "Orange";
  }
  if (hue < 70) {
    return "Yellow";
  }
  if (hue < 95) {
    return "Lime";
  }
  if (hue < 150) {
    return "Green";
  }
  if (hue < 185) {
    return "Teal";
  }
  if (hue < 250) {
    return "Blue";
  }
  if (hue < 290) {
    return "Purple";
  }
  return "Pink";
}

export function sortColors(colors: readonly ColorRecord[], sortBy: SortOption): ColorRecord[] {
  const sorted = [...colors];

  sorted.sort((a, b) => {
    if (sortBy === "name") {
      return a.name.localeCompare(b.name) || compareHueSort(a, b);
    }

    if (sortBy === "lightness") {
      return a.lightness - b.lightness || compareHueSort(a, b);
    }

    return compareHueSort(a, b);
  });

  return sorted;
}
