# 产品质量开发计划(2026-09-05)· 把付费和免费的独家功能都做好一点

> 承接 `docs/dev-plan-2026-09-03-product.md`(批次 A 已执行,B/C 等 11-02 读出)。
> owner 的要求(2026-09-05 原话):「把我们目前付费的以及免费功能都做得更好一点,网站自己的 exclusive 功能的」。
> 全部数字取自 2026-09-05 的只读查询:PostHog 456902(HogQL,`$lib='web'`,60 天)、Azure 生产库
> `events`/`users`/`orders`/`ai_usage`/`projects`、GSC 网页后台(90/28 天)、HEAD `bc55c4f` 源码。
> 由 4 个并行只读调查产出,再经人工逐条复核 —— **复核推翻了调查里的两条**(见 §1.6),这份文档只写复核后的。
> 评审:Gemini 3.1 Pro (High) + Gemini 3.8 Flash (High),经 `agy` 调用,**两者都给出「部分接受」**。
> **这是第 2 稿**:第 1 稿的四批(F→G→E→R)被评审改成下面的顺序,G2 押后、E4 与 R1 砍掉,判据全部重写。
> 逐条核实记录见 §7 —— 采纳 11 条、驳回 3 条(驳回的都用代码证明了)。

---

## §0 🔴 硬约束(继承 09-03 计划,一条没变)

| | |
|---|---|
| **W1 A/B 到 ~2026-10-12** | ❌ 不碰 `app/guides/[slug]`、`guide-word-card.tsx`、`src/lib/experiment.ts`;❌ 不改 `word_generated` 的 props;❌ **不加任何页面加载即发的事件**(本计划所有新事件都只在点击/提交时发) |
| **不动词页那道墙的语义** | 09-03 §2/§4 已定:甲 11-02 读出前**不削弱也不搬动**。它是站史全部 3 笔成交的来源。本计划只修它旁边的 bug,不改 5 词/终身/邮箱解锁这三条规则 |
| **B3 冻结、试用永不删** | 09-03 A4 触发 §5:试用 3/3 转正。本计划不碰订阅形态、不碰价格 |
| **`git push ≠ 部署`** | 改 `server/` 要 scp → `sudo install` → 逐个 md5;只有改 `index.js`/路由才 `pm2 restart`(会给订阅者群发邮件) |
| **付费墙在 localhost 永远渲染不出来** | CORS 挡 api → `proUser` 恒 null。**闸门类改动只能上生产验** |
| **iOS v1.4 在审(`WAITING_FOR_REVIEW`)** | 本计划不碰 `ios/`。过审后第一件事是看 `posthog-ios` 有没有真实事件(扣掉 09-04 全天 70 条模拟器事件) |

---

## §1 现状(全部实测)

### 1.1 钱:3 个付费用户,全部来自同一道墙,付完就消失

| | |
|---|---|
| 外部活跃订阅 | **3**(id 25/33/41),全部月付 ¥499/$3.49,**MRR $10.47**;0 年付、0 终身(有史以来) |
| 试用 | 外部 **3 开 / 3 转 / 0 流失**;当前 0 个在试用 |
| 三人怎么买的 | **完全一样**:Google → `/word-to-color/` → 第 5 个词撞墙 → 点 Pro → `/pro/` → 结账。撞墙到成交 **97 秒 / 4 分 10 秒 / 5 分 10 秒** |
| 买了之后用什么 | **只用 word→color**。AI 生成:`ai_usage` 有史以来 **0 条 `user:` 行**;导出:60 天 3 次全是匿名;WCAG 报告:5 次全匿名;`projects` 表 **有史以来 0 行**(「Save to project」在 color-detail / image-palette / mood-palette / url-analyzer **四处都有**,不是没入口);批量 token 导出 0 |
| 付完之后还来吗 | id25:首扣后只有 24 次 `pro_bypass`,**08-15 起沉默 21 天仍在扣费**;id33:首扣后 1 次访问(3 个事件);id41:首扣后 1 次访问(09-04,6 个事件) |
| 🔴 id41 按了两次「年付」,**被按月付扣了 ¥500** | `checkout_clicked{plan:yearly}` ×2(08-31 09:07、09:09)→ `lsinv_8357021` ¥500 = monthly。`checkout-config.ts:147-166`:`NEXT_PUBLIC_PRO_YEARLY_CHECKOUT_URL` 未设时**静默回退到带选择器的产品链接**。这个缺陷 08-31 就在;09-03 批次 A 的 A5(owner 设 3 个 env var)是**针对它的补救,至今未执行**。Vercel 项目 API 不暴露 env,**无法从这边核实;但结果已经发生了** |

