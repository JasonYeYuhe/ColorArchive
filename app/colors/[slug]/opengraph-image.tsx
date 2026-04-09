import { ImageResponse } from "next/og";
import { colors } from "@/src/data/colors";
import { SITE_DOMAIN } from "@/src/lib/site-config";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const color = colors.find((c) => c.id === slug);
  if (!color) return new Response("Not found", { status: 404 });

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
        {/* Left: color swatch */}
        <div style={{ width: "55%", height: "100%", background: color.hex }} />

        {/* Right: metadata */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "60px 52px",
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
              marginBottom: 16,
            }}
          >
            {color.family}
          </div>
          <div
            style={{
              fontSize: 44,
              fontWeight: 800,
              color: "#111111",
              lineHeight: 1.15,
              marginBottom: 20,
            }}
          >
            {color.name}
          </div>
          <div
            style={{
              fontSize: 28,
              fontFamily: "ui-monospace, monospace",
              color: "#444444",
              marginBottom: 48,
            }}
          >
            {color.hex}
          </div>
          <div
            style={{
              fontSize: 13,
              color: "#bbbbbb",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
          >
            {SITE_DOMAIN}
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
