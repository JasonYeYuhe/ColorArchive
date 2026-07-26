# AI 更新开发计划书 — 2026-07-26(v2,双评审后重写)

状态:已过评审(agy/gemini-3.6-flash-high + Codex),按评审结论重写
前置:`docs/dev-plan-2026-07-24-conversion.md`、commit `e3960c0`

> **v1 的核心论点被评审 + 我们自己的 nginx 日志证伪了。** 本文档保留证伪过程(§0.3),因为它是这次最有价值的产出:如果按 v1 执行,我会为一个真实需求约等于零的功能做一次大重构。

---

## 0. 结论

### 0.1 你要的是"大更新",但证据不支持把大更新做在 AI 上

诚实的结论:**AI 不该是这次的主体。** 但这次调查挖出了一个真正值得当"大更新"的东西 —— 一个已经上线四个月、正在**静默破坏我们全部转化测量**的 bug。

### 0.2 真正的发现:我们自己的分析数据正在被丢弃

`/etc/nginx/sites-available/colorarchive` 只设了 `X-Real-IP`,**从未设 `X-Forwarded-For`**:

```
proxy_set_header Host $host;
proxy_set_header X-Real-IP $remote_addr;
```

`server/index.js:11` 是 `app.set("trust proxy", 1)`,`server/client-ip.js:16` 是 `req.ip || req.socket?.remoteAddress`。
`X-Forwarded-For` 不存在 → Express 回落到 socket 地址 → nginx 走 loopback → **`req.ip` 恒为 `127.0.0.1` / `::1`**。

于是**所有按 IP 限流的地方都退化成了一个全站共享的桶**。线上 `ai_usage` 全历史只有 2 个 identifier,把 loopback 地址按 `ai-rate-limit.js` 的算法哈希,精确匹配:

```
sha256("::ffff:127.0.0.1")[0:16] = 3e48ef9d22e096da   ← 线上桶 1(47 次)
sha256("::1")[0:16]              = eff8e7ca506627fe   ← 线上桶 2(36 次)
```

**代价落在哪里 —— nginx 日志实测(2026-07-12 → 07-26,175,065 条请求):**

| 端点 | 429 次数 | 谁被挡 |
|---|---|---|
| `POST /pageviews` | **516** | 真实浏览器(1,024 条来自同一 Safari UA) |
| `POST /events` | **509** | 同上 |
| 各种 `.php` 扫描 | ~680 | 攻击者(挡对了) |

`server/routes/events.js:12` 是 **60 次/分钟**,因 loopback 变成**全站共享 60/分钟**。

> **更正(2026-07-27 全局审计)——这条我写错了,已撤回。** 那 1,025 次 429 里 **1,024 次来自同一个地址、同一天**(174.173.86.177,07-20),而该地址一共发了 5,561 次分析写入 —— 是一台洪水机器被**正确**限流。整个 14 天窗口只有 **1 次**其他 429。真正的缺陷不是「丢了一千次真实写入」,而是**那个上限是全局的**:任何一个吵闹的调用方都能把所有人限流掉。我当时只看了总数和 UA,没有按 IP 和按天分解。
> 这正是 commit `6ff2297` / `e3960c0` / `3b3286c` 建起来的那套漏斗测量。**我们过去两个阶段所有"转化率"结论,都建立在一份有损的数据上。**

这条比 AI 的任何一条都重要,而且它自证优先级:一个测量系统在骗自己,后面所有决策都不可信。

### 0.3 被证伪的部分(v1 错在哪)

v1 的论点是:"AI 看起来没人用,是因为 429 挡了所有人四个月,所以我们没有需求信号、而不是负信号。"

**gemini-3.6-flash-high 的反驳:** 页面浏览发生在点击**之前**,后端 429 挡不住"访问一个 URL"。AI 页面浏览从 4 月 40 → 7 月 7 的下滑,是发现/兴趣的失败,和 429 无关。这是**动机性推理** —— 用一个后端 bug 为一个没人要的功能找借口。

**我去查了日志,它是对的,而且比它说的更彻底:**

```
14 天内 POST /ai/* 总计 5 次:  4× 200, 1× 500
14 天内 /ai/* 的 429:          0 次
```

**loopback 桶从来没有真的挡住过任何 AI 用户 —— 因为几乎没有人尝试过。** 3 次/天的全站上限从未被触及。它是一个潜伏的责任,不是一个在起作用的阻塞。

→ **AI 的需求是真的约等于零。** v1 的 §0 整节作废,Phase 1 的大重构(`ai-core.js` 统一、接地流水线)全部删除。

### 0.4 顺带发现:爬虫正在压支付用的那个数据库

同一批日志:

```
/ai/usage 请求数(14 天):46,481  ← 占 API 全部请求的 26%
  Ahrefs 13,392 | Baiduspider 6,775 | bingbot 512 | Bytespider 116 | Googlebot 33
api.colorarchive.org/robots.txt → 不存在(返回 HTML 错误页)
```

