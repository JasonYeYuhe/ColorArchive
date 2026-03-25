# Human TODO — ColorArchive

> Things the autopilot can't do. Jason handles these when he picks up the project.
> Last updated: 2026-03-26

## High Priority

- [ ] **Activate Lemon Squeezy store** — Store needs KYB verification completion before payments go live. Check LS dashboard for verification status.
- [ ] **Set Pro subscription checkout URLs** — Pro subscription config in `src/lib/checkout-config.ts` needs the real LS monthly/yearly checkout URLs once store is active.
- [ ] **Test purchase flow end-to-end** — After LS activation, test buying a pack and verify webhook fires, order is recorded, and download link is delivered.
- [ ] **Wire up sendReferralWelcomeEmail** — New referral welcome email function is in email.js but not yet called from any route. Wire it into the subscribe route when a `ref` param is present and the referred user is new.

## Medium Priority

- [ ] **QA Color Name Generator** — New `/name/` page launched. Test the hex input, color picker, preset buttons, and copy actions on mobile and desktop. Verify nearest-color matching looks sensible.
- [ ] **QA new collections (batch 26)** — 4 new collections added (desert-gold, electric-violet, forest-floor, pearl-oyster). Verify they render correctly and color swatches look right in the browser.
- [ ] **TikTok content review** — TikTok account is in review. Check status and publish first videos once approved.
- [ ] **Twitter/X posting cadence** — API is configured. Set up or review the posting schedule for color-of-the-day content.
- [ ] **Pinterest board strategy** — Pinterest integration is active. Consider creating dedicated boards per color family or collection.
- [ ] **Product Hunt follow-up** — PH is live. Engage with comments and upvoters; post a milestone update when hitting 100 reviews/upvotes.
- [ ] **YouTube video strategy** — First video is published. Plan next 3 videos (tutorial, feature walkthrough, color theory explainer).
- [ ] **Google Search Console verification** — Confirm sitemap is indexed and check for crawl errors after the new /name/ and new guide pages are added. Now 154 guides total.

## Low Priority / Nice to Have

- [ ] **Demo video** — demo-video/ folder exists in repo root (untracked). Review and either publish or remove.
- [ ] **Figma plugin submission** — Figma plugin code exists. Submit to Figma Community if not already done.
- [ ] **API key beta program** — API endpoints are built. Consider creating a waitlist or beta for public API access.
- [ ] **Referral program promotion** — Referral system is live. Promote it in the next newsletter issue.
- [ ] **Review /use-cases/ page** — "By Industry" feature launched in prior big run. QA the page on mobile and desktop.

## Done

- [x] Lemon Squeezy product setup — products created with correct prices
- [x] Pro subscription pricing ($4.99/mo, $39.99/yr) — configured in checkout-config.ts
- [x] Product Hunt launch page — /launch/ is live
- [x] Pinterest OAuth integration — callback handler and save button implemented
- [x] WCAG audit tool — /wcag-audit/ page live
- [x] Color combinations library — /combinations/ page live
- [x] Design token generator — /tokens/ page live
- [x] Color Use Cases feature — /use-cases/ with 10 industry guides (2026-03-26)
- [x] i18n for use-cases pages — EN/ZH translations added (2026-03-26)
- [x] sendProUpsellEmail FROM_EMAIL bug — fixed (2026-03-26)
- [x] Color Name Generator — /name/ page live (2026-03-26)
