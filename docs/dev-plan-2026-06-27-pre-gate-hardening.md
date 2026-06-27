# ColorArchive 下阶段开发计划书 — 2026-06-27(退出门前 ~2.5 周 · pre-gate hardening)

> 起草:2026-06-27 · 作者:Claude (Opus 4.8) · 依据:一次 6 维全局审计(45 项发现,16 项 critical/high
> 经对抗式验证、0 误报;28 项 medium/low)。上游:`dev-plan-2026-06-19.md`(验证/分发 + 退出门 §5)、
> `dev-plan-2026-06-22-auditor.md`(Auditor §0 build-gate)。**本计划待 Codex/Gemini 复审后定稿。**

---

## 0. 门纪律(未变,先读)

退出门仍在 ~2026-07-15。`dev-plan-2026-06-22-auditor.md` §0 的 **build-gate = STOP** 依然成立:
**gate 前不 build "Accessibility Auditor",不做任何 net-new 产品功能。** 本计划**不绕过该门**——它只做
**门前加固(pre-gate hardening)**:修真实 bug、补**让验证实验能被读出的测量管线**、清掉未合并的安全债、
打磨已上线的转化面。**每一条都是对"现有功能/验证漏斗"的修复,不是新功能(逐条标了 gate_safe)。**

成本红线(`reference_vercel_cost`):**不加 `generateStaticParams` / 新 ISR / 新 Next API 路由**;纯客户端
优先。`server/*` 改动不进 Vercel,需 droplet 部署(`ssh root@143.198.85.72 'cd /root/ColorArchive && git
pull && pm2 restart colorarchive-server'`)。每批一次 commit+push;push 前 `npm run typecheck` + `npm run
build` 必须真实捕获退出码。

---

## 1. 头条发现:验证实验现在【读不出来 + 买家流程是断的】

审计最重要的结论,直接决定门前这 2.5 周该干什么:

**A. 真实预订永远进不了 gate 的分子(已亲眼核实)。** `app/api/webhook/route.ts:176-197` 的 `order_created`
**只在 `isLifetime===true` 时**才 `notifyBackend(...)`。Auditor 预订是**一次性 ¥4,999 的非订阅 LS 产品**
(变体名 "Accessibility Auditor",不含 "lifetime")→ 真实刷卡预订会被**静默丢弃**:不写 `orders` 表、
不发收据/确认信。而 gate 分子是 `SELECT COUNT(*) FROM orders`(`server/routes/analytics.js:451-461`,目标 10)。
**后果:即便上一阶段接通的漏斗完美工作、真有人预订,gate 也永远读到 0,买家还被白扣款。** 现处休眠(因
`NEXT_PUBLIC_PREORDER_CHECKOUT_URL` 未配,页面走邮箱兜底),但**一旦把预订做"活"就立刻丢单 + 门永远无法
触发 build**。

**B. 当前唯一"活着"的信号(邮箱预订)完全不被 gate 看到。** checkoutUrl 未配时,`/preorder` 渲染
`CotdSubscribeForm source="preorder"` 兜底(`preorder-page.tsx:70-81`),但该表单**不发任何 track 事件**,
gate 的 `GATE_EVENTS` 也没有邮箱预订事件,分子只读 `orders.attributed_source`、从不读 `subscribers.source`。
**于是实验现在能产生的唯一信号——付费意向的邮箱预订——在退出门漏斗里根本不存在。**

> **含义:在修好 A+B 之前,07-15 的门读数是无意义的——分发做得再好也测不到。** 这就是门前第一优先级,
> 且完全 gate_safe(修断掉的接线,不是新功能)。

---

## 2. 工作分解(全部 gate_safe;按优先级)

### WS-A — 修好"测量 + 履约"回路(P0,先做,没有它一切白搭)

