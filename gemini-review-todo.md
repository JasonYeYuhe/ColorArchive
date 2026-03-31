# Project Review Todo

> Gemini Pro + Codex 于 2026-03-31 对整个项目做了全面 review，以下是综合分析和行动计划。
> 标记：✅ 已完成 / 🔲 待处理 / ⏭️ 跳过（不适用或误判）

---

## 综合分析：两份 Review 对比

### Codex 独有发现（Gemini 没提到的）

1. **🔴 CRITICAL: Magic link origin 注入** — `server/routes/auth.js:38-56` 用 `req.headers.origin` 构建登录链接，攻击者可伪造 Origin 让合法 magic link 指向恶意域名。这是真实安全漏洞
2. **🔴 CRITICAL: Webhook 静默成功** — `app/api/webhook/route.ts:20-35` 后端 fulfillment 失败时仍返回 200 给 Stripe，导致 Stripe 不会重试，订单可能静默丢失
3. **🟡 CORS 缺少 DELETE 方法** — `server/index.js` CORS 只允许 GET/POST/PUT，但客户端用 DELETE 删项目和撤销 API key，跨域请求会失败
4. **🟡 API key 明文存储** — `server/db.js` API key 未哈希存储，且支持 query string 传递，有日志/浏览器历史泄露风险
5. **🟡 事件/页面统计无防护** — `server/routes/pageviews.js`, `events.js` 是公开写入接口，无 rate limit、无认证，可被刷数据
6. **🟡 Referral/分享积分无幂等控制** — `server/routes/subscribe.js:74-83` 可重复请求刷积分
7. **🟡 events/summary 权限检查缺失** — 标注为 admin only 但只检查了是否登录
8. **🟡 INTERNAL_WEBHOOK_SECRET 未设置时不拒绝** — webhook 路由在 secret 为空时允许未认证请求
9. **🟡 PaletteBuilderTray 全局挂载** — `app/layout.tsx:143-148` 在根 layout 挂载了导入完整颜色数据的组件，所有页面都受影响
10. **🟡 数据库缺索引** — `orders.email`, `pageviews.created_at` 等热查询列无索引
11. **🟡 SEO 元数据颜色数量过时** — 多处仍写 3,000+ 而实际是 5,446
12. **🟡 Pro 页面 CTA 失效** — `activeProvider` 为 Gumroad 但 Pro 页面 `gumroadUrl={null}`，订阅按钮无法点击
13. **🟢 Skip link 目标不可聚焦** — skip link 指向普通 div，需加 `tabIndex={-1}`
14. **🟢 SiteHeader currentPath 硬编码 union** — 不包含 /account 等路径

### 两者都提到的

- **collections.ts 客户端 bundle 问题** — 两者都认为是重大性能问题
- **SQLite 外键约束** — Gemini 提出，Codex 间接确认
- **数据库迁移工具原始** — 两者都提到
- **后端缺 CI/CD** — 两者都提到

### Gemini 误判的（Codex 没有重复这些错误）

- ⏭️ package.json 版本无效 — Next.js 16.x / React 19.x 是 2026 年真实版本
- ⏭️ 文档 3066 vs 5446 "矛盾" — 描述的是不同的东西
- ⏭️ "没有测试套件" 矛盾 — CLAUDE.md 的说法有特定语境

---

## 行动计划（按优先级排序）

### Phase 1: 安全修复（CRITICAL — 必须立即做）

- 🔲 **1.1 修复 magic link origin 注入**
  - 文件：`server/routes/auth.js:38-56`
  - 改动：用环境变量 `FRONTEND_URL` 替代 `req.headers.origin` 构建登录链接
  - 严重性：可被利用窃取用户账号

- 🔲 **1.2 Webhook 失败时返回错误码**
  - 文件：`app/api/webhook/route.ts`, `app/api/gumroad-webhook/route.ts`
  - 改动：后端 fulfillment 失败时返回 500，让 Stripe/Gumroad 触发重试
  - 严重性：订单可能静默丢失

- 🔲 **1.3 INTERNAL_WEBHOOK_SECRET 未设置时拒绝启动**
  - 文件：`server/routes/webhook.js`
  - 改动：非本地环境下 secret 为空时 throw error

