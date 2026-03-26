# Human TODO — ColorArchive

> Things the autopilot can't do. Jason handles these when he picks up the project.
> Last updated: 2026-03-26T autopilot normal run #3

## High Priority

- [ ] **Activate Lemon Squeezy store** — KYB review should be complete; activate the store so palette pack purchases work end-to-end
- [ ] **Set live Lemon Squeezy checkout URLs** in `src/lib/checkout-config.ts` — currently placeholder URLs; real LS product/variant IDs needed for purchases to function
- [ ] **Configure Pro subscription pricing** ($4.99/mo, $39.99/yr) in LS and wire up `src/lib/checkout-config.ts` subscription URLs — backend auth-client.ts is ready but needs live product IDs
- [ ] **Verify API server is healthy** — `ssh root@143.198.85.72 "pm2 status"` and check that colorarchive-server is running and API endpoints respond

## Medium Priority

- [ ] **TikTok marketing account** — video was in review; check if it's been approved and published, and schedule follow-up content
- [ ] **Product Hunt follow-up** — check upvotes/comments and reply to any feedback since launch
- [ ] **Twitter/X content cadence** — API is configured; set up or review scheduled posts for color content
- [ ] **Pinterest boards** — integration is live; review board performance and add seasonal/trending content
- [ ] **YouTube channel** — first video is published; plan next video topic (tutorial, color theory, ColorArchive walkthrough)

## Low Priority / Nice to Have

- [ ] **Figma plugin** — if planning to build a Figma integration, API keys are working; could implement a color search/copy plugin
- [ ] **Email capture flow** — review newsletter sign-up conversion; consider A/B testing the onboarding banner copy
- [ ] **Analytics review** — check Vercel/GA for traffic sources; validate that SEO guides are indexed and receiving traffic

## Done

- [x] Color by Decade page built and deployed — 2026-03-26
- [x] Newsletter infrastructure (284+ issues) — 2026-03-26
- [x] 265+ SEO landing guides — ongoing
- [x] 160 curated collections — 2026-03-26
- [x] Famous Palettes page — prior run
- [x] Use Cases page — prior run
- [x] Projects/workspace page — prior run
- [x] Pro subscription config in checkout-config.ts — prior run (URLs still need updating)
