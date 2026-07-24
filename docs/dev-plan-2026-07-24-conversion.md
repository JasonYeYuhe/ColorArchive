# ColorArchive 下阶段开发计划书 — 2026-07-24(conversion:把已有流量变成关系)

> 起草:2026-07-24 · 作者:Claude(remote session,owner 授权)· **已过 Codex + Gemini 3.1 Pro 双评审并按意见重写**
> 依据:droplet 30 天第一方数据实测(附录 queries)· 2026-07-20 首个真实订阅者事件复盘 · docs/dev-plan-2026-07-20-tools-expansion.md(工具矩阵已交付)

---

## §0 数据判定(2026-07-24 实测)

### 0.1 不缺流量,缺"接住流量"

30 天站点总浏览 **≈ 27,200**(**注意:这是 pageviews,不是去重会话/用户 —— 我们的 pageviews 表没有 session 列,所以本计划一律以"浏览"表述,不冒充 UV**),自然搜索 **15,579(57%)**、直接 10,778。

| 区块 | 30 天浏览 | 现有转化位(已核实) |
|---|---|---|
| **guides** | **8,398** | **已有** `guide.links` 工具链接区(guides.ts 317 条配置)+ 1 个未埋点的 `/pro/` 文字链;**无邮件捕获** |
| **color-detail** | **6,133** | **挂着已废弃的 Auditor 预购 CTA** + 未埋点 `/pro/` 链;无邮件捕获 |
| other | 4,302 | — |
| **word-to-color** | 4,184 | 付费墙 + **已有两个**邮件表单(墙内解锁 + 页下常驻)+ 调研 banner + Auditor CTA |
| home | 3,026 | Auditor CTA |
| notes | 1,161 | — |

同期产出:付费墙触发 138 · Pro 点击 **7** · checkout 1 · 成交 1(Hayley)· **新增邮件订阅 1**。

**⚠️ 证据口径修正(Codex)**:那 **7 次 Pro 点击只来自已埋点的 word-to-color 付费墙**;guides 与 color-detail 上的 `/pro/` 链接**根本没有埋点**,所以"全站只有 7 次 Pro 意向"是**未经证实的推断**,不能作为"邮件优先于 Pro"的论据。**这正是 P0-5 要先补的洞。**

### 0.2 三个已核实的漏点

1. **🔴 已下线的产品仍在售**:Auditor 已 07-20 off-ramp,但 `AuditorPreorderCta` 实际挂在 **8 处 / 7 个页面**(home、word-to-color、color-detail、collections、wcag-audit、palette-audit ×2、analyze),`/pro/` 页另有独立预购推广。30 天:`preorder_cta_click` **8**、`preorder_checkout_clicked` **3**、`preorder_checkout_redirected` **3**(注:该事件在 `window.open` 后立即上报,**只证明尝试打开,不证明抵达结账页**)。没人付款是运气不是设计。**止血,第一优先。**
2. **黄金位在替 Google 表单打工**:word-to-color 的调研 banner 30 天曝光 **3,857**,同期该页仅捕获 1 个邮箱。
3. **两大流量区无捕获**:guides + color-detail 合计 **14,531 浏览/月**,零邮件捕获位。

### 0.3 工具矩阵:还测不出来(不是失败)

上周 11 条新路由 30 天浏览各为 **1**(我 QA 点的)。上线仅 2–4 天,尚未索引 —— SEO 需 4–12 周。**本阶段不再新建工具**,等 08-20 GSC 复盘。

### 0.4 观察项:AI 助手引荐

chatgpt.com 311 · perplexity.ai 115 · copilot.com 47(≈473,占 1.7%)。仅记录,不投入。

---

## §1 定调(评审后修正)

**本阶段不造新工具,只做两件事:止血(下线废弃产品的所有售卖入口)+ 在最大的两块流量上建立可再触达的关系。**

