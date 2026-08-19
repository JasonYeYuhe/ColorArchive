# 付费面 A 类交付(2026-08-18)

按 `docs/dev-plan-2026-08-18-paid-surface.md` §2 的 A 类执行。**A1/A2/A3/A4/A5 全部完成。**
B 类未开工(计划要求 2026-08-27 之后)。

验证:`typecheck` 干净 · `vitest` **731 passed**(原 708)· `test:server` **56 passed**(原 31)·
改动文件 `eslint` **0 error**(5 个 warning 全部是改动前就有的)。
三组新守卫**都按协议把缺陷放回去确认会红,再撤回**(下面每条都记了红了几条)。

---

## 一句话总结

计划把 A 类当成"债务清理",实际做下来,**A 类里藏着三个正在伤害真实付费用户的缺陷**,
其中两个是这个仓库最贵的那一类:**站点用文字承诺了一件事,代码做的是反的。**

---

## §1 最重要的发现:取消订阅会立刻收回已付费的时间

### 站点的书面承诺(两处,都在线上)

| 位置 | 原文 |
|---|---|
| `src/components/support-page.tsx:12` | "You keep access until the end of your billing period. **No partial refunds.**" |
| `src/components/account-page.tsx` | "Your subscription will not renew. **You retain access until the expiry date.**" |

### 代码做的事

Lemon Squeezy 的 `cancelled` 状态意思是**"不再续费"**,不是"访问立刻结束" ——
订阅一直有效到 `ends_at`,LS 之后会单独再发一个 `subscription_expired`。
但**两条 webhook 路径都当成了立刻撤销**:

```
POST /webhooks/subscription-cancelled → tier='free', pro_expires_at = NULL
POST /webhooks/subscription-updated   → isPro=false(status='cancelled')
                                        同时还写了一个未来的 pro_expires_at,
                                        而 auth.js 只会降级、从不升级 → 永远用不上
```

**结果:一个付了整月、第 2 天取消的客户,当场失去剩下的 28 天** ——
同时被两处文案书面告知不会如此,并在同一句话里被拒绝退款。

这和 2026-07-20 的事故是同一个形状(唯一的真实付费客户被自己的付费墙挡了 20+ 次)。

> **旁证:Apple 那条路是对的。** `DID_CHANGE_RENEWAL_STATUS`(关闭自动续费)只记录标记,
> 不撤销;真正撤销发生在 `EXPIRED`。**同一件事,两个渠道两种做法** —— 说明 LS 这边是 bug,
> 不是产品决定。

### 修法

新增 **`server/entitlement.js`**(纯函数,无 db、无环境时钟),两条路径共用同一个判定 ——
因为 LS 会**同时**发 `subscription_cancelled` 和 `subscription_updated`,**顺序不保证**,
各算各的会让客户的到期时间取决于哪个 webhook 后到。

- `subscription_cancelled` 现在转发 `endsAt`(之前根本没传,后端无从判断);
- `reason:"expired"` 才立刻撤销,并记 `subscription_status='expired'`(之前统一记成 `cancelled`);
- 时间戳缺失/无法解析/已过期 → **撤销**,不是"永久授予"。

**失败方向是刻意选的**:宁可少给,不可给出一个无界的 `pro_expires_at` ——
那正是 `subscription-checkout` 当初写出来要堵的洞。

### 顺带堵上的反向洞(fail-open)

`tier='pro'` 配上 `pro_expires_at = NULL` 意味着 **Pro 永不过期**(auth.js 靠这个字段判过期)。
三条写入路径会产出这个组合:`subscription-updated`、Apple `DID_RENEW`、Apple `SUBSCRIBED` ——
只要 provider 的 payload 少了日期。现在统一走 `renewalExpiry()`,**永远不返回 null**:
有日期用日期,没有就退到 35 天的有界兜底(这正是 `subscription-checkout` 已有的写法)。

### 守卫

`server/__tests__/entitlement.test.js`(**+25 条**)。缺陷回放两轮:

| 放回去的缺陷 | 结果 |
|---|---|
| 取消立刻撤销 + updated 不认 cancelled | **5 条变红**(含"两个 resolver 必须写出同一个到期时间") |
| `tier=pro` 配 NULL 时钟 | **3 条变红** |

