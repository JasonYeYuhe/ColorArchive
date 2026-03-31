# Review Todo — 逐项执行记录

> 基于 gemini-review-todo.md，从 Phase 1 开始按顺序执行。Phase 6 跳过。

---

## Phase 1: 安全修复（CRITICAL）

- ✅ **1.1 修复 magic link origin 注入** — 2026-04-01 — `getLoginOrigin()` 不再读 req.headers.origin，直接用 FRONTEND_ORIGIN
- ✅ **1.2 Webhook 失败时返回 500** — 2026-04-01 — notifyBackend 改为 throw，webhook route 捕获后返回 500
- ✅ **1.3 INTERNAL_WEBHOOK_SECRET 未设置时拒绝** — 2026-04-01 — production 环境下 secret 为空返回 500
- ✅ **1.4 Checkout/billing-portal return URL 用 FRONTEND_URL** — 2026-04-01 — 用 FRONTEND_URL 环境变量替代 req.headers.get("origin")

## Phase 2: 安全加固

- ✅ **2.1 CORS 添加 DELETE 方法** — 2026-04-01 — methods 数组加入 DELETE
- ✅ **2.2 API key 哈希存储** — 2026-04-01 — SHA-256 哈希存储，自动迁移旧明文，只在创建时返回一次明文，移除 query string 接受
- ✅ **2.3 events/summary 加 admin 权限检查** — 2026-04-01 — 加 isAnalyticsAdmin 检查
- ✅ **2.4 Referral 积分加幂等控制** — 2026-04-01 — 检查 referred_by 是否已设置，防止重复积分
- ✅ **2.5 Analytics 写入接口加 rate limit** — 2026-04-01 — 60 次/分钟/IP 内存限速器

## Phase 3: 性能优化

- ✅ **3.1 collections.ts 拆分 server/client 数据流** — 2026-04-01 — 5 个客户端组件改为接收 server props，不再直接 import collections/colors
- ✅ **3.2 PaletteBuilderTray 从根 layout 移除** — 2026-04-01 — 改为 dynamic import + ssr:false 懒加载
- ✅ **3.3 搜索/过滤预计算索引** — 2026-04-01 — 新增 filterColorsWithCounts 单次遍历计算 familyCounts

## Phase 4: 数据库加固

- ✅ **4.1 启用 SQLite 外键约束** — 2026-04-01 — `db.pragma("foreign_keys = ON")`
- ✅ **4.2 添加数据库索引** — 2026-04-01 — 13 个索引覆盖 orders/pageviews/events/subscribers/users/projects/ai_usage
- ✅ **4.3 评估数据库迁移工具** — 2026-04-01 — 当前 ensureColumn 规模足够，备注了 better-sqlite3-migrations 作为升级方案

## Phase 5: 商务/内容修复

- ✅ **5.1 修复 Pro 页面 CTA** — 2026-04-01 — CheckoutButton 无 gumroadUrl 时自动回退 Stripe，不再 disabled
- ✅ **5.2 更新 SEO 元数据颜色数量** — 2026-04-01 — 12 个文件 3,000+→5,400+，3,066→5,446，移除 colors.slice(0,3066)
- ✅ **5.3 统一商务文案** — 2026-04-01 — email.js 中产品描述同步更新为 5,400+/5,446
