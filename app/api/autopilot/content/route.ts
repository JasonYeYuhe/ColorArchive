import { NextResponse } from "next/server";
import { collections } from "@/src/lib/collections";
import { landingGuides } from "@/src/lib/guides";

/**
 * Read-only JSON snapshot of pinnable content (collections + guides)
 * for the autopilot pin-scheduler on the DO Droplet. The server-side
 * scheduler cannot `require()` our TS modules, so it fetches this
 * endpoint once per day to build its rotation.
 *
 * No auth: all fields are already public on the public pages. The
 * endpoint is cacheable at the CDN.
 */

export const dynamic = "force-static";
export const revalidate = 3600; // 1 hour

export async function GET() {
  const collectionPayload = collections.map((c) => ({
    slug: c.id,
    title: c.title,
    summary: c.summary,
    tags: c.tags,
    paletteHex: c.palette.slice(0, 5).map((p) => p.hex),
  }));

  const guidePayload = landingGuides.map((g) => ({
    slug: g.slug,
    title: g.title,
    summary: g.summary,
    category: g.category,
    eyebrow: g.eyebrow,
  }));

  return NextResponse.json({
    generated_at: new Date().toISOString(),
    collections: collectionPayload,
    guides: guidePayload,
  });
}