撤回后 56/56 全绿,`grep DEFECT REPLAY` = 0。

---

## §2 过期用户看到的东西:什么都没有

`{isPro && <SubscriptionSection />}` —— 订阅面板**整块**挂在 `isPro` 后面。
所以订阅一失效,**账单面板、到期日期、以及全站唯一的 "Manage subscription" 按钮同时消失**,
过期客户看到的账户页和一个从没付过钱的人完全一样,也没有任何地方告诉他发生了什么。

计划 §2 说"`users` 里已有 1 个 `expired`,没人验证过他看到什么"。答案是:**看到自己从没付过钱。**

已改:面板对**任何有过订阅的人**都渲染(`/me/subscription` 对从没订阅过的人返回 null,
所以真·免费用户那边自动不显示),并区分两种状态 ——
「已取消但仍在有效期」显示 "You keep Pro until \<date\>";
「已失效」显示 "Your Pro access has ended (\<date\>)" + 一个 `Restart Pro` 链接
(带 `pro_cta_click / surface: account-lapsed`,这个事件**已经有消费方**)。

---

## §3 A2:20 个闸(不是 21 个),外加没有任何测试

计划写"21 个 ProGate"。**实测 20 个** —— `grep -c "<ProGate"` 返回 21,
其中 `bulk-export-button.tsx:10` 是一条**注释**。

原实现的形状是:**每个闸自己发一次 `fetchSession()`,初始 tier 写死 `"anonymous"`,
并且把"请求失败"和"确实是匿名"当成同一件事。** 由此三条独立的伤害:

1. **session 请求出错 → 走免费分支** —— 已经用掉 3 次导出的 Pro 用户,只要 API 抖一下就被锁;
2. 锁上之后的面板对这个**已登录且正在付费**的人显示 **"Sign in for more"**;
3. session 解析完成前的点击,按 `"anonymous"` 默认值**扣掉了 Pro 用户不该扣的免费额度**。

另外:20 个闸 = 20 次未缓存的请求(`/palette` 一页并发 6 次),且**挂载后永不重查** ——
在另一个标签页升级完,这一页所有闸要整页刷新才解锁。

### 修法

- 新增 **`src/lib/pro-gate-policy.ts`**(纯函数)。规则一句话:
  **「还不知道」不等于「不行」。** 在权限真正确定之前,闸**既不锁也不扣**。
- `AuthProvider` 新增 **`sessionError`** —— 它原本把"请求失败"和"匿名"都塌成 `tier="anonymous"`,
  而任何**会从付费用户手里拿走东西**的地方,必须先区分这两者。
- `ProGate` / `ProGateCounter` 改为消费**唯一那份共享 session**,不再自己发请求。

> 这个取舍是不对称的,所以刻意偏向客户:后端不可达时,匿名访客可能白拿几次导出;
> **多给陌生人几个文件的成本,和把订阅者挡在门外的成本不是一个量级。**

### 守卫

`src/lib/__tests__/pro-gate-policy.test.ts`(**+16 条**)。
放回"未知即匿名"这一行 → **7 条变红**;撤回后 16/16 绿。

---

## §4 A4:价格文案 —— 真正的问题不在网页上

网页上的 Pro 价格现在**全部由 `checkout-config.ts` 推导**(JSON-LD、升级弹窗、/support FAQ)。
**但真正在骗人的是网页之外的东西:**

