# ColorArchive iOS v1.4 计划书(2026-09-03)· 结论:**不发版**

> 起草:2026-09-03 · 作者:Claude(remote session)
> 评审:**Gemini 3.1 Pro (High)** 与 **Gemini 3.8 Flash (High)**,经 `agy` 调用,**两者独立给出 reject**
> 第 1 稿推荐「发一个瞄准 word→color 的 ASO 版本」。**评审推翻了它,我的复核确认评审是对的,已撤回。**
> 数据来源:ASC Analytics API(报告 `dda726fa`)、PostHog(project 456902)、生产库 `data.db`、GSC。全部只读。

---

## §0 结论先行

**不发 v1.4。iOS 转入维护状态(不下架、不开发)。**

这不是「暂缓」,是执行 v1.3 计划书 §5 早已预注册、却在 08-12 漏读的收缩分支。
下面 §1 是支撑它的实测,§2 是我第一稿错在哪(值得留档),§3 是唯一能重开这个决定的条件。

---

## §1 实测(2026-09-03)

### 1.1 下载:Apple 自己的数字,可信

ASC `App Downloads Standard`(r3,DAILY):

| 日期 | 内容 |
|---|---|
| 08-26 | 1 × Auto-update(iPad / iOS 17.7 / MX) |
| 08-29 | **1 × First-time download**(iPhone / US / App Store search)+ 1 auto-update + 1 redownload |
| 08-31 | 1 × Auto-update(iPad / iOS 17.7 / MX) |
| 09-01 | 1 × Auto-update(iPad / iOS 17.7 / MX) |

🔴 每天那条 auto-update 是**同一台 iPad 在自动更新**,不是新用户。扣掉后
**真实首下载 ≈ 1 次/周**,即 **≈0.14 次/天**。

冻结规则(2026-06-06)要求 **日下载 > 100 或 IAP 累计 > $100** 才解冻。
实测离前者差 **≈700 倍**,离后者差**无穷倍**(iOS 收入 $0、Apple 付费用户 0,
5 个付费用户全部来自 web:`SELECT payment_provider,COUNT(*) FROM users GROUP BY 1` → `lemonsqueezy 5`)。

### 1.2 🔴 v1.3 的三条判据:**一条真败,两条无效** —— 这个区分是本次最重要的更正

| v1.3 判据 | 阈值 | 实测 | 判定 |
|---|---|---|---|
| 日下载 | ≥10 | ≈0.14/天 | ❌ **真败**(Apple 数据,与我们的埋点无关) |
| Hue 完成率 | ≥30% | 0 次开始 | ⚠️ **无效** —— 见下 |
| share-intent | ≥10 | 0 | ⚠️ **无效** —— 见下 |

**我第一稿写的是「三条全败」。那是错的。**

第一稿据此断言「埋点是好的,是真的没人用」,证据是
`INFOPLIST_KEY_PostHogAPIKey` 在 Debug/Release 两个 config 都在、PostHog SPM 已链接。
**那只证明了 key 会被打进包,没有证明事件真的发得出去。** 两位评审同时指出这一点,复核确认:

1. 🔴 **app 的核心回路完全没有埋点。** 全应用只有 **16 个** capture 点,而
   `ColorBrowseView.swift`、`ColorDetailView.swift`、`ColorSearchView.swift` —— 浏览 5,446 个颜色、
   搜索、看色号详情、复制 HEX —— **各 0 个**。
   ⇒ 一个用户可以下载、浏览 200 个颜色、复制 10 个色号然后关掉,PostHog 只会看到一个 `$screen`。
2. 🔴 **退到后台不 flush。** `ColorArchiveApp.swift` / `AnalyticsBootstrap.swift` 里
   **没有任何 `flush` / `didEnterBackground` / `scenePhase` 处理**。posthog-ios 默认攒够 20 条或 30 秒才发。
   用户浏览一会儿直接杀进程 ⇒ 队列里的事件永久丢失。

