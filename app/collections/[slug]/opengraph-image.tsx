import { ImageResponse } from "next/og";
import { collections } from "@/src/lib/collections";
import { SITE_DOMAIN } from "@/src/lib/site-config";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const collection = collections.find((c) => c.id === slug);
  if (!collection) return new Response("Not found", { status: 404 });

  // Take up to 5 swatches from the palette for a horizontal strip.
  // Pinterest previews at 1200×630 — five swatches at 240px wide = full width.
  const swatches = collection.palette.slice(0, 5);
  const stripHeight = 320;

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
        {/* Palette strip */}
        <div style={{ display: "flex", width: "100%", height: stripHeight }}>
          {swatches.map((swatch) => (
            <div
              key={swatch.id}
              style={{ flex: 1, background: swatch.hex }}
            />
          ))}
        </div>

        {/* Metadata */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "48px 60px",
          }}
        >
          <div
            style={{
              fontSize: 14,
              fontWeight: 600,
              letterSpacing: "0.18em",
              color: "#9a9a9a",
              textTransform: "uppercase",
              marginBottom: 16,
            }}
          >
            {collection.tags.slice(0, 3).join(" · ")}
          </div>
          <div
            style={{
              fontSize: 56,
              fontWeight: 800,
              color: "#111111",
              lineHeight: 1.1,
              marginBottom: 16,
            }}
          >
            {collection.title}
          </div>
          <div
            style={{
              fontSize: 22,
              color: "#555555",
              lineHeight: 1.35,
              marginBottom: 32,
              // clamp to a short overview
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
          >
            {collection.summary}
          </div>
          <div
            style={{
              fontSize: 13,
              color: "#bbbbbb",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
            }}
          >
            {SITE_DOMAIN} · collection
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
