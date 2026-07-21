# ColorArchive iOS v1.3 开发计划书(2026-07-21 修订版,已过双评审)

> **执行记录(2026-07-22)**:owner 免除 TestFlight 步骤并授权直接上架,§6 两个决策委托执行。
> 当日完成:P0-0 parity harness(`ios/scripts/hue-parity-main.swift`,swiftc 编译**与 app 相同的** ColorConvert.swift,20/20 golden 全过)→ P0-1 Hue Challenge(tap-swap,sRGB 钉死,复用 ImageRenderer 分享卡,3 事件)→ P0-3 typed AI 错误(AIServiceError:429/5xx/offline 分支文案)→ P0-2 ASO(name 保留;subtitle → **"Palettes, Contrast & Hex Codes"**;keywords 94B 无重词:rgb,hsl,cmyk,swatch,picker,colorblind,gradient,mixer,harmony,tints,shades,converter,scheme,hue)→ **1.3 (build 6) 已提交审核**(submission `9d63d863`,**releaseType=AFTER_APPROVAL 批准即上架**)。截图未重做(预算取舍,现有截图沿用)。数据门倒计时自上架日起 3 周(约 **2026-08-12** 复盘)。

> 起草:2026-07-21 · 作者:Claude(remote session,owner 授权)
> 取代:`docs/ios-dev-plan-v1.3.md`(2026-06-06 版,双 review 判定「把已实现当待做」)
> Review:**Codex(gpt-5.6,read-only 仓库核查)+ Gemini 3.1 Pro (High)** 均 revise-then-ship,修订已全部回写 —— 见文末 Review 记录

---

## §0 数据判定(先读 —— 冻结规则仍然有效)

**冻结规则(2026-06-06 决议,不变)**:ASC 日下载 > 100 或 IAP 累计 > $100 之前,iOS 不投大功能。

**2026-07-21 实证:**

| 数据点 | 实测 | 来源 |
|---|---|---|
| 版本状态 | **1.2.1 READY_FOR_SALE**(StoreKit entitlement-retry 修复已上架) | ASC API |
| 后端同步的真实 IAP 收入 | **0**(orders 表仅 3 笔 ¥0 Pro 试用,最近一笔 2026-07-20) | droplet data.db |
| ASC 下载/活跃数据 | 本 session 拉不到(sales report 需 vendor number,机器无存档) | — |
| 补救(已完成) | **已创建 ASC Analytics ONGOING 报告请求**(id `dda726fa`),数日后可程序化拉取下载/会话/留存 | ASC API |

**判定**:冻结不解除。v1.3 定位为**一次带明确 pass/fail 阈值的小型获客实验**,不是功能版本。两评审一致:**ASO 是零预算下唯一确定性杠杆**;游戏钩子是附带实验,其"零预算自传播"假设默认不成立,必须靠数据证明。

**成本红线**:单人 + AI,≤ 2 个 session(评审后重排的范围已按此校准);**禁止触碰 StoreKit/购买流(1.2.1 刚修好)**;P1 云备份整体移出本版(见 §4)。

---

## §1 一句话定调

**v1.3 = 「ASO 刷新(主)+ Hue 排序游戏 MVP(实验)+ AI 错误文案修复(小)」**,发布后跑 **3 周数据门** 决定 iOS 深耕 / 维持 / 收缩。

## §2 P0

### P0-0 前置:XCTest target 引导(评审抓出的硬前提)

**项目当前没有测试 target** —— 计划里的任何"单测"先要有地方跑。加最小 XCTest target(仅 Utils 层),首批用例 = OKLCH 移植的 golden 值(从 web 端 vitest 期望值直接拷贝)。半小时级工作,但必须最先做。

### P0-1 Hue Arrangement 游戏 MVP(降级后)

Web `/screen-test/` 色相排序挑战的触屏移植 —— **按评审降级到 MVP**:

