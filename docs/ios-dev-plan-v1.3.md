# ColorArchive iOS 下一版(v1.3)开发计划书

> 起草:2026-06-06 · 作者:Claude (Opus 4.8)
> Review 目标:Gemini 3.1 Pro + Codex
> 性质:基于对 ios/ 现状逐项核实后的规划,延续本项目"修复+验证优于堆功能"的判断。

---

## 0. 现状(已核实)

- **版本**:MARKETING_VERSION 1.2 / build 3 · Bundle `me.colorarchive.app` · Team KHMK6Q3L3K
- **技术**:纯 SwiftUI · `@Observable` + `@Environment` 状态管理 · SwiftData(调色板)+ UserDefaults(收藏/最近) · 48 个 Swift 文件
- **核心功能(完整)**:浏览 5446 色 / 语义搜索 / 收藏(已云同步)/ 调色板 / 11 个色彩工具 / 颜色详情 / Spotlight 索引
- **IAP(完整)**:StoreKit 2,3 产品(monthly $4.99 / yearly $34.99 / lifetime $99.99);`ProAccessManager` 双解锁(StoreKit 或 web tier)
- **集成**:Magic-link 认证 + 服务端偏好同步(`/me/preferences`)+ Sentry(刚加,DSN 仍空)+ 设计 token 导出(CSS/Tailwind/Figma/SwiftUI)
- **代码质量**:零 TODO/FIXME,架构干净

---

## 1. 一句话定调

**v1.3 不堆新功能,而是「修复半成品 + 补完已开始的 + 闭合收入链路」**——让用户点了能用、让订阅事件可追踪。

---

## 2. 诚实反思:iOS 现在值得投入吗?

和 web 一样,**iOS 的 DAU 和真实 IAP 付费是未知的**(没看过 App Store Connect 的下载/活跃/付费数据)。所以严格说,投入 v1.3 前应该先看 ASC 数据。

**但 iOS 有 web 没有的「破窗」**——已经摆在用户面前、但是坏的:
- AI Mood Palette:用户点进去,**API 根本没接,不工作**
- Image Palette:UI 在,**k-means 算法没写完**,而且缺相册权限声明会**崩**
- 调色板:**不跨设备同步**(收藏却同步了,体验割裂)

破窗比"没有"更伤——用户点了坏功能会直接流失。**修破窗的 ROI 高于堆新功能**,且投入小、风险低。所以 v1.3 聚焦于此;大功能等 iOS 有真实用户信号再议。

---

## 3. P0 — 修复半成品(让现有功能真能用)

| # | 任务 | 说明 | 估时 |
|---|------|------|------|
| 1 | **AI Mood Palette 接 API** | UI 已就位,`AIService.generateMoodPalette()` 接口已定义,只差实际调用 `/ai/mood-palette` + 错误处理 + 配额(anon3/free10/pro∞)提示 + ProGate | 2 天 |
| 2 | **Image Palette 补完算法** | UI + k-means 框架已有(50×50 降采样 + bucketing),补完整像素提取 + 聚类 + 最近存档色匹配 | 3 天 |
| 3 | **加 `NSPhotoLibraryUsageDescription`** | Image Palette 要读相册,Info.plist 缺这个声明 = 审核被拒 / 运行崩溃 | 0.5 天 |
| 4 | **调色板云同步** | 收藏已同步,补调色板到 `/me/preferences`(后端字段已支持 palette_json)+ 冲突合并 | 2 天 |

**里程碑**:点开 AI Mood / Image Palette 都能真正出结果;调色板跨设备一致。

---

## 4. P1 — 收入闭环 + 稳定

| # | 任务 | 说明 | 估时 |
|---|------|------|------|
| 5 | **App Store Server Notifications V2 webhook** | 订阅续费/取消/退款事件后端接收,否则 iOS 的 MRR/churn 是黑盒(续费了不知道、取消了还显示 Pro) | 2 天 |
| 6 | **真正启用 Sentry** | `SentryBootstrap` 已加但 DSN 空 = 没监控。配 DSN(已在 pbxproj 的 `INFOPLIST_KEY_SentryDSN`)+ 验证崩溃/卡顿上报 | 0.5 天 |

---

## 5. P2 — 择机(需先有 iOS 用户信号)

- **中文本地化**(`Localizable.strings`):当前全英文硬编码;若 ASC 数据显示有中文区用户再做
- **Collections 数据补齐**:iOS 仅 20 个 vs web 256 个

---

## 6. 明确不做(v1.3)

- ❌ **Widget Extension** —— web 的 V2 计划也把它后置了;iOS 用户量未验证前,做了没人放首屏,ROI 低
- ❌ **全新 AI 工具**(Brand Palette / Image Analyze / Color Critique)—— web 有,iOS 现在堆 = 功能蔓延,先把已有的 Mood/Image 修好
- ❌ **Watch app / Android 同步重构** —— 没有用户基数支撑

---

## 7. 验证前提(人工,只有你能做)

1. **看 App Store Connect**:v1.2 的真实下载量 / DAU / IAP 付费数 —— 这直接决定 iOS 是否值得继续投 v1.3(可能数据显示该先做获客而非功能)
2. **申请 Apple Small Business Program**:抽成 30%→15%,纯收益,无脑该申请
3. **配 SentryDSN 到环境**(P1.6 需要)

---

## 8. Sprint 拆解(单人 + AI 节奏)

| Sprint | 内容 | 里程碑 |
|--------|------|--------|
| S1 | P0.1 AI Mood + P0.3 Photo 权限 | AI Mood 真能用 |
| S2 | P0.2 Image Palette 算法 | 图片取色真能用 |
| S3 | P0.4 调色板云同步 + P1.6 Sentry 启用 | 跨设备一致 + 崩溃可见 |
| S4 | P1.5 Server Notifications webhook | iOS 订阅事件可追踪 |
| 复盘门 | 提交 v1.3 前看 ASC 数据 | 若 iOS 几乎无用户,暂停后续、转验证 |

---

## 9. 给 Reviewer 的问题

1. v1.3 聚焦"修半成品 + 收入闭环"而非堆新功能,这个判断对吗?
2. 在 iOS 的 DAU / 付费未验证前,投入 v1.3 值得吗?还是该先逼自己看 ASC 数据、甚至先做 iOS 获客?
3. P0 四项有没有该砍或该加的?(尤其:调色板云同步 P0.4 值得 2 天吗,还是 iOS 用户根本不跨设备?)
4. Server Notifications webhook(P1.5)放 P1 对吗?iOS 收入黑盒严重到要提前吗?
5. 整份计划最大的盲点是什么?有没有明显该做却没列的?

---

## 附录:与 web 功能差距(供参考)

iOS 缺失:AI Mood(API)、Image Palette(算法)、Brand Palette、Image Analyze、Color Critique、调色板云同步、本地化、Widget。其中 v1.3 只补**前 3 个里的破窗**(Mood/Image + 云同步),其余明确推后。

*(end of plan)*
