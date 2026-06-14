/**
 * indexnow-ping.mjs
 *
 * Notifies IndexNow (Bing, Yandex, Seznam, Naver — and, importantly, the Bing
 * index that ChatGPT Search retrieves from) that key pages changed, so they get
 * re-crawled within hours instead of days. chatgpt.com is already this site's #2
 * external traffic source, so freshness on the Bing side is a real GEO lever.
 *
 * Runs automatically after `next build` via the "postbuild" npm script. It is
 * deliberately:
 *   - production-only (skips local + Vercel preview builds), and
 *   - never fatal — any failure is logged and the process still exits 0, so a
 *     flaky network call can never break a deploy.
 *
 * IndexNow only needs a freshness *signal*; we submit a curated high-value URL
 * set (engines then re-crawl and follow the sitemap to the rest).
 */

const KEY = "c0107a3b9f2d4e8a8b6c1d5e7f0a2b34";
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://colorarchive.org").replace(/\/$/, "");
const HOST = SITE_URL.replace(/^https?:\/\//, "");

// Only ping for real production deploys of the canonical domain.
const isVercelProd = process.env.VERCEL_ENV === "production";
const isCanonicalHost = HOST === "colorarchive.org";
if (!isVercelProd || !isCanonicalHost) {
  console.log(`[indexnow] skipped (VERCEL_ENV=${process.env.VERCEL_ENV ?? "none"}, host=${HOST})`);
  process.exit(0);
}

const paths = [
  "/",
  "/word-to-color/",
  "/all-colors/",
  "/collections/",
  "/guides/",
  "/families/",
  "/brands/",
  "/regions/",
  "/contrast/",
  "/convert/",
  "/gradient/",
  "/palette-generator/",
  "/tools/",
  // top guides (query-optimized titles + FAQ just shipped)
  "/guides/blue-color-psychology-branding-guide/",
  "/guides/film-cinematography-color-guide/",
  "/guides/color-trends-2026-design-guide/",
  "/guides/color-theory-fundamentals-guide/",
  "/guides/color-contrast-accessibility-guide/",
  "/guides/color-psychology-branding/",
  "/guides/cultural-color-meanings-guide/",
  "/guides/color-palette-for-logo-design/",
  // a sample of the new per-word pages (engines discover the rest via sitemap)
  "/word-to-color/quiet-luxury/",
  "/word-to-color/ocean/",
  "/word-to-color/sunset/",
  "/word-to-color/lavender/",
  "/word-to-color/emerald/",
  "/word-to-color/midnight/",
  "/word-to-color/forest/",
  "/word-to-color/sage/",
];

const urlList = paths.map((p) => `${SITE_URL}${p}`);

async function main() {
  const body = {
    host: HOST,
    key: KEY,
    keyLocation: `${SITE_URL}/${KEY}.txt`,
    urlList,
  };

  try {
    const res = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify(body),
    });
    console.log(`[indexnow] submitted ${urlList.length} URLs → HTTP ${res.status}`);
  } catch (err) {
    console.warn(`[indexnow] ping failed (non-fatal): ${err?.message ?? err}`);
  }
}

main().finally(() => process.exit(0));
