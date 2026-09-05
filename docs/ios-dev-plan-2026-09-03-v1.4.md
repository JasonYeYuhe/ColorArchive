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

---

# §7 Gate A 执行记录(2026-09-04)· **Gate A 未执行**,但方向按现有证据关闭

> 2026-09-04 remote session。经 4 个对抗性 lens + 1 个裁决者复核,**我最初写的结论被推翻并重写**。
> §3 的「热度极低 → 前提证伪 → 永久关闭」这条路径**没有被触发,因为 Gate A 根本没跑成**。

## 7.1 🔴 Gate A 没有跑 —— 状态是「未执行」,不是「已证伪」

§3 预注册的仪器是 **Apple Search Ads 关键词热度**。实际情况:

- ASA 后台 `app.searchads.apple.com` 重定向到 Apple ID 登录;
- 1Password 凭据桥**四次**返回 `transport_error/retryable`(1Password.app 与其 Chrome 扩展都在
  运行、都在当前活动 profile `Profile 1` 里,桥就是不应答);直接键入密码是禁止操作;
- 磁盘上**不存在任何 ASA 凭据**。`asc-api-key-DMMFP6XTXX-2026-07-08.p8` 是 App Store **Connect**
  的 key,属于**另一个 API 家族**;ASA 的 API key 必须从 ASA 后台**内部**生成 —— 而那正是登录
  失败的地方。这是个循环,没有绕过去的代码路径。

**⇒ §3 的两个分支一个都没触发。「永久关闭」这个词不能由本节的证据启动。**

## 7.2 换用了什么仪器,以及它测的**不是**同一个量

用了 App Store 搜索自动补全(**MZSearchHints**,免费、第一方、无需登录)。复现命令:

```bash
curl -s -G "https://search.itunes.apple.com/WebObjects/MZSearchHints.woa/wa/hints" \
  --data-urlencode "q=<TERM>" --data-urlencode "clientApplication=Software" \
  -H "X-Apple-Store-Front: 143441-1,29" -H "User-Agent: iTunes-iPhone/12.0"
```

(`X-Apple-Store-Front` 头是**必需**的 —— 缺了它每个查询都返回空数组,包括头部词。143441=US。)

测了 **128 个词 / 3 种非英语 / 7 个店面**:

| | US | GB | CN | JP | DE | CA | AU |
|---|---|---|---|---|---|---|---|
| `word to color` | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `color from word` | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `palette from text` | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| 对照 `color palette` | 10 | 10 | 10 | 10 | 10 | 10 | 10 |

母语形式同样为 0(CN `文字转配色`/`单词颜色`、JP `文字から色`、DE `wort farbe`),而各自母语
对照 `配色`/`カラーパレット`/`farbpalette` 全部打满 10。

## 7.3 🔴 但这个工具**不能**支撑「需求为零」—— 实测的反例

对抗复核跑了负对照,**结果推翻了我第一版的读法**:

- **`how to remove` → 0,而 `remove background` → 10、`background remover` → 10。**
  去背景是 App Store 图片工具里最大的需求池之一。
- **`extract palette from image` / `photo to palette` / `image to palette` 全 0**,而这个功能在
  美区有 **5,149** 和 **2,754** 评分的 app 在卖。
- `triadic color scheme` / `monochromatic palette` / `hex to pantone` 也全 0。

**语料还混入供给侧(app 标题):** `colorarchive` → 1 条,命中的是
`colorarchive - color tools` —— **本项目自己那个约每周 1 次下载、0 评价的 app**,靠标题进的语料。
`palette from photo` → `tinta-color palette from photo`;`color from photo` → `tinc — color from photos`。
**这个概念附近每一条非零命中都是 app 标题,不是查询串。**

**命中数不是量纲。** `delta e` 打满 10,全部来自 `delta emulator` / `delta executor for roblox`,
零颜色信息;10 是硬响应上限(6 个无关头部词全部钉在 10)。所以 **0-vs-10 不是比例**,
文档任何地方都不得给这些数字附加「热度很低」这类量级措辞。

**⇒ 0 的确切含义是「这个字符串不在 Apple 的补全语料里」,已证实与真实需求可观并存。**

已排除的伪影(逐条实测,不是推理):30 字符硬截断存在但三个测试词只有 13/15/17 字符;
150 次调用后对照仍逐字节相同(无限流衰减);语料新到 `sora 2`/`claude ai 4.6`/`deepseek v4`
(服务是活的);匹配是**子串**而非前缀锚定(所以 0 是比原以为**更宽**的证据);
无效店面确实会静默返回 0,但所用店面对照返回 10,已排除。

