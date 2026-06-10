# ColorArchive 开发计划书 — Figma 插件过审后的 30 天(2026-06-10)

> 起草:2026-06-10 · 作者:Claude(过审修复 + 实测 + 重提交的同一会话)
> 定位:**V2 战略(docs/dev-plan-2026-05-31.md)的执行子计划**,落在 P2.2「分发战线」上。
> 不开新战略、不推翻 V2;S2 退出门照旧有效。

---

## 0. TL;DR

**ColorArchive — 5,400+ Curated Colors 于 2026-06-09 通过 Figma 审核上线**(Community Version 2,插件 id `1616829363158218051`)。这是 V2 计划 P2.2 钦点候选渠道里第一个真正上线的分发渠道。本计划回答三件事:

1. **抓住上架窗口**:launch wave + listing 资产补全,把"过审"变成"装机"。
2. **修好渠道的转化闭环**:插件外链全无 UTM(渠道不可归因)+ API key 不持久(Pro 钩子体验残缺)——一次 v1.1.0 发版打包解决。
3. **不跑偏**:插件渠道数据喂给 V2 的 S3 押注决策;S2(10 用户访谈)仍是关键路径,插件只是给它加了一个招募入口。

---

## 1. 现状盘点(2026-06-10,已核实)

### 1.1 触发事件
- **2026-06-09 Figma 官方过审邮件**("Figma has approved your resource")。5-12 被拒的 3 个 bug(FigJam STYLE crash / clipboard export / Inspect 占位符)已在 PR #6 修复、桌面端双编辑器实测、6-07 重提交,工单 1842708/1948014 已闭环。
- 站内入口已存在:header 导航 + tools 页都已挂 Community 链接(出站闭环 OK)。

### 1.2 V2 进度对照(战略坐标)
| V2 条目 | 状态 |
|---|---|
| P0.1 接第三方分析 | ✅ PostHog Cloud US live(web+iOS,project 456902,cookieless,详见 docs/analytics-posthog-2026-06-06.md) |
| P0.2 LS Live + 真实支付 | ✅ 2026-04-17 已验证首单 |
| P0.3 找"那 1 个"入口 | ✅ baseline 已出:`/word-to-color/` 头号工具,SEO guides 板块最大(docs/baseline-metrics-2026-05-31.md) |
| P0.4 薄 E2E 护栏 | ⚠️ 待确认条数(e2e/ 当时只有 smoke) |
| S2 十个用户访谈 | ❌ 未启动 —— **仍是关键路径**(脚本已备:docs/user-interview-script.md) |
| P2.2 分发渠道 | 🟢 **Figma Community 渠道刚上线 ← 本计划主体** |

### 1.3 流量基线(对照用)
站点 ~110–240 PV/天(05-31 基线);插件装机数 = 0(刚上架)。30 天后回看本节。

---

## 2. 深度问题清单(按严重度)

### A. 渠道归因断链(P0 — 不修等于白装)
`figma-plugin/ui.html` 三处外链**全部没有 UTM**:
- `:196` Projects 标签 "Get your API key at colorarchive.org/account"
- `:209` footer `colorarchive.org`
- `:633` Inspect "View on ColorArchive" → `/colors/hex/?c=…`(JS 拼接)

后果:插件带来的访问在 PostHog 里与 direct 混在一起,**install → 访问 → 注册 → 付费的漏斗根本算不出来**,直接违背 V2 "先开真实信号"的第一原则。修法:统一追加 `?utm_source=figma-plugin&utm_medium=plugin&utm_campaign=v1_1`。

### B. Pro 钩子体验残缺:API key 永不持久(P0 — 产品 bug)
过审修复时我们把 `localStorage` 包成 `safeGetItem`(try/catch 返 null)——救了 crash,但 Figma 桌面端 UI 是 `data:` URL,**localStorage 永远抛错 → API key 永远存不住 → Projects 用户每次打开插件都要重贴 key**。这是当时为过审欠下的债。
正确方案(Figma 官方模式):**`figma.clientStorage`**(主线程、异步)。UI 在 `ui-ready` 后由主线程读 clientStorage 随 `init` 下发;UI 通过 `save-api-key` / `clear-api-key` 消息让主线程写入。

### C. 上架资产薄(P0 — 压制自然分发)
发版向导里 **playground file 为空**、仅 1 张 thumbnail、tags 未优化。Community 排序吃 engagement 和素材完整度;新上架的 "recently published" 曝光窗口有限,资产要趁这个窗口补齐。

