import { ImageResponse } from "next/og";
import { getNewsletterIssue } from "@/src/lib/newsletter-issues";
import { getCollectionById } from "@/src/lib/collections";
import { SITE_DOMAIN } from "@/src/lib/site-config";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Render on demand (like guides/collections) — Vercel's CDN caches the PNG after the first
// request. Per-note cards make shared Notes links render the post title instead of the
// generic brand image (distribution win for the thought-leadership / a11y-pain hook).
export const dynamic = "force-dynamic";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const issue = getNewsletterIssue(slug);
  if (!issue) return new Response("Not found", { status: 404 });

  const collection = issue.featuredCollectionId
    ? getCollectionById(issue.featuredCollectionId)
    : undefined;
  const heroColor = collection?.palette?.[0]?.hex ?? "#2b2b33";
  const eyebrow = (issue.tags && issue.tags[0]) || "Notes";

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
            Notes
          </div>
        </div>

        {/* Right: note meta */}
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
            {eyebrow}
          </div>
          <div
            style={{
              fontSize: 50,
              fontWeight: 800,
              color: "#111111",
              lineHeight: 1.12,
              marginBottom: 20,
              overflow: "hidden",
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
            }}
          >
            {issue.title}
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
            {issue.summary}
          </div>
          <div
            style={{
              fontSize: 13,
              color: "#bbbbbb",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
            }}
          >
            {`${SITE_DOMAIN} · notes`}
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