## 7.4 一条**不依赖把 0 读成需求**的正面发现

这条读的是**返回内容**而非缺失,所以不受 7.3 的缺陷影响 —— 在 App Store 用户真正会输的
**1–2 词**长度上,相邻的颜色需求是**图像驱动和随机驱动的,不是文字驱动的**:

- `color name` → 10 条,**全是相机/图像**(`color name from image`、`color name recognizer camera`)
  —— 那是 word→colour 的**反方向**。
- `color generator` → 3 条,全是***随机***颜色生成器。
- `word palette` → 1 条,是一个叫 **WordPalette 的写作 app**(1,073 评分)—— 这个词组在
  App Store 语汇里**已经被另一个含义占住了**。
- `color word` → 10 条全是**单词拼图游戏**;`word to` → 10 条全是 **Word 转 PDF**。

这是「App Store 的颜色需求形状与 web 不同」目前最强的论据,而且它**站得住**。

## 7.5 可写入的结论

**word→colour 的 ASO 方向:按现有证据关闭 —— 2026-09-04,工具 MZSearchHints,7 店面 128 词。**
**不是「永久关闭」,也不是「前提已证伪」。** 操作上完全等价(谁都不许再动它),认识论上站得住。

🔴 **不要把三件事捆在一句话里:**

| # | 决定 | 由什么决定 |
|---|---|---|
| 1 | word→colour ASO 方向 | 本节证据 → 按现有证据关闭 |
| 2 | **iOS 冻结** | **与本节证据无关。**只由 ≈0.14 次/天首下载、iOS 收入 $0、Apple 付费用户 0 决定 |
| 3 | §5 仓库条目 | 见 §7.6 —— **大部分已被证伪**,不得继承增长决策的时间表 |

**关键词证据无论正负都不能解冻 iOS。** 冻结规则只有两个解除条件(日下载 >100 或 IAP 累计 >$100),
这不是其中任何一个。把它们捆在一起会给未来的读者造出一根**不该存在的杠杆**。

## 7.6 🔴 §5 四条,逐条复核:**两条证伪、一条数字对但下游断言错、一条我上次的「更正」本身是错的**

### §5.1 PrivacyInfo 缺 ProductInteraction =「合规缺口」→ **证伪,删除该定性**

在钉住的 **posthog-ios 3.59.3** 上实测:SDK **自带** `PostHog/Resources/PrivacyInfo.xcprivacy`,
声明 `NSPrivacyCollectedDataTypeProductInteraction` + `OtherUsageData`(purpose = Analytics),
且 `Package.swift:34` 以 `.copy("Resources/PrivacyInfo.xcprivacy")` **真正打进 app bundle**。
Apple 的模型是 **per-bundle 聚合**(app manifest + 各 SDK manifest)。

更关键:**ASC 营养标签早在 2026-06-07 就已声明 Product Interaction → Analytics、linked = Yes**
(`docs/analytics-posthog-2026-06-06.md:89-102`),那才是 Apple 真正强制的那一层。而且同一份文档
**当时就写明**了 app 自己的 manifest 只声明 Sentry 那两项,并把补充 XML 作为**可选项**给出。

**正确措辞:「app 自己的 manifest 未列 ProductInteraction,而 posthog-ios 已在其自带 manifest 中
声明,营养标签也已正确;补进 app manifest 属于观感一致性,不是合规修复。」**
(旁证:v1.3 就是以此状态过审并上架的。)

### §5.2 「退到后台不 flush ⇒ 事件永久丢失」→ **证伪**

读了钉住 revision 的 SDK 源码:**`PostHogSDK.swift:216-220`** 在 `setup()` 内订阅
`UIApplication.didEnterBackgroundNotification` 并调用 `flush()`:

```swift
// Flush the queue when the app enters background to ensure
// pending events are sent before the app is suspended
if !config.disableFlushOnBackgroundForTesting {
    didEnterBackgroundToken = DI.main.appLifecyclePublisher.onDidEnterBackground.subscribe { [weak self] in
        self?.flush()
    }
}
```

唯一的开关是内部测试用的 `disableFlushOnBackgroundForTesting`(默认 false,app 从不触碰)。
队列是磁盘 FIFO,记录只在上传成功后才 pop。

🔴 **上一次的断言是只 grep 了 app 树得出的 —— grep 看不见 SDK 行为,而 SDK 行为就是全部答案。**
这与「vitest 会挂」「没有测试套件」是同一类错误:**把不完整搜索空间里的阴性当成阳性缺陷报出去。**

