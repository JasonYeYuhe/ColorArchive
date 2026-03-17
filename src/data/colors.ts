import { formatHsl, formatRgb, getColorFamily, hslToRgb, rgbToHex } from "@/src/lib/color-utils";
import type { ColorRecord } from "@/src/types/color";

const hueCatalog = [
  { hue: 0, root: "Crimson" },
  { hue: 10, root: "Ruby" },
  { hue: 20, root: "Ember" },
  { hue: 30, root: "Coral" },
  { hue: 40, root: "Apricot" },
  { hue: 50, root: "Amber" },
  { hue: 60, root: "Citrine" },
  { hue: 70, root: "Honey" },
  { hue: 80, root: "Olive" },
  { hue: 90, root: "Lime" },
  { hue: 100, root: "Moss" },
  { hue: 110, root: "Leaf" },
  { hue: 120, root: "Emerald" },
  { hue: 130, root: "Mint" },
  { hue: 140, root: "Seafoam" },
  { hue: 150, root: "Jade" },
  { hue: 160, root: "Teal" },
  { hue: 170, root: "Lagoon" },
  { hue: 180, root: "Aqua" },
  { hue: 190, root: "Cerulean" },
  { hue: 200, root: "Azure" },
  { hue: 210, root: "Sapphire" },
  { hue: 220, root: "Cobalt" },
  { hue: 230, root: "Indigo" },
  { hue: 240, root: "Iris" },
  { hue: 250, root: "Violet" },
  { hue: 260, root: "Orchid" },
  { hue: 270, root: "Plum" },
  { hue: 280, root: "Mulberry" },
  { hue: 290, root: "Magenta" },
  { hue: 300, root: "Fuchsia" },
  { hue: 310, root: "Peony" },
  { hue: 320, root: "Rose" },
  { hue: 330, root: "Blush" },
  { hue: 340, root: "Garnet" },
  { hue: 350, root: "Merlot" },
] as const;

const toneCatalog = [
  { suffix: "Whisper", saturation: 20, lightness: 96 },
  { suffix: "Mist", saturation: 24, lightness: 92 },
  { suffix: "Pearl", saturation: 30, lightness: 86 },
  { suffix: "Bloom", saturation: 40, lightness: 78 },
  { suffix: "Silk", saturation: 52, lightness: 69 },
  { suffix: "Tone", saturation: 62, lightness: 60 },
  { suffix: "Core", saturation: 74, lightness: 52 },
  { suffix: "Velvet", saturation: 60, lightness: 44 },
  { suffix: "Dusk", saturation: 48, lightness: 35 },
  { suffix: "Shadow", saturation: 40, lightness: 27 },
  { suffix: "Nocturne", saturation: 32, lightness: 20 },
] as const;

function createColorId(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function createColorDataset(): ColorRecord[] {
  return hueCatalog.flatMap(({ hue, root }) =>
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
}

export const colors: ColorRecord[] = createColorDataset();