| # | 文件 | 问题 | 修法 | 工作量 |
|---|---|---|---|---|
| A1 | `app/api/webhook/route.ts:176-197` · `server/routes/webhook.js:46-129`(`/webhooks/order-completed`,已存在但**从未被调用**) | 非 lifetime 一次性订单被丢弃(见 §1A) | 在 `order_created` 加分支:**仅对识别出的预订变体**(按 `first_order_item.variant_name`/product 名精确匹配,**不是所有非-lifetime 订单**——避免误改未来其它一次性产品的履约)转发到 `/webhooks/order-completed`。**详见下方「WS-A 实现红线」** | M |
| A2 | `preorder-page.tsx:70-81,122-129` · `analytics.js:420-475` | 邮箱预订零事件、gate 不读(见 §1B) | 两处 `CotdSubscribeForm` 加 `onSuccess={()=>track('preorder_email_reserve',{from:'preorder'})}`;`GATE_EVENTS` 加该事件;`/analytics/gate` + `gate-report.cjs` 把 `subscribers.source='preorder'` 作为**次级分子**暴露 | S |
| A3 | `webhook.js:221-237` · `analytics.js:468-475` | 没有订单带 `attributed_source='preorder'`,按来源拆是死的 | A1 落地后,确保买家此前的 subscriber 行 `source='preorder'`(由 A2 保证),订单即继承;或在 webhook payload 显式传 source | S |
| A4 | `analytics.js:451-475` · `webhook.js:226-236` · `db.js:242 is_test` | gate 订单数**不过滤 test-mode**,owner/QA 测试单会假触发 PROCEED | `ordersTotal/ByProduct/BySource` 都加 `AND COALESCE(is_test,0)=0`,`gate-report.cjs` 同步 | S |
| A5 | `preorder-page.tsx:73-80,127` · `cotd-subscribe-form.tsx:46` · `server/routes/subscribe.js:69-95` | 预订邮箱被**静默塞进每日 COTD** 且收到**错的**(free-pack)邮件 | `CotdSubscribeForm` 加可配 `cotd?:boolean`(默认 true);预订实例传 `cotd={false}`;`subscribe.js` 在 `source==='preorder'` 时发专门的预订确认信(或至少不发 free-pack 信) | M |
| A6 | `cotd-subscribe-form.tsx`(整组件无暗色样式) | 上一阶段加到**暗色 `/preorder`** 上的捕获表单渲染成刺眼白盒(med a11y #19) | 补 `dark:` 样式 | S |
| A7 | `preorder-page.tsx:51-68` | checkoutUrl 配置后,付费跳转**无 return/thanks 追踪**,成交不可确认(med #3) | `/thanks` 落地页 fire `preorder_purchase_confirmed`,或 success 回跳带参由 page-tracker 记 | S |

> A1–A4 是"让门能读出真实需求"的最小集;A5–A7 是把买家/订阅体验和付费确认补齐。**做完 WS-A,
> 上一阶段的站内漏斗才真正可判读。**

**WS-A 实现红线(Codex 复审 must-fix #1/#2):** 现有 `/webhooks/order-completed` 有坑,A1 落地**必须同时**
补这些,否则会丢单/误判/发错信:
1. **只转发识别出的预订变体**,不要"所有非-lifetime 订单"(否则误伤未来其它一次性产品)。
2. **`order-completed` 现在不读 `testMode`、不写 `is_test`**(`webhook.js:49,77`)→ 扩 payload + INSERT 写
   `is_test`,否则 A4 的 test 过滤无源可滤、test 单仍会假触发 PROCEED。**同时:payload 传真实 LS order id
   (`event.data.id`)写入 `orders.order_id` 作幂等键**——`INSERT OR IGNORE` 靠它对 LS 重投去重;别用合成/随机 id。
3. **`order-completed` 现在吞 DB 错误**(`webhook.js:76` 静默)→ 付费履约不能静默失败,要 log/告警 + 非 200。
4. **attribution 现在只从 `subscribers` 表反查**(`webhook.js:68`)→ 接受**显式 `attributed_source='preorder'`**
   覆盖,保证订单带对的来源(配合 A3)。
5. **确认信**:`order-completed` 默认发通用 order/download 确认(`webhook.js:114`)——预订没有下载物。
   → `packId:'preorder-auditor'` 时发**专门的预订确认信**(或先抑制),别发"你的下载已就绪"。
6. **A2/A4 一起做**:邮箱预订是**次级**信号(主分子仍是真实订单);gate + gate-report + admin gate UI 的
   query 与**类型**要一致(都加 `COALESCE(is_test,0)=0`;新字段在三处同步)。

### WS-B — 把未合并的安全加固落到 main + 部署(P0/P1)

`fix/security-hardening-2026-05-30`(commit `4d3f0ab`)**至今未并入 main**;审计在当前 main 上复现了这些活
的漏洞。**别整支合并(已陈旧),cherry-pick 各 guard 到 main**,然后 droplet 部署:

| # | 文件 | 问题 | 修法 | 工作量 |
|---|---|---|---|---|
| B1 | `server/routes/ai.js`(`/ai/analyze-url`) | **SSRF(CRITICAL):** 抓任意用户 URL,无私网/元数据 guard,可打 DO 元数据 `169.254.169.254` | 移植 `server/ssrf-guard.js`(来自 4d3f0ab):拒非 http(s)、解析并拒私网/loopback/link-local/metadata IP(含 IPv6)、`redirect:'manual'` 逐跳校验、限响应体 ~2MB | S–M |
| B2 | `server/routes/auth.js`(`/apple-purchase`) | **Apple IAP 自助授权(CRITICAL):** 生产环境对**未验证 JSON/无 JWS** 交易也发 Pro | grant 前加 `if (IS_PRODUCTION && !verified) return 403`(仅放行 `APPLE_SANDBOX_ALLOWED_USER_IDS`);iOS≥1.2 已发 verified JWS,生产影响≈0。移植自 4d3f0ab | S |
| B3 | `ai-rate-limit.js:29` · `api-rate-limit.js:11` · `routes/auth.js:27` · `routes/ai.js:27`(`/ai/usage`) | **XFF 伪造(HIGH):** 限流器取 `X-Forwarded-For[0]`(可伪造)→ 配额/成本绕过 | 抽一个共享 `getClientIp(req)`(`trust proxy:1` 已设,用 `req.ip`),**全 4 处**统一调用(含 `/ai/usage`,别漏) | S |
| B4 | `server/routes/subscribe.js` · `server/index.js` | `/subscribe` 无鉴权无限流 → 邮件轰炸 + 订阅表灌水(污染验证数据);`express.json()` 无 body 上限 → 内存 DoS | 给 `/subscribe` 套已有的 per-IP 限流(同 events.js,5–10/min)+ 首次 INSERT 才发信;`express.json({limit:'100kb'})` | S |
| B5 | `server/.env.facebook` · git history(commits `ea02299`/`f6dd53a`) | 旧 FB token 在历史里(已轮换,确认旧的已吊销) | 确认旧 token 已 revoke(`project_facebook_token_expired` 说已轮换);仅核实,不改码 | S |

### WS-C — 转化/质量/a11y 打磨(P1)

| # | 文件 | 问题 | 修法 | 工作量 |
|---|---|---|---|---|
| C1 | `src/lib/palette-audit.ts` · `palette-audit-page.tsx` | 粘贴即跑**无界 O(n²) 对比 + O(n×5446) 匹配(同步)**,会冻住 **palette-audit 这个喂预订漏斗的最高意向页** | 先 cap 提取色(如 top ~60),audit() 改 debounce/异步或 worker;截断时提示 "showing top N" | M |
| C2 | `src/lib/palette-audit.ts` | 对**从不叠放**的色对也报对比失败("cry wolf",med #4) | **⛔ 推迟到门后(Codex must-fix #4):** "只算有意义 FG×BG"需要**角色推断**,那正是 §0 门后 Auditor 的语义,门前做 = 偷渡新范围。门前只允许**文案级**缓解(加一句"shows all pairwise combinations"),不做角色推断/筛减 | — |
| C3 | `src/components/pro-gate.tsx` | ProGate 对**包裹元素内任意点击**都扣每日导出配额,不只导出时(med #6) | 配额只在真实导出动作触发(传 `onExport` 回调 / 绑到导出按钮本身) | M |
| C4 | `src/components/contrast-page.tsx` | 旗舰 a11y 工具**自己**无 `aria-live`、hex 输入与色块按钮无可访问名(#13/#14)——卖 a11y 审计却对 AT 不透明,声誉最敏感 | 结果区 `aria-live="polite" aria-atomic`;输入 `aria-label`/`htmlFor`;色块 `aria-label` | S |
| C5 | `src/components/auditor-preorder-cta.tsx` | Link+onClick 无可见键盘焦点环(med #20) | 加 `focus-visible:` 焦点样式 | S |

### WS-D — 成本/卫生(P2,快赢)

- **D1 成本:** `app/colors/[slug]/vs/[slug2]/page.tsx` 可索引(无 `robots:noindex`),覆盖 ~29M 对的按需 ISR
  空间 → 爬虫驱动的渲染成本(`reference_vercel_cost` 的老病根);`/preorder` 未进 `app/robots.ts` Disallow
  (med #15/#27)。→ vs 页加 `noindex`,robots 补 `/preorder`。S。**(注:`/preorder` 本就 meta-noindex,其验证
  流量来自站内 CTA + 帖子,SEO 不是 /preorder 的获客手段——故 robots Disallow 与 §4"真实流量到 /preorder"
  不矛盾:那是站内/帖子流量,不是搜索流量。)**
- **D2 工具链:** `.next/` 里的 iCloud 重复文件(`routes.d 2.ts` 等)会让 **typecheck(仓库唯一验证门)假报错**;
  `.gitignore` 覆盖 `' 2.*'/' 3.*'` 但漏 `' 4.*'`;`public/downloads/` 下 ~1.9MB 重复 `' N'` 二进制未追踪未忽略
  (#9/#16/#17/#26)。→ 清理 + 补 `.gitignore`。S。
- **D3 脚本入库:** `gate-report.cjs` / `send-preorder-broadcast.cjs` 现 droplet-only、不受版本控制不可复审
  (med #5/#12/#18/#28)。→ 收进 `server/scripts/`(纯运维脚本,Vercel `ignoreCommand` 对 server-only 改动应跳过
  构建;若不跳,接受一次构建换可审计性)。S。
- **D4 文档:** `STRUCTURE.md` 显著陈旧、与 CLAUDE.md/README 计数自相矛盾(#24);`.env.local.example` 缺验证
  漏斗关键变量(含 `NEXT_PUBLIC_PREORDER_CHECKOUT_URL`)、还引用废弃的 Stripe(#25)。→ 更新两者。S。

---

## 3. 明确不做(本期 = 红线)

- ❌ build "Accessibility Auditor" 或任何 net-new 产品功能(§0 门未过)。C1 是修 **现有** palette-audit 的**性能**
  (cap/debounce),gate_safe;**C2 的"有意义 FG×BG"角色推断已推迟到门后**(那是 Auditor 语义,门前只做文案级缓解)。
- ❌ 加 `generateStaticParams` / 新 ISR / 新 API 路由 / 自建数据层。
- ❌ 把陈旧的 `fix/security-hardening-2026-05-30` 整支合并(只 cherry-pick guard)。
- ❌ 为逃避分发而堆代码(`dev-plan-2026-06-19` §0.5);本期代码都为"让门可读 + 堵住活漏洞 + 提升现有转化"。

---

## 4. 排序 + 07-15 分叉

1. **第 1 优先(P0,1–2 天):WS-A 与 WS-B1/B2/B3 并列同为 P0,不分先后**(Codex must-fix #3——SSRF/IAP 是
   活的 critical,不能排在测量之后)。做完即:门能读出真实预订 + 邮箱预订;买家不再被白扣;活的安全洞堵上。
   **server 改动部署到 droplet 后必须按 §5 验证**(test-mode 跑一笔预订核对 orders/is_test/attribution/邮件)。
2. **第 2 优先(P1):** WS-B4、WS-C(palette-audit 冻结、ProGate、contrast a11y)。
3. **第 3 优先(P2):** WS-D 快赢。
4. **分发不停(`dev-plan-2026-06-19` Track A):** 代码是为让门可读;读门靠真实流量到 /preorder。
5. **~07-02 tripwire / ~07-15 硬门:** 看每周自动 gate 邮件 + `/analytics/gate`。按 `dev-plan-2026-06-19` §5:
   真实预订 ≥10 → **PROCEED**,进 `dev-plan-2026-06-22-auditor.md` 的 M0→M4 建 Auditor;仍 ~0 → **off-ramp**
   (控成本/转移精力/打包评估)。

---

## 5. 约束 / recon / 验证

- **先做 30 分钟 recon** 确认函数签名:`server/routes/webhook.js`(`/webhooks/order-completed` 的 payload 形状 +
  `attributed_source` 解析)、`app/api/webhook/route.ts`(`notifyBackend` 签名、`firstAmount/firstCurrency/customData`
  来源)、`src/lib/track.ts`(事件签名)、`src/components/cotd-subscribe-form.tsx`(`onSuccess` 触发点)、
  `server/routes/analytics.js`(GATE_EVENTS + gate SQL)、`server/db.js`(`orders.is_test` 列)。
- **验证:** 前端改动 `npm run typecheck && npm run build`(先清 `.next/` 重复文件,见 D2,否则 typecheck 假红)。
- **LS 预订 fixture/集成测试(Codex must-fix #高价值项,A1 的回归网):** 用 LS **test-mode** 跑一笔预订并断言:
  ① `orders` 多一行;② `is_test` 标对、`/analytics/gate` 的 `orders` 计数**不含** test;③ `attributed_source='preorder'`;
  ④ **幂等**:重投同一 webhook 不产生重复行(`INSERT OR IGNORE` + LS 重试);⑤ 邮件:发的是预订确认信、**不是**
  "下载已就绪";⑥ 邮箱预订路径 fire `preorder_email_reserve` 且进次级分子。把它做成可重复脚本(droplet 或本地连 test DB)。
- **协作协议:** `git pull --rebase` → 读 `.claude/session-lock.json` → 以 "remote" 抢锁 → 每批一次 commit+push →
  释放锁(写回 null)。`public/downloads/*.{zip,swatches}` 是再生成漂移,别 commit。

---

## 6. 风险

| 风险 | 缓解 |
|---|---|
| 改 webhook 误伤现有 Pro lifetime/订阅履约 | A1 只**新增** order_created 非-lifetime 分支,不动 lifetime/subscription 路径;test-mode 先验 |
| cherry-pick 安全 guard 引入回归 | 逐个 guard 移植 + 单测/手测;不整支合并陈旧分支 |
| palette-audit 改动被误当"建 Auditor" | 明确只做现有页的性能/正确性修复,产出仍是单盘结果,无新路由/导出/报告 |
| server 改动忘部署 droplet | 部署清单写进 PR 描述;门测量类改动必须 droplet 验证后才算完成 |
| typecheck 假红导致误判 | 先清 `.next/` iCloud 重复文件(D2)再 typecheck |

---

*依据 2026-06-27 全局审计(6 维 / 16 项 crit-high 经验证)。Pre-gate hardening,门纪律不变。**Codex 复审 = REVISE,
4 条 must-fix 已全部纳入**(A1 收紧到识别变体 + 扩 order-completed 写 is_test/不吞错/专用确认信;A2/A4 合并 + is_test
过滤 + 类型一致;B1/B2/B3 升为并列 P0 + 含 /ai/usage;C2 角色推断推迟门后)+ 补 LS 预订幂等/归因集成测试。可执行。*