- **数学**:Swift 实现 OKLCH→sRGB(iOS 现仅有 HSL 工具,`ColorConvert.swift` 需新增 ~40 行);参数与 web 完全一致(L=0.72, C=0.10, hue 250→340, 12 chips);**middle-only 洗牌**(两端锚定,仅中间 10 枚用 `HUE_SHUFFLE` 的派生 10-perm —— 直接套 12 项洗牌会破坏锚点,web 端 `scrambleMiddle` 的逻辑照抄)。golden parity 用 P0-0 的 XCTest 对齐 web vitest 期望。
- **色彩空间陷阱(Gemini)**:色块必须显式走 sRGB(`Color(.sRGB, …)` / UIColor sRGB init),否则 iPhone 默认 Display P3 会让题面与 web 不一致。
- **交互**:**tap-select-swap**(点两枚交换)为主交互 —— 触屏可靠、实现廉价;drag 重排仅作 stretch goal,超预算即弃(SwiftUI 自定横排 drag 是出名的坑,两评审都点名)。
- **评分**:错误分 = Σ|相邻 trueIndex 差| − (n−1),0 满分;**不做色觉医疗表述**,只报分数 +「如有疑虑请就医」。
- **分享**:**复用现有 `ShareSheet.swift` 组件与既有分享卡渲染路径**(评审实证:已存在,勿重写);`ShareLink` 无完成回调 → 事件命名如实叫 `hue_game_share_intent`(= 打开分享面板,非确认分享)。
- **埋点**:`hue_game_started` / `hue_game_completed{score}` / `hue_game_share_intent`。**`tool_used` 已由 ToolsHomeView 全局触发,勿重复实现**(评审实证)。
- 入口:工具列表一处。~~Color of the Day 交叉入口~~(砍,见 §4)。

### P0-2 ASO 刷新(主杠杆,纯元数据)

- **第 0 步:经 API 拉取线上 App Info localization 实况**(评审指出仓库文档口径 ≠ 线上实况,不得凭假设改)。name/subtitle 各 30 字符、keywords 100 字节上限,逗号后不留空格、不与 name/subtitle 重复用词、**不写 app 里不存在的功能词**(iOS 无 color wheel 页 —— hue 游戏 ≠ color wheel,不许挂羊头)。
- 候选方向(拉到实况后定稿):name 保留 "ColorArchive" 前缀 + 补一个高频准确词;subtitle 与 keywords 重排覆盖 palette / hex / rgb / contrast / colorblind / gradient / mixer 等 iOS 真有的功能词;Gemini 的"放弃品牌全换关键词"与 Codex 的"先拉实况再动"取交集 = 数据到手后 A 案 B 案并列给 owner 一句话选择。
- 截图:模拟器脚本化重截(含 hue 游戏一屏);What's New 对齐。

### P0-3 AI 工具错误 UX(按实况修正后的版本)

评审实证修正:`AIMoodPaletteView` 用的是**固定泛化文案**(非 localizedDescription),且 `APIService` **丢弃了 HTTP 状态码**,客户端根本无法分辨 429;iOS 的 AI Mood 入口是 **Pro-gated**,"免费额度用完"文案在这里是错的。因此正确工作项:

1. `APIService` 增加 typed error(带 statusCode + 服务端 message);
2. 按状态分支文案:429(Pro 日额度)→「今日 AI 生成次数已用完,明天再来」;5xx →「服务暂时不可用」;断网 → 系统离线文案;
3. Brand 生成器同样处理。预计 ≤ 60 行。

## §3 P1(仅当 2 个 session 内还有余量)

- drag 重排(P0-1 的 stretch goal);
- 分享卡针对 hue 分数做一版专属布局(现有渲染路径上改)。

## §4 明确不做(v1.3)

- **调色板云备份/同步(两评审一致砍)**:`/me/palettes` 端点不存在、`/me/preferences` 只存 favorites+6 色 ID、盲 PUT 必然踩多设备覆盖 —— 对零留存用户过度工程。留给「数据门通过后」的 v1.4+,且届时必须带 `updated_at` 乐观锁 + DTO 校验 + 尺寸上限。
- Widget、本地化、Image Palette/Analyze 移植、付费墙/价格改动、StoreKit 任何改动、屏幕检测套件移植。

