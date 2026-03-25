# Human TODO — ColorArchive

> Things the autopilot can't do. Jason handles these when he picks up the project.
> Last updated: 2026-03-26

## High Priority

- [ ] **Activate Lemon Squeezy store** — KYB/KYC review in progress. Store must be activated before any paid products work. Check LS dashboard for verification status.
- [ ] **Set final product pricing in LS** — All products need prices set in the Lemon Squeezy dashboard (current config in `src/lib/palette-packs.ts` reflects intended pricing, needs to match LS store).
- [ ] **Configure Pro subscription URLs** — `src/lib/checkout-config.ts` has placeholder URLs for Pro monthly/yearly. Need real Lemon Squeezy variant URLs once store is activated.
- [ ] **Verify download files are up to date** — Binary files in `public/downloads/` have local modifications (shown in git status). Confirm these are the correct final versions and commit them, or discard if they're accidental.

## Medium Priority

- [ ] **Test Pro subscription checkout flow end-to-end** — Once LS store is active, test the full flow: Pro upgrade button → LS checkout → webhook → pro status reflected in account page.
- [ ] **Configure Resend email domain** — Ensure `hello@colorarchive.me` is verified in Resend for email deliverability. Check bounce rates on waitlist confirmation emails.
- [ ] **Review Twitter/X API integration** — Twitter/X API is configured per marketing memory. Verify the integration is posting correctly to the account.
- [ ] **Pinterest integration review** — Pinterest is integrated per marketing memory. Confirm new collections and palettes are being promoted.
- [ ] **TikTok review status** — TikTok account was in review per marketing memory. Check if approved and if content calendar is active.

## Low Priority / Nice to Have

- [ ] **YouTube content pipeline** — YouTube is published. Consider adding ColorArchive content about color theory, tool walkthroughs, or palette design tutorials to drive traffic.
- [ ] **Product Hunt follow-up** — Product Hunt is live per marketing memory. Engage with comments and reviews, consider posting updates for new features.
- [ ] **Figma plugin** — API key system is built. A Figma plugin would be high-value for designer users. Requires manual Figma plugin development and submission.
- [ ] **Demo video** — `demo-video/` directory exists in working tree. Upload and embed on landing page or product pages.
- [ ] **Logo assets** — `colorarchive_logo_v1_assets/monthlysubscription.png` and `yearlysubscription.png` exist untracked. Add to appropriate pages if needed.

## Done

- [x] Pro subscription checkout URLs from Lemon Squeezy — added to checkout-config.ts (2026-03-26)
- [x] CSS Named Colors Reference page (/css-colors/) — built and deployed (2026-03-26)
- [x] Color Use Cases feature — built and deployed (2026-03-26)
- [x] Color Name Generator tool (/name/) — built and deployed (2026-03-26)
- [x] Invalid color IDs in collections.ts — fixed ~35 invalid IDs (2026-03-26)
- [x] Newsletter issues missing date field — fixed 25 issues causing sitemap RangeError (2026-03-26)