非词页的闸:60 天 `upgrade_clicked` 6 次(5 个 collections 页 + brand-generator)、`upgrade_modal_shown` 9 次(全在 brand-generator、全来自 ChatGPT)→ **0 次结账**。**站史上只有词页那道墙转化过。**

### 1.2 使用:哪些功能真有人用(60 天,去掉机器人后 ≈ 6,555 个有效会话,≈109/天)

去除规则见调查记录:无 `$browser` 的爬虫 50,802 会话、单会话 >100 pv 的重载循环 43 会话/222,794 pv、无任何交互的单页 27,282 会话。**下面每个「访问」都是下界。**

| 面 | 访问会话 | 真用了(证据) | 回访设备占比 |
|---|---:|---|---:|
| `/word-to-color/` | 1,492 | **69% 会话生成**(727/1,056,自 07-26);撞墙 169 | 14.4% |
| `/guides/*`(W1,勿动) | 1,727 | page_read 60% | 3.8% |
| `/brands/*` | 926 | 39 个会话点了「Click to copy」—— **但 `color_copied` 未埋点,0 条** | 3.5% |
| `/`(首页) | 709 | — | 23.1% |
| `/colors/*`(色卡) | 529 | copy 4、收藏 3、AI 起名 4 | 8.3% |
| `/collections/*` | 361 | page_read 81%;导出 zip 3;点 Pro 3 | 11.9% |
| `/all-colors/`(5,446 色浏览) | 248 | 162 个会话有点击;「Show more」44 会话;情绪筛选 Calm 17 / Luxury 16 / Energetic 14(**全部来自 `$autocapture` 的按钮文本,不是埋点**) | **24.2%(≥100 会话的面里最高)** |
| `/pick-for-me/` | 98(**≈1.6/天**) | **45 个会话按了 Go(46%,`$autocapture`)**;`track()` 调用 **0 处** | 22.4% |
| `/brand-generator/`(AI) | 41 | **59% 生成**(24/41,全站第二高);**28/29 落地会话来自 ChatGPT** —— 是 AI 助手引流的第一工具 | 12.2% |
| `/palette/`(调色板构建器) | 118 | **导出 0、下载 0** | 16.1% |
| `/compare/`(ΔE) | 20 | 9 个会话有点击;无事件 | — |
| `/tokens/` | 14 | 8 个会话有点击;无事件 | — |
| `/wcag-audit/` `/name/` `/image-palette/` `/color-quiz/` `/analyze/` | 7 / 7 / 7 / 3 / 2 | 全部**无埋点**;色相挑战连完成事件都不存在 | — |

🔴 **9 个独家工具页零埋点**:pick-for-me、compare、name、tokens、wcag-audit、color-quiz、image-palette、all-colors、collections 索引。**「有没有人用」对它们只能靠 `$autocapture` 点击猜。** 和 iOS §8.1 是同一种病:看不见的东西没法做好。

### 1.3 有机流量落在哪(GSC 90 天,≈3K 点击)

| 命名空间 | 点击 | 曝光 | CTR | 备注 |
|---|---:|---:|---:|---|
| `/word-to-color/` | **1,330(44%)** | 6,832 | 19.5% | 前 40 个查询里 **26 个是 word→colour 措辞** |
| `/brands/` | 459 | **53.3K** | **0.9%** | 曝光第一、CTR 垫底;`/brands/google/` 21K 曝光 → 128 点击 |
| `/guides/` | 322 | 45.5K | 0.7% | W1 |
| `/colors/` | 192 | 43.5K | 0.4% | **5,446 页里只有 ≈131 页 90 天内有过任一点击(2.4%)** |
| `/regions/` `/decades/` `/collections/` | 135 / 79 / 79 | | decades CTR 2.9% | |
| `/mixer/` | 31 | 964 | 3.2% | **排名 24.9,有上升空间** |
| `/seasonal/` `/today/` `/identify/` | **0 / 0 / 1** | | | **但 PostHog 显示 60 天 109 / 33 / 42 个有机会话 —— 全来自 DuckDuckGo/Bing/Ecosia,Google 一个没有**,GSC 看不见 |
| `/pick-for-me/` `/screen-test/` `/brand-generator/` `/compare/` `/palette/` `/tokens/` | ≤1 | | | Google 侧 ≈0 |

### 1.4 Pro 层在代码里到底是什么(HEAD `bc55c4f`,逐闸核过)

