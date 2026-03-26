# Human TODO — ColorArchive

> Things the autopilot can't do. Jason handles these when he picks up the project.
> Last updated: 2026-03-26 (after normal run #6)

## High Priority
- [ ] Activate Lemon Squeezy store — *required before any product purchases can complete*
- [ ] Configure Pro subscription checkout URLs — `src/lib/checkout-config.ts` has placeholder URLs for LS/Stripe subscription checkout; these need real product URLs once the store is activated
- [ ] Review and activate the LS KYB (Know Your Business) submission — store is blocked on this
- [ ] Set final pricing in LS dashboard — pricing is defined in code (`palette-packs.ts`, `checkout-config.ts`) but needs to match what's configured in the LS product catalog

## Medium Priority
- [ ] Upload free palette pack ZIP to `/public/downloads/free-palette-pack.zip` — referenced in email templates but file may not exist yet
- [ ] Record and upload demo video — `demo-video/` folder exists in repo but appears empty; product pages could use a short screen recording
- [ ] Pinterest: verify API integration is working and boards are publishing — Pinterest is configured but verify content is flowing
- [ ] Twitter/X: verify API publishing is working — configured but needs verification

## Low Priority / Nice to Have
- [ ] Update `server/content/update-brief.js` with current featured collections and pack info — this file drives the waitlist confirmation email content and may have outdated references
- [ ] Consider adding the /trends page to the mobile primary nav items (currently only in desktop Explore dropdown) — if trends traffic grows, elevate it
- [ ] Review `/colorarchive_logo_v1_assets/` folder — contains monthlysubscription.png and yearlysubscription.png; verify these are being used correctly in the Pro page

## Done
- [x] /trends page created — Color Trends 2026 with 8 trend entries, EN+ZH, category filter (big run #5)
- [x] /trends added to Explore nav and i18n — nav.trends key, site-header updated (normal run #6)
- [x] YouTube published — product demo/overview video live
- [x] TikTok submitted for review
- [x] Product Hunt live
- [x] Twitter/X API configured
- [x] Pinterest integrated
