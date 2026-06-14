import { ImageResponse } from "next/og";
import { generateColorFromWord } from "@/src/lib/word-color";
import { wordSeedBySlug, titleCaseWord } from "@/src/lib/word-to-color-seeds";
import { SITE_DOMAIN } from "@/src/lib/site-config";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Render on demand — don't prerender ~280 satori PNGs at build time
// (mirrors the guides OG decision). Vercel's CDN caches after first hit.
export const dynamic = "force-dynamic";

export default async function Image({
  params,
}: {
  params: Promise<{ word: string }>;
}) {
  const { word: slug } = await params;
  const word = wordSeedBySlug[slug];
  const generated = word ? generateColorFromWord(word) : null;
  if (!word || !generated) return new Response("Not found", { status: 404 });

  const display = titleCaseWord(word);
  const onColorText = generated.lightness > 58 ? "#111111" : "#ffffff";

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
        }}
      >
        {/* Left: the generated color with the word over it */}
        <div
          style={{
            width: "52%",
            height: "100%",
            background: generated.hex,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "64px",
          }}
        >
          <div
            style={{
              fontSize: 16,
              fontWeight: 600,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: onColorText,
              opacity: 0.7,
              marginBottom: 18,
            }}
          >
            Word to Color
          </div>
          <div
            style={{
              fontSize: 78,
              fontWeight: 800,
              lineHeight: 1.05,
              color: onColorText,
            }}
          >
            {display}
          </div>
        </div>

        {/* Right: hex + variant chips */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "60px 56px",
            background: "#ffffff",
          }}
        >
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: "0.16em",
              color: "#aaaaaa",
              textTransform: "uppercase",
              marginBottom: 12,
            }}
          >
            {generated.family}
          </div>
          <div
            style={{
              fontSize: 56,
              fontWeight: 800,
              fontFamily: "ui-monospace, monospace",
              color: "#111111",
              marginBottom: 36,
            }}
          >
            {generated.hex}
          </div>
          <div style={{ display: "flex", gap: 12, marginBottom: 44 }}>
            {generated.variants.map((v) => (
              <div
                key={v.label}
                style={{
                  width: 88,
                  height: 88,
                  borderRadius: 16,
                  background: v.hex,
                  border: "1px solid rgba(0,0,0,0.06)",
                }}
              />
            ))}
          </div>
          <div
            style={{
              fontSize: 13,
              color: "#bbbbbb",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
            }}
          >
            {`${SITE_DOMAIN} · word to color`}
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
