export type ColorFamily =
  | "Red"
  | "Orange"
  | "Yellow"
  | "Lime"
  | "Green"
  | "Teal"
  | "Blue"
  | "Purple"
  | "Pink";

export type SortOption = "hue" | "lightness" | "name";

export interface ColorRecord {
  id: string;
  name: string;
  hex: string;
  rgb: string;
  hsl: string;
  hue: number;
  saturation: number;
  lightness: number;
  family: ColorFamily;
}
