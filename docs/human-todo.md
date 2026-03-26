# Human TODO — ColorArchive

> Things the autopilot can't do. Jason handles these when he picks up the project.
> Last updated: 2026-03-26 (normal run #8)

## High Priority
- [ ] Activate Lemon Squeezy store — *KYB review is the blocker; no sales until this is done*
- [ ] Set final pricing in LS dashboard — *autopilot has pricing defined in checkout-config.ts but needs LS product IDs*
- [ ] Configure Pro subscription URLs — *$4.99/mo and $39.99/yr plans need LS checkout links in checkout-config.ts*
- [ ] Wire `sendWeeklyDigestEmail()` to a cron/route — *function added in run #8, needs a server route + scheduler call to actually send*

## Medium Priority
- [ ] Review TikTok account status — *was "in review" as of last check; confirm if approved*
- [ ] Set up Twitter/X scheduled posting — *API configured; need to write posting logic or connect to autopilot*
- [ ] Pinterest integration — *integrated but confirm boards and pins are being created correctly*
- [ ] Set up `sendCotdEmail()` cron on server — *function exists, needs PM2 cron or external scheduler (e.g., `node-cron`)*
- [ ] Add newsletter unsubscribe endpoint test — *token-based unsub exists in route but hasn't been end-to-end tested*

## Low Priority / Nice to Have
- [ ] Demo video — *demo-video/ directory exists locally but not committed; record and add*
- [ ] Monthly/yearly subscription badge images — *colorarchive_logo_v1_assets/monthlysubscription.png + yearlysubscription.png exist locally but not committed*
- [ ] Review directory-submissions.md — *has local modifications; check if ready to publish as outreach tracker*
- [ ] Product Hunt follow-up posts — *Product Hunt is live; consider update posts or comment engagement*
- [ ] Consider APCA-based contrast in color detail pages — *new WCAG 3.0 standard; autopilot noted in newsletter, could add as UI feature*

## Done
- [x] YouTube channel published — completed before run #1
- [x] Color Trends 2026 page — built in big run #5
- [x] Navigation: /trends added to site-header — run #5 + run #6
- [x] 241+ newsletter issues — ongoing
- [x] 248 collections — ongoing  
- [x] 312 SEO guides — ongoing
- [x] Weekly digest email template — added run #8
