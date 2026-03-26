# Human TODO — ColorArchive

> Things the autopilot can't do. Jason handles these when he picks up the project.
> Last updated: 2026-03-26 (Big Run #2)

## High Priority

- [ ] Activate Lemon Squeezy store and set live pricing — *revenue blocked until store is live*
- [ ] Configure Pro subscription URLs in `src/lib/checkout-config.ts` — *Pro page shows "launching soon" until URLs are live*
- [ ] Verify LS KYB review status — *store cannot process payments until KYB is complete*

## Medium Priority

- [ ] Test free pack download email flow end-to-end — *email sends but download URL needs verification*
- [ ] Set up Pinterest API credentials in server `.env` — *Pinterest save feature needs real API keys*
- [ ] Review Twitter/X API configuration — *marketing automation configured but needs verification*
- [ ] Update pack prices in email templates if LS pricing differs from current values in `server/email.js`
- [ ] Review /decades/ page after deploy — *verify swatch colors look accurate, expand some decade cards to verify context copy*

## Low Priority / Nice to Have

- [ ] Record demo video for Product Hunt / YouTube — *marketing assets in `demo-video/` directory ready*
- [ ] Upload monthly subscription and yearly subscription images — *`colorarchive_logo_v1_assets/monthlysubscription.png` and `yearlysubscription.png` are untracked*
- [ ] Review Famous Palettes page for any factual accuracy on brand history claims
- [ ] Consider adding PDF export of palette packs for Pro users
- [ ] Add /decades/ to site nav or homepage featured tools section — *currently only accessible via /tools/ listing*

## Done

- [x] Newsletter infrastructure — `src/data/newsletter-issues.json` pattern established, 269 issues
- [x] SEO guides — ~250 guides across all topics
- [x] Collections — 145 curated collections
- [x] Famous Palettes page — 35+ iconic palettes (big run 2026-03-26)
- [x] Color by Decade page — 11 decades, 66 signature colors, full history (big run 2026-03-26)
- [x] Search aliases — 780+ total aliases covering all major color search terms
- [x] i18n — EN + ZH translations complete for all UI strings
- [x] Pro page — fully built with comparison table and FAQ
- [x] Palette builder word pools — expanded MOOD_WORDS and SCENE_WORDS (2026-03-26)