### D. 工程护栏缺口(P0 — 同类回归还会再发生)
`.github/workflows/ci.yml` 只跑主站 typecheck/lint/test/build,**figma-plugin 完全不在 CI 内**:`tsc` 不跑、`ui.html` 语法不查、也没有"禁止裸 `localStorage.`"的守护。这次三个 bug 全部属于"CI 一行命令就能拦住"的级别。

### E. 文档/版本漂移(P1 — 信任与维护成本)
- `figma-plugin/README.md`:还是 "2016 colors" 旧文案,无发版 runbook、无桌面回归 checklist、无 localStorage 教训;
- `figma-plugin/package.json`:version 1.0.0(Community 已是 Version 2)、description 同样过时;
- `docs/human-todo.md`:停更于 04-24,与现实大幅脱节;
- `figma-plugin/thumbnail.png` untracked。

### F. 业务侧悬而未决(继承项)
- 🔴 Facebook token 失效(6 月初再坏,需人工 re-auth)→ launch wave 少一个自动渠道;
- StoreKit sandbox 购买测试未做(human-todo 遗留);iOS v1.2 build 4 在审;
- Paddle 搁置(LS 为主,维持现状)。

### G. 战略层(提醒,非本计划范围)
S2 的 10 个访谈没做,ICP 仍未收敛。插件渠道再热闹,**S2 退出门的输入还是访谈+真实数据**。插件能贡献的是:① 渠道数据;② 插件内 feedback 入口帮招募访谈对象。

---

## 3. 行动计划

### P0 — Launch 窗口周(本周,一次发版打包)

| # | 任务 | 验收标准 | 工作量 |
|---|------|---------|--------|
| P0.0 | **确认线上状态**:访问 `figma.com/community/plugin/1616829363158218051`,记录 version/installs/likes 初值到本文件 §6 | 数字记录在案 | 10 min |
| P0.1 | **插件 v1.1.0 代码包(→ Community Version 3,一次重审)**:<br>a. API key 迁移 `figma.clientStorage`(B 项,含 ui-ready/init 往返 + 旧 key 无缝升级)<br>b. 三处外链加 UTM(A 项)<br>c. 文案/版本清理:README 重写(5,446 色 + 发版 runbook + 桌面回归 checklist + localStorage 教训)、package.json → 1.1.0、thumbnail.png 入库 | `npm run build` 干净;桌面端 Design+FigJam 全功能回归通过(含:重开插件 API key 仍在);一次 Publish | 1 天 |
| P0.2 | **Listing 资产**(不动代码、不动 data-security 答案):用 Figma MCP 造 playground file(色卡 + Inspect 示例 + 使用引导);2–4 张 carousel 截图;补 tags(color palette / WCAG / accessibility / design tokens / tailwind) | Community 页资产齐全 | 0.5 天 |
| P0.3 | **Launch wave**:X/Pinterest/IG 自动队列各 1 波(已有管线);newsletter + weekly roundup 提及;Product Hunt/Indie Hackers 更新贴文案备好(人工发);tools 页插件入口文案强化 | 内容发出/排队,文案交付 | 0.5 天 |
| P0.4 | **CI 护栏**:ci.yml 加 figma-plugin job(`npm ci && tsc --noEmit` + ui.html `node --check` + **grep 禁裸 `localStorage.`**) | PR 上 CI 必跑必绿 | 0.5 天 |
| P0.5 | **PostHog 渠道漏斗**:utm_source=figma-plugin → signup → purchase 的 funnel/insight;周报并入 autopilot-log | funnel 建好,能出数 | 0.5 天 |

> **发版纪律**:P0.1 的 a/b/c 必须**一个版本一次过审**。Listing 资产(P0.2)与代码发版解耦,文本/图片编辑不触发重审;**data-security 答案一个字都不改**(改了重审,见 §5)。

### P1 — 渠道深化(第 2–3 周,限时盒,不挤占 S2)

| # | 任务 | 价值 |
|---|------|------|
| P1.1 | **Variables 支持**:Style 之外提供 "Create as Variables"(`figma.variables`,Design-only,照 P0 模式 guard)——design tokens 是当下 Figma 主叙事,差异化卖点 | 高 |
| P1.2 | **选区取色 → 最近色映射**:选中 frame 提取 solid fills,映射到最近 ColorArchive 色,一键批量建样式(连接"你的设计"与"我们的库") | 高 |
| P1.3 | 导出格式扩展:Tailwind v4 `@theme` / OKLCH / SwiftUI(主站已有逻辑可镜像) | 中 |
| P1.4 | **端到端购买测试**(human-todo 遗留)+ account 页 API key 获取流程打磨(Pro 钩子的另一半) | 高 |
| P1.5 | 插件内 **feedback 入口**(mailto/表单链接)→ 给 S2 访谈招募供给 | 中 |

