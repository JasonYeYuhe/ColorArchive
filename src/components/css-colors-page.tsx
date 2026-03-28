"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { CopyButton } from "@/src/components/copy-button";

/* ─── CSS Named Colors Data ──────────────────────────────────────────────────── */

interface CssColor {
  name: string;
  hex: string;
  rgb: [number, number, number];
  family: string;
  cssLevel: "CSS1" | "CSS2" | "CSS3" | "CSS4";
}

const CSS_COLORS: CssColor[] = [
  // Reds
  { name: "red", hex: "#FF0000", rgb: [255, 0, 0], family: "Red", cssLevel: "CSS1" },
  { name: "darkred", hex: "#8B0000", rgb: [139, 0, 0], family: "Red", cssLevel: "CSS3" },
  { name: "firebrick", hex: "#B22222", rgb: [178, 34, 34], family: "Red", cssLevel: "CSS3" },
  { name: "crimson", hex: "#DC143C", rgb: [220, 20, 60], family: "Red", cssLevel: "CSS3" },
  { name: "indianred", hex: "#CD5C5C", rgb: [205, 92, 92], family: "Red", cssLevel: "CSS3" },
  { name: "lightcoral", hex: "#F08080", rgb: [240, 128, 128], family: "Red", cssLevel: "CSS3" },
  { name: "salmon", hex: "#FA8072", rgb: [250, 128, 114], family: "Red", cssLevel: "CSS3" },
  { name: "darksalmon", hex: "#E9967A", rgb: [233, 150, 122], family: "Red", cssLevel: "CSS3" },
  { name: "lightsalmon", hex: "#FFA07A", rgb: [255, 160, 122], family: "Red", cssLevel: "CSS3" },
  // Pinks
  { name: "pink", hex: "#FFC0CB", rgb: [255, 192, 203], family: "Pink", cssLevel: "CSS3" },
  { name: "lightpink", hex: "#FFB6C1", rgb: [255, 182, 193], family: "Pink", cssLevel: "CSS3" },
  { name: "hotpink", hex: "#FF69B4", rgb: [255, 105, 180], family: "Pink", cssLevel: "CSS3" },
  { name: "deeppink", hex: "#FF1493", rgb: [255, 20, 147], family: "Pink", cssLevel: "CSS3" },
  { name: "mediumvioletred", hex: "#C71585", rgb: [199, 21, 133], family: "Pink", cssLevel: "CSS3" },
  { name: "palevioletred", hex: "#DB7093", rgb: [219, 112, 147], family: "Pink", cssLevel: "CSS3" },
  // Oranges
  { name: "orange", hex: "#FFA500", rgb: [255, 165, 0], family: "Orange", cssLevel: "CSS3" },
  { name: "darkorange", hex: "#FF8C00", rgb: [255, 140, 0], family: "Orange", cssLevel: "CSS3" },
  { name: "orangered", hex: "#FF4500", rgb: [255, 69, 0], family: "Orange", cssLevel: "CSS3" },
  { name: "tomato", hex: "#FF6347", rgb: [255, 99, 71], family: "Orange", cssLevel: "CSS3" },
  { name: "coral", hex: "#FF7F50", rgb: [255, 127, 80], family: "Orange", cssLevel: "CSS3" },
  // Yellows
  { name: "yellow", hex: "#FFFF00", rgb: [255, 255, 0], family: "Yellow", cssLevel: "CSS1" },
  { name: "lightyellow", hex: "#FFFFE0", rgb: [255, 255, 224], family: "Yellow", cssLevel: "CSS3" },
  { name: "lemonchiffon", hex: "#FFFACD", rgb: [255, 250, 205], family: "Yellow", cssLevel: "CSS3" },
  { name: "lightgoldenrodyellow", hex: "#FAFAD2", rgb: [250, 250, 210], family: "Yellow", cssLevel: "CSS3" },
  { name: "papayawhip", hex: "#FFEFD5", rgb: [255, 239, 213], family: "Yellow", cssLevel: "CSS3" },
  { name: "moccasin", hex: "#FFE4B5", rgb: [255, 228, 181], family: "Yellow", cssLevel: "CSS3" },
  { name: "peachpuff", hex: "#FFDAB9", rgb: [255, 218, 185], family: "Yellow", cssLevel: "CSS3" },
  { name: "palegoldenrod", hex: "#EEE8AA", rgb: [238, 232, 170], family: "Yellow", cssLevel: "CSS3" },
  { name: "khaki", hex: "#F0E68C", rgb: [240, 230, 140], family: "Yellow", cssLevel: "CSS3" },
  { name: "darkkhaki", hex: "#BDB76B", rgb: [189, 183, 107], family: "Yellow", cssLevel: "CSS3" },
  { name: "gold", hex: "#FFD700", rgb: [255, 215, 0], family: "Yellow", cssLevel: "CSS3" },
  // Greens
  { name: "green", hex: "#008000", rgb: [0, 128, 0], family: "Green", cssLevel: "CSS1" },
  { name: "lime", hex: "#00FF00", rgb: [0, 255, 0], family: "Green", cssLevel: "CSS1" },
  { name: "darkgreen", hex: "#006400", rgb: [0, 100, 0], family: "Green", cssLevel: "CSS3" },
  { name: "forestgreen", hex: "#228B22", rgb: [34, 139, 34], family: "Green", cssLevel: "CSS3" },
  { name: "seagreen", hex: "#2E8B57", rgb: [46, 139, 87], family: "Green", cssLevel: "CSS3" },
  { name: "mediumseagreen", hex: "#3CB371", rgb: [60, 179, 113], family: "Green", cssLevel: "CSS3" },
  { name: "limegreen", hex: "#32CD32", rgb: [50, 205, 50], family: "Green", cssLevel: "CSS3" },
  { name: "springgreen", hex: "#00FF7F", rgb: [0, 255, 127], family: "Green", cssLevel: "CSS3" },
  { name: "mediumspringgreen", hex: "#00FA9A", rgb: [0, 250, 154], family: "Green", cssLevel: "CSS3" },
  { name: "darkseagreen", hex: "#8FBC8F", rgb: [143, 188, 143], family: "Green", cssLevel: "CSS3" },
  { name: "lightgreen", hex: "#90EE90", rgb: [144, 238, 144], family: "Green", cssLevel: "CSS3" },
  { name: "palegreen", hex: "#98FB98", rgb: [152, 251, 152], family: "Green", cssLevel: "CSS3" },
  { name: "honeydew", hex: "#F0FFF0", rgb: [240, 255, 240], family: "Green", cssLevel: "CSS3" },
  { name: "chartreuse", hex: "#7FFF00", rgb: [127, 255, 0], family: "Green", cssLevel: "CSS3" },
  { name: "lawngreen", hex: "#7CFC00", rgb: [124, 252, 0], family: "Green", cssLevel: "CSS3" },
  { name: "greenyellow", hex: "#ADFF2F", rgb: [173, 255, 47], family: "Green", cssLevel: "CSS3" },
  { name: "yellowgreen", hex: "#9ACD32", rgb: [154, 205, 50], family: "Green", cssLevel: "CSS3" },
  { name: "olivedrab", hex: "#6B8E23", rgb: [107, 142, 35], family: "Green", cssLevel: "CSS3" },
  { name: "olive", hex: "#808000", rgb: [128, 128, 0], family: "Green", cssLevel: "CSS3" },
  { name: "darkolivegreen", hex: "#556B2F", rgb: [85, 107, 47], family: "Green", cssLevel: "CSS3" },
  // Cyans / Teals
  { name: "cyan", hex: "#00FFFF", rgb: [0, 255, 255], family: "Cyan", cssLevel: "CSS3" },
  { name: "aqua", hex: "#00FFFF", rgb: [0, 255, 255], family: "Cyan", cssLevel: "CSS1" },
  { name: "lightcyan", hex: "#E0FFFF", rgb: [224, 255, 255], family: "Cyan", cssLevel: "CSS3" },
  { name: "aquamarine", hex: "#7FFFD4", rgb: [127, 255, 212], family: "Cyan", cssLevel: "CSS3" },
  { name: "mediumaquamarine", hex: "#66CDAA", rgb: [102, 205, 170], family: "Cyan", cssLevel: "CSS3" },
  { name: "paleturquoise", hex: "#AFEEEE", rgb: [175, 238, 238], family: "Cyan", cssLevel: "CSS3" },
  { name: "turquoise", hex: "#40E0D0", rgb: [64, 224, 208], family: "Cyan", cssLevel: "CSS3" },
  { name: "mediumturquoise", hex: "#48D1CC", rgb: [72, 209, 204], family: "Cyan", cssLevel: "CSS3" },
  { name: "darkturquoise", hex: "#00CED1", rgb: [0, 206, 209], family: "Cyan", cssLevel: "CSS3" },
  { name: "lightseagreen", hex: "#20B2AA", rgb: [32, 178, 170], family: "Cyan", cssLevel: "CSS3" },
  { name: "cadetblue", hex: "#5F9EA0", rgb: [95, 158, 160], family: "Cyan", cssLevel: "CSS3" },
  { name: "darkcyan", hex: "#008B8B", rgb: [0, 139, 139], family: "Cyan", cssLevel: "CSS3" },
  { name: "teal", hex: "#008080", rgb: [0, 128, 128], family: "Cyan", cssLevel: "CSS3" },
  // Blues
  { name: "blue", hex: "#0000FF", rgb: [0, 0, 255], family: "Blue", cssLevel: "CSS1" },
  { name: "darkblue", hex: "#00008B", rgb: [0, 0, 139], family: "Blue", cssLevel: "CSS3" },
  { name: "navy", hex: "#000080", rgb: [0, 0, 128], family: "Blue", cssLevel: "CSS3" },
  { name: "mediumblue", hex: "#0000CD", rgb: [0, 0, 205], family: "Blue", cssLevel: "CSS3" },
  { name: "royalblue", hex: "#4169E1", rgb: [65, 105, 225], family: "Blue", cssLevel: "CSS3" },
  { name: "cornflowerblue", hex: "#6495ED", rgb: [100, 149, 237], family: "Blue", cssLevel: "CSS3" },
  { name: "dodgerblue", hex: "#1E90FF", rgb: [30, 144, 255], family: "Blue", cssLevel: "CSS3" },
  { name: "deepskyblue", hex: "#00BFFF", rgb: [0, 191, 255], family: "Blue", cssLevel: "CSS3" },
  { name: "lightskyblue", hex: "#87CEFA", rgb: [135, 206, 250], family: "Blue", cssLevel: "CSS3" },
  { name: "skyblue", hex: "#87CEEB", rgb: [135, 206, 235], family: "Blue", cssLevel: "CSS3" },
  { name: "lightblue", hex: "#ADD8E6", rgb: [173, 216, 230], family: "Blue", cssLevel: "CSS3" },
  { name: "powderblue", hex: "#B0E0E6", rgb: [176, 224, 230], family: "Blue", cssLevel: "CSS3" },
  { name: "lightsteelblue", hex: "#B0C4DE", rgb: [176, 196, 222], family: "Blue", cssLevel: "CSS3" },
  { name: "steelblue", hex: "#4682B4", rgb: [70, 130, 180], family: "Blue", cssLevel: "CSS3" },
  { name: "aliceblue", hex: "#F0F8FF", rgb: [240, 248, 255], family: "Blue", cssLevel: "CSS3" },
  { name: "slateblue", hex: "#6A5ACD", rgb: [106, 90, 205], family: "Blue", cssLevel: "CSS3" },
  { name: "darkslateblue", hex: "#483D8B", rgb: [72, 61, 139], family: "Blue", cssLevel: "CSS3" },
  { name: "mediumslateblue", hex: "#7B68EE", rgb: [123, 104, 238], family: "Blue", cssLevel: "CSS3" },
  // Purples / Violets
  { name: "purple", hex: "#800080", rgb: [128, 0, 128], family: "Purple", cssLevel: "CSS1" },
  { name: "magenta", hex: "#FF00FF", rgb: [255, 0, 255], family: "Purple", cssLevel: "CSS3" },
  { name: "fuchsia", hex: "#FF00FF", rgb: [255, 0, 255], family: "Purple", cssLevel: "CSS1" },
  { name: "darkmagenta", hex: "#8B008B", rgb: [139, 0, 139], family: "Purple", cssLevel: "CSS3" },
  { name: "darkviolet", hex: "#9400D3", rgb: [148, 0, 211], family: "Purple", cssLevel: "CSS3" },
  { name: "darkorchid", hex: "#9932CC", rgb: [153, 50, 204], family: "Purple", cssLevel: "CSS3" },
  { name: "blueviolet", hex: "#8A2BE2", rgb: [138, 43, 226], family: "Purple", cssLevel: "CSS3" },
  { name: "indigo", hex: "#4B0082", rgb: [75, 0, 130], family: "Purple", cssLevel: "CSS3" },
  { name: "rebeccapurple", hex: "#663399", rgb: [102, 51, 153], family: "Purple", cssLevel: "CSS4" },
  { name: "mediumpurple", hex: "#9370DB", rgb: [147, 112, 219], family: "Purple", cssLevel: "CSS3" },
  { name: "mediumorchid", hex: "#BA55D3", rgb: [186, 85, 211], family: "Purple", cssLevel: "CSS3" },
  { name: "orchid", hex: "#DA70D6", rgb: [218, 112, 214], family: "Purple", cssLevel: "CSS3" },
  { name: "violet", hex: "#EE82EE", rgb: [238, 130, 238], family: "Purple", cssLevel: "CSS3" },
  { name: "plum", hex: "#DDA0DD", rgb: [221, 160, 221], family: "Purple", cssLevel: "CSS3" },
  { name: "thistle", hex: "#D8BFD8", rgb: [216, 191, 216], family: "Purple", cssLevel: "CSS3" },
  { name: "lavender", hex: "#E6E6FA", rgb: [230, 230, 250], family: "Purple", cssLevel: "CSS3" },
  { name: "lavenderblush", hex: "#FFF0F5", rgb: [255, 240, 245], family: "Purple", cssLevel: "CSS3" },
  { name: "mistyrose", hex: "#FFE4E1", rgb: [255, 228, 225], family: "Pink", cssLevel: "CSS3" },
  // Browns
  { name: "brown", hex: "#A52A2A", rgb: [165, 42, 42], family: "Brown", cssLevel: "CSS3" },
  { name: "maroon", hex: "#800000", rgb: [128, 0, 0], family: "Brown", cssLevel: "CSS1" },
  { name: "saddlebrown", hex: "#8B4513", rgb: [139, 69, 19], family: "Brown", cssLevel: "CSS3" },
  { name: "sienna", hex: "#A0522D", rgb: [160, 82, 45], family: "Brown", cssLevel: "CSS3" },
  { name: "chocolate", hex: "#D2691E", rgb: [210, 105, 30], family: "Brown", cssLevel: "CSS3" },
  { name: "peru", hex: "#CD853F", rgb: [205, 133, 63], family: "Brown", cssLevel: "CSS3" },
  { name: "sandybrown", hex: "#F4A460", rgb: [244, 164, 96], family: "Brown", cssLevel: "CSS3" },
  { name: "burlywood", hex: "#DEB887", rgb: [222, 184, 135], family: "Brown", cssLevel: "CSS3" },
  { name: "tan", hex: "#D2B48C", rgb: [210, 180, 140], family: "Brown", cssLevel: "CSS3" },
  { name: "rosybrown", hex: "#BC8F8F", rgb: [188, 143, 143], family: "Brown", cssLevel: "CSS3" },
  { name: "moccasin", hex: "#FFE4B5", rgb: [255, 228, 181], family: "Brown", cssLevel: "CSS3" },
  { name: "navajowhite", hex: "#FFDEAD", rgb: [255, 222, 173], family: "Brown", cssLevel: "CSS3" },
  { name: "wheat", hex: "#F5DEB3", rgb: [245, 222, 179], family: "Brown", cssLevel: "CSS3" },
  { name: "bisque", hex: "#FFE4C4", rgb: [255, 228, 196], family: "Brown", cssLevel: "CSS3" },
  { name: "antiquewhite", hex: "#FAEBD7", rgb: [250, 235, 215], family: "Brown", cssLevel: "CSS3" },
  { name: "linen", hex: "#FAF0E6", rgb: [250, 240, 230], family: "Brown", cssLevel: "CSS3" },
  { name: "oldlace", hex: "#FDF5E6", rgb: [253, 245, 230], family: "Brown", cssLevel: "CSS3" },
  { name: "cornsilk", hex: "#FFF8DC", rgb: [255, 248, 220], family: "Brown", cssLevel: "CSS3" },
  { name: "blanchedalmond", hex: "#FFEBCD", rgb: [255, 235, 205], family: "Brown", cssLevel: "CSS3" },
  // Whites / Off-whites
  { name: "white", hex: "#FFFFFF", rgb: [255, 255, 255], family: "White", cssLevel: "CSS1" },
  { name: "snow", hex: "#FFFAFA", rgb: [255, 250, 250], family: "White", cssLevel: "CSS3" },
  { name: "ivory", hex: "#FFFFF0", rgb: [255, 255, 240], family: "White", cssLevel: "CSS3" },
  { name: "floralwhite", hex: "#FFFAF0", rgb: [255, 250, 240], family: "White", cssLevel: "CSS3" },
  { name: "seashell", hex: "#FFF5EE", rgb: [255, 245, 238], family: "White", cssLevel: "CSS3" },
  { name: "whitesmoke", hex: "#F5F5F5", rgb: [245, 245, 245], family: "White", cssLevel: "CSS3" },
  { name: "ghostwhite", hex: "#F8F8FF", rgb: [248, 248, 255], family: "White", cssLevel: "CSS3" },
  { name: "mintcream", hex: "#F5FFFA", rgb: [245, 255, 250], family: "White", cssLevel: "CSS3" },
  { name: "azure", hex: "#F0FFFF", rgb: [240, 255, 255], family: "White", cssLevel: "CSS3" },
  // Grays / Blacks
  { name: "black", hex: "#000000", rgb: [0, 0, 0], family: "Gray", cssLevel: "CSS1" },
  { name: "darkgray", hex: "#A9A9A9", rgb: [169, 169, 169], family: "Gray", cssLevel: "CSS3" },
  { name: "gray", hex: "#808080", rgb: [128, 128, 128], family: "Gray", cssLevel: "CSS1" },
  { name: "darkgrey", hex: "#A9A9A9", rgb: [169, 169, 169], family: "Gray", cssLevel: "CSS3" },
  { name: "grey", hex: "#808080", rgb: [128, 128, 128], family: "Gray", cssLevel: "CSS3" },
  { name: "silver", hex: "#C0C0C0", rgb: [192, 192, 192], family: "Gray", cssLevel: "CSS1" },
  { name: "lightgray", hex: "#D3D3D3", rgb: [211, 211, 211], family: "Gray", cssLevel: "CSS3" },
  { name: "lightgrey", hex: "#D3D3D3", rgb: [211, 211, 211], family: "Gray", cssLevel: "CSS3" },
  { name: "gainsboro", hex: "#DCDCDC", rgb: [220, 220, 220], family: "Gray", cssLevel: "CSS3" },
  { name: "slategray", hex: "#708090", rgb: [112, 128, 144], family: "Gray", cssLevel: "CSS3" },
  { name: "slategrey", hex: "#708090", rgb: [112, 128, 144], family: "Gray", cssLevel: "CSS3" },
  { name: "lightslategray", hex: "#778899", rgb: [119, 136, 153], family: "Gray", cssLevel: "CSS3" },
  { name: "lightslategrey", hex: "#778899", rgb: [119, 136, 153], family: "Gray", cssLevel: "CSS3" },
  { name: "dimgray", hex: "#696969", rgb: [105, 105, 105], family: "Gray", cssLevel: "CSS3" },
  { name: "dimgrey", hex: "#696969", rgb: [105, 105, 105], family: "Gray", cssLevel: "CSS3" },
  { name: "darkslategray", hex: "#2F4F4F", rgb: [47, 79, 79], family: "Gray", cssLevel: "CSS3" },
  { name: "darkslategrey", hex: "#2F4F4F", rgb: [47, 79, 79], family: "Gray", cssLevel: "CSS3" },
  // Special
  { name: "transparent", hex: "#00000000", rgb: [0, 0, 0], family: "Special", cssLevel: "CSS3" },
];