所以那唯一一次会话(`Application Installed` → `Application Opened` → `$screen`,2 秒内,之后再无)
**恰恰就是「一个真实用户打开 app、在 Browse 页看了一会儿、关掉」会产生的形状** ——
因为 Browse 页什么都不发,而队列从未 flush。

**结论:「那个人装了就跑」这个说法不成立,我撤回它。** 能站住的只有下载数。

**顺带排除了崩溃假说**(Flash 提出):ASC `App Crashes`(r2)**无任何日实例**;
`App Sessions`(r8)历史数据显示真实会话时长 9–87 秒。app 能正常启动。
Flash 认为 `ColorCardView.swift:72` 的同步 `ImageRenderer` 会在首屏炸掉主线程 —— **不成立**:
它在 `.contextMenu {}`(:38 打开)里,SwiftUI 对 contextMenu 内容是**长按时才构建**。
(它仍是个坏味道:长按会卡一下。但不是启动崩溃,不能作为解释。)

### 1.3 web 侧对照(用来说明 iOS 有多小)

| PostHog 60 天 | 事件数 |
|---|---:|
| `web` | **706,815** |
| `posthog-ios` | **3**(有史以来) |

---

## §2 我第一稿错在哪(留档,因为这是个典型错误)

第一稿的论点是:GSC 证明 `word to color` 有真实需求(90 天 1,290 次点击、占全站 44%、
CTR 21.2%、均位 5.3),而 iOS **没有这个功能**、关键词还全是打不赢的头部词
(`rgb,hsl,cmyk,picker,...`);所以 v1.4 应该把 word→color 移植到 iOS 并重瞄 ASO。

**两位评审独立判定这是 category error,我同意:**

1. **Google 意图 ≠ App Store 意图。** 在 Google 搜
   `colour palette generator from words` 的人坐在电脑前用 Figma/CSS,他要的是一个 10 秒的网页:
   输入词、复制 5 个色号、关掉。**GSC 数据证明的恰恰是「网页已经把这个需求满足了」**,
   而不是「这些人想装一个 app」。第一稿把「需求存在」偷换成了「需求会迁移」。
2. **查询形态也对不上。** GSC 赢的是 4–6 词的长尾自然语言;App Store 搜索框里
   人们打的是 1–2 个词(`palette`、`color picker`)。没有人在 App Store 里打整句话。
3. 🔴 **ASO 排名主要由下载速度和评价驱动,不是由关键词匹配驱动。**
   一个周下载 1 次、**0 条评价**的 app,即使关键词完全匹配也排不上去。
   第一稿默认「改了关键词就会有曝光」,这一步根本没有依据。
4. 🔴 **从没有人验证过 App Store 上「word to color」有任何搜索量。**
   第一稿把 web 的量直接当成 App Store 的量。1,290 点击/90 天 = 全球 **14 次/天**,
   分到 App Store 侧可能 < 1 次/天。**这是免费可查的,而第一稿没查就要写代码。**
5. 🔴 **「这不算违反冻结规则,因为它是发现机制不是功能」是诡辩。**
   Pro 的原话:如果一条硬规则可以靠重新定义名词绕过,这条规则就不存在。
   写 parity harness、移植算法、做 UI、做截图、走审核 —— 这就是一次功能发版。**我撤回这个说法。**

第一稿自己在 §1 写下的反方假设,比它自己的推荐更强 —— 而我还是推荐了发版。**这就是沉没成本合理化。**

### 第一稿里评审认为应当保留的部分

- §0 对 v1.3 判据失败的**不加粉饰的复盘**(包括识别出 MX 的 iPad 是自动更新噪声)。
- **不碰 StoreKit / 后端 / 云同步**的克制($0 收入下动支付链路只有回归风险)。
- **parity harness 先行**、golden 逐字节比对的纪律(若将来真要移植,这仍是唯一正确做法)。
- **`Color(.sRGB, …)` 钉死**防 P3 偏色。
- **放弃头部词** —— 这一条判断是对的,只是它推不出「换成长尾就能赢」。

---

## §3 决定与唯一的重开条件

### 决定:Option A · 收缩