- **20 个 `<ProGate>`,共用一个 3 次/天的 localStorage 计数器**(`pro-gate.tsx:11`),UTC 零点重置(=JST 09:00),**无服务端记录**。登录的免费账号和匿名一样是 3 次。
- **8/20 严格意义上「付费内容就在闸旁边明文可选」**(collections zip、palette-generator 导出面板、`/palette/` Tailwind/Figma/StyleDict 三处、`/tokens/` 导出块、wcag 报告 PNG 与 CSV);**17/20 宽泛意义上**(同屏有免费的同数据)。**只有 3 个闸包的是同屏没有的派生内容**:BrandSystemPanel、DarkModePairsCard、CollectionContrastCard。
- 🔴 **切换格式的按钮会扣额度**:BrandSystemPanel 5 个 toggle、DarkModePairsCard 3 个 toggle 没有 `stopPropagation`,**看一遍三种格式就花光一天的额度,什么都没导出**。
- 🔴 **CollectionContrastCard 被闸住,但里面没有任何可点的东西** —— 只会被惩罚,永远不能被「用」。
- **锁定态什么都不解释**:`label` prop 从不渲染,没有「3/3 today」,没有重置时间;写着「Sign in for more」**但登录不改变额度**,且登录后落到 `/pro/` 而不是回工具页。
- **`/pro/` 与邮件里的承诺 vs 代码**:row5「WCAG 报告 Free = —」**是假的**(免费 3/天,且报告是可见矩阵的截图);`email.js:1280` 承诺 SwiftUI/Android/Flutter 导出器 —— **站内不存在**;`email.js:1124`「完整 5,446 色 token 集」—— 免费公开文件;`family-detail-page.tsx:284`「priority access to new collections」—— **无此机制**;brand-generator 指向「Brand Starter Kit」—— **无此产品**;terms「API access」—— 限流器**没挂载**,0 个用户有 key。
- **真正独家的资产全是免费的**:5,446 色算法命名 + 色调伴侣/类似/互补关系、261 个精选集、333 篇指南、确定性 word→colour 哈希、派生的暗色配对与品牌中性色系统 —— 且完整归档在 `public/downloads` 免费九种格式。

### 1.5 词页的 URL 重写在制造假流量

`word-color-generator-page.tsx:318-332`:**每次输入变化都 `router.replace(?q=)`**。PostHog 把每次 replace 记成一个 `$pageview` ⇒ 该页 **≈48 pv/会话**。极端案例:**08-15 付费用户 id25 一个会话 45,768 次 pageview**(峰值 14,928/小时);07-29 一个 360px 手机会话 11,320 次;**09-05 今天还有一个在跑**(2,414 次)。根因**未诊断**(只读任务;`LAST_WRITTEN_KEY` 的 try/catch 为空,存储被禁时守卫失效是一个候选)。后果:**PostHog 上该路径的任何 pageview 计数都不可用,只能用 distinct session。**

### 1.6 🔴 复核推翻的两条(留档)

1. 调查把「id25 付费后 40 分钟内被墙 19 次」写成待修 bug。**它是 07-22 就修掉的历史 bug**(`07b379c`,「paywall honors Pro accounts」),id33/id41 付费后立即 `pro_bypass`。**不修。**
2. 调查写「12/18 明文渲染」(来自 09-03 记忆)。HEAD 是 **20 个闸**,严格口径 **8/20**、宽泛口径 **17/20**。数字差异是口径不是代码变了;本计划用严格口径。

---

## §2 诊断(先写反方)

**反方(必须原文保留,因为它与数据同样相容)**:「这是一个即查即走的搜索工具。3 个付费者买的是『多查几个词』,买完就走是**正常**的 —— 配色是一次性任务。你把 Pro 层修得再诚实、再好懂,也不会多一个人续费;把独家功能做得再好,回访率也是 8.6% 的天花板。真正的杠杆在 11-02 那份读出(要不要一次性交付物),这两周任何『做好一点』都是在等待期里给自己找事做。」

**这个反方有一半是对的**:本计划**不承诺**任何一项能改变 MRR。它承诺的是三件更基本的事,每一件都有一个现在就在发生、可测的坏结果:

1. **有人在为不存在的东西付钱,有人在为选错的东西付钱。** id41 按年付被扣月付(¥3,999 vs ¥499,少收 ¥3,500,且第一次续费 10-03 就是流失风险);邮件向每个 Pro 承诺 SwiftUI/Android/Flutter 导出器;`/pro/` 说 WCAG 报告免费用户拿不到。**这些不是「转化优化」,是把假话改成真话** —— 09-03 A2 的续篇。
2. **免费用户在被一个不是付费墙的东西惩罚。** 20 个闸共用 3 次/天,看三种格式就花光,锁定后什么都不解释,让人登录却登录无用。这层**从来没转化过任何人**(60 天 6 次点击 → 0 结账),它只是摩擦。**把它拆到只剩真的,免费体验直接变好,Pro 不损失任何真实价值。**
3. **独家功能里最被用的那几个是坏的或看不见的。** pick-for-me 98 会话/46% 按 Go,**返回的是单色板,中文输入返回空**(07-30 实测,未修);`/all-colors/` 回访率全站最高但筛选不能分享、翻页要点;`/brands/` 53K 曝光却没有一次复制被记录;9 个独家页零埋点。**「做好一点」的第一步是能看见,第二步是修坏的,第三步才是加东西。**

**评审补了第二个反方,我采纳了它**:「20 个闸里那 8 个『明文可见』的 PRO 徽章,单独看谁也没转化过;但它们合起来在**塑造『Pro 是一整套工具』的认知**,而那 3 个人在第 5 个词撞墙时愿意付 ¥499,可能正是因为这个认知。拆掉它们,墙就从『一套工具的入口』变成『查第 6 个词收 ¥499』。」这条**同样无法用 N=3 证实或证伪**;但它的风险落在 100% 收入来源上,而拆闸的收益是免费用户少一点挫败 —— **不对称,所以押后到 11-02**。

**所以本计划的形状是:先看得见(E1),再修真 bug(F),再把闸做诚实但不拆(G1/G3-web),再做独家面(E)。** 它不押注收入;它把「等 11-02」这段时间用来让产品配得上那份读出 —— 无论读出是哪一支。

---

## §3 计划 — 按此顺序执行,每批一个 commit

| 序 | 项 | 天 | 一句话 |
|---|---|---:|---|
| 1 | **E1** 埋点 | 1 | 9 个零埋点独家面 + `/brands/` 复制 + seasonal/today/identify —— **先看得见** |
| 2 | **F1** 年付回退 | 0.3 + owner 15 分钟 | 不许静默回退成月付 |
| 3 | **F4** ProGate 三个纯 bug | 0.3 | toggle 不扣额;对比卡解闸;删死代码 |
| 4 | **G1** 锁定态说人话 + 登录真有用 | 0.5 | 显示 n/3 与重置时间;登录 → 10/天 |
| 5 | **G3-web** 承诺真话化(只改网页侧) | 0.3 | `/pro/` row5、family-detail、brand-generator、terms、product-examples |
| 6 | **F2** 词页 URL 重写去抖 | 0.5 | 每词一次而非每键一次;**带回归清单** |
| 7 | **E2** `/all-colors/` | 1 | 筛选进 URL、连续加载 |
| 8 | **E3** `/brands/` → 归档 | 1 | 每个品牌色链到最接近的归档色 |
| 9 | **E5** 非 Google 入口 + `/mixer/` → 归档 | 1 | seasonal / today / identify / mixer 各加「进归档」与复制 |
| 10 | **F3** pick-for-me 两个缺陷 | 0.75 | CJK 子串匹配;亮度带塌陷 —— **排最后,1.6 会话/天** |

合计 ≈ **6.5–7 个工程日**。**押后到 11-02 之后**:G2(拆 8 个明文闸)、G3-email(`server/email.js` 需 `pm2 restart`)。**砍掉**:E4、R1(理由见 §4)。

### 1 · E1 · 埋点(先做;其余每一项的判据都从这里的上线日起算)

- 做什么:只在**用户手势**上发,一个名字回答一个问题 —— `archive_filter{kind}`、`archive_show_more`、`archive_copy{format}`(`/all-colors/`);`collection_open{slug}`(索引);`compare_run`;`name_generate`;`token_row_copy{step}`、`token_export{format}`;`audit_run`、`audit_copy`;`hue_game_started/completed{score}`(与 iOS 同名);`image_extract`、`image_copy`;**`color_copied{variant:"brand"}`**(`/brands/*`「Click to copy」,926 会话/60 天却 0 条);`seasonal_copy`、`today_copy`、`identify_result`(E5 的三个入口页);`pick_go{lang}`、`pick_copy`(F3)。全部走 `track()` → 后端 + PostHog。**不加任何加载即发的事件。**
- 怎么验:**每个事件在生产上点一次,查到达后端 `events` 与 PostHog,然后删掉那条测试记录**(09-03 A1 的做法 —— 阈值是个位数,一条合成事件就污染)。
- 判据:无。这是仪器。**它的上线日期是 E2/E3/E5/F3 所有「30 天绝对数」的窗口起点。**