**重要修正(Codex #6)**:"邮件优先于直推 Pro"目前**是一个待验证的实验,不是已证实的结论** —— 因为 guides/color-detail 的 Pro 链接从未埋点,我们根本没有可比数据。因此本阶段**同时保留并埋点 Pro CTA**,让 30 天后能真正比较"捕获 vs 直推"两条路,而不是替未来的自己预设答案。

---

## §2 P0 —— 必做

### P0-1 Auditor 全面下线(止血,今天就做)

**顺序很重要(Codex #2 —— 我原方案的机制是错的)**:

1. **先在 Lemon Squeezy 商户侧停售/下架该预购产品**(owner 操作,或授权我经 LS API 处理)—— 因为 `checkoutUrl` 来自 `NEXT_PUBLIC_PREORDER_CHECKOUT_URL`,是**构建时烘进前端的公开变量**,改环境变量必须重新部署才生效,期间旧链接仍可付款;
2. **移除全部 8 处 `AuditorPreorderCta`**(url-analyzer / color-archive-home / color-detail / wcag-audit / word-to-color / palette-audit ×2 / collections)+ `/pro/` 页的独立预购推广;
3. **给 `/preorder/` 一个显式的 `closed` 状态** —— 注意:`checkoutUrl` 为 null 时现有代码会**回退成"预留创始价"的邮件捕获**,而不是"已取消",所以必须新增明确的 closed 分支,文案诚实说明该功能已暂缓,并指向免费对比度工具 / Pro;
4. **保留 `/preorder/` 路由**(它本就 `noindex` + robots 禁止 + 不在 sitemap —— 所以我原稿写的"保留链接权重"理由不成立,**真实理由只是:仍有站外直链会打进来,得给他们一个诚实页面**);
5. **不对已留邮箱的预购意向者做任何自动外发**(需 owner 单独授权)。

### P0-2 guides + color-detail 接入邮件捕获

- 复用**既有** `CotdSubscribeForm`(已支持 `source` 参数,已上报既有事件约定 **`email_subscribed {source}`** —— **不新造 `email_capture` 事件**,Codex #7);
- **color-detail**(6,133/月):放在原 Auditor CTA 腾出的位置,钩子 = 每日一色(上下文贴切);
- **guides**(8,398/月):放在正文末尾。**钩子必须不同**(Gemini #4)—— 指南读者要的是技术知识,"每日一色"对他们不对味;用"设计色彩笔记/工具更新"类的技术向订阅承诺。**这需要 owner 确认内容产能**(§6 问题 2);
- **后端补一个缺口**:`/subscribe` 目前是 upsert 且**会覆盖 source、也不返回是否新订阅**,导致"表单提交成功"无法等同于"新增一个邮箱"。需让接口返回 `isNewSubscriber`(并保留首次 source),否则 §5 的指标测不准。

### P0-3 word-to-color:减法,不是加法(Codex #4 修正)

我原稿要在这页"加一个捕获表单"是**错的** —— 该页**已有两个**邮件表单(付费墙内解锁表单 + 页面下方常驻表单)。实际该做:

- **移除该页的 Auditor CTA**(属 P0-1);
- **下线调研 banner**(3,857 曝光、产出≈0;两位评审都主张砍。Gemini 主张彻底删,我倾向**先降级为捕获成功后的一行小字**,保留访谈价值 —— 由 owner 定,§6 问题 1);
- **不新增第三个表单**。

### P0-4 用好**已存在**的 guides→工具链接(Codex #3 修正)

我原稿提议"关键词映射 + 手工覆盖"是**重复造轮子** —— `GuideDetailPage` 早已渲染 `guide.links`,guides.ts 里有 317 条链接配置。实际该做:

- **给现有 `guide.links` 埋点**(`guide_tool_click`,带 guide slug + 目标路由)—— 现在是零埋点,所以"内容→工具"这条链路的真实 CTR **我们其实不知道**;
- **调整位置**:把工具链接区从当前位置提到正文中/末尾更显眼处(具体位置改动小、可回滚);
- **不新建第二套映射系统**。

### P0-5 给所有 Pro CTA 埋点(否则本阶段无法评判)

guides / color-detail / 其它页的 `/pro/` 链接一律加 `pro_cta_click {surface}` 埋点。**这是让 30 天后"捕获 vs 直推 Pro"可比的前提**,也是 §0.1 证据缺口的修补。

### P0-6 捕获之后的桥(Gemini #1 / #8)

- **欢迎邮件**:新订阅者收到的第一封信里,除了兑现钩子(每日一色 / 设计笔记),要有一条通往 Pro 或核心工具的自然路径 —— 否则捕获来的邮箱永远不会变成收入;
- **捕获成功后的引导**:提交成功不要只弹个 toast,直接把人送进一个相关工具(建立 `tool_used` 习惯)。

---

## §3 P1

**word-to-color 付费墙触发率**:4,184 浏览只触发 138 次墙(**3.3%**)。两位评审在此分歧 —— Gemini 主张立刻收紧 `FREE_GENERATIONS`,Codex 主张先把测量做对。**裁决:两步走** ——
1. 先补埋点(每会话生成次数分布),**同 session 就能上**;
2. 数据出来后做**一次**有明确回滚判据的收紧(例如 5→3),**预先写死回滚条件**:若付费墙触发率上升但 `pro_cta_click` 未同步上升、且页面跳出显著变差,则回滚。
不盲调、也不干等 30 天。

**AI 引荐观察**:给 chatgpt/perplexity/copilot 来源单独打标,月度看是否值得为 GEO 优化。

---

## §4 明确不做

不新建工具(等 08-20 GSC)· 不动 iOS(冻结至 08-12)· 不重启 Auditor · 不做付费投放 · 不给现有订阅者/预购意向者群发(需单独授权)· **不动 StoreKit/支付链路**(刚修完,零回归优先)· 不上弹窗/黏底栏(会触发 Google 侵入式插页惩罚,伤的正是我们的主渠道 —— Gemini #6)。

---

## §5 成本红线、验收与数据门

**红线**:不新增 generateStaticParams / ISR 家族、不新增 Next API 路由(P0 全是既有页面内组件插入 + 配置开关 + 一个既有 Express 接口的返回值补充);单 session 一次 commit + 一次 push;会话锁协议照旧。

**验收**:typecheck + vitest 全绿 + build exit 0 + 浏览器实测三处捕获位渲染/提交成功 + `/preorder/` 关闭态渲染正确。

### 数据门(30 天;分母口径已按 Codex #8 修正)

**不再用 pageviews 当分母**(它既非会话也非表单曝光)。需先埋"表单曝光"事件,用 **表单曝光 → 新增订阅** 作真实转化率:

| 指标 | 今日基线 | 30 天后目标 |
|---|---|---|
| 新增邮件订阅(去重、`isNewSubscriber`) | **1** | **≥ 40**(按表单曝光的 0.5% 量级估;Gemini 认为 0.17% 太松,采纳其上调建议,但以曝光而非浏览为分母) |
| 邮件表单曝光→订阅转化率 | 未测 | 建立基线(目标 ≥0.5%) |
| `guide_tool_click` CTR(现有链接) | **未埋点(≠0)** | 建立基线 |
| `pro_cta_click`(全站) | **未埋点** | 建立基线,并与邮件捕获对比 |
| 付费转化 | 1 | ≥ 2(样本极小,**仅作方向参考,不作判据**) |
| 走到废弃产品结账的人数 | 3 | **0**(硬性) |

**判据**:主看"捕获率是否达 0.5% 量级"与"内容→工具 CTR 是否成立"。达标 → 下阶段做邮件培育与 Pro 桥;不达标 → 说明问题不在捕获位而在流量意图,转向内容选题与工具选型的重新校准。

---

## §6 给 owner 的决策点

1. word-to-color 的访谈问卷:**彻底下线**(Gemini 主张)还是**降级为捕获成功后的次级入口**(我倾向)?
2. guides 的邮件钩子用什么?"每周设计色彩笔记"这类技术向承诺**需要真实的内容产能** —— 你能持续供稿吗?若不能,就统一用"每日一色"(转化率会低些但不食言)。
3. Auditor 商户侧下架:你自己在 LS 后台点,还是授权我经 LS API 处理?
4. 已留下预购意向的邮箱(subscribers.source='preorder'),要不要发一封"该功能暂缓"的说明信?(我不代发,需你授权)

---

## 附录:依据的 queries(可复现)

```sql
-- 分区流量(30d,pageviews 口径)
SELECT CASE WHEN path LIKE '/guides/%' THEN 'guides'
            WHEN path LIKE '/word-to-color%' THEN 'word-to-color'
            WHEN path LIKE '/colors/%' THEN 'color-detail'
            WHEN path LIKE '/notes/%' THEN 'notes'
            WHEN path='/' THEN 'home' ELSE 'other' END sec,
       COUNT(*) v FROM pageviews
 WHERE datetime(created_at) >= datetime('now','-30 day') GROUP BY sec ORDER BY v DESC;

-- 全部事件(30d)
SELECT event_name, COUNT(*) c FROM events
 WHERE datetime(created_at) >= datetime('now','-30 day') GROUP BY event_name ORDER BY c DESC;

-- 废弃产品仍在走的漏斗(30d)
SELECT event_name, COUNT(*) c FROM events
 WHERE event_name LIKE 'preorder%' AND datetime(created_at) >= datetime('now','-30 day')
 GROUP BY event_name ORDER BY c DESC;

-- 渠道(30d)
SELECT COALESCE(NULLIF(channel,''),'unknown') ch, COUNT(*) v FROM pageviews
 WHERE datetime(created_at) >= datetime('now','-30 day') GROUP BY ch ORDER BY v DESC;
```

---

## Review 记录(2026-07-24,原始输出见 session scratchpad)

两家均 **revise-then-ship**,修订已全部回写:

**Codex(gpt-5.6,read-only 仓库核查,124k tokens)** —— 又一次抓出"把已实现当待做":
- **Auditor CTA 实为 8 处 / 7 页 + pro-page 独立推广**(我原稿只写了 color-detail)→ P0-1 全面重写;
- **`checkoutUrl` 是 build 时烘入的公开 env,且 null 会回退成"预留创始价"而非"已取消"** → 必须商户侧先停售、再部署显式 closed 态;
- **guides 早有 `guide.links`(317 条配置)** → P0-4 从"造关键词映射"改为"给既有链接埋点 + 调位置";
- **word-to-color 已有两个邮件表单** → P0-3 从"加表单"改为"做减法";
- **证据口径**:pageviews≠会话;7 次 Pro 点击只来自唯一埋点的表面;`preorder_checkout_redirected` 只证明尝试打开 → §0.1 加修正说明,并新增 P0-5 补埋点;
- **`CotdSubscribeForm` 已用 `email_subscribed {source}` 约定**,后端 upsert 覆盖 source 且不返回是否新订阅 → 不造新事件名 + 后端补 `isNewSubscriber`;
- **`/preorder/` 本就 noindex + robots 禁止 + 不在 sitemap** → "保留链接权重"的理由不成立,改为"服务站外直链"。

**Gemini 3.1 Pro (High)** —— 战略侧:
- **捕获之后必须有通往 Pro 的桥**,否则邮件列表永远不变现 → 新增 P0-6(欢迎邮件 + 捕获后引导进工具);
- **别干等 30 天看付费墙不触发** → P1 改为"埋点 + 一次带回滚判据的收紧";
- **guides 与 color-detail 的钩子应差异化**(技术读者不吃"每日一色")→ P0-2 采纳,并把内容产能作为 owner 决策点;
- **0.17% 目标太松** → 数据门上调到 0.5% 量级(但按 Codex 意见改用表单曝光作分母);
- **禁止弹窗/黏底栏**(Google 侵入式插页惩罚会伤主渠道)→ 写入 §4;
- 主张彻底删调研问卷 / 301 preorder —— 前者留给 owner 定(§6-1),后者按 Codex 的事实(已 noindex)调整为保留诚实页面。