## §5 发布与数据门

1. P0-0 → P0-1/P0-3 开发(XCTest golden parity 全绿)→ P0-2 元数据;
2. bump 1.3 (build 6) → archive → 上传(沿用 1.2.1 的 ExportOptions + team key 流程);
3. **TestFlight 真机回归:StoreKit 沙盒购买必测**(1.2.1 修复不许回归)+ hue 游戏手感;
4. 提交 `releaseType=MANUAL`,ASO 元数据随版本生效;
5. **数据门:上架后 3 周**(评审:2 周不够 App Store 搜索索引生效),用 ONGOING analytics 报告复盘,**pass/fail 阈值先写死**:
   - 下载:ASO 后 3 周日均下载 **≥ 10**(现状约 0)→ 否则 ASO 假设失败;
   - 游戏:打开者完成率 **≥ 30%** 且 `share_intent` ≥ 完成数的 **10%** → 否则钩子假设失败;
   - 结论三选一:**深耕**(两项都过,解冻讨论)/ **维持**(下载过、游戏不过:只跟系统兼容)/ **收缩**(都不过:iOS 转纯维护,资源全回 web)。

## §6 遗留的 owner 决策点

1. ASO name/subtitle 的 A/B 案(等 API 拉到线上实况后我给出,一句话选择);
2. 数据门阈值(上面写的 10/30%/10% 若你有异议现在改,发布后不许移动球门柱)。

## 附录:今日数据 queries(可复现)

- ASC 版本/审核状态:`asc-verify.cjs`(ES256 team key,app id 6761363087)
- 后端订单:`sqlite3 data.db "SELECT product, COUNT(*), SUM(amount) FROM orders GROUP BY product"` → Pro monthly 3 笔 ¥0;Seasonal 4 笔(3-4 月 web 订单)
- Analytics 请求:`GET/POST /v1/apps/6761363087/analyticsReportRequests` → ONGOING `dda726fa`

---

## Review 记录(2026-07-21,原始输出见 session scratchpad)

**Codex(gpt-5.6-terra,read-only 仓库核查,148k tokens)— revise-then-ship**:
- **旧病复发被抓**:`tool_used` 已全局触发(ToolsHomeView.swift:133)、PostHog 已接真 key、分享卡渲染已存在(ShareSheet.swift)→ 计划已改为复用;
- AI Mood 错误工作项表述错误:固定文案 + APIService 丢状态码 + iOS 入口 Pro-gated → P0-3 已按实况重写;
- `/me/palettes` 不存在、preferences 仅 favorites+6 色、盲 PUT 覆盖风险 → P1 备份砍;
- 无 XCTest target(声称的测试无处运行)→ 新增 P0-0;
- OKLCH:iOS 只有 HSL 工具,须新写并 middle-only 洗牌 → 已写死到 P0-1;
- ShareLink 无完成回调 → 事件更名 `share_intent`;
- ASO 须先拉线上实况、守字节上限、不写不存在的功能词 → P0-2 第 0 步;
- 钩子假设未验证 → 发布前先写死 pass/fail 阈值(§5)。

**Gemini 3.1 Pro (High) — revise-then-ship**:
- 零预算图片分享病毒式传播 ≈ 神话,ASO 才是最高杠杆 → 定调已倒转(ASO 主、游戏实验);
- 2 周数据门不够搜索索引生效 → 改 3 周;
- SwiftUI 自定 drag 重排 + ImageRenderer 都是预算炸弹 → tap-swap 主交互、复用现有分享路径、drag 降为 stretch;
- 色彩空间:iPhone 默认 P3,OKLCH 输出须显式钉在 sRGB → 已写入 P0-1;
- JSON 盲 PUT 必丢数据 → 与 Codex 一致,砍;
- StoreKit 隔离红线 → §0 成本红线明文;
- (分歧点:Gemini 主张整砍 hue 游戏;Codex 主张保留单一免费 MVP 实验。裁决:按 Codex 保留但按 Gemini 降级,阈值不过即收缩 —— 两边的下行保护都拿到。)