**因此 §1.2「行为判据无效」的两条支撑塌了一条。** 结论(无效 ≠ 失败)仍然成立,但现在**只**靠
「核心回路零埋点」这一条支撑 —— 那一条是真的,见下。

### §5.3 「16 个 capture 点,三个核心视图 0 个」→ **数字对,下游断言错,且漏了第 4 个文件**

`AnalyticsBootstrap.capture(` **13** 处 + `.screen(` **3** 处 = **16**,wrapper 之外
`PostHogSDK` 出现 **0** 次(无隐藏调用点)。SDK 默认值实测:`captureScreenViews` 默认 **true**
但 app 显式设为 false;`captureElementInteractions` 默认 false;`sessionReplay` 默认 false ——
**自动采集确实全关,没有任何隐式采集能补上缺失的调用点。埋点覆盖缺口是真的。**

🔴 **漏了一个文件:`ColorCardView.swift`(拥有 Copy HEX / RGB / HSL 上下文菜单的那个)也是 0。**
四个文件全部为 0:`ColorBrowseView` / `ColorSearchView` / `ColorDetailView` / **`ColorCardView`**。
比原断言更糟。

**但「PostHog 只会看到一个 `$screen`」是错的**:`$screen` 在**每次切 tab** 时都发
(`ContentView.swift:49`),另有 lifecycle 的 Installed/Opened/Backgrounded,以及从浏览网格
直接可达的 `favorite_toggled`。**正确说法:「浏览 200 个颜色、复制 10 个 hex 产生零事件。」**

### §5.4 🔴 我上次「更正」了 Flash 的 ImageRenderer 发现 —— **那个更正是错的,原发现才是对的**

§1.2 写的是:「它在 `.contextMenu {}` 里,SwiftUI 对 contextMenu 内容是**长按时才构建**」。
**这句话是错的。** 两条独立证据:

1. **iPhoneOS26.5.sdk 的 SwiftUI 接口第 9401 行:**
   `contextMenu<MenuItems>(@ViewBuilder menuItems: () -> MenuItems)` —— **没有 `@escaping`**。
   对比同一份接口里 `sheet`(7145/7147 行)与 `contextMenu(forSelectionType:)`(21060 行)
   **都是 `@escaping`**。非逃逸闭包不能比调用活得更久,**必须在调用返回前执行**。
2. 编译探针实测输出 `>>> CLOSURE BODY RAN: contextMenu`,而 `sheet` 的闭包没有运行。

而 `ColorCardView.swift:72` 的调用**直接位于 ViewBuilder body 里**(是 `if let`,**不是**
Button 的 action 闭包 —— action 闭包才是逃逸的):

```swift
.contextMenu {                                             // :38
    ...
    if let image = ShareHelper.colorCardImage(for: color) { // :72  ← 每次 body 求值就渲染
```

`ShareHelper.colorCardImage`(`ShareSheet.swift:6`)以 **600×400 @ scale 2.0 = 1200×800 px**
渲染,**≈3.84 MB/张**。浏览网格首屏 15–18 个可见 cell ⇒ **≈60–70 MB 常驻图像数据,在首次渲染时
同步发生在主线程**,不是长按时。长按反而是唯一不额外花钱的时刻。
(叠加效应:`FavoritesStore` 是 `@Observable` 且 `ColorBrowseView` 在自己 body 里读 `isFavorite`,
点一次心会让所有可见 cell 重渲染 —— 即重跑一遍上面这笔开销。)

`ColorDetailView.swift:40` 有同样的调用,但那里一屏只有一个,量级小得多。

**⇒ 撤回 §1.2 的「不成立」,恢复 Flash 的原始发现。这是一个正在线上生效的真实缺陷。**
不为它单独发版(当前 DO NOT SHIP,且约每周 1 次下载),但**应在仓库里修掉,搭下一次因别的
原因发的版**。修法:把 `ShareLink` 的 item 改成惰性求值(把渲染移进 Button action,或改用
`ShareLink(item:preview:)` 的 lazy 形式 / `Transferable` 表示),不要在 builder body 里直接 render。

🔴 **元教训:「更正」需要和「断言」同等的验证。这次差点把一个真实发现永久关掉 ——
而它出现在一份专门批评「先建后测」的文档里。**

### 🟢 7.6b 已修并在真机模拟器里实测(2026-09-04 当日)

owner 说「继续做」,所以修了。**不是推理,是在跑起来的 app 里数出来的** ——
临时在 `ShareHelper.colorCardImage` 里加计数 + `NSLog`,用
`xcrun simctl spawn <sim> log stream` 抓,量完即移除。设备 iPhone 17 Pro / iOS 26.5,Debug 构建。