`routes/ai.js:38` 每次调用都对 sqlite 做一次 `SELECT`。**那是承载审计级订阅生命周期的同一个 better-sqlite3 句柄,机器是 1 vCPU / 395MB 可用。**
约 3,300 次/天的爬虫读,全落在支付路径旁边。

这同时否掉了 v1 的一个提案:gemini 说"别加 `ai_calls` 表,会和支付抢锁" —— 对,而且**现存的争用已经在那里了**,正确的动作是**削减**,不是新增。

---

## 1. 同一个 bug 的其余三处

| 位置 | 设计意图 | 实际效果 | 严重度 |
|---|---|---|---|
| `routes/auth.js:116` `/verify` | 5 次/15 分钟,key = `ip:email` | **verify 请求体只有 token,没有 email** → key 恒为 `127.0.0.1:` → **全站每 15 分钟 5 次魔法链接验证**。任何人可锁死所有人的魔法链接登录。Codex 纠正:范围**不是「所有登录」** —— Google OAuth 不走这个限流器 | **P0 可用性** |
| `routes/subscribe.js:22` | 10 次/分钟 | **全站** 10 次/分钟订阅上限 | P0(压在漏斗上) |
| `api-rate-limit.js:7` | 匿名 60 次/小时 | **全站** 60 次/小时 | P1 |
| `ai-rate-limit.js:21` | 匿名 3 次/天 | **全站** 3 次/天(实测从未触及) | P2 |

`/verify` 这条是本次最严重的**安全**发现:一个任何人都能触发的全站登录拒绝服务,已上线四个月。日志里没有它的 429,只说明还没人这么干过。

**修复不能只改 nginx。** nginx 配置不在 git 里 —— 这个 bug 能潜伏四个月正是因为没有任何东西断言它:

1. nginx 加 `proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;`
2. 配置纳入仓库(`server/deploy/nginx-colorarchive.conf`)
3. **启动自检**:生产环境探测到 `req.ip` 为 loopback → `console.error` + `/health` 报 degraded。**不 crash** —— 支付 webhook 在同一进程,不能因为限流配置问题拒绝收款。

### 关于伪造的安全性(评审提出的疑虑,已核实)

`$proxy_add_x_forwarded_for` + `trust proxy 1` 是**正确配对**:客户端伪造 `X-Forwarded-For: 1.2.3.4` 时,nginx 追加成 `1.2.3.4, <真实IP>`,`trust proxy 1` 从右数剥掉 1 跳 → 取到真实 IP。不可伪造。

**gemini 担心的"Vercel/CF 中间跳会让所有人塌成一个边缘 IP 桶" —— 在我们的拓扑下不成立,已实测:**
- `src/lib/api-config.ts` 的 `API_URL` 指向 `api.colorarchive.org`,浏览器**直连** droplet
- `next.config.ts` **无 rewrites/proxy**
- `curl -I https://api.colorarchive.org/health` → `Server: nginx/1.24.0 (Ubuntu)`,**无 `cf-ray`、无 `x-vercel-*`**

---

## 2. 顺序是硬依赖

修好 XFF = 把一个**误打误撞 fail-closed 的全局桶**变成**真正的按 IP 限流**,而按 IP 限流之上没有天花板。

> **花费熔断 + 突发限流必须与 XFF 修复同批部署,或更早。** 先修 XFF 就是先把洞打开。

现状 AI 成本(实测):7 月 7 次调用,历史 83 次,**约 $0.02/月**。Vercel 是 ~$74/月。
**所以所有成本措施都按"爆炸半径"来卖,不按"省钱"来卖。** 省下来的是几分钱;界定的是几千美元的最坏情况。

最坏情况(今日配置 `gemini-2.5-flash` + thinking 默认开):

| 场景 | 请求/月 | 成本/月 |
|---|---|---|
| 5,000 个轮换 IP(IPv6 /64 轮换即可) | 450,000 | ~$1,418 |
| **`TIER_LIMITS.pro = Infinity`**(`ai-rate-limit.js:23`),1 订阅者脚本化 1 req/s | 2,592,000 | ~$8,165 |

---

## 3. Phase 0 — 拆弹 + 恢复测量(一次部署,不可拆分)

这就是本次的"大更新"主体。