- **不发 v1.4。** 不移植功能,不改 ASO,不做截图,不提交审核。
- **app 保持上架**(无维护成本,偶尔的自然下载不损失什么)。
- iOS 从开发排期移除,冻结规则继续有效,写进 `human-todo.md` 作为**已关闭方向**。
- **本轮不修埋点。** 理由要说清楚:修埋点需要发版过审,而在 ≈1 次下载/周的基数上,
  **修好了也依然测不到任何东西**。埋点缺陷记录在此,等到有流量再修才有意义。

### 唯一能重开 B 的条件(免费、无需写码)

**先查 App Store 侧到底有没有这个需求,再谈移植。** 用 **Apple Search Ads 关键词热度**
(免费,不需要投放,登录 ASA 后台即可查)看 `word to color`、`color from word`、
`palette from text` 这组词的 popularity。

- **若热度极低(预期结果)** → B 的前提当场证伪,**永久关闭**,不必再讨论。
- **若热度意外可观** → 才值得重开讨论,而且届时判据必须是**下载数**,不是曝光数。

### 🔴 判据设计的教训(下次任何 iOS 计划都要遵守)

第一稿把主判据定成「6 周 ≥300 次搜索曝光」。**两位评审都指出这是个假阳性陷阱**,复核确认:
300 次曝光 × App Store 典型 1–3% 转化 ≈ **6 次下载 / 6 周 ≈ 1 次/周** —— **正好等于今天的基线**。
也就是说这条判据**在完全没有任何改善时也会「达标」**,然后触发 v1.5 的讨论。
**用一个比现状还低的门槛去验证现状,是把判据当仪式。**

**规则:iOS 的判据只能用冻结规则本身的量纲(下载数 / 付费数),不能用曝光、完成率这类
在分母≈0 时无意义的比率。**

---

## §4 明确不做

| 不做 | 原因 |
|---|---|
| v1.4 发版(任何形态) | §1 的下载数据 + §2 的需求迁移未验证 |
| 移植 word→color 到 iOS | 前提未验证(App Store 搜索量未知),且违反冻结规则 |
| 改 App 名称 / 关键词 | 无下载速度支撑,改了也排不上;且改名有 2.3.7 关键词堆砌被拒风险 |
| 修 iOS 埋点 / 补 flush / 补核心回路事件 | 需要发版过审,而当前基数下修好也测不到。**记录在案,等有流量再做** |
| 补 `PrivacyInfo.xcprivacy` 的 ProductInteraction 声明 | 同上 —— **但见 §5,这条有合规性质,若将来发版必须一起改** |
| 任何 StoreKit / 付费面改动 | iOS 收入 $0、付费用户 0 |
| 下架 app | 没有理由。挂着不花钱 |

---

## §5 如果将来因为别的原因必须发 iOS 版,这些必须一起修

(不构成发版理由,只是「一旦发版就顺手做掉」的清单,来自本次评审)

1. 🔴 **`PrivacyInfo.xcprivacy` 缺 `NSPrivacyCollectedDataTypeProductInteraction`** ——
   现在只声明了 CrashData / OtherDiagnosticData(Sentry),但 PostHog 实际在收集产品交互数据。
   **这是合规缺口,不是优化项。**
2. **补 flush**:`didEnterBackground` 时 `PostHogSDK.shared.flush()`,否则事件丢。
3. **给核心回路补埋点**:Browse / Search / ColorDetail 的 screen + 复制动作。
4. **`ColorCardView.swift:72`**:把同步 `ImageRenderer` 移出 contextMenu builder(长按卡顿)。

---

## §6 owner 需要确认的一件事

**只有一个问题:接受 Option A(不发版、iOS 转维护)吗?**

我第一稿推荐发版,经两轮评审和复核后**撤回**。数据支持的答案是 A,而且这是三周前
(08-12 数据门)就该做出的决定。

如果 owner 出于非数据理由(例如想让 app 保持「在更新」的状态)仍要发版,
那么 §5 的四项必须一起做,且判据必须换成下载数量纲 —— 但我不推荐。
