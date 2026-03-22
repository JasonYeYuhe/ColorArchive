# Human TODO — ColorArchive

> Things the autopilot can't do. Jason handles these when he picks up the project.
> Last updated: 2026-03-23

## High Priority
- [ ] Integrate real payment provider (Lemon Squeezy / Stripe) in `src/lib/checkout-config.ts` — *all commerce flows are still mock/placeholder*
- [ ] Set up Pinterest API credentials for Pinterest OAuth flow — *`app/pinterest/callback/` exists but OAuth app needs credentials*
- [ ] Review and publish the TikTok admin page (`app/admin/tiktok/`) and terms page (`app/terms/`) — *these are untracked/uncommitted pages visible in git status*
- [ ] Test the new Design Token Generator (/tokens/) visually — *built and deployed but not manually QA'd*

## Medium Priority
- [ ] Configure Umami analytics to track new tool pages (/tokens/, /wcag-audit/, /colorblind/, /brand/) — *new pages added but not confirmed in analytics dashboard*
- [ ] Review the waitlist page (`src/components/waitlist-page.tsx`) — *untracked, unclear if it should be published*
- [ ] Review the launch page (`src/components/launch-page.tsx`) — *untracked, Product Hunt launch page, check if still relevant*
- [ ] Review/update pricing on pack product pages — *Lemon Squeezy URLs are placeholders*
- [ ] Update the figma-plugin with any new color data or features — *figma-plugin/package-lock.json is untracked*

## Low Priority / Nice to Have
- [ ] Add the new /tokens/ page to any marketing copy or newsletter mentions — *newly launched tool worth promoting*
- [ ] Consider adding color palette import to the token generator (paste hex list → generate tokens) — *would make the tool more powerful for existing palettes*
- [ ] Update OpenGraph preview image to reflect the expanded tool set — *og-image-v1.png was created with fewer tools*
- [ ] Add a /tokens/ link to the color detail pages sidebar — *cross-linking would improve discoverability*

## Done
- [x] Add Color Mixer page (/mixer/) — completed 2026-03-23
- [x] Add WCAG Audit page (/wcag-audit/) — completed 2026-03-23
- [x] Add Color Blindness Simulator (/colorblind/) — completed 2026-03-23
- [x] Add Tints & Shades Generator (/tints/) — completed 2026-03-23
- [x] Add Brand Color Generator (/brand/) — completed 2026-03-23
- [x] Add Palette Generator (/palette-generator/) — completed 2026-03-23
- [x] Add Design Token Generator (/tokens/) — completed 2026-03-23 (this big run)
- [x] Reach 100+ newsletter issues — achieved (130 as of this run)
- [x] Reach 80+ SEO guides — achieved (88 as of this run)
- [x] Reach 50+ collections — achieved (51 as of this run)