| 场景 | 修前 | 修后 |
|---|---:|---:|
| 冷启动进浏览网格,**零交互** | **15** | **0** |
| 再上滑一屏 | **30** | **0** |
| 长按一张卡(菜单弹出) | — | **1**(且只渲染被长按的那一张 `crimson-ink-pure`) |
| 打开一个颜色详情页 | 1 | 1 |
| 详情页里连点 3 次收藏 | **4** | **1** |

每次渲染 = 1200×800 px ≈ **3.84 MB**,同步跑在主线程。
⇒ 修前首屏白送 **≈57.6 MB**、每滑一屏再送一次;详情页每次 body 重算再送一次。

**改法(两处,都没新增文件,所以不碰 pbxproj):**
- `ColorCardView.swift` —— 把 `ShareLink` 抽成 `private struct ShareCardMenuItem: View`。
  构造这个 struct 是免费的,它的 `body` 要等**菜单真正呈现**时才求值。
- `ColorDetailView.swift` —— 抽成 `private struct ColorShareButton: View`,**唯一输入是 `color`**。
  `ColorRecord: Hashable`,所以只有收藏状态变化时 SwiftUI 会 diff 掉、跳过 body。
  (这里**不能**靠「延迟到呈现」—— 分享按钮本来就一直可见;起作用的是 diff。)
- `ShareSheet.swift` —— 给 `colorCardImage` 加了 🔴 注释说明它有多贵。
  两个新 struct 上都写了「**不要再 inline 回去**」以及原因,免得下一个人「顺手清理」时又踩回来。

**行为逐项确认没变**(截图核对):上下文菜单仍是 Copy HEX / RGB / HSL / 分隔线 / Add Favorite /
**Share**;点 Share 正常弹出系统分享面板,**预览缩略图仍在**(卡片图 + 色号),
Save Image / Assign to Contact 等图片动作都在。Debug 与 **Release** 两个 configuration 均构建通过。

⚠️ **这只是进了仓库,没有发版。** v1.4 的结论仍然是 DO NOT SHIP;这个修复搭下一次
因别的原因发的版。

## 7.7 §3 判据本身的措辞缺陷(以后不许再犯)

§3 的分支写的是「若热度极低(**预期结果**)→ 前提当场证伪,**永久关闭**」,另一支标为
「若热度**意外**可观」。**一个判据把自己的期望答案写在分支里,就不是判据,是仪式**
—— 这是 §3 自己批评「6 周 ≥300 曝光」时用的同一句话。

**规则:任何预注册判据的分支里不得出现「预期结果」这类字样。**

## 7.8 一个被跳过的第一方仪器(记录,但**不是** Gate A 的替身)

计划拉了 ASC Analytics 报告实例 `dda726fa` 并读了 r3/r2/r8,却从未读
**App Store Discovery and Engagement** 家族(按来源类型分段的 Impressions / Product Page Views)。
`asc-api-key-DMMFP6XTXX-2026-07-08.p8` 就在磁盘上、免登录、不受 1Password/锁屏故障影响,
而 §1.1 已记录 08-29 那次首下载**正是来自 App Store search** —— 所以该渠道是活的,
其当前尺寸是一条没人去查的第一方事实。

⚠️ **但它测的是本 app 的曝光,而一个排名为零的 app 无论如何都接近零 —— 它不能回答 Gate A 问的
关键词需求问题,不得写成「本来该跑的那个检查」。**

## 7.9 冻结规则算术更正(损伤的是推理,不是决定)

计划用「差 ≈700 倍」打发整条 ASO 论证,**但那只对分支 A(日下载 >100)成立**。
分支 B(IAP 累计 >$100)只需**持续一年 1.4–9.2 次/天**($9.99 × 2% 转化 → 1.4/天;
$2.99 × 1% → 9.2/天),相对当前 0.14/天 是 **10–65 倍**,不是 700 倍。

更值得记的是:**分支 A 根本不需要任何关键词工具就能关掉。**用计划自己的 GSC 数字 ——
1,290 点击 / 21.2% CTR ⇒ 6,085 曝光 / 90 天 = **全球每天 67.6 次 Google 搜索**,
而 100 次下载/天 是**整个概念全球查询量的 1.5 倍**。
**预注册指向 ASA 这件事本身就选错了仪器 —— 手上已有的两行算术就能结案。**

---

# §8 v1.4 已构建(2026-09-05)· owner 决定发版;并且发现了比埋点缺口更根本的东西

