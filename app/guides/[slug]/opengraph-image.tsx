import { ImageResponse } from "next/og";
import { getLandingGuide, landingGuides } from "@/src/lib/guides";
import { getCollectionById } from "@/src/lib/collections";
import { SITE_DOMAIN } from "@/src/lib/site-config";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Parent guide page has dynamicParams=false. Pre-render all slugs so
// the OG route doesn't 500 at runtime.
export async function generateStaticParams() {
  return landingGuides.map((g) => ({ slug: g.slug }));
}

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const guide = getLandingGuide(slug);
  if (!guide) return new Response("Not found", { status: 404 });

  // If the guide references a featured collection, pull a hero color
  // to warm the left rail; otherwise use the brand mid-neutral.
  const collection = guide.featuredCollectionId
    ? getCollectionById(guide.featuredCollectionId)
    : undefined;
  const heroColor = collection?.palette[0]?.hex ?? "#2b2b33";

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
        {/* Left: hero color rail */}
        <div
          style={{
            width: "30%",
            height: "100%",
            background: heroColor,
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            padding: "40px",
          }}
        >
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: "0.18em",
              color: "rgba(255,255,255,0.82)",
              textTransform: "uppercase",
            }}
          >
            {guide.category}
          </div>
        </div>

        {/* Right: guide meta */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "60px 72px",
            background: "#ffffff",
          }}
        >
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: "0.18em",
              color: "#a0a0a0",
              textTransform: "uppercase",
              marginBottom: 16,
            }}
          >
            {guide.eyebrow}
          </div>
          <div
            style={{
              fontSize: 50,
              fontWeight: 800,
              color: "#111111",
              lineHeight: 1.12,
              marginBottom: 20,
              // clamp long titles
              overflow: "hidden",
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
            }}
          >
            {guide.title}
          </div>
          <div
            style={{
              fontSize: 20,
              color: "#555555",
              lineHeight: 1.4,
              marginBottom: 32,
              overflow: "hidden",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
          >
            {guide.summary}
          </div>
          <div
            style={{
              fontSize: 13,
              color: "#bbbbbb",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
            }}
          >
            {`${SITE_DOMAIN} · guide`}
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
