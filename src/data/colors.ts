import { formatHsl, formatRgb, getColorFamily, hslToRgb, rgbToHex } from "@/src/lib/color-utils";
import type { ColorRecord } from "@/src/types/color";

const hueCatalog = [
  { hue: 0, root: "Crimson" },
  { hue: 5, root: "Scarlet" },
  { hue: 10, root: "Ruby" },
  { hue: 15, root: "Vermillion" },
  { hue: 20, root: "Ember" },
  { hue: 25, root: "Tangerine" },
  { hue: 30, root: "Coral" },
  { hue: 40, root: "Apricot" },
  { hue: 45, root: "Saffron" },
  { hue: 50, root: "Amber" },
  { hue: 55, root: "Canary" },
  { hue: 60, root: "Citrine" },
  { hue: 70, root: "Honey" },
  { hue: 75, root: "Chartreuse" },
  { hue: 80, root: "Olive" },
  { hue: 90, root: "Lime" },
  { hue: 100, root: "Moss" },
  { hue: 110, root: "Leaf" },
  { hue: 115, root: "Clover" },
  { hue: 120, root: "Emerald" },
  { hue: 130, root: "Mint" },
  { hue: 140, root: "Seafoam" },
  { hue: 145, root: "Celadon" },
  { hue: 150, root: "Jade" },
  { hue: 160, root: "Teal" },
  { hue: 170, root: "Lagoon" },
  { hue: 175, root: "Cyan" },
  { hue: 180, root: "Aqua" },
  { hue: 190, root: "Cerulean" },
  { hue: 200, root: "Azure" },
  { hue: 205, root: "Steel" },
  { hue: 210, root: "Sapphire" },
  { hue: 220, root: "Cobalt" },
  { hue: 230, root: "Indigo" },
  { hue: 240, root: "Iris" },
  { hue: 245, root: "Amethyst" },
  { hue: 250, root: "Violet" },
  { hue: 260, root: "Orchid" },
  { hue: 270, root: "Plum" },
  { hue: 280, root: "Mulberry" },
  { hue: 290, root: "Magenta" },
  { hue: 300, root: "Fuchsia" },
  { hue: 305, root: "Mauve" },
  { hue: 310, root: "Peony" },
  { hue: 320, root: "Rose" },
  { hue: 330, root: "Blush" },
  { hue: 340, root: "Garnet" },
  { hue: 350, root: "Merlot" },
] as const;

const lightBands = [
  { label: "Veil", lightness: 98 },
  { label: "Whisper", lightness: 94 },
  { label: "Mist", lightness: 90 },
  { label: "Pearl", lightness: 84 },
  { label: "Bloom", lightness: 76 },
  { label: "Silk", lightness: 68 },
  { label: "Tone", lightness: 60 },
  { label: "Radiant", lightness: 54 },
  { label: "Core", lightness: 48 },
  { label: "Velvet", lightness: 42 },
  { label: "Dusk", lightness: 34 },
  { label: "Shadow", lightness: 28 },
  { label: "Nocturne", lightness: 20 },
  { label: "Ink", lightness: 14 },
] as const;

const chromaBands = [
  { label: "Faint", saturation: 10 },
  { label: "Muted", saturation: 18 },
  { label: "Dust", saturation: 26 },
  { label: "Soft", saturation: 34 },
  { label: "Clear", saturation: 54 },
  { label: "Vivid", saturation: 74 },
  { label: "Bright", saturation: 84 },
  { label: "Pure", saturation: 92 },
] as const;

const toneCatalog = lightBands.flatMap(({ label: lightLabel, lightness }) =>
  chromaBands.map(({ label: chromaLabel, saturation }) => ({
    suffix: `${lightLabel} ${chromaLabel}`,
    saturation,
    lightness,
  })),
) as ReadonlyArray<{
  suffix: string;
  saturation: number;
  lightness: number;
}>;

function createColorId(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

const neutralCatalog = [
  { root: "Warm Gray", hue: 30, saturation: 6 },
  { root: "Taupe Gray", hue: 40, saturation: 5 },
  { root: "True Gray", hue: 0, saturation: 0 },
  { root: "Sage Gray", hue: 150, saturation: 5 },
  { root: "Cool Gray", hue: 210, saturation: 6 },
] as const;

function createColorDataset(): ColorRecord[] {
  // Main chromatic colors: 48 hues × 14 lightness × 8 saturation = 5,376
  const chromatic = hueCatalog.flatMap(({ hue, root }) =>
    toneCatalog.map(({ suffix, saturation, lightness }) => {
      const name = `${root} ${suffix}`;
      const rgbValue = hslToRgb(hue, saturation, lightness);

      return {
        id: createColorId(name),
        name,
        hex: rgbToHex(rgbValue),
        rgb: formatRgb(rgbValue),
        hsl: formatHsl(hue, saturation, lightness),
        hue,
        saturation,
        lightness,
        family: getColorFamily(hue),
      };
    }),
  );

  // Neutral grays: 5 groups × 14 lightness = 70
  const neutrals = neutralCatalog.flatMap(({ root, hue, saturation }) =>
    lightBands.map(({ label, lightness }) => {
      const name = `${root} ${label}`;
      const rgbValue = hslToRgb(hue, saturation, lightness);

      return {
        id: createColorId(name),
        name,
        hex: rgbToHex(rgbValue),
        rgb: formatRgb(rgbValue),
        hsl: formatHsl(hue, saturation, lightness),
        hue,
        saturation,
        lightness,
        family: getColorFamily(hue),
      };
    }),
  );

  return [...chromatic, ...neutrals];
}

export const colors: ColorRecord[] = createColorDataset();