> owner 2026-09-05 决定:**发 v1.4**,理由是「在网站上说我们有这个软件来引流」。
> 这个理由**绕开了评审的核心反对意见** —— 评审反对的是「靠 App Store 搜索被发现」,
> 而 owner 的渠道是**自己的网站**,那是一个真实存在、有流量的渠道。范围:**最小版**
> (性能修复 + 核心回路埋点 + 版本号),不做 word→color 移植。

⚠️ 先记一条 owner 应该知道的事:**网站挂 App 推广根本不需要发版**,v1.3 早在架上。
发版和引流是两件可拆的事;owner 仍选择两件都做。

## 8.1 🔴 最重要的发现:**PostHog 和 Sentry 从来没有初始化过**

补埋点时顺手验证了一下「key 到底有没有进包」,结果:

```
/usr/libexec/PlistBuddy -c "Print PostHogAPIKey" <built>/ColorArchive.app/Info.plist
→ Print: Entry, "PostHogAPIKey", Does Not Exist
```

**根因:** `project.pbxproj` 里设了 `INFOPLIST_KEY_PostHogAPIKey` / `_PostHogHost` /
`_SentryDSN`,但 **Xcode 的 `INFOPLIST_KEY_*` 机制只注入它「认识」的键**。自定义键被
**静默丢弃**,没有任何警告。

自证的对照:构建产物里,所有 Xcode **认识**的 `INFOPLIST_KEY_*` 全都在
(`CFBundleDisplayName`、`LSApplicationCategoryType`、`UILaunchScreen`、
`UIApplicationSceneManifest`、`UISupportedInterfaceOrientations~*`);
**缺的恰好就是那三个自定义键**。

**运行时确认**(不是从配置推断 —— 在模拟器里打日志读的):
```
PHPROBE key_present=false key_empty=true sentry=false
PHPROBE RESULT=PostHog NOT started — analytics is a no-op
```

⇒ `AnalyticsBootstrap.start()` 一直命中 `else { return }`,
**app 里那 16 个 capture 调用全部是空操作,SentryBootstrap 同样从未启动。**

这比 §5.3「核心回路没埋点」更根本:**就算核心回路有埋点,也一样发不出去。**
它也解释了 `posthog-ios` 历史上只有 3 条事件(那 3 条来自更早某个 key 确实进了包的构建)。

🔴 **这是同一个错误模式的第四次:「配置里写了」≠「运行时生效」。**
v1.3 计划书用 config grep 冒充埋点验证;这次是 build setting 冒充 built plist。
**规则:验证配置类事项,只能读构建产物或运行时,不能读设置。**

**修法**(在 `ColorArchive/Info.plist` 里显式声明,`$(…)` 引用 build setting,
所以 pbxproj 仍是唯一真值来源,**且不用动那个手写短 ID 的 pbxproj**):
```xml
<key>PostHogAPIKey</key><string>$(INFOPLIST_KEY_PostHogAPIKey)</string>
<key>PostHogHost</key><string>$(INFOPLIST_KEY_PostHogHost)</string>
<key>SentryDSN</key><string>$(INFOPLIST_KEY_SentryDSN)</string>
```
修后运行时:`PHPROBE key_present=true … RESULT=PostHog STARTED`,
且 **Release 构建产物**里三个键都在。

## 8.2 埋点:端到端验证到 PostHog,不是「加完就算」

新增 4 处,事件名与 props 对齐 web taxonomy(web 用**小写** format:`hex`/`rgb`/`hsl`):

| 位置 | 事件 |
|---|---|
| `ColorCardView`(浏览网格长按菜单的三个复制) | `color_copied {format, variant:"card", color_id}` |
| `ColorDetailView` 的色值行 | `color_copied {format, variant:"detail", color_id}` —— 与 web 详情页**同一个 variant** |
| `ColorDetailView` 打开 | `screen("color_detail")`(ContentView 只按 tab 发 `$screen`) |
| `ColorSearchView` | `search_performed {query_length, result_count}` |

**在生产 PostHog(project 456902)里查到了实际到达的事件**,不是本地日志:

```
$screen                n=3
Application Installed  n=1   Application Opened n=2   Application Backgrounded n=1
color_copied  format=hex variant=card    n=1
color_copied  format=rgb variant=detail  n=1
search_performed  qlen=5 results=560 / qlen=5 results=560 / qlen=4 results=574
```

⚠️ **这些是从模拟器发出的验证事件,不是真实用户。**
🔴 **精确范围(事后复核修正,我最初写的 16:31–16:36 是错的):
2026-09-04 全天 70 条,16:31:58 → 17:42:59 UTC。历史基线是 2026-08-05 的 3 条。**
判据不靠我的记忆:`search_performed` / `color_copied` / `screen("color_detail")` **只存在于尚未发布的 v1.4**,
而 v1.4 还在 `WAITING_FOR_REVIEW` —— 没有任何用户拿得到,所以 09-04 当天 70 条全部是本机产生的。

