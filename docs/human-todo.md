# Human TODO — ColorArchive

> Things the autopilot can't do. Jason handles these when he picks up the project.
> Last updated: 2026-03-26T autopilot normal run #1

## High Priority

- [ ] **Activate Lemon Squeezy store** — KYB review should be complete; activate the store so palette pack purchases work end-to-end
- [ ] **Set live Lemon Squeezy checkout URLs** in `src/lib/checkout-config.ts` — currently placeholder URLs; real LS product/variant IDs needed for purchases to function
- [ ] **Configure Pro subscription pricing** ($4.99/mo, $39.99/yr) in LS and wire up `src/lib/checkout-config.ts` subscription URLs — backend auth-client.ts is ready but needs live product IDs
- [ ] **Verify API server is healthy** — `ssh root@143.198.85.72 "pm2 status"` and check that colorarchive-server is running

## Medium Priority

- [ ] **TikTok marketing account** — video was in review; check if it's been approved and published
- [ ] **Product Hunt follow-up** — check upvotes/comments and reply to any feedback since launch
- [ ] **Twitter/X content cadence** — API is configured; set up or review scheduled posts for color content
- [ ] **Pinterest boards** — integration is live; review board performance and add industry/seasonal content
- [ ] **YouTube channel** — first video is published; plan next video topic (tutorial, color theory, ColorArchive walkthrough)

## Low Priority / Nice to Have

- [ ] **Figma plugin** — API keys are working; could implement a color search/copy plugin
- [ ] **Email capture flow** — review newsletter sign-up conversion; consider A/B testing onboarding banner copy
- [ ] **Analytics review** — check Vercel/GA for traffic sources; validate that SEO guides are indexed

## Done

- [x] Newsletters 310–313 + 3 guides + 6 collections + 50 aliases — 2026-03-26 normal run #1
- [x] /industry Color Palettes by Industry page built and deployed — 2026-03-26 big run #4
- [x] /seasonal and /decades added to main Explore nav — 2026-03-26 big run #4
- [x] Color by Season page built and deployed (/seasonal/) — 2026-03-26
- [x] Newsletter 300-309 + guides + collections — 2026-03-26 multiple runs
- [x] Color by Decade page built and deployed — 2026-03-26
- [x] Newsletter infrastructure (313+ issues) — 2026-03-26
- [x] 289 SEO landing guides — ongoing
- [x] 193 curated collections — 2026-03-26
- [x] Famous Palettes page — prior run
- [x] Use Cases page — prior run
- [x] Projects/workspace page — prior run
- [x] Pro subscription config in checkout-config.ts — prior run (URLs still need updating)