### 2 · F1 · 年付按钮静默回退成月付(id41 已经中招)

- 做什么:`checkout-config.ts:147-166` —— 当 `NEXT_PUBLIC_PRO_{YEARLY,LIFETIME}_CHECKOUT_URL` 未设时,**不许**回退到带选择器的产品链接。若 LS 支持 URL 预选 variant,回退链接带上它;否则隐藏该计划的按钮并在构建期 `console.warn`。**同时** owner 做 09-03 A5:LS 后台 → Products → 每个 variant → Share → 3 个 `/buy/<uuid>` → Vercel env → **重新部署**(`NEXT_PUBLIC_*` 是构建期变量)。
- 判据(**评审改的,原来的 60 天观察在 N≈0 下读不出**):**一次生产手工验证** —— 点年付 → LS 页面已选中 yearly(截图存 `docs/`);点月付 → monthly。不设观察窗。
- ⚠️ owner 决定:**要不要给 id41 发邮件**(他按了年付、被扣了月付,LS 后台可改 variant)。客户邮件需 owner 单独授权。

### 3 · F4 · ProGate 的三个纯 bug

- (1) BrandSystemPanel 5 个格式 toggle(`brand-system-panel.tsx:146-160`)、DarkModePairsCard 3 个(`dark-mode-pairs-card.tsx:41-52`)加 `stopPropagation` —— 切换格式不扣额度。(2) `collection-detail-page.tsx:134` CollectionContrastCard **解闸**(里面没有可点的,闸只会惩罚)。(3) `ProGateCounter`(`pro-gate.tsx:37-92`)导出但 0 处渲染 —— G1 用上或删。
- 判据:生产上切三种格式后 `colorarchive_export_count` 仍为 0;collections 页对比卡在第 3 次导出后不再变暗。手工验证,不设观察窗。

### 4 · G1 · 锁定态说人话,登录真有用

- 做什么:`pro-gate.tsx:200-237` 渲染 `label`;显示「今天 n/3 次免费导出已用 · 明天 09:00(JST)重置」(按访客本地时间换算 UTC 零点)。**「Sign in for more」今天是假话**(`decideGate` 只认 pro/非 pro)—— 改成真话:`pro-gate.tsx:127` 按 tier 传 `limit`(free 账号 10/天,匿名 3/天),与 AI 配额(匿名 3 / 登录 10)对齐。**评审说「改 policy 数字运行时不生效」是错的**:`decideGate` 用 `limit - used` 比较,传什么就是什么;localStorage 荣誉制是既有事实。
- 判据(**评审删了分母为 2 的比率**):手工验证 —— 匿名第 4 次导出被锁且能看到 n/3 与重置时间;登录后额度变 10。另记录 60 天 `upgrade_clicked{source:export_locked_signin}` 之后的 `login` **绝对数**(基线 0),只作信息,不作判据。

### 5 · G3-web · 承诺真话化(只改网页侧;bug 修复)

- 做什么:`/pro/` row5 WCAG「Free —」→ 真实状态(免费 3/天);`family-detail-page.tsx:106/:135/:284` 删「priority access」「downloadable assets with Pro」;brand-generator WhatsNext 的「Brand Starter Kit」→ 指向 `/pro/` 真实内容或删;`terms-page.tsx:17`「API access」→ 删(限流器未挂载、0 key);`product-examples-page.tsx:105-108`「every collection ships as live color tokens with Pro」→ 免费。
- 🔴 **`server/email.js:1280/:1124`(SwiftUI/Android/Flutter 导出器、「完整 token 集」)押后**:评审核实 `email.js` 被 7 处 `require()` 在启动时加载(Node 模块缓存),**改它必须 `pm2 restart`,而 restart 会给订阅者群发邮件**。我第 1 稿写的「发送时读取,待核」是猜错了方向。**搭下一次本来就要 restart 的部署一起改**,记进 human-todo。
- 判据:`grep -in "starter kit\|priority access\|api access" src` 为 0;`price-copy`/`copy-counts` 守卫绿。

### 6 · F2 · 词页 URL 重写:每键一次 → 每词一次