**搜索埋点改过一次,过程值得记:** 第一版用 `.onSubmit(of: .search)`,查 PostHog 没看到,
我一度判定「没触发」。**那个判定是错的** —— 我用的是 `simctl terminate`,而 terminate
**不触发** `didEnterBackground`,所以事件还在磁盘队列里没发。后来它们自己到了
(就是上面那两条 `qlen=5`)。`.onSubmit` **是能工作的**。
最终仍改成 `.task(id:)` 去抖,理由是另一条:结果随输入实时更新,**几乎没人会按回车**,
`.onSubmit` 会系统性少计,读起来像「没人搜索」。
🔴 **注意这是本轮第二次「我的更正本身需要被更正」。**

## 8.3 版本与构建

`MARKETING_VERSION 1.3 → 1.4`,`CURRENT_PROJECT_VERSION 6 → 7`。
Debug 与 **Release** 均构建通过;Release 产物里
`PostHogAPIKey` / `PostHogHost` / `SentryDSN` / `CFBundleShortVersionString=1.4` /
`CFBundleVersion=7` 全部存在。

**§5 四条的处置:**
- 5.1 PrivacyInfo —— **没动**。§7.6 已证伪「合规缺口」:SDK 自带 manifest 已声明
  ProductInteraction,ASC 营养标签 2026-06-07 就是对的。
- 5.2 flush —— **没动**。SDK 默认就 flush(§7.6 证伪)。加一个是冗余代码。
- 5.3 核心回路埋点 —— **已做**,见 8.2。
- 5.4 ImageRenderer —— **已做**,见 §7.6b。

## 8.4 网站引流(owner 选了四个位置全上)

| 位置 | 做法 |
|---|---|
| `/ios/` 落地页 | 新路由 `app/ios/page.tsx` + `src/components/ios-page.tsx`,独立的 `SoftwareApplication` JSON-LD(`operatingSystem: "iOS 17.0 or later"`,**故意不并进 `/pro/` 那个 node** —— 那个描述的是 Web 产品且 Google 会引用它的价格) |
| 全站 footer | 一个 pill,`t("nav.iosApp")`(en + zh 都加了) |
| 首页 | hero CTA 行下面一行安静的文字链,**不是第四个按钮** —— 那三个按钮是站内漏斗,一个每周 1 次下载的 app 还没资格跟它们平权 |
| `/word-to-color/` | 结果卡片里,调色板下方 |

🔴 **更正(收尾复核发现,原文写错了):只有三处会发 `app_store_click`。**
`/ios/`(`surface="ios_page"`)、首页(`"homepage"`)、`/word-to-color/`(`"word_to_color"`)走
`AppStoreLink`,**只在 click 时发事件,render 不发**(W1 到 ~2026-10-12,禁止页面加载事件)。

**footer 那条是内部链接 `<Link href="/ios/">`,不发任何事件** —— 它把人送到 `/ios/`,
所以它的贡献只能从 **`/ios/` 的访问量**里读,读不到 `app_store_click`。
⚠️ **读 readout 时不要把「没有 footer 这个 surface」当成「没人点 footer」** ——
它从来就没被埋点。(`surface` 联合类型里原本还留着没用过的 `"footer"`/`"privacy"`,已删掉,
免得以后有人以为那两个值应该出现。)

🔴 **URL 是实测的,不是拼的:**
`https://apps.apple.com/app/id6761363087` → 200,重定向到
`/us/app/colorarchive-color-tools/id6761363087`;`itunes.apple.com/lookup` 返回
`ColorArchive - Color Tools` / Free / Graphics & Design / iOS 17.0 / **0 条评价**。
用 id-only 形式是故意的:storefront 段和 slug 由 Apple 按访客所在区自动补,
写死 `/us/` 会让别的区多一跳,写死 slug 会在改名后失效。

**文案上刻意写了 app 没有什么。** `/ios/` 有一整块「These stay on the web」列出
word→color、brand generator、Figma/Tailwind token 导出;`/word-to-color/` 的 CTA
也直说「The word generator stays here on the web」。
理由:**流量最大的入口正是 app 没有的那个功能**,不讲清楚换来的是一星评价,不是安装。
app 目前 **0 条评价**,没有任何社会证明可引用,文案里也没编。

顺手修了 `src/components/privacy-page.tsx:139` 那个指向 `https://apps.apple.com`
裸域名的占位链接(**只改 href,措辞一个字没动** —— 那句话和已发布的 App Privacy 标签绑定)。