| # | 动作 | 文件 |
|---|---|---|
| 0.1 | nginx XFF + 配置入仓 + 启动自检 | `server/deploy/nginx-colorarchive.conf`、`index.js` |
| 0.2 | **同批**修 `/verify`(key 并入 token 哈希前缀)、`/subscribe`、`/api`、`/events`+`/pageviews` 四处桶 | `auth.js` `subscribe.js` `api-rate-limit.js` `events.js` |
| 0.3 | 全局日花费熔断 `GEMINI_DAILY_BUDGET_USD`(起始 $2/天 ≈ 预期 60 倍),越线后只服务档案兜底,文案诚实 | 新 `server/ai-budget.js` |
| 0.4 | 每分钟突发限流:匿名 2 / free 5 / pro 10,端点全局 30 | `ai-rate-limit.js` |
| 0.5 | ~~`pro: Infinity` → 50/天~~ **撤销** | `ai-rate-limit.js:23` |
| 0.6 | IPv6 按 **/64 前缀** 归桶 | `client-ip.js` |
| 0.7 | **削减爬虫对支付库的读压**:`api.colorarchive.org` 加 robots.txt(Disallow: /)、`/ai/usage` 对已知 bot UA 直接返回静态值不查库、加 `Cache-Control` | `index.js`、`routes/ai.js` |
| 0.8 | 隐私政策补披露"用户输入会发往第三方 AI 处理" | `app/privacy/` |
| 0.9 | 申请 ColorArchive 独立 `GOOGLE_AI_API_KEY`(现与 OpenClaw 共用 → 无法归因、跑飞互相拖累、轮换同时断两边;熔断是进程内的,看不见另一个消费方) | `credits.md` |

### 0.5 为什么撤销给 Pro 加日上限(Codex 的 stop-ship 第 1 条)

"unlimited AI" 不是宽松的营销话术,它是**写进 Terms of Service 的承诺**:

- `src/components/terms-page.tsx:16` —— "Pro subscription: Unlock **unlimited** AI palette generations…"
- `app/pro/page.tsx:13`、`src/components/upgrade-modal.tsx:75/83`
- `src/lib/i18n.ts:2172/2187` —— 中英双语("无限 AI 生成")
- `server/email.js:1029/1039/1085` —— 两封事务邮件

把唯一一个付费订阅者从 unlimited 静默改成 50/天,是**单方面违约**,而且她会从一个 429 里发现这件事。我原本要省的那点钱远不值这个代价。

→ 恢复 `pro: Infinity`。约束放在**不需要对客户说谎的地方**:
- **每分钟突发限流**(阻止脚本化,不影响正常使用)
- **全局日花费熔断**(系统级安全阀,而非按账户配额 —— 这是任何订阅里 "unlimited" 的通常含义:合理使用、禁止异常自动化)

在 10 次/分钟的突发上限下,花费熔断远早于任何日配额触发,**所以两者中更紧的那个本来就是诚实的那个**。`AI_PRO_DAILY_LIMIT` 保留为运维杠杆,默认不设。

### 0.10 新增:Express 绑定 loopback(Codex 第 4 条,实测确认的活漏洞)

`app.listen(PORT)` 未绑定网卡,且 droplet 上 **ufw 未启用**。实测:

```
curl http://143.198.85.72:3001/health  →  200
```

nginx **可被绕过**。这本身就击穿了本进程里所有限流:`trust proxy = 1` 意味着 Express 信任一跳 XFF,而直连 Node 的调用者**就是**那一跳,可以靠轮换一个自己完全控制的头来无限造桶。加上 nginx 的 XFF 之后,这个绕过会变得更有威力。

→ 改为 `app.listen(PORT, "127.0.0.1")`。已核实无任何东西依赖外部 3001(只有 `DEPLOY.md` 的 proxy_pass、一个 SSRF 测试桩、`scripts/verify-preorder.cjs`,全是 localhost)。

### 0.11 新增:AI 挂载隔离(Codex 第 3 条)

`require("./routes/ai")` 在模块层抛错会**中止整个服务器启动** —— 而同一个进程还承载 Lemon Squeezy 订阅 webhook。全站最不值钱的功能(5 次请求/两周)的一个语法错误,不能导致我们收不了钱。

→ AI 路由用 try/catch 挂载,失败则降级为诚实的 503。

### 撤销 v1 的两条(评审后核实为错)

- ~~iOS AI 调用永远是匿名的~~ —— **错**。`APIService.swift:38` 设了 `httpCookieStorage = .shared`,而 `AIMoodPaletteView.swift:208` 用的 `URLSession.shared` 用的是**同一个**全局 `HTTPCookieStorage.shared`(Foundation 头文件:"The shared session uses the currently set global NSURLCache, NSHTTPCookieStorage and NSURLCredentialStorage objects")。服务端 session 就是 cookie(`auth.js:214` `setSessionCookie`)。→ 登录用户的 iOS AI 调用**会**带凭证。
- ~~XFF 修复会污染 08-12 iOS 数据门~~ —— **错**。iOS 走 `AnalyticsBootstrap`(PostHog SDK)直传,不经我们的 `/events`。数据门不受影响。且 `/ai/` 实测 0 个 429,CGNAT 风险本就趋零。

### Phase 0 验收

- [ ] 线上 `ai_usage` / 限流桶出现 **> 2 个** distinct identifier
- [ ] 两个不同外网 IP 各发请求互不影响
- [ ] 从 IP A 打满 `/verify` 后,IP B 仍能登录
- [ ] **`/pageviews` + `/events` 的 429 归零**(这是本阶段的头号验收项)
- [ ] 熔断:临时把预算设为 $0 → 返回档案兜底而非 500
- [ ] `/ai/usage` 的爬虫流量不再产生 sqlite 读