- 做什么:`word-color-generator-page.tsx:318-332` 改为输入稳定 ≥ 500ms 后再 `router.replace`,且 replace 前比较 `searchParams.get('q')`,相同则不写。**URL 语义不变**(仍是 `?q=<word>`)。另尝试复现 §1.5 的循环(禁用 sessionStorage 后输入);复现不出就记「未复现」,不猜。
- 🔴 **两位评审都把这条标为「碰了唯一收入页」的风险,我同意风险但不同意不做**:≈48 pv/会话让该页所有 PostHog pageview 计数失效,且 08-15 那个 45,768 次的会话是**付费用户**。所以做,但带**回归清单**(PR 里逐项打勾):分享链接 `?q=` 落地仍免费、reload 不解墙、第 6 个新词仍撞墙、邮箱解锁仍生效、`word_generated` 的触发时机与 props **逐字节不变**、`sudo node w1-readout.cjs` 改前改后同数。
- 判据:上线后 7 天,PostHog 上该页 `$pageview` / **去机器人后的** distinct session(用 §1.2 的过滤集)从 ≈48 降到个位数;7 天内**不再出现** >1,000 pv 的单会话。

### 7 · E2 · `/all-colors/`:全站回访率最高的面(24.2%)

- 做什么:筛选/排序状态写进 URL(`replaceState` 节流,**不用 `useSearchParams`**);「Show more」改为滚动到底自动加载(保留按钮作无 JS 回退);Copy hex 走 E1 的 `archive_copy`。**不动** 5,446 色的生成逻辑与 `/colors/[slug]`。
- 判据(**评审改的:不设目标,不设「>0 即成功」**):E1 上线后 30 天,记录 `archive_filter` 与 `archive_copy` 的会话**绝对数**,与 `$autocapture` 基线(筛选 ≈81 会话/月、复制 2/月)**同口径**并排写进 11-02 决策会材料。**这一项不能「成功」也不能「失败」**,它回答的是「归档本身有没有人当工具用」。

### 8 · E3 · `/brands/*`:53K 曝光的门,通向独家归档

- 做什么:不改 SEO 文案。每个品牌色旁加「归档里最接近的颜色」链接(`findClosestArchiveColor`,`app/word-to-color/[word]/page.tsx` 已用)→ `/colors/{id}` 拿色调伴侣/类似/互补;顶部一键「Copy all as CSS / Tailwind」(免费)。事件:`brand_archive_click{brand}`、`color_copied{variant:"brand"}`。
- 判据(同 E2 的口径):30 天绝对数,基线 0(功能不存在)—— **「>0」不是成功**,只是第一次有数。与 `$autocapture` 的 39 会话/60 天复制点击并排记录。

### 9 · E5 · 非 Google 入口页 + `/mixer/`(评审补的两条,数据支持)

- 事实:`/seasonal/` `/today/` `/identify/` 60 天合计 **184 个有机会话,全部来自 DuckDuckGo/Bing/Ecosia,Google 0**;它们是真正的自动化独家功能(每日色、季节色、图片识色),没做过任何推广;`/mixer/` GSC CTR 3.2%、排名 24.9。
- 做什么(功能,不做 SEO 文案):四个页各加「在归档里打开」(最接近归档色 → `/colors/{id}`)与复制;E1 的 `seasonal_copy`/`today_copy`/`identify_result` 事件;`/mixer/` 的混合结果链到最接近归档色。
- 判据:同 E2/E3 口径,30 天绝对数,不设目标。

### 10 · F3 · pick-for-me 两个缺陷(排最后)

- 事实:**≈1.6 会话/天**,Google 90 天 ≤1 点击 —— 评审说它是「玩具」,数字上没错。留下它的理由只有两条:它**坏着**(返回单色板、中文返回空),以及它是少数几个交互式独家工具;砍掉不损失收入。**排最后,预算 0.75 天,超了就停。**
- 做什么:(1) CJK 子串匹配(`tokenize()` 按空格切、`SCENARIO_KEYWORDS` 精确匹配 ⇒ 11 个中文 chip 里 10 个返回空);(2) `pickColorsFromFragments()` 只按色相根打分,亮度/彩度片段作约束(优先 Silk–Dusk,每族最多一色),填充循环按族去重。
- 判据(**这是 bug 修复,判据是测试不是观察**):单测钉死 —— 11 个中文 chip 各 ≥4 色;`Coffee shop brand` / `Wedding invitation` / `Yoga studio website` 各 ≥3 个亮度带、≥4 个色族。E1 的 `pick_go`/`pick_copy` 只作信息。

## §4 明确不做