> P1.1–P1.3 打包成 v1.2.0 一次发版。两周做不完就砍,**S2 访谈优先**。

### P2 — 伺机(不排期)
- 插件内匿名遥测:**默认不做**。现 data-security 答案 =「自托管后端、不传 Figma 派生数据、无第三方请求」;接 PostHog(第三方)直接推翻答案。真要做,只考虑自托管 api.colorarchive.org 匿名计数 + 先改答案再发版。当前 UTM 落站归因已够用。
- iOS v1.2 过审后与插件互相 cross-promo;VS Code 扩展文案同步刷新。
- FigJam 深化(sticky/section 适配)。

### 明确不做(继承 V2 §5)
自建数据层、新横向工具、iOS Widget、大 E2E 工程、Android/UGC/SSO、迁库重构 UI。

---

## 4. 30 天指标

| 指标 | 基线(06-10) | 目标 |
|---|---|---|
| 插件 installs / likes(Figma 后台周记) | 0 / 0 | **第 1 周末定基线后修订**(不拍脑袋) |
| utm_source=figma-plugin 周 sessions(PostHog) | 0 | 同上 |
| 该渠道 signup / 首笔支付 | 0 / 0 | 30 天内 ≥1 笔该渠道支付 = 渠道成立的最强信号 |
| 站点 PV | ~110–240/天 | 对照观察 |

**判读规则**:第 4 周末如果 installs 增长停滞且漏斗为 0,把结论(渠道弱)如实写进 S3 押注决策,不恋战;数据正反都喂 V2 的 S2/S3 节点。

---

## 5. 发版与合规约束(血泪换来的,违反必返工)

1. **插件 UI 是 `data:` URL**:`localStorage`/`sessionStorage` 永远抛 SecurityError,裸访问会**杀死整个脚本**(5-12 被拒 bug#3 的真根因)。持久化只走 `figma.clientStorage`(主线程);UI 侧一律 try/catch + CI grep 把守。
2. **每次代码 Publish = 一次重审**:改动打包,一个版本过一次审;频繁小版本 = 排队地狱。
3. **data-security 问卷答案不动**:改答案触发重审;新功能不得引入第三方网络请求(manifest allowedDomains 也别动)。
4. **发版前桌面回归(两个编辑器都要)**:Design — Apply/Swatch/Style/Export(剪贴板验证)/Inspect(含"先选层再开插件");FigJam — 无 crash、禁用项有提示、Apply/Export/Inspect 正常;控制台(Plugins→Development→Show/Hide console)无插件报错。
5. **发版路径**:Figma 桌面 → Plugins → Manage plugins in development → ⋯ → Publish new version(4 步向导,listing 预填,Version 自动 +1)。
6. 仓库纪律照旧:session-lock 协议、feature branch + PR(参照 PR #6)、单 commit 单 push、`docs/dev-plan-*.md` 在 vercel-ignore 内不耗构建。

---

## 6. 渠道数据记录(滚动更新)

| 日期 | Version | Installs | Likes | utm sessions(7d) | 备注 |
|---|---|---|---|---|---|
| 2026-06-10 | 2 | (P0.0 填) | (P0.0 填) | 0 | 过审上线初值 |

---

## 7. 任务归属

**Claude 可全权执行**:P0.1/P0.4/P0.5 全部代码、P0.2(Figma MCP 造 playground + computer-use 截图/发版)、P0.3 文案与自动渠道排队、P1 全部代码、human-todo.md 刷新。
**只有 Jason 能做**:
- [ ] 🔴 Facebook token 人工 re-auth(launch wave 缺的一臂)
- [ ] Reddit / 设计师社区人工发帖(账号信任度,Claude 备稿)
- [ ] **S2 的 10 个用户访谈**(脚本已备,这是 V2 关键路径)
- [ ] StoreKit sandbox 购买测试(human-todo 遗留)
- [ ] 发版向导最后一步 Publish 的确认点击(或继续授权 Claude 代点)

---

## 8. 风险

| 风险 | 缓解 |
|---|---|
| v1.1.0 重审再被拒 | 改动面小且全在已过审框架内;发版前跑 §5.4 回归;被拒则按工单流程修复重提(已有完整 playbook) |
| launch wave 哑火(装机寥寥) | 这本身就是渠道信号,如实记录进 §6,4 周判读,不沉没成本 |
| P1 feature creep 挤占 S2 | P1 限时盒 2 周,到期即砍;访谈不动摇 |
| clientStorage 迁移破坏现有用户 | 读取顺序:clientStorage → (无) → 视为未连接;不会比现状(永远丢失)更差 |

---

*(end of plan — 交接 prompt 见会话回复,新 session 从 P0.0 开始执行)*