- 🔲 **1.4 Checkout/billing-portal return URL 用白名单**
  - 文件：`app/api/checkout/route.ts:25-32`, `app/api/billing-portal/route.ts:24-29`
  - 改动：用 `FRONTEND_URL` 替代 `req.headers.origin`

### Phase 2: 安全加固（IMPORTANT）

- 🔲 **2.1 CORS 添加 DELETE 方法**
  - 文件：`server/index.js:14-25`
  - 改动：CORS allowedMethods 加入 DELETE

- 🔲 **2.2 API key 哈希存储**
  - 文件：`server/db.js`, `server/routes/me.js`
  - 改动：存储时 sha256 哈希，创建时只返回一次明文，查询时对比哈希
  - 同时：移除 query string 接受方式，只允许 Authorization header

- 🔲 **2.3 events/summary 加 admin 权限检查**
  - 文件：`server/routes/events.js:32-56`
  - 改动：加 `requireAnalyticsAccess` 中间件

- 🔲 **2.4 Referral 积分加幂等控制**
  - 文件：`server/routes/subscribe.js:74-83`
  - 改动：记录已奖励的 referral，防止重复刷

- 🔲 **2.5 Analytics 写入接口加 rate limit**
  - 文件：`server/routes/pageviews.js`, `server/routes/events.js`
  - 改动：加 IP 级别 rate limiting

### Phase 3: 性能优化

- 🔲 **3.1 collections.ts 拆分 server/client 数据流**
  - 文件：`src/lib/collections.ts` + 12 个消费组件
  - 方案：collections 在构建时解析好 ColorRecord[]，客户端不再间接导入 colors.ts

- 🔲 **3.2 PaletteBuilderTray 从根 layout 移除**
  - 文件：`app/layout.tsx:143-148`
  - 方案：只在需要的路由组加载，或用 dynamic import + lazy load

- 🔲 **3.3 搜索/过滤预计算索引**
  - 文件：`src/components/color-archive-page.tsx`, `src/lib/color-search.ts`
  - 方案：预算 family counts，debounce URL 更新，语义搜索表移到 server 端

### Phase 4: 数据库加固

- 🔲 **4.1 启用 SQLite 外键约束**
  - 文件：`server/db.js`
  - 改动：`db.pragma('foreign_keys = ON')`

- 🔲 **4.2 添加数据库索引**
  - 文件：`server/db.js`
  - 列：`orders.email`, `orders.created_at`, `pageviews.created_at`, analytics 归因列

- 🔲 **4.3 评估数据库迁移工具**
  - 调研轻量方案替代 `ensureColumn`

### Phase 5: 商务/内容修复

- 🔲 **5.1 修复 Pro 页面 CTA**
  - 文件：`src/lib/checkout-config.ts`, `src/components/pro-page.tsx`
  - 确认 activeProvider 和 gumroadUrl 配置一致

- 🔲 **5.2 更新 SEO 元数据颜色数量**
  - 文件：`app/layout.tsx`, `app/page.tsx`, `app/all-colors/page.tsx`, `public/manifest.json`
  - 把 "3,000+" / "3,066" 更新为 "5,400+"

- 🔲 **5.3 统一商务文案**
  - 检查 palette-packs 和 email 模板中过时的价格/数量描述

### Phase 6: DX & 可维护性（不急）

- 🔲 **6.1 后端 GitHub Actions CI/CD**
- 🔲 **6.2 结构化日志（pino）**
- 🔲 **6.3 替换手动 cookie 解析**
- 🔲 **6.4 关键页面添加结构化数据**
- 🔲 **6.5 Skip link 目标加 tabIndex={-1}**
- 🔲 **6.6 SiteHeader currentPath 改为动态获取**

### 跳过的建议

- ⏭️ ~~SQLite → PostgreSQL 迁移~~ — 当前阶段不需要
- ⏭️ ~~重构所有页面为 Server Components~~ — 收益不够大
- ⏭️ ~~API 响应 Zod 校验~~ — 自有后端，schema 可控
- ⏭️ ~~迁移 i18n 库~~ — 当前自研方案够用
- ⏭️ ~~tags_json 改关系表~~ — 无按 tag 查询的场景

---

## 执行记录

| 日期 | Phase | 项目 | 状态 | 备注 |
|------|-------|------|------|------|
| | | | | |