| 不做 | 原因 |
|---|---|
| **G2 · 拆 8 个「明文可见」的闸**(押后到 11-02 之后) | 两位评审一致:徽章单独看没转化过,但**可能在塑造「Pro 是一套工具」的认知**,而那正是 3 个人付费时的语境。N=3 证不了也证伪不了;风险落在 100% 收入源上,收益是免费用户少点挫败 —— 不对称。F4+G1 已经去掉了闸最伤人的部分(扣额 bug、不解释)。 |
| **R1 · Pro 的查词历史/调色板同步** | 两位评审一致砍。理由:与 09-01 W-2、09-03 B1 同一片领地,11-02 要决定的正是「这是订阅还是一次性任务」;3 个付费者付完就消失,没有人在要同步;我第 1 稿的判据「0/3 不构成否定」**是把失败预先豁免** —— 一个不能失败的判据不是判据。owner 可推翻,但默认不做。 |
| **E4 · brand-generator 的 Save to project** | 41 会话/60 天且 28 个来自 ChatGPT 的瞬时流量;`projects` 表在**四个已有入口**下有史以来 0 行 —— 再加第五个入口不会改变这个事实。 |
| **G3-email · `server/email.js` 里的假承诺** | 改它必须 `pm2 restart`(7 处启动时 `require`),restart 会群发邮件。**是真的假承诺(给每个新 Pro 的欢迎邮件写着 SwiftUI/Android/Flutter 导出器)**,搭下一次必要的 restart 一起改;记进 human-todo。 |
| **动词页墙的任何规则**(5 词、终身、邮箱解锁、文案) | 09-03 §2/§4:11-02 前不削弱唯一转化过的墙。**「5 词终身不重置、回访者被墙 490 次」是个真问题,但要等 11-02 的读出一起决定** |
| **B1 一次性 SKU / 任何新 SKU** | 11-02 读出前提未满足 |
| **改价、A/B、订阅形态** | B3 冻结;A/B 与 W1 抢分臂 |
| **服务端导出计数器**(让 3/天「真的」限住) | 方向反了:那是把假闸做成真闸,惩罚免费用户换来 60 天 0 结账的东西。G2 是拆假闸,不是加固它 |
| **新 AI 功能** | 0 个付费者用过 AI;60 天 AI 总花费 ≈ $0.14;需求为零的地方不加 |
| **API 分级 / API key** | 限流器未挂载、0 用户有 key、terms 里的承诺按 G3 删掉 |
| **`/colors/*` 5,446 页的 SEO 改造** | 90 天只有 131 页有点击,CTR 0.4%,查询是 hex 查询意图;这是内容/SEO 线,不是本计划(功能)的事 |
| **`/brands/` 的 title/meta 优化** | 同上 —— E3 只做功能,不做文案;SEO 另立项 |
| **iOS** | 在审;`ios/` 不动 |
| **成本** | 已在 $20 含额内 |

---

## §5 会推翻或改写本计划的信号

- **id41 在 10-03 第一次续费时流失** → F1 的 bug 直接丢了一个客户;§6 那封邮件的决定要在 10-03 前做。
- **F2 上线后 7 天 PostHog 仍出现 >1,000 pv 的单会话** → 循环根因不在 replace 频率,回到 1.5 的存储假说复现。
- **E1 上线 30 天后,`/all-colors/` 的 `archive_filter` + `archive_copy` 会话数合计 < 40**(基线 `$autocapture` ≈81+2/月) → 埋点比 `$autocapture` 漏得多,先查仪器再谈 E2 的效果。
- **F3 上线 30 天 `pick_go` < 10 会话** → pick-for-me 的 98 会话里大半是 `$autocapture` 误判,该工具没有真实使用者,E 批后续不再投入它。
- **甲 11-02 读出 ≥12 且 `/tokens/` 有结账** → B1 取消、卡片扩到 `/colors/*`,**E3 的「最接近归档色」链接就成了那条路的一部分**,优先级上调。
- **甲 11-02 ≤3 且 A1 = 0** → 词页转纯分发;G2 与 R1 **永久不做**(没有付费面可优化)。
- **甲 11-02 ≥12 或 B1 出单** → 11-02 决策会重开 G2(有了「Pro 是什么」的答案再决定徽章去留)。
- **W1 10-12 读出 <2×** → 内容页读者不进工具;E3「门→归档」的假设也要重估。
- **GSC 10-03 `/word-to-color/` 28 天点击 < 431** → 回滚 `word-color.ts` FAQ 措辞(既有守卫,与本计划无关但同期)。

---

## §6 owner 需要决定的三件事

