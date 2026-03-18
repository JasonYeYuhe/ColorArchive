"use client";

import type { ColorRecord } from "@/src/types/color";

const STORAGE_KEY = "colorarchive-palette";
const MAX_PALETTE_SIZE = 6;
const CHANGE_EVENT = "palette-builder-change";

function readFromStorage(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function writeToStorage(ids: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    window.dispatchEvent(new Event(CHANGE_EVENT));
  } catch {
    // ignore
  }
}

export function getPaletteIds(): string[] {
  return readFromStorage();
}

export function addToPalette(colorId: string): void {
  const ids = readFromStorage();
  if (ids.includes(colorId) || ids.length >= MAX_PALETTE_SIZE) return;
  writeToStorage([...ids, colorId]);
}

export function removeFromPalette(colorId: string): void {
  writeToStorage(readFromStorage().filter((id) => id !== colorId));
}

export function clearPalette(): void {
  writeToStorage([]);
}

export function isPaletteColor(colorId: string): boolean {
  return readFromStorage().includes(colorId);
}

export function subscribeToPalette(callback: (ids: string[]) => void): () => void {
  const handler = () => callback(readFromStorage());
  window.addEventListener(CHANGE_EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(CHANGE_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}

export function buildPaletteCssExport(colors: ColorRecord[]): string {
  const vars = colors.map((c, i) => `  --palette-${i + 1}: ${c.hex}; /* ${c.name} */`).join("\n");
  return `:root {\n${vars}\n}`;
}

export function buildPaletteJsonExport(colors: ColorRecord[]): string {
  const data = colors.map((c) => ({ name: c.name, hex: c.hex, hsl: c.hsl, rgb: c.rgb }));
  return JSON.stringify(data, null, 2);
}

export const MAX_SIZE = MAX_PALETTE_SIZE;
