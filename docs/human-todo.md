# Human TODO — ColorArchive

> Things the autopilot can't do. Jason handles these when he picks up the project.
> Last updated: 2026-03-26

## High Priority

- [ ] **Lemon Squeezy store activation** — Switch LS from Test mode to Live mode (bottom-left toggle). Without this, no real purchases can be made. *Commerce cannot launch until this is done.*
- [ ] **Set post-purchase URLs in LS** — For all 7 products, set Confirmation modal + Email receipt CTA to `https://colorarchive.me/thanks/`. *Required for buyers to reach the confirmation page.*
- [ ] **Run purchase smoke test** — Complete one real purchase after store activation to verify checkout → thanks → download email → /login order history all work end-to-end.
- [ ] **Google OAuth smoke test** — Follow `docs/google-auth-checklist.md` for first real login. Verify account state and admin allowlist.

## Medium Priority

- [ ] **TikTok review status** — Check if TikTok developer account is approved yet. The admin interface at `/admin/tiktok/` is ready.
- [ ] **Pinterest integration verification** — Confirm Pinterest OAuth is working end-to-end with a live account.
- [ ] **Product Hunt listing** — Verify PH listing is accurate and matches current product state.
- [ ] **Check famous palettes page** — New `/famous-palettes/` page launched in this run. Verify it renders correctly on production (Vercel auto-deploy triggered by push to main).

## Low Priority / Nice to Have

- [ ] **Demo video** — `demo-video/` folder exists with content. Review and decide if/how to publish.
- [ ] **Monthly/yearly subscription assets** — `colorarchive_logo_v1_assets/monthlysubscription.png` and `yearlysubscription.png` are untracked. Decide if these should be committed.
- [ ] **Analytics decision layer** — Review ROADMAP.md priority #3: cohort-over-time views, retention by source, buyer audit trail.

## Done

- [x] Famous Palettes page built and deployed — 2026-03-26
- [x] CSS Named Colors page — 2026-03-26
- [x] Colorblind simulator — prior runs
- [x] WCAG audit matrix — prior runs
- [x] Design token generator — prior runs
- [x] Image palette extractor — prior runs
- [x] Color quiz — prior runs
- [x] Mesh gradient generator — prior runs
- [x] Brand color analyzer — prior runs
- [x] Color stories page — prior runs
- [x] Color of the Day — prior runs
- [x] 126 color collections — prior runs
- [x] 230+ SEO guides — prior runs
- [x] 249 newsletter issues — prior runs