---

## 4. Phase 1 — 就地修 bug,不重构(评审否掉了大重构)

**删除 v1 的 `ai-core.js` 统一层和接地流水线。** 为一个 30 天试用期的功能做架构重构,是重犯 Auditor 的错。
只做**就地**的、每端点约 10 行的改动 —— 而且这些是爆炸半径控制和真实崩溃修复,不是重构:

| # | 改动 | 位置 |
|---|---|---|
| 1.1 | `generationConfig`:`responseMimeType: "application/json"` + `maxOutputTokens`(900/500/1200)+ `temperature` + **`thinkingConfig: { thinkingBudget: 0 }`** | `ai.js` ×4 |
| 1.2 | `AbortController` 超时(现无超时,实测健康调用 10.2s) | `ai.js` |
| 1.3 | 默认模型 → **`gemini-3.1-flash-lite`**(见下方 §4.2,计划里的 flash-lite 被现实否掉了)| `ai.js:56` |
| 1.4 | **每字段**输入截断(现只有 mood-palette 截 200 字;brand-palette 四个字段仅受 100kb body 限制 ≈ 25,000 token 攻击者可控输入 = 50× 成本放大器) | `ai.js` |
| 1.5 | **`/critique` 请求永久挂起**:对比度矩阵在 try **之外**(`ai.js:307-341`),`{"colors":[{},{}]}` 在 try 前抛错 → Express 不 await async 处理器的 promise → **永不响应,配额已扣**,一条 curl 即可触发。(Codex 纠正:实装 Express 是 **4.22.1** 而非 4.18,且进程级 `unhandledRejection` 会记录 —— 是请求挂起,不必然崩进程)。修法:入口先按 hex 正则校验并 400,再把计算移进 try | `ai.js` |
| 1.6 | 配额语义(**按 Codex 第 2 条改正**):~~成功后计数~~ 是不安全的 —— 多个并发请求会读到同一个"未用满"状态一起放行,且客户端中断会留下已计费却永不"成功"的模型调用。正确做法是**入场即预留**(保持先扣),**只在明确 5xx 时退还**。幂等性是结构性的:钩子绑在单个 request 对象上、只触发一次、由 `refunded` 标志兜底,所以一次扣减最多对应一次退还;而中断的请求不会产生 5xx 状态,因此走开也刷不到配额。花费同样**改为调用前预留**,否则并发能跑过熔断 | `ai-rate-limit.js` |
| 1.16 | 新增:并发闸 `AI_MAX_INFLIGHT`(默认 4)。日/分钟限额都在入场计数,同一 tick 到达的突发可以全部通过;在 1 vCPU 且承载支付 webhook 的机器上,一堆并发的 10 秒上游调用才是真正的故障模式 | `ai.js` |
| 1.17 | 新增:**模型输出真校验**(Codex 第 7 条)。`responseMimeType` 只保证**能解析**,不保证内容。原校验只有"`palette` 是非空数组",**从未校验任何 hex**,畸形值直通客户端的 `hex.slice(1,3)` 和 `` `${hex}cc` `` → 崩溃 + 乱色。新增 `sanitizeColorEntries()`:非法 hex 丢弃(不伪造替代色)、`#abc` 展开、大小写归一、自由文本截断。`/critique` 从 `res.json(parsed)` 透传改为逐字段白名单,对比度**无条件替换为我们自己算的值** | `ai.js` |
| 1.18 | 新增:`btoa()` 对中文预设直接抛异常 —— `PRESETS[0]` 就是 `"深夜咖啡馆"`。生成成功、调色板已渲染,然后同一个 try 里抛错 → 用户**同时**看到调色板和一条报错,且没有分享链接。改为 UTF-8 安全的 base64(纯 ASCII 输出与旧 `btoa` 字节一致,已分享链接不失效) | `mood-palette-page.tsx:92` |
| 1.7 | `${color.hex}cc` 拼接(`mood-palette-page.tsx:254`)、`luminance()` 的 `slice(1,3)` 短 hex 崩溃 | 多处 |
| 1.8 | **`+ Save` 存的不是用户看到的那个颜色**(实测:返回 5 个 hex 全不在档案中,最近邻 ΔE 达 5.4,保存时静默替换)→ 保存显示值,或显式告知替换 | `mood-palette-page.tsx` |
| 1.9 | 删死代码 `onReplace`("Apply suggestion" 从未可用,无任何调用方) | `palette-critique-panel.tsx:11` |
| 1.10 | 删 `/analyze/` 里仍在宣传**已取消的** Accessibility Auditor 的文案 | `/analyze` |
| 1.11 | `/brand-generator/` 每次 1.2MB(把全部 5,446 条序列化给客户端只为显示一个标签)→ 匹配移到服务端 | `app/brand-generator/page.tsx` |
| 1.12 | ~~**存储型注入**~~ **降级(Codex 第 7 条)**:未被证实。项目值与分享值都以 React 转义文本或 `style.backgroundColor` 渲染,相关路径没有 `dangerouslySetInnerHTML`(`shared-project-page.tsx:74`)。**不要把它叫 stored XSS**。该做的是校验模型输出(见 1.17),已做 | — |
| 1.13 | `me.js:234-240` referral 的 `credits + 2` 无幂等 + `email.js:1047` 在推广它 | 两处 |
| 1.14 | `/ai/analyze-url` 是挂在 `/ai` 下的**正则爬虫,零模型调用**,却消耗 AI 配额并被当"AI 工具"营销 → 移出 AI 配额并改名 | `ai.js` |
| 1.15 | 用回已测过的数学 —— 但**分清两件事(Codex 第 7 条)**:WCAG 对比度**必须**用相对亮度,ΔE 量的是感知色差,**两者不可互换**,v1 把它们混为一谈了。实际做的是:(a) 保留 `relativeLuminance`,但把线性化阈值从 `0.03928` 改成 `0.04045` —— `src/lib/` 里**所有**受测实现都用后者,原值来自旧勘误表,导致我们喂给模型、又作为"事实"展示给用户的对比度,和站内工具自己报的数字对不上;(b) 颜色**匹配**处才换 `deltaE2000`(`color-brand-matches.ts:21` 的加权 RGB) | 2 文件 |

