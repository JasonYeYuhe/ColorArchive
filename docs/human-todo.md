# Human TODO — ColorArchive

> Things the autopilot can't do. Jason handles these when he picks up the project.
> Last updated: 2026-03-23

## High Priority

- [ ] **Verify Lemon Squeezy store status** — Commerce integration is coded but store may still be pending approval. Check if checkout URLs are live and purchase flow works end-to-end.
- [ ] **Pinterest OAuth flow** — Pinterest Save button was added. Verify the OAuth redirect/callback works in production (https://colorarchive.me) since localhost testing may differ from deployed behavior. The `PINTEREST_APP_ID`, `PINTEREST_APP_SECRET`, and `PINTEREST_REDIRECT_URI` env vars need to be set in Vercel.
- [ ] **Wire up sendNewsletterIssueAlert** — New email function added in server/email.js for broadcasting new notes to subscribers. Needs to be integrated into a route (e.g., POST /api/newsletter/broadcast) and triggered when new issues go live.
- [ ] **TikTok admin page** — There's an `app/admin/tiktok/` directory in the untracked files. This may need review/cleanup or deployment.

## Medium Priority

- [ ] **OG images for new tool pages** — /mixer/ has a generic OG image. Consider generating a custom OG image showing the color blending interface for better social sharing.
- [ ] **Newsletter count in sitemap** — Sitemap may need updating if new note slugs aren't being generated statically. Run `npm run build` and verify /notes/ pages build correctly.
- [ ] **Collection color IDs audit** — A commit `692bc Fix broken collection color IDs` was pushed. Worth reviewing which collections had broken IDs and whether the fixes are correct. New collections cobalt-morning and sage-fog use valid algorithmic IDs.
- [ ] **Terms page** — There's an untracked `src/components/terms-page.tsx` and `app/terms/` directory. If these are ready, they should be committed.
- [ ] **i18n-merged.ts, i18n-part1.ts, i18n-part2.ts** — Untracked files in src/lib/. These look like working files from an i18n split/merge operation. Should be cleaned up or committed.
- [ ] **Session lock race conditions** — Multiple autopilot instances ran concurrently in a previous session despite the lock system. Consider increasing the stale lock threshold to 30 minutes if it recurs.

## Low Priority / Nice to Have

- [ ] **Color Mixer OG preview** — A screenshot or visual showing the mixer at work would improve the /mixer/ page's social sharing appearance.
- [ ] **Test new collections in Figma plugin** — Verify the 7 newest collections (aurora-veil, desert-amber, arctic-minimal, amber-manuscript, cobalt-morning, sage-fog) appear correctly in the plugin.
- [ ] **Performance audit** — Site has grown significantly (2016 colors + 106 newsletter issues + 73 guides + 39 collections). Worth running a Lighthouse audit on key pages.

## Done

- [x] Color Mixer tool — launched at /mixer/ with OKLCH/HSL/RGB modes (2026-03-23)
- [x] Newsletter issues 090-105 — comprehensive content on print, wayfinding, typography, naming, motion, illustration, cross-cultural, type on color, AI design, healthcare UI, color forecasting, e-commerce conversion, color fatigue (2026-03-23)
- [x] 9 new collections since launch — sage-terrarium, dusk-coral, aurora-veil, desert-amber, arctic-minimal, amber-manuscript, cobalt-morning, sage-fog (2026-03-23)
- [x] 4 new SEO guides — color-for-social-media, oklch-color-space-guide, monochromatic-color-palette-guide, dark-mode-color-design-guide (2026-03-23)
- [x] Search alias expansion — 80+ new semantic aliases (cyberpunk, dark_mode, oklch, monochromatic, arctic_blue, etc.) (2026-03-23)
- [x] Pinterest Save button + OAuth integration
- [x] Backend REST API (/api/colors endpoint) with API docs page
- [x] Figma plugin: semantic colors, site integration
- [x] WCAG Audit tool launched
- [x] Brand Color System Generator launched
- [x] Tints & Shades Generator launched
- [x] Email D-variant subject lines for all 5 follow-up stages (2026-03-23)
