import { ImageResponse } from "next/og";
import { SITE_DOMAIN } from "@/src/lib/site-config";

export const OG_SIZE = { width: 1200, height: 630 };

/**
 * Shared Open Graph card for palette-style pages (brands, regions, families):
 * a strip of the palette's colors over a title + subtitle. Returns an
 * ImageResponse so each route's opengraph-image.tsx stays a 6-line wrapper.
 */
export function paletteOgImage(opts: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  hexes: string[];
  footer?: string;
}) {
  const hexes = (opts.hexes.length > 0 ? opts.hexes : ["#2b2b33"]).slice(0, 6);

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
        <div style={{ display: "flex", height: 290 }}>
          {hexes.map((hex, i) => (
            <div key={`${hex}-${i}`} style={{ flex: 1, background: hex }} />
          ))}
        </div>
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "48px 64px",
          }}
        >
          <div
            style={{
              fontSize: 14,
              fontWeight: 600,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "#a0a0a0",
              marginBottom: 14,
            }}
          >
            {opts.eyebrow}
          </div>
          <div
            style={{
              fontSize: 60,
              fontWeight: 800,
              color: "#111111",
              lineHeight: 1.08,
              marginBottom: opts.subtitle ? 16 : 0,
            }}
          >
            {opts.title}
          </div>
          {opts.subtitle ? (
            <div
              style={{
                fontSize: 24,
                color: "#555555",
                lineHeight: 1.35,
                overflow: "hidden",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
              }}
            >
              {opts.subtitle}
            </div>
          ) : null}
        </div>
        <div
          style={{
            padding: "0 64px 40px",
            fontSize: 14,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "#bbbbbb",
          }}
        >
          {opts.footer ?? SITE_DOMAIN}
        </div>
      </div>
    ),
    { ...OG_SIZE },
  );
}