**观测:不建 `ai_calls` 表**(评审第 4 条 + §0.4)。端点/延迟/成败写 stdout → PM2 日志,零 sqlite 争用。

---

### 4.2 模型选择:计划被现实纠正了一次,值得记下来

计划是 `gemini-2.5-flash-lite`($0.10/$0.40 vs $0.30/$2.50,最坏成本降 15×)。它**在 `/models` 列表里**,看起来可用。**它不可用:**

```
404  This model models/gemini-2.5-flash-lite is no longer available to new users
```

部署后第一次真实调用就 500 了。逐个实测(2026-07-26,均含本文的 `thinkingConfig`):

| 模型 | 结果 |
|---|---|
| `gemini-2.0-flash-lite` | ❌ 404 已退役 |
| `gemini-2.5-flash-lite` | ❌ 404 对新用户不可用(**但在列表里**) |
| `gemini-3.5-flash-lite` | ❌ 400 拒绝该 generationConfig |
| **`gemini-3.1-flash-lite`** | ✅ 200 ← 采用 |
| `gemini-2.5-flash` | ✅ 200 |

顺带证实:`thinkingConfig: { thinkingBudget: 0 }` **确实能透传**(SDK 0.21.0 无该字段类型,但它把 `generationConfig` 原样序列化进 REST body),且被 2.5-flash 与 3.1-flash-lite 接受。实测延迟 **10.2s → 1.8s**。

→ **因此不再声称"降本 15×"**:`ai-budget.js` 把 3.1-flash-lite 保守地按 2.5-flash 价格计,真实节省未经证实。界定最坏情况的是突发限流 + 并发闸 + 日花费熔断,**不是模型选择**。实测花费本来就是 ~$0.02/月。

**教训(这个病已犯过两次):** 错误的 model id **静默失败** —— 没人用的功能没人会发现。`gemini-3-flash`(一个从不存在的名字)让每个 AI 请求 404 了约两个月。
→ 新增 `recordModelOutcome()`,连续失败次数暴露在 `/health` 的 `aiModel` 字段(不做自动回退:静默切换模型会掩盖这个哨兵存在的意义)。
→ **列表会骗你。换 model id 必须先用一次真实调用验证。**

---

## 5. Phase 2 — 唯一的 AI 赌注,且是最小的那个

竞品调研最硬的一条:**没有任何"新 AI 功能"通得过"每周会回来用"的检验。留存住在 lock-and-regenerate 和情境预览上 —— 两者都不需要 AI。**

所以不做第六个 AI 页面。只做两件:

### 5.1 一行修复,全站最大浪费面

`src/components/color-detail-page.tsx:228` 是全站**唯一**不带 `credentials` 的 AI 调用(其余 4 处都带,已逐一比对)→ Pro 不被识别,429 是死胡同。
而 color-detail 是 **6,133 次/30 天**。

→ 加 `credentials: "include"` + 429 → `UpgradeModal`(组件已存在,直接复用)。

### 5.2 锁定 + 重掷 —— 确定性实现,不调模型

评审第 3 条指出了 v1 的自相矛盾:v1 一边在 §6 否掉"坐标化点评做成 AI 端点(那是 ID 轴上的算术)",一边又提议用 LLM 做"保留第 2 个、其余压低彩度"—— **降彩度/调对比/移色相是纯色彩空间数学**,调 LLM 去做违反自己定的规则。

→ 锁定 + 重掷 + 调整**全部**用 `src/lib/` 里的确定性函数(即时、零成本、零 token)。
→ LLM **只**用于开放语义查询("像 1980 年代东京夜景的颜色"),且只在候选 ID 集里选,输出过 `colorMap` 校验。

