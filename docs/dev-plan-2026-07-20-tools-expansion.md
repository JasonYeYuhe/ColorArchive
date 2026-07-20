# ColorArchive 下阶段开发计划书 — 2026-07-20(tools-expansion:屏幕测试套件 + 工具矩阵获客)

> 起草:2026-07-20 · 作者:Claude(remote session,owner 授权全权负责)
> 依据:gate-report 2026-07-20(droplet 实测)· 5-agent 研究 Workflow(仓库盘点 / screen-test 竞品 / 工具缺口 / 浏览器平台 API / 完整性评审)· docs/dev-plan-2026-06-27-pre-gate-hardening.md 纪律沿袭
> Review:Gemini 3.1 Pro (High) + Gemini 3.5 Flash(via agy CLI)+ Codex —— 见文末 Review 记录

---

## §0 判定与纪律(先读)

### 0.1 Gate 判定:Auditor off-ramp 正式生效

2026-07-15 硬门已过。07-20 droplet 实测(30 天窗口):

| 指标 | 实测 | 目标 | 判定 |
|---|---|---|---|
| Qualified /preorder UV | **0**(raw 9) | 500 | ❌ |
| Paywall triggers | 396 | 1000 | ❌ |
| **Auditor 预购(gate 判据)** | **0** | 10 | ❌ |
| 全部订单(context) | **1(Pro monthly)** | — | ✅ 亮点 |

结论按 dev-plan-2026-06-19 §5 的既定规则执行:**证据驱动 off-ramp —— 不再建 Auditor(M1)**。

**证据口径修正(Codex review 抓出,已 DB 实证)**:gate-report 里的"1 笔 Pro monthly 订单"经 droplet 查证为 **amount=0 JPY(2026-07-20 免费试用开通)**,不是收入。真实信号降级为:"零分发条件下有自然用户进入订阅漏斗" —— 方向性弱证据。因此本计划的立论主要靠:
- 站点历史上唯一的大流量(13.4k/10d /word-to-color)来自 **SEO 工具页**,而非任何人工分发;
- Owner 明确指示新增"屏幕颜色测试"工具 + 更多 color tools。

战略定位(采纳 Codex 表述):这是一次**窄口径、有测量的获客实验**,不是"工具矩阵"铺开。**流量≠买家**:screen-test 用户偏消费者/售后场景,离 Pro/packs 比设计工具用户更远 —— 所以成功判据必须绑定**下游合格行为**(测试完成 + cross-link 点击 + 试用开通),不是曝光量(§4)。word-to-color 的教训(大流量零转化)是本计划的反面清单。

### 0.2 成本红线(不可违反,逐条沿袭 reference_vercel_cost + CLAUDE.md)