const FAMILIES = ["All", "Red", "Pink", "Orange", "Yellow", "Green", "Cyan", "Blue", "Purple", "Brown", "White", "Gray", "Special"];
const CSS_LEVELS = ["All", "CSS1", "CSS2", "CSS3", "CSS4"];

const LEVEL_COLORS: Record<string, string> = {
  CSS1: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  CSS2: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  CSS3: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
  CSS4: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
};

function hexToHsl(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
}

function isLight(hex: string): boolean {
  if (hex.length < 7) return true;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) > 128;
}


function ColorCard({ color }: { color: CssColor }) {
  const [hovered, setHovered] = useState(false);
  const light = isLight(color.hex.slice(0, 7));
  const hsl = color.hex.length > 7 ? "transparent" : hexToHsl(color.hex);
  const rgbStr = `rgb(${color.rgb[0]}, ${color.rgb[1]}, ${color.rgb[2]})`;

  return (
    <div
      className="group flex flex-col overflow-hidden rounded-xl border border-black/8 bg-white transition hover:shadow-md dark:border-white/8 dark:bg-neutral-900"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Swatch */}
      <div
        className="relative h-20 w-full transition-all duration-300"
        style={{ backgroundColor: color.hex.length > 7 ? "transparent" : color.hex, backgroundImage: color.hex.length > 7 ? "linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)" : undefined, backgroundSize: "16px 16px", backgroundPosition: "0 0, 0 8px, 8px -8px, -8px 0px" }}
      >
        {hovered && color.hex.length <= 7 && (
          <div className={`absolute inset-0 flex items-center justify-center gap-1.5 bg-black/10`}>
            <CopyButton value={color.name} label="name" variant="compact" className="rounded border border-black/8 bg-neutral-50 px-2 py-0.5 font-mono text-[10px] text-neutral-600 transition hover:bg-neutral-900 hover:text-white dark:border-white/10 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-white dark:hover:text-neutral-950" />
            <CopyButton value={color.hex} label="hex" variant="compact" className="rounded border border-black/8 bg-neutral-50 px-2 py-0.5 font-mono text-[10px] text-neutral-600 transition hover:bg-neutral-900 hover:text-white dark:border-white/10 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-white dark:hover:text-neutral-950" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col gap-1.5 p-3">
        <div className="flex items-start justify-between gap-1">
          <span className="font-mono text-xs font-semibold text-neutral-900 dark:text-neutral-100 break-all leading-tight">
            {color.name}
          </span>
          <span className={`shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider ${LEVEL_COLORS[color.cssLevel]}`}>
            {color.cssLevel}
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="font-mono text-[10px] text-neutral-500 dark:text-neutral-400">{color.hex.length > 7 ? "transparent" : color.hex}</span>
          <span className="font-mono text-[10px] text-neutral-400 dark:text-neutral-500">{rgbStr}</span>
          {color.hex.length <= 7 && (
            <span className="font-mono text-[10px] text-neutral-400 dark:text-neutral-500">{hsl}</span>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────────────────────────────── */

export function CssColorsPage() {
  const [query, setQuery] = useState("");
  const [family, setFamily] = useState("All");
  const [level, setLevel] = useState("All");

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return CSS_COLORS.filter((c) => {
      if (family !== "All" && c.family !== family) return false;
      if (level !== "All" && c.cssLevel !== level) return false;
      if (q && !c.name.includes(q) && !c.hex.toLowerCase().includes(q) && !c.family.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [query, family, level]);

  const stats = useMemo(() => {
    const unique = CSS_COLORS.filter((c) => c.hex.length <= 7);
    const byLevel: Record<string, number> = {};
    CSS_COLORS.forEach((c) => { byLevel[c.cssLevel] = (byLevel[c.cssLevel] ?? 0) + 1; });
    return { total: CSS_COLORS.length, byLevel };
  }, []);

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 pb-24 pt-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <p className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-400">Developer Reference</p>
        <h1 className="mb-3 text-3xl font-bold tracking-tight text-neutral-950 dark:text-white sm:text-4xl">
          CSS Named Colors
        </h1>
        <p className="max-w-2xl text-base text-neutral-600 dark:text-neutral-400">
          Complete reference for all {CSS_COLORS.length} CSS named color keywords. Includes hex, RGB, and HSL values
          for every color — from CSS Level 1 basics to CSS Level 4's{" "}
          <code className="rounded bg-neutral-100 px-1 py-0.5 font-mono text-xs dark:bg-neutral-800">rebeccapurple</code>.
        </p>
        {/* Stats */}
        <div className="mt-4 flex flex-wrap gap-3">
          {Object.entries(stats.byLevel).map(([lvl, count]) => (
            <span key={lvl} className={`rounded-full px-3 py-1 text-xs font-medium ${LEVEL_COLORS[lvl]}`}>
              {lvl}: {count} colors
            </span>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search color name or hex…"
          className="h-10 flex-1 rounded-xl border border-black/10 bg-white px-4 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-white/10 dark:bg-neutral-800 dark:text-white dark:placeholder:text-neutral-500"
        />
        <div className="flex gap-2 flex-wrap">
          <select
            value={family}
            onChange={(e) => setFamily(e.target.value)}
            className="h-10 rounded-xl border border-black/10 bg-white px-3 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-white/10 dark:bg-neutral-800 dark:text-white"
          >
            {FAMILIES.map((f) => (
              <option key={f} value={f}>{f === "All" ? "All Families" : f}</option>
            ))}
          </select>
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="h-10 rounded-xl border border-black/10 bg-white px-3 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-white/10 dark:bg-neutral-800 dark:text-white"
          >
            {CSS_LEVELS.map((l) => (
              <option key={l} value={l}>{l === "All" ? "All CSS Levels" : l}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Results count */}
      <p className="mb-4 text-sm text-neutral-500 dark:text-neutral-400">
        {filtered.length === CSS_COLORS.length
          ? `${CSS_COLORS.length} named colors`
          : `${filtered.length} of ${CSS_COLORS.length} colors`}
      </p>

      {/* Color Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {filtered.map((color) => (
            <ColorCard key={color.name} color={color} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="text-neutral-400">No colors match your filters.</p>
          <button
            type="button"
            onClick={() => { setQuery(""); setFamily("All"); setLevel("All"); }}
            className="mt-3 text-sm text-blue-600 hover:underline dark:text-blue-400"
          >
            Clear filters
          </button>
        </div>
      )}

      {/* Info Section */}
      <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-black/8 bg-white p-6 dark:border-white/8 dark:bg-neutral-900">
          <h2 className="mb-2 text-sm font-semibold text-neutral-900 dark:text-white">CSS Level 1 (1996)</h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            16 basic colors defined in the original CSS specification: aqua, black, blue, fuchsia, gray, green, lime, maroon, navy, olive, purple, red, silver, teal, white, and yellow.
          </p>
        </div>
        <div className="rounded-2xl border border-black/8 bg-white p-6 dark:border-white/8 dark:bg-neutral-900">
          <h2 className="mb-2 text-sm font-semibold text-neutral-900 dark:text-white">CSS Level 3 (2011)</h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Expanded to 147 named colors, adding the full X11 color set. Includes color aliases like <code className="rounded bg-neutral-100 px-1 font-mono text-xs dark:bg-neutral-800">grey</code> variants and <code className="rounded bg-neutral-100 px-1 font-mono text-xs dark:bg-neutral-800">transparent</code> as a keyword.
          </p>
        </div>
        <div className="rounded-2xl border border-black/8 bg-white p-6 dark:border-white/8 dark:bg-neutral-900">
          <h2 className="mb-2 text-sm font-semibold text-neutral-900 dark:text-white">CSS Level 4 (2022)</h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Added <code className="rounded bg-neutral-100 px-1 font-mono text-xs dark:bg-neutral-800">rebeccapurple</code> (#663399) — named in honor of Rebecca Meyer, daughter of web pioneer Eric Meyer. The only new named color in CSS4.
          </p>
        </div>
      </div>

      {/* Related tools */}
      <div className="mt-10 flex flex-wrap gap-3">
        <Link href="/convert/" className="rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm text-neutral-700 transition hover:border-black/20 hover:shadow-sm dark:border-white/10 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:border-white/20">
          Color Converter
        </Link>
        <Link href="/contrast/" className="rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm text-neutral-700 transition hover:border-black/20 hover:shadow-sm dark:border-white/10 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:border-white/20">
          Contrast Checker
        </Link>
        <Link href="/tints/" className="rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm text-neutral-700 transition hover:border-black/20 hover:shadow-sm dark:border-white/10 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:border-white/20">
          Tints &amp; Shades
        </Link>
        <Link href="/tokens/" className="rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm text-neutral-700 transition hover:border-black/20 hover:shadow-sm dark:border-white/10 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:border-white/20">
          Design Tokens
        </Link>
      </div>
    </main>
  );
}