1. **设 3 个 LemonSqueezy env var 并重新部署**(09-03 A5,15 分钟)。F1 的代码防线之外,这是让年付真的能买到的唯一方法。
2. **要不要给 id41 发一封邮件**:他 08-31 两次按年付、被扣了月付 ¥500。可选做法:说明 + 主动提供改成年付(LS 后台可改 variant)。客户邮件需你单独授权。
3. **R1 要不要推翻评审、还是做**。两位评审一致砍掉它,我采纳了(§4 有理由)。如果你仍想做,说一声,它 2 天;但请先看 §4 那条「一个不能失败的判据不是判据」。

---

## §7 评审记录(2026-09-05)

调用:`agy --print "$(cat brief.md)" --model gemini-3.1-pro-high < /dev/null` 与 `--model gemini-3.8-flash-high`,brief 开头「不要用任何工具」,inline 全文。两份均「**部分接受**」。**每条都先核实再采纳;驳回的三条都有代码证据。**

| # | 评审意见 | 来源 | 核实 | 处置 |
|---|---|---|---|---|
| 1 | id41 08-31 中招,不能怪 09-03 才布置的 A5 | Pro | ✅ 措辞因果倒置 | §1.1 改为「缺陷 08-31 就在,A5 是补救、未执行」 |
| 2 | 「零埋点」却引用 Calm 17/Luxury 16,是幻觉 | Pro | ❌ 数字来自 `$autocapture` 按钮文本(§1.2 表头已说明) | 在表格行内明确标注来源 |
| 3 | `projects` 0 行不能推「不要」,因为按钮不存在 | Pro | ⚠️ brand-generator 上确实没有;**但 color-detail/image-palette/mood-palette/url-analyzer 四处有,仍 0 行** | 标注四处入口;结论反而更强,砍 E4/R1 |
| 4 | F1 的「60 天每笔一致」在 N≈0 读不出 | Pro+Flash | ✅ | 改为一次生产手工验证 |
| 5 | E3/E4 「>0 即成功」是零改善也达标 | Pro+Flash | ✅ 基线 0 是因为功能不存在 | 改为「30 天绝对数、不设目标、不能成功也不能失败」 |
| 6 | G1 分母为 2 的比率无意义 | Pro | ✅ | 删比率,只留手工验证 + 绝对数 |
| 7 | **E1 必须第一** | Pro+Flash | ✅ 先看见再改 | 顺序改为 E1 → F → G → E |
| 8 | G3 是忙碌工作,scp/pm2 风险不值得 | Pro+Flash | ⚠️ 网页侧零风险;**`email.js` 被 7 处启动时 `require`,改了必须 restart** —— 我第 1 稿「发送时读取」猜错 | 拆成 G3-web(做)与 G3-email(押后到下次必要 restart) |
| 9 | F2 碰了唯一收入页,违反 §0 | Pro+Flash | ⚠️ 不碰墙的规则,但确是收入页 | 保留,降序到 E1/F1/F4/G1 之后,加回归清单 + `w1-readout` 前后对比 |
| 10 | **G2 在削弱 Pro**:徽章塑造「一套工具」的认知 | Pro+Flash | ⚠️ 无法用 N=3 证实或证伪;**风险不对称** | 押后到 11-02;F4+G1 保留 |
| 11 | **R1 砍掉**:违反 11-02 原则,「0/3 不构成否定」是预先豁免失败 | Pro+Flash | ✅ 后一条尤其对 —— 我在别人的计划里批过同一件事 | 砍掉,记 §4,owner 可推翻 |
| 12 | 漏了 `/mixer/`(CTR 3.2%、排名 24.9) | Pro+Flash | ✅ | 加进 E5 |
| 13 | 漏了 seasonal/today/identify(184 个非 Google 有机会话) | Flash | ✅ 好抓 | 加进 E5,E1 补事件 |
| 14 | E4 优先级错(41 会话、ChatGPT 瞬时) | Pro+Flash | ✅ | 砍掉 |
| 15 | F3 是 1.6 会话/天的玩具,砍 | Flash | ⚠️ 数字对;但它坏着,且是少数交互式独家工具 | 保留但排最后、封顶 0.75 天 |
| 16 | 「改 policy 里的数字运行时不生效」 | Flash | ❌ `decideGate({limit})` 用 `limit - used` 比较,`pro-gate.tsx:127` 传常量 3;按 tier 传 10 是真实运行时改动 | 驳回;保留 G1 |
| 17 | F2 用 PostHog distinct session 作分母,被机器人污染 | Flash | ✅ | 明确用 §1.2 的去机器人过滤集 |

**没有采纳评审的地方只有三处**(#2、#16、#15 的一半),每处都有代码或数据证据写在表里。