1. **禁止新增 generateStaticParams / ISR 页面家族**(Vercel Build-CPU $30.51 事故教训)。每个新工具 = 手写静态路由,数量以个位数计。
2. **禁止新增 Next API route**(app/api/* 冻结;服务端逻辑一律进 droplet Express —— 本计划全部工具**纯客户端**,不触发此项)。
3. **每 session 恰好 1 commit + 1 push**(每次 push 重建 3,000+ 页)。
4. 会话协议:pull --rebase → 查锁 → 以 "remote" 持锁 → 单 commit 含锁释放。

### 0.3 研究中被否决的想法(红线冲突,记录在案防止复活)

| 想法 | 否决理由 | 替代 |
|---|---|---|
| 5,446 个 `/screen/{color-id}` 全屏纯色静态页 | 违反红线 1(新 generateStaticParams 家族) | 单一 `/screen-test/color-screens/` 路由 + `?color=` query(客户端渲染,支持全部 5,446 色 + 任意 hex;仅 hub 进 sitemap) |
| 每-结果动态 OG 分享卡 | 违反红线 2(需动态 route/edge fn) | **客户端 canvas 生成 PNG 下载/分享**(零服务端);结果 URL 用 query 编码,robots-disallow(沿 sitemap.ts:63 惯例) |
| Kelvin 每 100K 一页 / "A+B makes" 程序化页 | 违反红线 1 | 单页工具 + 客户端交互 |
| HDR 测试内容 | 需制作+托管 HLG/PQ 视频资产,且浏览器仅能"播放",无法控制 nits | v1 仅做 HDR **能力检测**(matchMedia dynamic-range),内容测试 defer |

---

## §1 现状盘点(研究 Workflow 实证)

- 31 个工具已在 `/tools/` 注册表(TOOLS array,src/components/tools-page.tsx),另有 palette-audit / validate / palette-generator / journal 等**未注册或注册不全**的路由。
- **注册表漂移 bug(本计划顺手修复;范围经 Codex 仓库核查修正)**:
  - `/palette-audit/` 补进 TOOLS array(**sitemap 已有,勿重复加**);
  - `/validate/` 补进 TOOLS array + header nav + sitemap(真·近孤儿路由);
  - `/pick-for-me/` 补进 sitemap;
  - `/surprise/` **不动** —— 它声明了 noindex(app/surprise/page.tsx:6),是有意为之,进 sitemap 反而自相矛盾;
  - STRUCTURE.md 工具行数落后(feedback_structure_doc 要求同步)。
- 数字口径(critique 质疑,已核实):**5,446 = 颜色总数**(src/data/colors.ts 算法生成);**3,066 = 预渲染子集**(app/colors/[slug]/page.tsx:34 注释明确:Vercel 80MB 输出限制,其余 dynamicParams on-demand + CDN 缓存)。两者都对,引用时须分清。
- iOS:**1.2.1 (build 5) 已 READY_FOR_SALE**(StoreKit entitlement-retry 修复已上架)。
- 现成引擎(已核实存在,直接复用):`color-mix.ts`(OKLCH 插值)、`colorblind.ts`(Viénot 矩阵)、`dark-mode-pairs.ts`、`palette-import.ts`、`color-contrast.ts`(WCAG;APCA-W3 实现在 contrast-page.tsx 内 —— Codex 纠正)、`color-naming.ts`。

---

## §2 主打:Screen Test 套件(`/screen-test/`)

### 2.1 定位与竞争格局

竞品三层(研究实证):① EIZO(13 项、桌面-only、无评分、企业站无动力现代化)/ Lagom(图形学最正确但 **HTTP-only**、2000s 设计、无全屏、无移动端);② dead-pixel / white-screen 复制粘贴群(各 6-8 个近似域名靠广告分食 —— **复制密度即流量证据**,SERP 质量极弱);③ 2024-26 一页一词 SEO 站(screendetect 等,内容浅)。TestUFO 独占动效测试(**不碰,link-out 换信任**)。

**差异化(仅我们能做)**:
1. **Archive-native**:色差辨别测试用真实相邻档案色(同 hue root 相邻 chroma/lightness band),结论用命名色表述("你的屏幕在低 chroma 下分不开 Steel 和 Sapphire");FM-100 式色相排序游戏基于 48 个 hue roots 的 OKLCH 插值。5,446 色点阵无法被通用测试站复制。
2. **正确性即营销**:gamma/锐度图案必须画在**物理设备像素**上(DPR-aware canvas + zoom 检测);banding 用 canvas 逐值色带(CSS 渐变会被浏览器抖动掩盖真实 banding —— 所有 copycat 都错)。可产出 "why most online screen tests are wrong at 125% zoom" 这类换外链的内容。
3. **有评分、可分享**:全部竞品都是"自己看自己judge"。我们的 guided wizard 逐步记录(最低可见黑阶、gamma 估计、坏点 y/n、hue 得分)→ 命名结果卡(客户端 canvas PNG)。
4. **现代 UX**:dark-mode-first(黑阶测试时白色 chrome 是自毁)、全屏流 + 触摸手势、Wake Lock、零广告。
5. **生态飞轮**:结果页 cross-link 对比检查器 / palette-audit / 色彩详情页;测试历史入 localStorage 订阅模式(favorites.ts 同款)。

### 2.2 子测试清单(**scope 经三方 review 收敛**:P0 = Phase 1 本 session,P1/P2 = 后续)

| 优先 | 子测试 | 关键词家族 | 实现要点 |
|---|---|---|---|
| P0 | Dead / Stuck Pixel(独立路由) | dead pixel test, stuck pixel test | 全屏纯色循环(W/K/R/G/B + 档案色);点击/方向键切换;光标闲置隐藏;Wake Lock。**"修复模式"(快速闪色)三方一致:永久砍掉** —— 光敏癫痫风险不对称,警告门也不足以豁免,且搜索意图在"测"不在"修" |
| P0 | Color Screens(独立路由) | white screen, black screen 家族(最大体量、最弱 SERP) | 一键全屏任意色;`?color=` 支持 5,446 命名色 + hex(**canonical 指回基路由**,防爬虫噪音);清洁/打光/描图用途文案 |
| P0 | Black Level + White Saturation(hub 内分节) | black level test, white saturation test | 近黑 1-16 阶 / 近白 240-254 阶楔,DOM/CSS 实现;交互仅"你报告能看到第 N 阶"表述 |
| P0 | Uniformity / 背光渗漏(hub 内分节) | backlight bleed test | 纯黑/25%/50% 灰全屏;bleed vs IPS glow 辨别指引;纯 DOM |
| P0 | Screen Report(hub 内,**仅事实无判定**) | what is my screen resolution | 分辨率×DPR、color-gamut(srgb/p3/rec2020)、dynamic-range(**能力非状态**,措辞 "HDR-capable")、colorDepth(规范允许硬编码 24,只展示);forced-colors/prefers-contrast 检测→警告横幅。**Hz 测量从 v1 砍掉**(rAF 是调度估计非面板测量,省电模式限流会当场毁信誉;P2 再做交互驱动版) |
| P1 | Gamma ~2.2(canvas) | gamma test, monitor gamma test | **必须 DPR-exact canvas** + `getContext('2d', {colorSpace:'display-p3'})` 能力检测(默认 canvas 是 8-bit sRGB,会自造 banding 假阳性 —— Flash/Pro 一致);zoom 检测只能提示不能证明(dPR 混杂 OS 缩放,Codex 纠正措辞) |
| P1 | Banding / 渐变(canvas) | color banding test, gradient test | canvas 逐值 256 阶(CSS gradient 会被浏览器抖动掩盖);**定性视觉检查,非测量** —— 浏览器管线(ICC/合成器/FRC)无法与面板隔离,文案如实说 |
| P1 | Guided Wizard + 结果卡 | monitor test online | 串联+逐步记录;结果卡 = 客户端 canvas PNG,**iOS 用长按保存 + navigator.share**(a[download] 在 iOS 不可靠);**分享态用 hash(#)不用 query**(robots.ts 只挡路径,query 无先例;hash 天然不进爬虫) |
| P1 | Sharpness / 色差辨别(archive 版)/ Hue Arrangement / Burn-in / Touch tester | monitor sharpness test / **screen color test**(勿用 "color accuracy" —— 违反自家文案红线)/ color hue test / screen burn in test / touch screen test | Hue 游戏错误分布**不做 CVD "倾向"诊断表述**,只报分数 + "如担心色觉请就医"(Codex);其余同前 |
| P2 | Viewing angle / Subpixel / Inversion / Flicker / 交互驱动 Hz | 小体量 | 完整性补充,不投营销 |
| — | Motion / 响应时间 | — | **不做**,页内 link-out TestUFO |

### 2.3 技术规范(平台研究结论,写死为工程约束)

1. **渲染分工**:颜色/渐变补丁用 DOM/CSS(Firefox 无 P3 canvas);**仅几何图案(1px 网格/线对/zone-plate)用 canvas**,尺寸 = CSS 尺寸 × devicePixelRatio 取整,监听 resolution/dPR 变化重绘。
2. **全屏梯**:`requestFullscreen` → Safari `webkitRequestFullscreen` 前缀 → **iPhone Safari 无法全屏非视频元素:maximize-fallback**。Flash 补强:fixed inset-0 在 iOS 会被弹性滚动 + 动态地址栏破坏 —— 须 `touch-action: none` + `touchmove` preventDefault + `viewport-fit=cover` + `100dvh`,并给 iOS 用户 "aA → 隐藏工具栏" 提示;边缘像素在 iPhone 上永远测不全(诚实文案)。Esc/下滑退出是浏览器强制,UI 给淡出提示不对抗。全屏调用必须来自用户手势。
3. **能力检测全部响应式**:color-gamut / dynamic-range / forced-colors / resolution 都挂 `change` 监听(拖窗到另一台显示器时结果要跟着变)。
4. **P3 自证补丁**:`rgb(255 0 0)` vs `color(display-p3 1 0 0)` 并排 —— 看得出差异 = 广色域端到端成立;看不出 = sRGB 管线(这本身就是诚实结论)。`CSS.supports` 只证解析器,必须与 `(color-gamut: p3)` 联合判定。
5. **Wake Lock**:`navigator.wakeLock.request('screen')` try/catch 包裹 + visibilitychange 重获取;HTTPS-only(本站满足)。
6. **检测并警告,而非默默错测**:forced-colors: active / prefers-contrast: more(OS 在改写颜色)→ 横幅;zoom≠100%(fractional dPR)→ 图形类测试前置警告;夜览/True Tone 提示语。
7. **诚实文案红线**:通篇用 test / check / inspect,**禁用 calibrate / measure / color accuracy / ΔE / nits 作为能力承诺**;页脚固定 "This is not calibration — for hardware calibration you need a colorimeter" + 检测值标注 "as reported by your browser"。这既是正确性也是差异化(法务+信任)。
8. **安全(review 后升级)**:快速闪烁类功能(stuck-pixel 修复、strobe)**整体不做** —— 三方 review 一致认为警告门不足以豁免光敏癫痫风险,且无 SEO 增益。任何未来动效均以 3Hz 为频率上限。
9. **DPR 措辞纠正(Codex)**:devicePixelRatio 同时受浏览器 zoom 与 OS 缩放影响,**无法证明 "zoom=100%"** —— 检测到 fractional dPR 时提示"可能处于缩放状态",不下断言。
10. **P3 自证补丁措辞**:两块补丁看不出差异 = "端到端呈现为 sRGB"(现象),**不是** "你的管线是 sRGB"(结论)—— 浏览器色彩管理可能在任一环转换。

### 2.4 信息架构与 SEO(**三方 review 后收敛版**)

- **Phase 1 = 3 个路由,不是 7 个**(三方一致:低权重站同时铺 6 个薄页会互蚕食+稀释):
  - `/screen-test/` hub:Screen Report(事实版)+ black/white level、uniformity 内嵌分节 + **≥500 词的测试准备指南**(测试环境/照明/暖屏 —— Pro 指出纯链接网格 hub 排不了头词)+ 各子测试入口;
  - `/screen-test/dead-pixel/`(最大专词);
  - `/screen-test/color-screens/`(white/black screen 家族)。
- 后续路由(gamma/banding/黑白阶独立页)**由 GSC 数据触发**:hub 家族有曝光后再拆,每拆一页必须内容上实质差异化。
- `?color=` 参数页 canonical 指回基路由;分享/结果态一律 hash(#),不产生可爬 URL。
- 3 个路由进 sitemap(monthly, 0.8);i18n 沿 useLocale() 出 EN/ZH 文案对。
- **埋点(Codex:仅 tool_used 不够,漏斗事件必须齐)**:`screen_test_selected`(选了哪个子测试)→ `screen_test_fullscreen`(进全屏)→ `screen_test_completed` / abandoned → `screen_test_downstream_click`(结果区 cross-link 点击)。

### 2.5 验收标准

- typecheck + build + vitest 全绿;新增 lib 逻辑(能力检测、阶梯/色循环生成)带单测。
- 移动 Safari(maximize-fallback)+ 桌面 Chrome/Safari/Firefox 手测通过。
- PostHog `tool_used` 自动埋点(TOOL_SLUGS)+ §2.4 漏斗四事件;GSC 曝光只作早期信号,**通过判据以 §4 Phase 3 合格行为口径为准**。

---

## §3 更多 Color Tools(合并去重后的 ranked backlog)

Critique 实证:研究员盲提的 14 个候选中 6 个已存在(mixer/tints/colorblind/wcag-audit/image-palette/surprise)。以下为**去重后**真实缺口,按 SEO 潜力 × 档案契合 ÷ 工时:

### Tier A(screen-test 后立即做,每个 ≤1 session)

| 工具 | 形态 | 理由 |
|---|---|---|
| **OKLCH/LAB 支持** | **retrofit `/convert/`** | 现有转换器缺 OKLCH/OKLAB/LCH/LAB/P3;`color-mix.ts` 已有 OKLCH 数学;"oklch converter" 是增长最快的 dev 词族 |
| **ΔE 色差计算** | **retrofit `/compare/`** | 加 CIE76/CIEDE2000 分数 + 白话解读("肉眼不可分/相邻可分");避免与 compare 互蚕食;metadata 拓展 "delta e calculator" |
| **Tailwind 色彩工具** | 新 `/tailwind-colors/` | hex→最近 Tailwind class 双向 + 档案名互注;dev 高频词族,S 工时 |
| **CSS Filter 生成器** | 新 `/css-filter/` | 黑色 SVG→任意色 filter 链(经典高流量 dev 工具);纯数值优化,客户端 |
| **色盲安全修复器** | **retrofit `/colorblind/`** | 模拟器只"展示问题",加"从档案取最近安全替代色"= 修复方案(palette-audit 的 nearestAccessibleArchive 同款思路) |
| **独立色轮页** | 新 `/color-wheel/` | "color wheel" 巨量词,现有 harmonies 内嵌轮无独立路由;复用 harmonies SVG 轮 + 档案 snap |

### Tier B(观察池,GSC 数据决定是否做)

Kelvin→RGB(映射到最近档案色)· Dark-mode 调色板转换(dark-mode-pairs.ts 引擎已在)· Duotone 图像(image-palette 已有图像摄取)· 名色反查升级(retrofit `/name/` 加 ΔE 排名的最近档案色列表,**不建新路由防互蚕食**)· paint-mixing 比例。

### Registry hygiene(与 Phase 1 同 commit,零风险)

palette-audit + validate 补进 TOOLS array;validate + pick-for-me(+surprise 裁决)补进 sitemap;STRUCTURE.md 工具行与计数刷新。

---

## §4 阶段划分

| 阶段 | 内容 | 出口判据 |
|---|---|---|
| **Phase 1(本 session)** | `/screen-test/` hub(Screen Report 事实版 + black/white level + uniformity 内嵌 + 500 词指南)+ `/dead-pixel/` + `/color-screens/` 两个子路由 + 漏斗埋点 + registry hygiene(修正版范围) | 全绿 + 单 commit 部署 |
| **Phase 2** | Gamma + Banding(DPR/P3 canvas 模块)+ Guided Wizard + 结果卡(hash 态 + navigator.share)+ hue game / sharpness / 色差辨别 / burn-in / touch;Tier A 工具穿插 | 每批独立 commit;GSC 首批曝光数据决定拆哪些独立路由 |
| **Phase 3** | Tier A 余量 + Tier B(数据驱动)+ "online screen test 正确性" 内容营销文 | **30 天决策规则(Codex 版):合格行为口径** —— screen_test_completed 数、downstream_click 数、试用开通归因,**不以曝光/流量为通过标准**;若合格行为≈0 → 该获客面降级为维护态,回到变现层实验 |

**变现挂点(不新建付费墙)**:wizard 结果卡免费;结果页 cross-link 现有 ProGate 工具(tokens/preview/audit 导出);screen-test 不设付费项(纯获客面)。

---

## §5 iOS 下阶段(简短)

- **1.2.1 已上架**(StoreKit entitlement-retry 修复 live)。**硬冻结维持**:ASC 日下载>100 或 IAP 累计>$100 前不投 iOS 新 feature(2026-06-06 决议不变)。
- 本阶段唯一 iOS 动作:**看 ASC 数据**(1.2.1 上架后的下载/IAP 曲线,决定 v1.3 是否启动);v1.3 若启动,范围沿 docs/ios-dev-plan-v1.3.md 的"修破窗"清单,并可按需移植 web 端已验证的 hue-arrangement game(唯一适合触屏的新玩法)。
- Web screen-test 的移动端体验(maximize-fallback + touch tester)本身即覆盖 iPhone 用户,无需 App 侧动作。

---

## §6 风险与开放问题

1. **rAF Hz 读数**在省电模式/后台被限流 → 已用文案+重测按钮缓解,但 Screen Report 作为开屏第一信息仍有误读风险(观察退出率)。
2. **SEO 生效周期** 4-12 周,Phase 3 复盘前无数据反馈 → 用 GSC 曝光(先于点击)做早期信号。
3. **word-to-color 先例**:大流量未必转化 → screen-test 页内 cross-link 密度(结果卡→contrast/audit/详情页)是本计划与 word-to-color 的关键差异,PostHog 上专门盯 cross-link CTR。
4. **iPhone 全屏缺失**是体验硬伤 → maximize-fallback 已定,但 dead-pixel 类测试在 iPhone 上永远有 Safari chrome 残留(诚实文案,不假装)。
5. ~~修复模式闪烁的光敏风险~~ —— **已裁决:三方 review 一致,修复模式整体不做**(见 §2.2/§2.3-8),风险闭环。

## §7 执行清单(每个新工具走一遍)

```
app/<route>/page.tsx        · metadata(absolute title / canonical / OG)+ JSON-LD WebApplication + BreadcrumbList
src/components/<x>-page.tsx · "use client" UI
tools-page.tsx TOOLS array  · href/icon/nameKey/descKey/categoryKey/badgeKey/accent
site-header.tsx             · Tools nav group
i18n.ts                     · nav.* / tools.*.name / tools.*.desc(EN/ZH)
posthog.ts TOOL_SLUGS       · tool_used 自动埋点
app/sitemap.ts              · topLevelRoutes(用户态结果 URL 走 robots disallow)
STRUCTURE.md                · 路由行 + 计数
验证                         · npm run typecheck && npm run build && npx vitest run
```

---

## Review 记录(2026-07-20,原始输出见 session scratchpad)

三方均为 **revise-then-ship**,修订已全部回写至上文(scope 收敛、fixer 砍除、Hz 延后、canvas colorSpace、iOS 细节、hash 态、漏斗埋点、注册表纠错、订单证据修正):

- **Gemini 3.1 Pro (High)**(via agy):Phase 1 超范围(mega-commit 陷阱)→ 收敛为 hub+2 子路由;fixer 永久砍(不对称法律/健康风险);rAF Hz 信任赤字 → v1 砍;hub 需 ≥500 词内容否则排不了头词;banding/gamma 的 canvas 需显式 colorSpace。
- **Gemini 3.5 Flash (High)**(via agy):同 scope 结论;canvas 默认 8-bit sRGB 会自造 banding 假阳性;iOS maximize-fallback 需 touch-action/dvh/地址栏处理;iOS 下 a[download] 不可靠 → 长按保存 + navigator.share;6 路由互蚕食 → 收敛;forced-colors 静默错测风险 → 警告横幅。
- **Codex**(read-only 仓库核查):**"1 笔 Pro monthly" 实为 ¥0 试用**(已 DB 实证并修正 §0);palette-audit 已在 sitemap / surprise 有意 noindex(注册表修复范围纠错);APCA 位置纠正;robots 只挡路径 → 分享态改 hash;DPR≠zoom 证明;流量≠买家 → 30 天决策规则改合格行为口径;漏斗事件补齐;"color accuracy" 关键词违反自家文案红线 → 撤换。