> 运行时校验器需要新写。CLAUDE.md 里"build 会因 `Unknown color id` 失败"是**构建期**对策展集合的检查,**不是运行时校验**。

### 架构红线(必须明说)

`guides`(8,398/30d)和 `color-detail`(6,133/30d)是 `generateStaticParams()` 静态生成的:
- 服务端渲染 AI 文本 = 每次内容变更重建 3,066+318 页 → 正是 `reference_vercel_cost` 的 build-minutes 红线
- 客户端拉取 = 不可索引

**选客户端拉取。因此:Phase 2 的 AI 只有产品价值,没有 SEO/GEO 价值。** 不拿它论证流量。

---

## 6. 明确不做

| 不做 | 理由 |
|---|---|
| **`ai-core.js` 统一层 / 接地流水线** | 为 30 天试用期的功能做架构重构 = Auditor 的错(评审第 6 条) |
| **`ai_calls` SQLite 表** | 与支付共用 1 vCPU / 395MB 的库;现存爬虫读压已需削减,不该新增(评审第 4 条 + §0.4) |
| **droplet 上架 MCP server** | 30 天内 `/colors/*` 的 AI 助手引荐 = **0**(29,214 次浏览中),guides 拿到 263 —— 为需求信号为零的资产造投递管道。另:注册表 8,000–15,930 个 server 过半不活跃;MCP 结构性反漏斗(无点击/无归因);机器 961MB 已用 565 |
| **批量预生成 5,446 个 AI 颜色名** | `src/lib/color-naming.ts` 的 `generateColorName()` 已上线、确定性、免费。会**重新引入**"模型发明"问题,并给每个颜色造出第二个冲突的名字 |
| **"反向命名"当差异化** | `/name/` 今天就有(全 5,446 条 CIEDE2000 top-5,零 token) |
| **4 个 Pro 专属新功能** + 滚动月配额 | 为**只有 1 个成员**的档位做新建 = Auditor 的错 |
| **Cloudflare / ChatGPT app 第二套代码库** | 必须与 `src/data/colors.ts` 字节级同步,自带密钥/域名验证/审核门;Apps SDK 禁止售卖订阅 → 无法回本。写触发条件,不写代码 |
| **配额退款机制** | 需要幂等键,否则 client-abort 循环刷免费配额。用"成功后计数"替代 |

---

## 7. 只做三件的话

1. **XFF 修复 + `/pageviews`/`/events`/`/verify` 三处桶,与花费熔断和突发限流同批**(§3.1–3.4)—— 恢复测量完整性 + 关掉登录 DoS + 先装好盖子再开洞
2. **削减 `/ai/usage` 的爬虫读压**(§3.7)—— 26% 的 API 请求压在支付库旁边
3. **`color-detail` 加 `credentials` + 429→UpgradeModal**(§5.1)—— 6,133 次/30 天,一行修复

其余等这三件的数据。

---

## 8. 死线(按评审第 2 条重写)

v1 的判据被否:"≥30 个不同 identifier" 在 color-detail 上会被爬虫和换 IP 的单个用户轻易凑满,在 `/ai/*` 上(29 次浏览/30d)数学上不可能;"≥1 个 `user:` 调用" 在只有 1 个订阅者时是**保证通过**,不是判据。

改为按转化判:

| 项 | 判据 | 日期 | 不达标 |
|---|---|---|---|
| **测量完整性**(唯一无条件执行的一项) | `/pageviews` + `/events` 的 429 **= 0** | 部署 +7 天 | 回滚 XFF 变更,重查 |
| AI 的真实需求 | 需要**最小样本量**才有意义:**≥3,000 次人类模块曝光**(`ai_module_impression`)且 **≥100 次成功生成**;在此基础上,曝光→发起 **≥3%**、发起→复制/保存 **≥15%** | 事件上线 +30 天,样本不够则延期 | **删掉 AI 端点**,确定性部分并回 guides / color-detail。收益:29 次浏览/月 换 3 个路由、5 个端点、约 1,200 行、一个共用密钥 |
| 锁定-重掷循环 | ≥15% 的会话产生 ≥2 次重掷,**且 N ≥ 100 次会话** | 上线 +30 天 | 回滚成静态调色板 |
| ~~Pro 的 AI 价值~~ | ~~≥1 个 `user:` 调用~~ **作废** | — | 见下 |