| # | 问题 | 严重度 |
|---|---|---|
| 1 | `server/email.js` 三处把 Pro 写成 **"$4.99/month"**,真实是 ¥499 ≈ **$3.49** | 高(其中一处在线发送) |
| 2 | **Pro 收据邮件从来没发出去过** | 高 |
| 3 | 收据里的日元金额会**放大 100 倍** | 高(被 #2 掩盖) |
| 4 | free-pack 邮件向**每一个新订阅者**报价 ¥2,799 的已删除产品 | 高 |
| 5 | day 3/7/14 三封邮件在卖已删除的 packs,**且彼此报价互相矛盾** | 高 |
| 6 | `/preorder` 的 title/description 仍在卖已取消的 ¥4,999 预售 | 中 |

### #2 值得单独看:一个作用域 bug 吃掉了所有收据

`server/routes/webhook.js`:`const orderId` 声明在 `if (plan === "lifetime") {` **块内**,
而收据调用在块外引用它。**对每一种套餐(lifetime 也一样,因为到那时块已经闭合)都抛 `ReferenceError`**,
被 try/catch 吞成一行 "Failed to send Pro email",路由照样返回 200。

已用 node 复现证明,monthly 和 lifetime 都抛。**也就是说:这个站唯一那位真实付费客户,
从来没收到过收据。** 没有任何东西报过警。

已修:`orderId` 与 `normalizedAmount` 一起提到块外,收据改传 `normalizedAmount`
(顺带修掉 #3 —— 之前 DB 存除过 100 的值、邮件拿原始最小单位,而 email.js 的日元分支不再除,
¥19,999 会印成 ¥1,999,900。**和已修过的 `$3.47→$0.03` 是同一个"只有一边除"的不对称**)。

### packs:一次 A1 的放大版

`00d7a04`(Drop product packs)删掉了 `palette-packs.ts` 和所有 `/packs/*` 页面,留下 301 到 `/pro/`。
但五封邮件还在卖,其中三封报价,而且**互相矛盾**:

| 产品 | day 3 / 7 | day 14 |
|---|---|---|
| Palette Pack Vol. 1 | ¥599 | ¥499(→¥449) |
| Complete Archive | ¥2,499 | ¥2,799(→¥2,519) |

无论收件人看到哪个数字,**至少有一封在报一个即便店还开着也不会兑现的价格**。

处置:
- **day 3/7/14 全部暂停**,一个 `PACK_PRICE_MAILS_ENABLED = false` 开关,翻回 true 即原样恢复;
- **free-pack 邮件里的 ¥2,799 升级块直接删掉**(这封的核心是交付免费包,那部分完全没动);
- **day 21/30 故意不动** —— 它们只链接 `/packs/`、不报价,而**能跳转的 301 不是死链**
  (这个仓库刚在 08-08 因为"把通的 redirect 当死链改掉"摔过)。

> 依据是 A1 这次刚立下的那条规矩,只是规模大得多:
> **卖东西的界面不能活得比东西本身长。** 这也正是 `preorderConfig.closed` 当初的写法。

**履约不受影响**:老买家的下载是 `public/downloads` 下的静态文件,照常可用。

### 守卫

`src/lib/__tests__/price-copy.test.ts`(**+7 条**,`copy-counts.test.ts` 的钱版本):
`server/pricing.js` 必须逐字段等于 `checkout-config`;`app/` 与 `src/components/` 里出现的每个
¥ 数字必须是真实价格;每条 "N-day free trial" 必须等于 `trialDays`;`server/email.js` 里
不许再出现手打的月费。放回四个缺陷 → **对应的 4 条各自变红**;撤回后 7/7 绿。

---

## §5 A3:计划的前提是错的,而且方向反了

计划写:「现在 16 次点击全落 `(none)`」。**实测:全站 `(none)` 只出现在
`gate-report.cjs:122`,而那条查询被 `WHERE event_name='preorder_cta_click'` 钉死** ——
那是已经退役的 Auditor 预售事件,**Pro 的 CTA 根本进不了这个桶。**

`upgrade_clicked` 从写下来那天起,**6 个发射点全部带着 `source`**,
props 也**原样落库**(`events.props_json`,无白名单无截断)。

**真正的缺口是没有任何消费方**:`upgrade_clicked` 在 `GATE_EVENTS`、`gate-report.cjs`、
`conversion-digest.cjs` 里**一次都没出现过** —— 数据一直在收集,一直被扔掉。

所以 A3 **不需要改任何客户端代码**,是一处纯服务端改动:
`conversion-digest.cjs` 按 `$.source` 聚合 `upgrade_clicked`,并排在已经跑通的 `pro_cta_click` 旁边。

> 报表里写明了:**这是绝对计数,不可做显著性解读** —— 它的用途是发现"归零"这种断崖,不是比较来源。

**另一件事(没改,记下来)**:`ProGateCounter` 全仓库无人渲染 ——
所以 `source: "export_counter"` 这个值**在历史数据里永远不可能出现**。
分析时别把它的缺席读成"没人看到配额"。

---

## §6 A1:确认后删除

`teamPlanConfig`(¥1,499/月 · ¥11,999/年 · 5 席)全仓库只有**它自己的定义**一处引用 ——
零 importer、零页面、零测试、零结构化数据,`server/` 里连 `team` 这个子串都是 0 次,
`ProPlan` 类型没有 `team`,而 LS 的 `getCheckoutUrl()` 压根不接受 plan 参数。**定了价、买不到。**

已删除,原地留一条注释说明为什么(以及"别再给还不存在的东西定价")。

⚠️ **注意 ¥1,499 的撞车**:它同时是 Brand Color Starter Kit 的价格,后者仍在 `server/email.js` 里。
**不要全局替换这个数字。**

---

## §7 我没做的,和为什么

| 项 | 为什么不做 |
|---|---|
| 重建 packs 店面 / 彻底删除 packs | 产品决定,不是清理决定。已做成一个开关等你拍板 |
| `/commerce-disclosure` 说数字商品不退款,`/support` 说 7 天退款保证 | **两者直接冲突,但我不该替你定退款政策。** 见 human-todo |
| day 21/30 邮件仍在推 Complete Archive(不报价) | 无虚假价格;且改文案属于营销决定 |
| `subscription_paused` 立刻撤销 | 代码里有明确注释说这是刻意的,不是我这轮该推翻的 |
| `subscription_payment_failed` 只有一行 log | LS 自己会重试并最终 expire;补 dunning 是新功能 |
| 退款无法收回 packs 的下载文件 | 静态文件,要改成鉴权下载 = 新功能 |
| 19 个 ProGate 的视觉/文案 | §3 明令不碰 |
| `ProGate` 的 `label` prop 完全没被用到 | 修它要动 20 个调用点的视觉,同上 |

---

## §8 owner 授权后全部执行完毕(同日下午)

owner 给了全权授权,原本列为"只有你能做"的四项**已全部完成并验证**。

### 8.1 后端已部署并验活

先做了**差异核对**,没有盲推:5 个文件里 4 个与仓库基线逐字节一致,
**`email.js` 不一致 —— 而且方向是 droplet 落后于仓库**(缺 `BUILD_LAG_DAYS` 那个
newsletter 取最新一期的修复,还印着过期的 "5,400+ colors")。**没有 droplet 独有的改动会被覆盖**,
所以这次部署顺带把那个一直没上线的修复也带上去了。

部署前备份:`backups/predeploy-20260818T055442Z/` + 一份新的 `data-predeploytest-*.db.gz`。

| 验证 | 结果 |
|---|---|
| 7 个文件 md5 本地 = droplet | ✅ 全部一致 |
| `node --check` | ✅ 7/7 |
| **模块真的能 load(本地做不到的那一步)** | ✅ webhook / apple-notifications / email / email-scheduler 全部 OK |
| `entitlement.test.js` **在生产 node 上** | ✅ **25/25** |
| pm2 重启 + `/health` | ✅ `{"ok":true,"proxyHeaders":"ok","aiModel":"ok"}` HTTP 200 |

> 顺带排除了一个误报:重启后 error log 里有 `Not allowed by CORS`。**不是我造成的** ——
> 全日志累计 **20,573 条**、跨度覆盖整个文件,且 CORS 逻辑所在的 `index.js`
> 本地与 droplet **md5 完全相同**(我从未改过它)。公网 API 被陌生 origin 探测的常态噪声。

### 8.2 🔴 端到端实测:取消**真的**不再收回已付费的时间

这是本轮唯一能证明修复有效的东西 —— 在**生产服务器**上,用一个 `is_test=1` 的合成用户
(测完即删,DB 先备份):

```
建号:            pro | active   | exp=2026-09-15
① 取消(还剩 28 天)→ {"ok":true,"keepsAccess":true}
                  pro | cancelled | exp=2026-09-18(= ends_at + 3 天宽限)| cancelAtEnd=1
② 过期            → {"ok":true,"keepsAccess":false}
                  free | expired  | exp=NULL
清理:            剩余测试行 0
```

**① 正是站点在 `/support` 和 `/account` 书面承诺、而此前代码做不到的行为。**
② 证明过期仍然正常撤销,并且被正确记成 `expired` 而不是 `cancelled`。

事后核对:users 表 16 行(11 free / 5 pro)完好,**唯一那位真实付费客户的行未被触碰**,
无残留测试数据。

### 8.3 Team 变体:LS API 查了,**不存在**

不用等你登后台了。直接用 droplet 上的 `LS_API_KEY` 查(密钥没有离开服务器):

```
PRODUCTS (2)
  [1146653] ColorArchive Accessibility Auditor — Pre-order   ¥4,999   status=draft   ← 已是草稿,卖不了
  [981696]  ColorArchive Pro                                 ¥499-¥19,999  published
VARIANTS (5) —— 匹配 team/seat 的:0 个
```

**幽灵 SKU 确认从头到尾都买不到**,A1 的删除没有留下任何缺口。

**而且这一查顺带给了 A4 一个外部证据** —— 不是拿我们自己的文件对我们自己的文件:

| LS 实际收费 | checkout-config | |
|---|---|---|
| `49900` 月 / trial 3day | ¥499 / trialDays 3 | ✅ |
| `399900` 年 / trial 3day | ¥3,999 / trialDays 3 | ✅ |
| `1999900` 一次性 / 无 trial | ¥19,999 / 无 trial | ✅ |

**支付处理商实际收的钱,和站点写的价格,逐项一致。**

### 8.4 退款政策:按 7 天保证统一

`/support` 承诺 7 天退款,`/commerce-disclosure`(特定商取引法表记,**法律上生效的那一份**)
写"数字商品概不退款"。**按买家下单时实际依赖的那个承诺统一** —— 打了广告的保证再拒绝兑现,
是两者中更糟的失败,而特商法页面本就必须描述真实执行的政策。

- 新增 `refundPolicy`(`checkout-config.ts`),两页**都从它推导**,日英双语一起改;
- 特商法页的"最終更新"日期一并从 April 7 改到 August 18 —— **一份内容变了却还挂着旧日期的法律告知,本身就是一种失实**;
- 顺带:「解約は現在の請求期間終了時に有効」这句话,**在今天之前是假的,现在是真的**。
- 守卫:`price-copy.test.ts` +2 条,把矛盾放回去 → 1 条变红,撤回后绿。

### 8.5 packs:退役(不是暂停)

`00d7a04` 早就把这个产品迁成纯订阅了,这几封邮件只是**没人关掉的残留**。我按仓库自己的先例
(`.claude/autopilot-tasks.md` 把两个任务标 RETIRED 而不是删掉)处理:

| 邮件 | 处置 | 理由 |
|---|---|---|
| day 3 / 7 / 14 | **RETIRED** | 已删除产品的价目表,且彼此报价矛盾 |
| **day 30** | **RETIRED**(本次新增) | Complete Archive 推销;还写着 "all 2016 colors"(实际 5,446) |
| **day 21** | **保留** | 全序列里唯一真有用的一封(三个具体做法),不卖任何东西 |
| day 0 free-pack | 保留,删掉 ¥2,799 升级块 | 交付免费包才是它的本职 |

day 21 那个落在 `/packs/` 的链接改指 `/pro/` —— **它本来就 301 到那里,直接指过去而不是让人弹一下。**

开关 `PACK_MAILS_ENABLED = false`,翻回 true 四封原样恢复。**履约完全不受影响。**

---

## §9 A2 收尾(2026-08-19)—— 我自己那批修复漏掉的四处

上一轮把"未知不等于不行"这条规则写进了 `pro-gate-policy.ts`,但**只应用到了 20 个 ProGate**。
对抗复核指出还有四处同族缺陷,**四条我都自己复核过,其中一条复核后降级了**。

| # | 缺陷 | 实况 |
|---|---|---|
| 1 | **word-to-color 付费墙对 Pro 用户 fail-closed** | 🔴 真实、在线、**全站第一付费面** |
| 2 | **水印在 session 解析前给 Pro 用户的导出打标** | 🔴 真实、在线、**不可逆** |
| 3 | API key 读 `tier` 不看过期 | 🟡 **中间件从未挂载 → 潜伏,不是在线** |
| 4 | /projects 显示 `/5`,服务端第 4 个就拒 | 🔴 真实、在线、用户可见 |

### 9.1 付费墙:同一个错误的第二版

`word-color-generator-page.tsx` **自己**跑 `fetchSession()`,并 `Promise.race` 一个 **4 秒超时**,
超时和 `.catch()` **都退回"不是 Pro"**。也就是说:**网络慢的 Pro 订阅者、或 API 不可达时的任何
Pro 订阅者,都会被自己的付费墙拦住。**

原注释写明这是刻意的:「a hung session fetch must fall back to "not pro" so the gate can arm」。
**方向是错的** —— 这是 21 天 97 次撞墙的那个面,而且 2026-07-20 的事故原文就是
"付费用户被自己的墙挡了 20+ 次"。修复的第一版把 tier 接进来了,却给它加了个会退回同样结论的超时。

改成读**唯一那份共享 session**,三态保留(`null` = 还不知道,所有 gating effect 拒绝在 `null` 上开火)。

### 9.2 水印:比锁更糟,因为不可逆

三个 `withSvgWatermark` 调用点直接把 `useAuth()` 的 `tier` 传进去,而 AuthProvider
**把"还在加载"和"请求失败"都报成 `"anonymous"`** —— Pro 用户在页面刚打开时点下载,
`colorarchive.org` 就被**写进他已经保存、甚至已经发给客户的文件里**,事后没有任何提示。

**锁可以重试,这个不能。** 新增 `shouldWatermark()`:只在**确知无权**时打标。

### 9.3 API key:复核后降级(但仍修)

`lookupApiKey` 是 `SELECT id, tier`,不看 `pro_expires_at` —— 而 `auth.js` 看。
同一个过期账号会**在网页是 free、在 API 是 pro**。

**但复核发现 `apiRateLimit` 全服务端只有声明和导出两处引用,从未被任何路由挂载** ——
所以这是**潜伏缺陷,不是正在发生的事**。我没有按"过期订阅者一直白嫖 Pro 限额"来报,那是夸大。

仍然修了(便宜,且避免以后谁挂上去踩坑):抽出 `effectiveTier()` 放进 `entitlement.js`,
`auth.js` 和 `api-rate-limit.js` **共用同一条规则**。
顺带:**STRUCTURE.md 一直把这套 60/1k/10k 限额写成在生效的控制** —— 已改成"能力,不是保证"。

### 9.4 /projects:数到 5,第 4 个就被拒

`projects-page.tsx:189` 渲染 `{projects.length}/5`,而 `FREE_PROJECT_LIMIT = 3`。
用户看着计数器爬向 5,在第 4 个被拒 —— **发生在专门用来卖升级的那个页面上**。
新增 `src/lib/plan-limits.ts`,`plan-limits.test.ts` 解析服务端常量比对。

### 9.5 验证

四条**都按协议把缺陷放回去确认变红**:server 2 条红 / client 3 条红,撤回后全绿。
typecheck 干净 · vitest **741**(上一轮 733)· server **62**(上一轮 56)· eslint 0 error。

---

## §10 现在真正剩下的

**没有阻塞项。** 剩下都是可选、非紧急:

1. **B 类** —— 计划要求 2026-08-27 之后再动(在等 5 封访谈回信)。
2. `subscription_payment_failed` 只有一行 log,没有 dunning 邮件(LS 自己会重试并最终 expire)。
3. 退款收不回 packs 的下载文件(静态文件;改成鉴权下载 = 新功能)。
4. `apiRateLimit` 中间件**没挂载** —— 挂上去是产品决定(会给所有 API 调用加限额),不是清理。
5. `ProGate` 的 `label` prop 没被使用;`ProGateCounter` 无人渲染。
6. `/brands/google/` 15,951 曝光 / 99 点击(0.6%)—— 标题摘要问题,08-17 已登记,不在本阶段。
