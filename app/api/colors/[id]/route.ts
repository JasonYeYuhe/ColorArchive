import { NextResponse } from "next/server";
import { colors } from "@/src/data/colors";
import {
  getAnalogousColors,
  getComplementaryColor,
  getNearestColors,
  getTriadicColors,
  getSplitComplementaryColors,
} from "@/src/lib/color-utils";

/**
 * GET /api/colors/:id
 *
 * Returns a single color with its relationships.
 * The id can be a slug (e.g., "crimson-veil-muted") or a hex code (e.g., "F5E6E8" or "f5e6e8").
 */
export function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return params.then(({ id }) => {
    // Try slug match first, then hex match
    let color = colors.find((c) => c.id === id);
    if (!color) {
      const hex = `#${id.toUpperCase()}`;
      color = colors.find((c) => c.hex === hex);
    }

    if (!color) {
      return NextResponse.json({ error: "Color not found" }, { status: 404 });
    }

    const analogous = getAnalogousColors(colors, color, 2);
    const complementary = getComplementaryColor(colors, color);
    const triadic = getTriadicColors(colors, color);
    const splitComp = getSplitComplementaryColors(colors, color);
    const nearest = getNearestColors(colors, color, 4);

    return NextResponse.json({
      ...color,
      relationships: {
        analogous,
        complementary,
        triadic,
        splitComplementary: splitComp,
        nearest,
      },
    }, {
      headers: {
        "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
      },
    });
  });
}
