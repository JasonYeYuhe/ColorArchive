import { ImageResponse } from "next/og";

import { colors } from "@/src/data/colors";
import { hslToRgb } from "@/src/lib/color-convert";
import { prefersDarkText } from "@/src/lib/color-contrast";
import { buildPinPalette } from "@/src/lib/pin-palette";
import { SITE_DOMAIN } from "@/src/lib/site-config";
import type { ColorRecord } from "@/src/types/color";

/**
 * Pinterest-only pin image — 1000×1500 (2:3).
 *
 * ─── WHY A SEPARATE ROUTE AND NOT A CHANGE TO opengraph-image ──────────────
 *
 * `app/colors/[slug]/opengraph-image.tsx` is 1200×630 because that is what
 * Open Graph and Twitter cards want, and it is what every share of a colour page
 * renders as. Pinterest wants the opposite shape. Editing the OG image to suit
 * Pinterest would silently change how every link to this site looks everywhere
 * else, so the two are separate files with separate jobs.
 *
 * ─── WHY THIS EXISTS AT ALL (measured 2026-09-01) ──────────────────────────
 *
 * 78 pins published daily since 2026-06-10 earned, in total: 833 impressions,
 * 3 saves, 6 pin clicks, 0 outbound clicks, 0 sessions. Age-fair, a pin gets
 * 0.05 impressions in its first WEEK — 71 of 74 measured pins got exactly zero.
 * Pinterest is not distributing this account, and every pin it did not
 * distribute was a 1.90:1 landscape image in a portrait-first feed.
 *
 * ─── THIS DELIBERATELY CHANGES TWO THINGS AT ONCE ──────────────────────────
 *
 * Geometry (1.90:1 → 0.67:1) AND content (one flat swatch → a five-colour
 * palette). That confounds them, and it is on purpose:
 *
 *   The gap to close is not 2×. To land one visitor a week at a normal 0.2%
 *   outbound CTR you need ~500 impressions/week; the whole account currently
 *   earns ~10/day. That is a ~50× gap. Neither factor alone plausibly covers it,
 *   so isolating them would spend the measurement window proving that a
 *   sufficient-by-itself factor does not exist. Bundling asks the question that
 *   matters first — does the creative axis move this at all — and decomposition
 *   is only worth buying if the answer is yes.
 *
 * The palette half also happens to be the dev plan's §6.4 ("what gets saved on
 * Pinterest is palettes, not swatches"), so the two branches it framed as
 * either/or are both addressed by this one image.
 *
 * ─── SATORI CONSTRAINTS (next/og) ──────────────────────────────────────────
 * Flexbox only, no grid. Every element with more than one child needs an
 * explicit `display: "flex"`. No shorthand `background` gradients beyond what
 * satori supports. Keep to the vocabulary the two existing og-image routes use.
 */

// Render on demand, never at build time. There are 5,446 colours; prerendering
// satori PNGs for them would blow both the build and the 80 MB deployment-output
// cap that app/colors/[slug]/page.tsx already prerenders a 3,066-colour SUBSET to
// stay under.
export const dynamic = "force-dynamic";

/**
 * 🔴 next/og does NOT cache. Verified in
 * node_modules/next/dist/server/og/image-response.js:39 — ImageResponse hardcodes
 * `cache-control: public, max-age=0, must-revalidate` in production, so without
 * the override below EVERY request re-runs satori. An earlier version of this
 * comment claimed "Vercel's CDN caches each PNG after its first request"; that
 * was simply false, and it was the assumption holding up the cost argument for
 * a per-colour dynamic route on a site where a crawled dynamic /colors/ route
 * once became the single largest line on the Vercel bill (see app/robots.ts).
 *
 * The image is a pure function of the slug and of generated colour data, and a
 * design change ships in a deploy that invalidates the CDN anyway — so it is
 * safe to cache at the edge effectively forever. That turns the worst case from
 * "one satori render per request, unbounded" into "one render per slug, 5,446
 * max", which is what makes it safe to leave crawlable.
 *
 * `noindex` keeps the PNGs out of search results without blocking the fetch —
 * unlike a robots.txt Disallow, which Pinterest's own ingester would obey.
 */