## 8.5 Gate A 仍未跑成 —— 但这次拿到了确切原因

owner 说已登录 1Password,凭据桥确实通了(`request_credentials` → `approved`)。
但填充始终 `tab_unavailable`,直到截图里看见输入框旁边挂着 **「Unlock 1Password」** ——
**Chrome 里的 1Password 扩展是锁着的**(桌面 app 登录 ≠ 浏览器扩展解锁)。
主密码只能 owner 自己输。

**⇒ Gate A 状态不变:未执行。** 但它现在只是补记录,**承载不了任何决策** ——
发版决定已由 owner 做出,而冻结/解冻只看下载数。

---

# §9 Gate A 的最终结论(2026-09-05)· **它从来就不是「5 分钟的免费检查」**

owner 解锁了 1Password 扩展,登录这次一路通到底:
`request_credentials` → `approved` → 1Password 自动填好 → 点「登录」→ 进入
`account.apple.com/account/manage`(叶宇和 / `yyyyy.yeyuhe@icloud.com`,无需二次验证)。

然后打开 `app.searchads.apple.com/cm/app/`,它**重定向到了**
`ui.ads.apple.com/signup/landing`:

> **Welcome to Apple Ads** — Reach new customers and promote your business with Apple Ads.
> **Ads on the App Store** — Confirm the App Store Connect accounts you'd like to link to
> your Apple Ads account to get started. ☑ Yuhe Ye  · **[Get Started]**

## 9.1 🔴 这个账号从来没有开通过 Apple Ads

**没有「ASA 后台」可以登进去 —— 它需要先被创建。** 页面是一个账号创建向导:
链接 ASC 团队、接受 Apple Ads 服务条款(页脚 Terms of Service),之后才谈得上关键词工具。

**我停在了 Get Started 之前,没有点。** 创建账号、接受服务条款都不是我可以代做的动作。
(是否还要求填business/付款信息,我没有继续,因此**不知道**,不在这里瞎猜。)

## 9.2 §3 关于 Gate A 的描述是错的,这是计划书第四条未经核实的断言

§3 原话:「**免费,不需要投放,登录 ASA 后台即可查**」。

- 「登录即可查」**不成立** —— 没有账号可登。
- 「5 分钟」**不成立** —— 前置是开一个广告账号并接受其条款。
- 「免费」大概率仍成立(不投放不扣费),但**这一条我没有验证到底**,所以不写成结论。

⇒ 与 §7.7 是同一个毛病:**判据里写了一个从没有人试过的操作步骤**,
然后把它当成「便宜、随时可做」。**判据的可执行性本身也需要先验证一次。**

## 9.3 现在的处置

**Gate A 状态:未执行,且前置条件是 owner-only。**

但它已经**不重要了**,原因不是回避而是事实:

1. **发版决定已由 owner 做出**(§8),依据是网站引流,不是 App Store 搜索;
2. **冻结/解冻只看下载数和 IAP 金额**,关键词热度不是那两个解除条件中的任何一个;
3. §7.9 已经证明,**分支 A 用手上已有的 GSC 数字两行算术就能关掉** ——
   1,290 点击 / 21.2% CTR = 全球每天 67.6 次 Google 搜索,而解冻线是 100 次下载/天。

**⇒ 建议:不要为了补这个数去开一个广告账号。** 它买不到任何决策。
真正该等的数是 `app_store_click`(§8.4 四个位置)和 ASC 的首下载数 ——
那两个才和冻结规则同量纲,而且**下一次读数时它们已经在跑了**。

如果 owner 出于别的理由本来就想开 Apple Ads 账号,那另说;
但那是一个投放决定,不是这个 gate 的一部分。

---

# §10 v1.4 已提审(2026-09-05)· `WAITING_FOR_REVIEW`

owner:「不投 apple ads,你直接帮我提审发布 ASC,你全权负责」。已执行。

## 10.1 结果

| | |
|---|---|
| 版本 | **1.4**(id `448779cf-34f5-49f0-aa16-58d9cdc906eb`) |
| 构建 | **build 7**(id `875b3c2a-87d1-4dac-80da-deb9c22130f4`,`VALID`) |
| 状态 | **`WAITING_FOR_REVIEW`** |
| 提交时间 | 2026-09-04T17:35:20Z |
| 发布方式 | **`AFTER_APPROVAL`** —— **过审后自动上架,不需要你再点一次** |

`AFTER_APPROVAL` 是沿用 1.3 的约定(1.2.1 用的是 `MANUAL`)。
⚠️ **这意味着过审即上线,中间没有人工闸门。** 如果想改成手动放行,
在 ASC → App 版本 → 「手动发布此版本」即可,过审前随时能改。

