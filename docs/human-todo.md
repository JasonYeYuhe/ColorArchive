# Human TODO — ColorArchive

> Things the autopilot can't do. Jason handles these when he picks up the project.
> Last updated: 2026-03-23

## High Priority
- [ ] Add real payment provider to `src/lib/checkout-config.ts` — *commerce is currently non-functional; Lemon Squeezy or Stripe integration needed*
- [ ] Verify Vercel builds are now succeeding — *check Vercel dashboard after the big run push (ce9198d) to confirm /combinations/ deploys correctly*
- [ ] Review collections with renamed IDs — `moonlit-garden`, `dark-botanical`, `copper-verdigris` replaced duplicates; check if any external links or marketing materials referenced the old IDs

## Medium Priority
- [ ] Configure TikTok admin page (`app/admin/tiktok/`) — *exists as untracked file; unclear if it should be staged and deployed*
- [ ] Review and stage `src/components/launch-page.tsx`, `waitlist-page.tsx`, `terms-page.tsx` — *several components exist as untracked files; decide if these should be deployed*
- [ ] Figma plugin: `figma-plugin/package-lock.json` is untracked — should be committed if the plugin is actively maintained
- [ ] Verify newsletter `featuredCollectionId` references are valid — *some older issues may reference renamed collections (midnight-garden, copper-patina)*; no automated check exists
- [ ] Add color ID validation to autopilot SKILL.md — *autopilot continues to accidentally use combination IDs as collection IDs; a validation step would prevent this*

## Low Priority / Nice to Have
- [ ] Add Stripe/LS webhooks to server for order fulfillment automation — *currently manual*
- [ ] Review `src/lib/i18n-merged.ts`, `i18n-part1.ts`, `i18n-part2.ts` — *untracked files; unclear if these are working drafts or obsolete*
- [ ] Seasonal collection: spring-2026 assets exist in downloads but no corresponding collection page — *consider adding a seasonal palette page*
- [ ] Add more combinations to /combinations/ — *started with 30; could expand to 50+ over future runs*

## Social Media & Promotion Status (Updated 2026-03-24)

### Instagram ✅ 全自动运行中
- [x] 账号: @colorarchive.me (Business), IG User ID: `34301687282808975`
- [x] Meta Developer App: "ColorArchive" (App ID: `2333103020516915`)
- [x] Instagram API (Instagram Login OAuth): 完整 OAuth + publish + media feed
- [x] Token: 长期有效，到期日 2026-05-23，服务器每12h自动检查+续期
- [x] **自动发帖 scheduler 已部署在 DO 服务器**:
  - 每天 10:00 JST 发 Story（60% 每日颜色 / 40% 调色板集合）
  - 每3天 12:00 JST 发 Feed Post（50% 单色 / 50% 调色板 + caption + hashtags）
  - 图片由 sharp 自动生成（SVG→PNG, Story 1080×1920, Post 1080×1080）
  - 防重复: date-seeded + post-log.json
- [x] 已成功发帖测试: 2条 Story + 1条 Feed Post

### X/Twitter ⏳ API key 已存到服务器，待集成
- [x] X Developer App: "ColorArchive" (App ID: `32630701`, ACTIVE)
- [x] Bearer Token: 已生成 (2026-03-24), 已验证有效
- [x] OAuth 1.0a: Consumer Key + Secret + Access Token + Secret, 已验证（for @JasonYeyuhe, Read+Write+DM）
- [x] OAuth 2.0: Client ID + Secret
- [x] **Keys 已存到 DO 服务器** (`server/.env.twitter`)
- [ ] **TODO: 集成 X API 到 server（自动发推 + 配合 IG scheduler 同步发帖）**
- 注: Access Token 绑定 @JasonYeyuhe 个人号，如需品牌号需另建 X 账号并重新授权

### TikTok ⏳ 审核中
- [x] TikTok Developer App: "ColorArchive" (Category: Productivity)
- [x] App icon 已上传 (ColorArchive logo)
- [x] 已提交审核，状态: **"In review"**（Production 模式）
- [ ] **等审核通过后: 集成 TikTok Content Posting API 到 server**
- 注: 前端有 admin demo page (`app/admin/tiktok/`)，但后端未实现

### YouTube ⏳ API key 已存到服务器，待集成
- [x] 频道: @colorarchiveme (Channel ID: `UCNoXTmSG24M20aXOjD7bHsA`), 1 subscriber, 1 video
- [x] Avatar + banner 已设置 (`colorarchive_logo_v1_assets/`)
- [x] Google Cloud Project: `main-analog-442915-s5`, YouTube Data API v3 已启用
- [x] API Key: 已验证有效，已存到 DO 服务器 (`server/.env.youtube`)
- [x] OAuth 2.0 Client: "ColorArchive YouTube Uploader" (Desktop app) — 用于上传视频
- [ ] **TODO: YouTube upload 集成到 server（自动生成+上传 color showcase 视频）**

### Pinterest ✅ 已集成
- [x] OAuth flow 工作中 (App ID: `1555251`)
- [x] 用户可以从颜色页 Save Pin 到 Pinterest boards
- [ ] TODO: 自动发 Pin（配合 IG scheduler 同步）

### Facebook 📋 Page 已创建
- [x] Facebook Page: "Color Archive" (ID: `61576446410794`)
- [ ] 未做 API 集成，暂不优先

### Email Marketing ✅ 自动运行中
- [x] Resend 发送, from: hello@colorarchive.me
- [x] 免费包下载邮件 + waitlist 确认
- [x] 5轮自动 follow-up (3/7/14/21/30天) + A/B/C 测试
- [x] UTM + referrer 追踪

### Commerce ⏳ 待激活
- [x] 7个产品定义完成 (¥99–¥2,799)
- [x] Lemon Squeezy + Stripe 代码就绪
- [ ] **TODO: Lemon Squeezy 商店激活 + webhook 配置**

## Done
- [x] Fix collections build error (18 invalid color IDs) — completed 2026-03-23 autopilot
- [x] Fix duplicate collection IDs (midnight-garden ×3, copper-patina ×2) — completed 2026-03-23 autopilot
- [x] Fix notes page prerender failure (15 links with url instead of href) — completed 2026-03-23 autopilot
- [x] Add Image Color Extractor tool (/image-palette/) — completed 2026-03-23 big run
- [x] Add Design Token Generator — completed earlier big run
- [x] Add Color Combinations Library (/combinations/) — completed 2026-03-23 big run
- [x] Next run trigger: big run is due — completed 2026-03-23 big run (was flagged in previous todo)
