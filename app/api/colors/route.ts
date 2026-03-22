import { NextRequest, NextResponse } from "next/server";
import { colors } from "@/src/data/colors";
import { filterColors } from "@/src/lib/color-search";
import { sortColors } from "@/src/lib/color-filter";
import type { ColorFamily, SortOption } from "@/src/types/color";

const VALID_FAMILIES = ["Red", "Orange", "Yellow", "Lime", "Green", "Teal", "Blue", "Purple", "Pink"] as const;
const VALID_SORTS = ["hue", "lightness", "name"] as const;

/**
 * GET /api/colors
 *
 * Query params:
 *   q       — search query (name, hex, or semantic keyword like "sunset")
 *   family  — color family filter: Red | Orange | Yellow | Lime | Green | Teal | Blue | Purple | Pink
 *   sort    — sort order: hue | lightness | name (default: hue)
 *   limit   — max results (default: 50, max: 200)
 *   offset  — pagination offset (default: 0)
 */
export function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const q = searchParams.get("q") ?? "";
  const familyParam = searchParams.get("family") ?? "All";
  const sortParam = searchParams.get("sort") ?? "hue";
  const limit = Math.min(Math.max(1, Number(searchParams.get("limit")) || 50), 200);
  const offset = Math.max(0, Number(searchParams.get("offset")) || 0);

  // Validate family
  const family: ColorFamily | "All" =
    familyParam === "All" || (VALID_FAMILIES as readonly string[]).includes(familyParam)
      ? (familyParam as ColorFamily | "All")
      : "All";

  // Validate sort
  const sort: SortOption =
    (VALID_SORTS as readonly string[]).includes(sortParam)
      ? (sortParam as SortOption)
      : "hue";

  // Filter + sort
  const filtered = filterColors(colors, q, family);
  const sorted = sortColors(filtered, sort);

  // Paginate
  const page = sorted.slice(offset, offset + limit);

  return NextResponse.json({
    total: sorted.length,
    limit,
    offset,
    colors: page,
  }, {
    headers: {
      "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
    },
  });
}
