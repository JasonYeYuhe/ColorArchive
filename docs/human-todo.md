# Human TODO — ColorArchive

> Things the autopilot can't do. Jason handles these when he picks up the project.
> Last updated: 2026-03-26

## High Priority
- [ ] Add real payment provider to `src/lib/checkout-config.ts` — *commerce is currently non-functional; Lemon Squeezy or Stripe integration needed*
- [ ] Review collections with renamed IDs — `moonlit-garden`, `dark-botanical`, `copper-verdigris` replaced duplicates; check if any external links or marketing materials referenced the old IDs

## Medium Priority
- [ ] Configure TikTok admin page (`app/admin/tiktok/`) — *exists as untracked file; unclear if it should be staged and deployed*
- [ ] Review and stage `src/components/launch-page.tsx`, `waitlist-page.tsx`, `terms-page.tsx` — *several components exist as untracked files; decide if these should be deployed*
- [ ] Figma plugin: `figma-plugin/package-lock.json` is untracked — should be committed if the plugin is actively maintained
- [ ] Verify newsletter `featuredCollectionId` references are valid — *some older issues may reference renamed collections (midnight-garden, copper-patina)*; no automated check exists
- [ ] Add color ID validation to autopilot SKILL.md — *autopilot occasionally uses invalid color IDs in collections; a pre-commit validation step would prevent this*
- [ ] X/Twitter integration — *API keys stored on DO server; need to integrate with scheduler to auto-post color content*
- [ ] TikTok integration — *awaiting review approval; once approved, integrate Content Posting API with server scheduler*
- [ ] YouTube auto-upload — *API key stored on DO server; auto-generate and upload color showcase videos*

## Low Priority / Nice to Have
- [ ] Add Stripe/LS webhooks to server for order fulfillment automation — *currently manual*
- [ ] Review `src/lib/i18n-merged.ts`, `i18n-part1.ts`, `i18n-part2.ts` — *untracked files; unclear if these are working drafts or obsolete*
- [ ] Seasonal collection: spring-2026 assets exist in downloads but no corresponding collection page — *consider adding a seasonal palette page*
- [ ] Add more combinations to /combinations/ — *started with 30; could expand to 50+ over future runs*
- [ ] Auto-Pinterest Pins — *OAuth works for user-save; could add automated pin posting to match IG scheduler*

## Social Media & Promotion Status (Updated 2026-03-26)

### Instagram ✅ 全自动运行中
- [x] 账号: @colorarchive.me (Business), IG User ID: `34301687282808975`
- [x] **自动发帖 scheduler 已部署** (每天 Story, 每3天 Feed Post)

### X/Twitter ⏳ API key 已存到服务器，待集成
- [x] X Developer App + OAuth 1.0a/2.0 已配置，存到 DO 服务器

### TikTok ⏳ 审核中
- [x] 已提交审核，状态: **"In review"**

### YouTube ⏳ API key 已存到服务器，待集成
- [x] 频道: @colorarchiveme, API key 已验证

### Pinterest ✅ 已集成 (用户 Save Pin)

### Commerce ⏳ 待激活
- [ ] **TODO: Lemon Squeezy 商店激活 + webhook 配置**

## Done
- [x] Fix collections build error (18 invalid color IDs) — completed 2026-03-23 autopilot
- [x] Fix duplicate collection IDs (midnight-garden ×3, copper-patina ×2) — completed 2026-03-23 autopilot
- [x] Fix notes page prerender failure (15 links with url instead of href) — completed 2026-03-23 autopilot
- [x] Add Image Color Extractor tool (/image-palette/) — completed 2026-03-23 big run
- [x] Add Design Token Generator — completed earlier big run
- [x] Add Color Combinations Library (/combinations/) — completed 2026-03-23 big run
- [x] Verify Vercel builds are succeeding — confirmed via multiple successful pushes