## 10.2 怎么做的(可复用)

参照 Nihongo Ride(`~/Documents/typing_app/scripts/asc_release.py` +
`submit_<version>.py`)的房规:配置写在发版脚本里、每次同样的 API 调用顺序、
最后**从 Apple 读回**而不是相信自己发了什么。落到本仓库:

- `ios/scripts/asc_api.sh` —— ES256 JWT + ASC REST(共用 team key `DMMFP6XTXX`,
  issuer `c5671c11-…`)。key 路径按 `~/.appstoreconnect/private_keys/` →
  `CLI-Pulse-Secrets/` → iCloud 依次回退。
- `ios/scripts/submit_1_4.py` —— 三段式 `--dry-run` / `--metadata` / `--submit`,
  带 preflight(★ 字形、4000 字上限)和读回校验。

归档/上传用仓库里本来就有的 `ios/ExportOptions-upload.plist`
(`method: app-store-connect`,`destination: upload`,`signingStyle: automatic`):

```bash
xcodebuild -project ColorArchive.xcodeproj -scheme ColorArchive -configuration Release \
  -destination 'generic/platform=iOS' -archivePath <path>.xcarchive \
  -allowProvisioningUpdates -authenticationKeyPath ~/.appstoreconnect/private_keys/AuthKey_DMMFP6XTXX.p8 \
  -authenticationKeyID DMMFP6XTXX -authenticationKeyIssuerID c5671c11-… archive
xcodebuild -exportArchive -archivePath <path>.xcarchive \
  -exportOptionsPlist ios/ExportOptions-upload.plist -exportPath <out> …
```

**iOS 上架不需要 notarization**(那是 macOS 的事),所以**不受锁屏影响** ——
全程用 `.p8`,没碰 data-protection keychain。

**归档前逐项验过构建产物**(不是「设置里写了」):
`CFBundleShortVersionString=1.4`、`CFBundleVersion=7`、
`PostHogAPIKey`/`PostHogHost`/`SentryDSN` 三个键都在、
privacy manifest 含 `ProductInteraction Linked=True`,
且 SDK 各自的 manifest(PostHog / PHPLCrashReporter / Sentry)也都在包里被聚合。

## 10.3 提审前补的一处改动:PrivacyInfo 加 `ProductInteraction`

§7.6 判定它是「观感一致性,不是合规修复」。**那个判断的前提是 PostHog 是空操作** ——
现在 §8.1 修好了,它**第一次真的开始采集**,前提变了,所以补上。

🔴 **而且这条不是抄 SDK 的:** posthog-ios 自带的 manifest 写的是
`ProductInteraction Linked=**False**`,那对通用 SDK 成立,**对本 app 不成立** ——
ColorArchive 对登录用户用账号 id 调 `identify()`,Apple 视为 linked,
ASC 营养标签自 2026-06-07 起也一直写的是 **linked = Yes**。
**app 自己这条是三者中最严格、最准确的**,SDK 那条低报了。

## 10.4 审核备注里主动交代了什么

**没有让审核自己从 manifest diff 里发现。** 备注明写:
以前 `INFOPLIST_KEY_*` 自定义键被静默丢弃 ⇒ 两个 SDK 从未初始化、**从来没采集过任何数据**;
1.4 修好了 ⇒ 因此新增 `ProductInteraction` 声明;
营养标签**未变**(6-07 起就是这么写的);
无广告 SDK / 无 IDFA / 无 ATT / 不与数据经纪商共享;
搜索**只发长度和命中数,不发查询词**;session replay 与 autocapture 全关。

What's New 写了两条用户能理解的:网格更快更省内存;崩溃上报此前根本没在工作、现在能收到了。
**没有编任何社会证明**(app 目前 0 条评价),也**没有改** description / 关键词 / 副标题 /
截图 / IAP —— 这一轮的分发改动在网站,不在商店页。

## 10.5 待办

- 审核结果:通常 24–48 小时。过审后**自动上架**。
- 🔴 **`app_store_click` 目前全时段 0 条,那只是因为它 09-04 16:48 UTC 才上线。**
  读它之前先确认观测窗口起点,否则「0」不含任何信息。
- 上架后第一件事:**看 `posthog-ios` 有没有真实事件** ——
  这是历史上第一个埋点真能工作的版本,⚠️ 扣掉 **2026-09-04 全天 70 条**(16:31:58–17:42:59 UTC)模拟器事件;真实历史基线只有 08-05 的 3 条。
- Sentry 同理:这也是崩溃上报第一次真的能上报。
