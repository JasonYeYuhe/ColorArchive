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

export function addManyToPalette(colorIds: string[]): void {
  const ids = readFromStorage();
  const nextIds = [...ids];

  for (const colorId of colorIds) {
    if (nextIds.includes(colorId)) continue;
    if (nextIds.length >= MAX_PALETTE_SIZE) break;
    nextIds.push(colorId);
  }

  writeToStorage(nextIds);
}

export function removeFromPalette(colorId: string): void {
  writeToStorage(readFromStorage().filter((id) => id !== colorId));
}

export function clearPalette(): void {
  writeToStorage([]);
}

export function replacePalette(colorIds: string[]): void {
  writeToStorage(colorIds.slice(0, MAX_PALETTE_SIZE));
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

function toSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function buildPaletteTailwindExport(colors: ColorRecord[]): string {
  const lines = colors.map((c) => `    "${toSlug(c.name)}": "${c.hex}",`).join("\n");
  return `// tailwind.config.ts\nmodule.exports = {\n  theme: {\n    extend: {\n      colors: {\n${lines}\n      },\n    },\n  },\n};`;
}

export function buildPaletteFigmaExport(colors: ColorRecord[]): string {
  const tokens: Record<string, { $type: string; $value: string; $description: string }> = {};
  for (const c of colors) {
    tokens[toSlug(c.name)] = {
      $type: "color",
      $value: c.hex,
      $description: `${c.name} · ${c.hsl}`,
    };
  }
  return JSON.stringify({ palette: tokens }, null, 2);
}

export function buildPaletteStyleDictionaryExport(colors: ColorRecord[]): string {
  const properties: Record<string, { value: string; comment: string }> = {};
  for (const c of colors) {
    properties[toSlug(c.name)] = {
      value: c.hex,
      comment: `${c.name} · ${c.hsl}`,
    };
  }
  return JSON.stringify({ color: { palette: properties } }, null, 2);
}

// Deterministic palette naming based on color properties
const MOOD_WORDS: Record<string, string[]> = {
  warm_light: ["Morning", "Dawn", "Sunrise", "Bloom", "Glow"],
  warm_mid: ["Spice", "Clay", "Ember", "Terra", "Harvest"],
  warm_dark: ["Dusk", "Mulled", "Fireside", "Hearth", "Smolder"],
  cool_light: ["Frost", "Mist", "Cloud", "Arctic", "Drift"],
  cool_mid: ["Ocean", "Stream", "Wave", "Tide", "Harbor"],
  cool_dark: ["Midnight", "Deep", "Abyss", "Tempest", "Shadow"],
  neutral_light: ["Silk", "Pearl", "Linen", "Ivory", "Whisper"],
  neutral_mid: ["Stone", "Ash", "Fog", "Dove", "Slate"],
  neutral_dark: ["Onyx", "Iron", "Carbon", "Eclipse", "Void"],
};

const SCENE_WORDS: Record<string, string[]> = {
  monochrome: ["Study", "Suite", "System", "Scale", "Layer"],
  analogous: ["Garden", "Coast", "Valley", "Meadow", "Path"],
  complementary: ["Clash", "Dialog", "Tension", "Balance", "Duet"],
  triadic: ["Festival", "Bazaar", "Mosaic", "Carnival", "Prism"],
  diverse: ["Palette", "Spectrum", "Story", "Journey", "Scene"],
};

function getTemperature(hue: number): "warm" | "cool" | "neutral" {
  if ((hue >= 0 && hue < 70) || hue >= 310) return "warm";
  if (hue >= 150 && hue < 260) return "cool";
  return "neutral";
}

function getLightnessZone(lightness: number): "light" | "mid" | "dark" {
  if (lightness >= 65) return "light";
  if (lightness >= 35) return "mid";
  return "dark";
}

function getHarmonyType(colors: ColorRecord[]): string {
  if (colors.length < 2) return "diverse";
  const hues = colors.map((c) => c.hue);
  const uniqueFamilies = new Set(colors.map((c) => c.family));

  if (uniqueFamilies.size === 1) return "monochrome";

  const hueSpread = hues.reduce((maxDist, h1) => {
    return hues.reduce((md, h2) => {
      const diff = Math.abs(h1 - h2) % 360;
      return Math.max(md, Math.min(diff, 360 - diff));
    }, maxDist);
  }, 0);

  if (hueSpread <= 40) return "analogous";
  if (hueSpread >= 150 && hueSpread <= 210) return "complementary";
  if (uniqueFamilies.size >= 3 && hueSpread > 120) return "triadic";
  return "diverse";
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

export function generatePaletteName(colors: ColorRecord[]): string {
  if (colors.length === 0) return "Empty Palette";

  const avgHue = Math.round(colors.reduce((s, c) => s + c.hue, 0) / colors.length);
  const avgLight = Math.round(colors.reduce((s, c) => s + c.lightness, 0) / colors.length);

  const temp = getTemperature(avgHue);
  const zone = getLightnessZone(avgLight);
  const harmony = getHarmonyType(colors);

  const moodKey = `${temp}_${zone}`;
  const moodPool = MOOD_WORDS[moodKey] ?? MOOD_WORDS.neutral_mid;
  const scenePool = SCENE_WORDS[harmony] ?? SCENE_WORDS.diverse;

  // Deterministic pick based on color ids
  const seed = hashString(colors.map((c) => c.id).join(","));
  const mood = moodPool[seed % moodPool.length];
  const scene = scenePool[(seed >> 4) % scenePool.length];

  return `${mood} ${scene}`;
}

export const MAX_SIZE = MAX_PALETTE_SIZE;