> **2026-07-26 续:埋点已落地,§8 重写为可执行的规则。** 前两版判据(§8 初版的「≥100 次成功生成」、以及我为报表定的「≥1,000 次曝光才下结论」)犯的是**同一个结构性错误**:它们把样本量当成"判断是否有使用"的**前置条件**。没有需求 → 样本永远不够 → 判决永不到达 → AI 靠一个技术性理由永久存活。**这正是让 Auditor 活了好几个月的机制。**
>
> 改为**单侧二项检验**。规则:
>
> | 判定 | 条件 |
> |---|---|
> | **DELETE** | 请求数 ≤ 该 n 下的删除带 —— 即"若真实转化率是 3%,出现该结果的概率 <10%"的最大计数。**n=150→≤1、200→≤2、250→≤3、300→≤4、400→≤7**(可手算核对) |
> | **KEEP AND INVEST** | 三者同时成立:Wilson-95 下界 >3%、≥5 个不同会话发起请求、≥3 个会话复制了结果。单看百分比可以被两个热情用户抬起来 |
> | **KEEP, DO NOT INVEST** | 在删除带之上但没到 KEEP 线 |
> | **NOT ENOUGH DATA** | n < 150 —— 此时**即使零点击也无法否证** 3% |
>
> **n=150 是关键数字:** 在真实率 3% 下,观测到 0 次点击的概率是 **0.010**、1 次是 **0.058**。所以 150 是"几乎没人用"从**轶事变成陈述**的最小样本 —— color-detail 约两周可达。**低使用量现在直接判删,不再无限期挂着。**
>
> 判据里的三个阻塞项已全部解除:
> - `ai_module_impression` —— 已上线,`src/lib/use-impression.ts`,**50% 可见 + 连续 1 秒停留**(不是"observer 响了一次")。停留要求顺带免费过滤爬虫:实测一个 6,753 IP 的农场渲染了 6,555 个页面,只触发了 **1 次**交互事件。
- `ai_result_copied` —— 已上线于三个可复制的界面。critique 面板没有(散文点评没有可复制产出),报表显示 `n/a` 而非 0%。
> - 「`pageviews` 没有访客 ID」—— **这条其实是伪问题**:两个比率都是 事件÷事件,`pageviews` 不在任何分母里。真正需要的是**会话级去重**,已用那个**从建表起就存在、4,690 行全为 NULL** 的 `events.session_id` 列实现(sessionStorage,随标签页消失,不是持久标识符,零 DDL)。
>
> **运行方式:** `node server/scripts/ai-gate-report.cjs`(按界面明细)。周报 `gate-report.cjs`(每周一 09:00 UTC,已在跑)现在携带这个判决 —— 它**原本明天还会再发一封关于已取消的 Auditor 的报告**。净新增 cron 行:0。净新增产物:0。

**Codex 第 2 条否掉了 v1 的判据,理由成立:**

1. **"≥1 个 `user:` 调用" 在只有 1 个订阅者时是保证通过**,不是判据 —— 她随手点一次 AI 就"达标"了。删除。
2. **"≥30 个不同 identifier"** 在 color-detail(6,133 次浏览)上会被爬虫和换蜂窝 IP 的单个用户轻易凑满,而在 `/ai/*`(29 次浏览/30 天)上**数学上不可能**。删除。
3. **判据目前不可测量**:`color-detail-page.tsx` 既没有 generate 也没有 copy 事件,一方 `pageviews` 表**没有访客 ID**(`db.js:76`),而 AI 卡片位置很靠下 —— 所有 color-detail 访客不能当曝光分母。
   → 因此本次已加 `ai_generate_click` / `ai_generated` 事件;**`ai_module_impression`(IntersectionObserver)与"复制结果"事件仍待补**,判据在它们上线后才起算。
4. **爬虫必须从分母剔除**(按 UA + 行为),否则第一项自动通过。

---

## 9. 基线(诚实数字)

- 总浏览 **29,214**/30 天;guides **8,398**;color-detail **6,133**
- AI 三个路由合计 **29** 次浏览/30 天(brand-generator 21、mood-palette 6、analyze 2)
- **`POST /ai/*` 实际请求:14 天 5 次(4×200、1×500),429 = 0 次**
- AI 历史调用 83 次,全落在 2 个 loopback 桶;`user:` 前缀 **0**
- ~~被 429 丢弃的真实分析写入:14 天 1,025 次~~ **已撤回**:1,024/1,025 来自单一洪水地址,不是真实用户损失(见 §0.2 更正)
- `/ai/usage`:14 天 **46,481** 次(占 API 请求 26%),其中 Ahrefs 13,392 + Baiduspider 6,775
- AI 助手引荐:guides 263、word-to-color 124、`/colors/*` **0**
- 邮件订阅 **2** 人 → 访客→订阅 ≈ **0.007%**
- 收入 **$3.47/月**,1 订阅者;AI 成本 ~**$0.02/月**(Vercel ~$74/月)

---

## 10. 数字口径(仓库里四处不一致)

| 项 | 真实值 | 错值 |
|---|---|---|
| guides | **316**(`src/lib/guides.ts` 计数) | 317 / 368 / 360+(llms.txt) / 315(memory) |
| collections | 256 | llms.txt "260+"、CLAUDE.md **"68+"** |
| tools | ~33 | llms.txt "23+" |

→ 修 `public/llms.txt` **和** `CLAUDE.md`,不只改研究里恰好读到的那一个。

---

## 11. 复核记录

每条载荷性事实写入前独立复核,不采信报告转述:

| 结论 | 复核方式 |
|---|---|
| ✅ nginx 缺 XFF | 读线上配置 |
| ✅ 两个桶 = loopback | 线上 `ai_usage` + 本地重算哈希,精确匹配 |
| ❌→ `/pageviews`+`/events` 的 1,025 次 429 **不是**真实用户损失 | 按天/按 IP 重算:1,024 次来自单一地址单日。**我最初只看总数和 UA,没有按 IP 和按天分解** —— 这是本次最该记住的方法论教训 |
| ✅ `/ai/*` 零 429、14 天仅 5 次请求 | nginx 日志 —— **证伪了 v1 的核心论点** |
| ✅ `/ai/usage` 46,481 次、爬虫为主、无 robots.txt | 日志 + UA 分布 + `curl` |
| ✅ `/verify` key 塌成全局 | `auth.js:116` + `auth.js:31-36`(请求体只有 token) |
| ✅ 仅 `color-detail` 缺 `credentials` | 5 个调用点逐一比对 |
| ✅ 无 Vercel/CF 中间跳 | `api-config.ts` + `next.config.ts` + 响应头 —— **否证了评审的代理链疑虑** |
| ❌→ iOS AI 调用带凭证 | `APIService.swift:38` + Foundation 头 —— **否证了 v1 的 §0.7** |
| ❌→ 08-12 数据门不受影响 | `AnalyticsBootstrap.swift` 走 PostHog SDK —— **否证了评审的 iOS 疑虑** |
| ❌→ 全部 5,446 色页可解析 | `dynamicParams = true` + 4 个非预渲染 ID 实测 200 —— **否证了完整性反审的头号结论** |
| ✅ guides = 316 | 计数,非引用 |

### 评审采纳情况

| 评审意见 | 处理 |
|---|---|
| gemini #1:核心论点是动机性推理 | **接受**,查日志后确认并作废 v1 §0 |
| gemini #2:死线不可证伪 | **接受**,§8 全部重写为转化判据 |
| gemini #3:用 LLM 做纯数学是自相矛盾 | **接受**,§5.2 改为确定性实现 |
| gemini #4:删 `ai_calls`,别写支付库 | **接受**,且发现现存爬虫读压更该先削 |
| gemini #5:iOS/代理链风险 | **部分驳回**,两条都实测不成立(见上表) |
| gemini #6:删 Phase 1 重构 | **接受**,只留就地改动 |
| gemini #7:为 1 个用户写复杂档位逻辑 | **接受**,不写滚动配额逻辑 |

### Codex 采纳情况(独立复核了仓库,推翻了我自己的两处)

| Codex 意见 | 处理 |
|---|---|
| **stop-ship 1**:给 Pro 加日上限会违反写在 Terms 里的付费承诺 | **接受,已撤销**(见 §3 的 0.5)。这是本次最重要的一条纠正 |
| **stop-ship 2**:"成功后计数"不安全(并发同读、中断已计费) | **接受**,改为入场预留 + 仅 5xx 退还,幂等性由请求生命周期结构性保证 |
| AI 模块加载失败会拖垮支付 webhook | **接受**,AI 用 try/catch 挂载降级 503(§3 的 0.11) |
| `app.listen` 未绑 loopback + ufw 未启用 → nginx 可绕过、XFF 可伪造 | **接受**,实测 `curl :3001/health → 200` 确认,改绑 `127.0.0.1`(§3 的 0.10) |
| $2/天 ≈ $60/月 = 17× MRR,不算天花板;并发能跑过熔断 | **接受**,默认降到 **$0.50/天**,花费改为调用前预留,加并发闸 |
| 爬虫压 SQLite 的论断被夸大(0.038 req/s、索引查找、WAL 已开) | **接受**,保留拦截(26% 无意义流量)但把理由改诚实,注释里明确记下这次纠正 |
| 存储型注入未被证实(React 转义) | **接受**,降级,不再称 XSS |
| 真 bug 是 `btoa()` 对中文预设抛异常 | **接受**,这是我漏掉的线上 bug,已修(§4 的 1.18) |
| 别把 relativeLuminance 换成 ΔE(量的不是一回事) | **接受**,v1 混淆了;实际只对齐了阈值常量(§4 的 1.15) |
| `responseMimeType` 不是输出校验 | **接受**,新增 `sanitizeColorEntries()`(§4 的 1.17) |
| 死线不可测量(缺事件、`pageviews` 无访客 ID、AI 卡片位置太靠下) | **接受**,§8 全部重写并加最小样本量 |
| Express 实为 **4.22.1** 而非 4.18;`/critique` 是"请求挂起"而非"进程崩溃" | **接受**,措辞纠正(bug 本身成立且已修) |
| `/verify` 是**魔法链接验证**的全站 DoS,不是"所有登录"(Google OAuth 不走该限流器) | **接受**,措辞收窄 |
| `credits.md` 不存在 | **驳回** —— 它在 `~/Documents/credits.md`(仓库外,按全局约定),Codex 沙箱看不到 |