const IMAGE_HEADERS = {
  "cache-control": "public, max-age=0, s-maxage=31536000, stale-while-revalidate=86400",
  "x-robots-tag": "noindex",
};

const WIDTH = 1000;
const HEIGHT = 1500;
const HERO_H = 820;
const PALETTE_H = 380;

function textOn(color: ColorRecord): string {
  const { r, g, b } = hslToRgb(color.hue, color.saturation, color.lightness);
  return prefersDarkText(r, g, b) ? "#14161a" : "#ffffff";
}

/**
 * The eyebrow above the name.
 *
 * `color.family` buckets by hue, so the five neutral gray roots inherit whatever
 * hue they were built around: Warm Gray Whisper comes back "Orange". That is
 * correct for filtering and wrong for a reader — "ORANGE / Warm Gray Whisper" on
 * a pin just looks like a mistake. Relabel it here, in the presentation, rather
 * than touching the shared classification the whole site filters on.
 *
 * Neutral ids are `{root}-{lightness}` with no chroma token, and every root ends
 * in "gray" — so the second segment is the test (CLAUDE.md, "Color ID Naming").
 */
function eyebrowFor(color: ColorRecord): string {
  return color.id.split("-")[1] === "gray" ? "Neutral" : color.family;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const color = colors.find((c) => c.id === slug);
  if (!color) return new Response("Not found", { status: 404 });

  const ink = textOn(color);
  const palette = buildPinPalette(colors, color);

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          background: "#ffffff",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
        }}
      >
        {/* ── Hero: the colour itself, with its name set ON it ───────────── */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            width: "100%",
            height: HERO_H,
            background: color.hex,
            padding: "0 72px 64px 72px",
          }}
        >
          <div
            style={{
              fontSize: 26,
              fontWeight: 600,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: ink,
              opacity: 0.72,
              marginBottom: 22,
            }}
          >
            {eyebrowFor(color)}
          </div>
          <div
            style={{
              fontSize: 92,
              fontWeight: 800,
              lineHeight: 1.05,
              color: ink,
              marginBottom: 18,
            }}
          >
            {color.name}
          </div>
          <div
            style={{
              fontSize: 52,
              fontFamily: "ui-monospace, monospace",
              letterSpacing: "0.04em",
              color: ink,
              opacity: 0.86,
            }}
          >
            {color.hex}
          </div>
        </div>

        {/* ── The palette: the part worth saving ─────────────────────────── */}
        <div style={{ display: "flex", width: "100%", height: PALETTE_H }}>
          {palette.map((swatch) => (
            <div
              key={swatch.id}
              style={{
                display: "flex",
                flexDirection: "column",
                flex: 1,
                height: "100%",
              }}
            >
              <div style={{ display: "flex", flex: 1, background: swatch.hex }} />
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: 92,
                  background: "#ffffff",
                  fontSize: 24,
                  fontFamily: "ui-monospace, monospace",
                  color: "#4a4a4a",
                  letterSpacing: "0.02em",
                }}
              >
                {swatch.hex}
              </div>
            </div>
          ))}
        </div>

        {/* ── Footer ─────────────────────────────────────────────────────── */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            justifyContent: "center",
            padding: "0 72px",
            background: "#ffffff",
          }}
        >
          <div
            style={{
              fontSize: 34,
              fontWeight: 700,
              color: "#111111",
              marginBottom: 14,
            }}
          >
            {/* One expression, not text + expression: satori counts JSX children,
                and two of them on a div without display:flex is a hard error. */}
            {`Palette built around ${color.name}`}
          </div>
          <div style={{ fontSize: 26, color: "#6b6b6b", marginBottom: 26 }}>
            {`5,446 colors · free CSS, Tailwind and Figma exports`}
          </div>
          <div
            style={{
              fontSize: 24,
              fontWeight: 600,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "#b4b4b4",
            }}
          >
            {SITE_DOMAIN}
          </div>
        </div>
      </div>
    ),
    { width: WIDTH, height: HEIGHT, headers: IMAGE_HEADERS },
  );
}
