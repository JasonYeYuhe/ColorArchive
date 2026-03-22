# Human TODO — ColorArchive

> Things the autopilot can't do. Jason handles these when he picks up the project.
> Last updated: 2026-03-22 (normal run — Newsletter 062-065, 2 new collections)

## High Priority
- [ ] Set up real Lemon Squeezy checkout URLs in `src/lib/checkout-config.ts` — *placeholders are still in place; purchases can't complete*
- [ ] Configure Resend domain verification for production email delivery — *follow-up emails require verified sender domain*
- [ ] Test the full purchase → webhook → email flow end-to-end in staging — *critical path not validated with real money*

## Medium Priority
- [ ] Review and update `PRODUCT_MEMO.md` with current pricing/pack structure — *may have drifted from what's live on LS*
- [ ] Verify the `/admin/orders/` dashboard works with real orders data — *built on SQLite, not tested with production volume*
- [ ] Check Umami analytics is correctly tracking new tool pages (contrast, convert, harmonies, compare, colorblind, gradient, /tools/) — *may need manual registration of new page paths*
- [ ] Review new collections (arctic-dawn, golden-hour) added this run — confirm color IDs render correctly in live UI
- [ ] Now that day-30 emails are fixed (autopilot run 5 bug fix) — check if any subscribers are overdue for the day-30 email and consider a manual one-time send to catch up

## Low Priority / Nice to Have
- [ ] Add Open Graph image generation for individual color pages — *currently uses static og-image-v1.png for all pages*
- [ ] Set up a real CDN for download files in `public/downloads/` — *GitHub Pages serves them fine for now, but CDN would be faster*
- [ ] Consider adding Google Search Console property for colorarchive.me — *would help track search impressions for SEO guides*
- [ ] Review new SEO guides (color-typography-hierarchy, design-token-color-naming) — confirm they render correctly at /guides/{slug}/

## Done
- [x] Lemon Squeezy webhook configured — completed 2026-03-18
- [x] Free pack email sequence (Day 0, 3, 7, 14) — completed 2026-03-18
- [x] Magic link auth — completed 2026-03-18
- [x] Color converter tool /convert/ — completed 2026-03-21 (autopilot-big)
- [x] Color Blindness Simulator /colorblind/ — completed 2026-03-22 (autopilot-big)
- [x] Color Blindness Simulator added to homepage feature grid — completed 2026-03-22 (autopilot)
- [x] Day-30 follow-up email bug fixed — completed 2026-03-22 (autopilot run 5: code was outside function)
- [x] Color Tools Hub /tools/ — completed 2026-03-22 (autopilot-big run 3)
