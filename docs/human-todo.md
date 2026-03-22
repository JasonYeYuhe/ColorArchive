# Human TODO — ColorArchive

> Things the autopilot can't do. Jason handles these when he picks up the project.
> Last updated: 2026-03-23

## High Priority

- [ ] **Review duplicate newsletter slug pattern** — Multiple concurrent autopilot sessions created some content with overlapping topics. Issues 094 and the original 098 both covered "Color in motion design." The duplicate was replaced with an AI-design topic, but worth reviewing the 98-102 range for any remaining quality/coherence issues.
- [ ] **Verify Lemon Squeezy store status** — Commerce integration is coded but store may still be pending approval. Check if checkout URLs are live and purchase flow works end-to-end.
- [ ] **Pinterest OAuth flow** — Pinterest Save button was added. Verify the OAuth redirect/callback works in production (https://colorarchive.me) since localhost testing may differ from deployed behavior. The `PINTEREST_APP_ID`, `PINTEREST_APP_SECRET`, and `PINTEREST_REDIRECT_URI` env vars need to be set in Vercel.
- [ ] **TikTok admin page** — There's an `app/admin/tiktok/` directory in the untracked files. This may need review/cleanup or deployment.
- [ ] **Session lock race conditions** — Multiple autopilot instances ran concurrently despite the lock system. Investigate why the 20-minute stale lock check is triggering too aggressively. Consider increasing the stale lock threshold to 30 minutes.

## Medium Priority

- [ ] **OG images for new tool pages** — /mixer/ has a generic OG image. Consider generating a custom OG image showing the color blending interface for better social sharing.
- [ ] **Newsletter count in sitemap** — Sitemap may need updating if new note slugs aren't being generated statically. Run `npm run build` and verify /notes/ pages build correctly.
- [ ] **Collection color IDs audit** — A commit `692cc6c Fix broken collection color IDs` was pushed by an automated session. Worth reviewing which collections had broken IDs and whether the fixes are correct.
- [ ] **Terms page** — There's an untracked `src/components/terms-page.tsx` and `app/terms/` directory. If these are ready, they should be committed.
- [ ] **i18n-merged.ts, i18n-part1.ts, i18n-part2.ts** — Untracked files in src/lib/. These look like working files from an i18n split/merge operation. Should be cleaned up or committed.

## Low Priority / Nice to Have

- [ ] **Color Mixer OG preview** — A screenshot or visual showing the mixer at work would improve the /mixer/ page's social sharing appearance.
- [ ] **Test new collections in Figma plugin** — The Figma plugin shows color families; verify the 5 new collections (aurora-veil, desert-amber, arctic-minimal, amber-manuscript, sage-terrarium, dusk-coral) appear correctly.
- [ ] **Performance audit** — Site has grown significantly (2016 colors + 102 newsletter issues + 73 guides + 37 collections). Worth running a Lighthouse audit on key pages.

## Done

- [x] Color Mixer tool — launched at /mixer/ with OKLCH/HSL/RGB modes (2026-03-23)
- [x] Newsletter issues 090-101 — comprehensive content on print, wayfinding, typography, naming, motion, illustration, cross-cultural, type on color, AI design (2026-03-23)
- [x] 5 new collections — sage-terrarium, dusk-coral, aurora-veil, desert-amber, arctic-minimal, amber-manuscript (2026-03-23)
- [x] 4 new SEO guides — color-for-social-media, oklch-color-space-guide, monochromatic-color-palette-guide, dark-mode-color-design-guide (2026-03-23)
- [x] Search alias expansion — 80+ new semantic aliases (cyberpunk, dark_mode, oklch, monochromatic, arctic_blue, etc.) (2026-03-23)
- [x] Pinterest Save button + OAuth integration (committed 90793f2)
- [x] Backend REST API (/api/colors endpoint) with API docs page
- [x] Figma plugin: semantic colors, site integration
- [x] WCAG Audit tool launched
- [x] Brand Color System Generator launched
- [x] Tints & Shades Generator launched
