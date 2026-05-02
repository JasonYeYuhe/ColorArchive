# ColorArchive 增长导向开发计划书

> 起草:2026-05-02
> 作者:Claude (Opus 4.7)
> 目的:在产品已具备完整功能闭环的前提下,把开发资源从"加功能"切换到"加用户"。
> Review 目标:Gemini 3.1 Pro

---

## 0. 一句话结论

**功能层面已经做完了 80%,但当前产品的瓶颈不是"功能不够",而是"没有让用户带来用户的引擎,也没有让用户每天回来的钩子"。下一个 90 天的核心任务是把 ColorArchive 从"工具集合"变成"会自我繁殖的色彩品牌"。**

---

## 1. 现状盘点(2026-05-02)

### 1.1 产品资产(已有)

- 5,446 颜色档案 + 2016 个静态详情页(静态生成)
- 23+ 在线工具(对比、调色、渐变、色盲、品牌生成、AI 评审、图片提色…)
- 256+ collections / 317 SEO guides / 349 newsletter issues
- 完整商业化:Stripe 9 SKU + LemonSqueezy + iOS IAP + Pro 订阅(¥499/月、¥3,999/年)
- 账户体系:magic link + Google OAuth、云端 favorites/palette 同步、3-tier(anon/free/pro)
- 营销渠道:YouTube、TikTok(in review)、Twitter API、Pinterest Standard live、Product Hunt 上线
- AI 5 个端点(brand-palette、mood-palette、name-color、critique、analyze-url)
- Figma 插件、VS Code 扩展、iOS app(v1.1 已审)
- 后端:DigitalOcean Droplet + Express + SQLite + Resend + PM2
- 邮件 nurture 序列 Day 0/3/7/14/21/30 + COTD 日推
- 工程基础:465+ Vitest 测试、Sentry、ESLint、TypeScript strict

### 1.2 真实瓶颈(诚实地说)

| 维度 | 现状 | 问题 |
|------|------|------|
| **流量入口** | 主要靠 SEO 长尾(317 guides) | SEO 覆盖好,但流量爬升曲线慢,缺乏"突袭式"获客 |
| **病毒系数** | 几乎没有 | 用户没有理由把 ColorArchive 分享给朋友,也没有自带传播性的产物 |
| **每日活跃** | COTD 邮件推送 + Pinterest pin | 用户没有"每天打开网站"的钩子,iOS 也没用上 widget/通知能力 |
| **付费转化** | 漏斗已搭,但样本少 | 免费用户体验完整,付费门槛模糊;Pro vs Free 的"差异感"不强 |
| **差异化** | 概念是"档案馆",但用户感知是"又一个调色工具" | 没有一两个让人记住"这是 ColorArchive"的招牌功能 |
| **UGC** | 0 | 用户只能消费内容,不能创作并被看到 — 缺少社区飞轮 |

### 1.3 用户视角的"为什么不选你"

- 已有 Coolors / Adobe Color / Khroma / huemint(免费、知名度高)
- 我们的 5,446 颜色对设计师是"有趣但非必需"
- Free pack 已下载 → 用户没有回来的理由
- 中文用户体验 i18n 已就绪,但中文渠道(小红书/微信公众号)还没真正打通

---

## 2. 思考框架

把增长拆成 4 个独立可优化的系数:

```
新用户增量 = 流量 × 病毒系数 × 留存率 × 付费转化率
```

- **流量(Acquisition)**:每天有多少新人来?
- **病毒系数(K-factor)**:每个用户带来 N 个新用户(目前 K ≈ 0)
- **留存(Retention)**:N 天后还有多少回来?
- **转化(Conversion)**:多少人付费?

**当前最弱的是病毒系数和留存。这两个加成是乘法关系,改善它们的杠杆远大于继续做新工具。**

---

## 3. 90 天战略目标

| 时间 | 北极星指标 | 收入指标 |
|------|------------|----------|
| **Day 30** | DAU 300+(目前估计 < 50) | Pro 订阅 10+ |
| **Day 60** | DAU 1,000+ + 一个"病毒功能"达到 50k 次访问 | Pro 订阅 50+ |
| **Day 90** | DAU 3,000+ + 月留存 35%+ + UGC 内容 1k+ | MRR ¥10,000+ |

具体到产品:**3 条主战线 + 2 条副战线**。

---

## 4. 主战线 A — 病毒分享引擎(Growth)

> 目标:让每个新用户至少产出 1 个可分享物,平均带 0.3+ 个新访客。

### A1. "Your Year Color" 年度代表色生成器 ⭐⭐⭐ P0

**功能**:输入名字 + 生日(或星座/MBTI),生成独属于你的"2026 年度代表色"+ 4 色 palette + 一张可下载的 1080×1920 Instagram Story 卡片(自带水印 colorarchive.org)。

**为什么这个会爆**:
- "What's your X" 类内容在 IG/小红书/X 长期高传播(参考:Spotify Wrapped、星座色测试)
- 输出物是一张图片,天然适合 Story/朋友圈/小红书首图
- 季节性:可以在年初推一次,季节切换推一次,生日当天推一次(邮件触发)

**技术实现**:
- 算法:已有 `word-color.ts` 哈希逻辑可复用,扩展为 `name+date → seed → palette`
- 图片生成:用 `@vercel/og` 或 `satori` 在 edge function 生成 PNG,缓存到 CDN
- 路由:`/your-color/[hash]/` 静态可分享 URL,带社交 meta tags
- 分享按钮:Instagram Story、X、小红书复制图、微信复制图

**估时**:5–7 天(后端 og 生成 + 前端表单 + 分享卡片设计)

**衡量指标**:
- 生成次数 / 周
- 生成 → 分享转化率
- 分享 → 回访率(UTM)

---

### A2. AI Image → Brand Kit ⭐⭐⭐ P0

**功能**:用户上传任意图片(产品照、风景、Logo 草图),AI 自动产出:
- 5–7 色品牌色板(含 primary/secondary/neutral)
- 命名(AI 起诗意名)
- WCAG 配对建议
- 一份 PNG 风格指南(banner + 色块 + 用法示例)

**为什么这个会爆**:
- 设计师/创业者刚需:"我有一张参考图,怎么搭品牌色"
- 输出物即营销内容(分享品牌指南页 → 自然带 ColorArchive logo)
- AI 工具天然话题度高,Twitter/Threads 易传播

**技术实现**:
- 已有 `image-palette/` 提色 + AI brand-palette 端点 → 串起来即可
- 增加风格指南导出(PDF + PNG + .swatches)
- Free 限 1 次/天,Pro 无限 + 高分辨率

**估时**:7–10 天(主要在风格指南模板设计 + AI prompt 调优 + Pro gating)

**衡量指标**:
- 生成次数
- Free → Pro 转化(从这个工具进 /pro/ 的比例)

---

### A3. 自带传播水印的 OG 图 ⭐⭐ P1

**功能**:每个 palette / collection / pack 详情页生成的 OG 图,在用户分享到 X/微博/朋友圈时,默认带:
- 极简右下角 logo
- 二维码(指向回 colorarchive.org/[原始 URL])

目前 OG SVG 已生成,扩展加水印 + 二维码即可。

**估时**:2 天

**衡量指标**:OG 图分享 → 来源 referral

---

## 5. 主战线 B — 每日回访钩子(Retention)

> 目标:把用户从"用一次就走"变成"每天打开一次"。

### B1. Daily Streak + 徽章系统 ⭐⭐⭐ P0

**功能**:
- 连续访问 N 天 → 解锁徽章(7/14/30/100/365)
- 每天首次访问展示一个动效 ribbon:"Day 12 streak — Today's color: …"
- 30 天连续访问解锁"Pro 7 天试用券"
- 100 天解锁"永久 7 折券"
- 个人页面 `/account/` 展示徽章墙

**为什么有效**:
- 连续打卡的"损失厌恶"是经过验证的最强留存机制(Duolingo 模式)
- 徽章本身可以分享(扩展 A1 的截图卡片)
- 把 Pro 试用从"销售页面跳出"前置到"日常打卡奖励"

**技术实现**:
- 后端:在 `users` 表加 `last_visit_date`、`current_streak`、`longest_streak`、`badges` JSON
- 前端:`<StreakRibbon />` 组件挂在 layout,匿名用户用 localStorage,登录后合并到云端

**估时**:5 天

**衡量指标**:Day-7 / Day-30 留存率(目标:30%+ / 15%+)

---

### B2. iOS Lock-Screen Widget + 推送通知 ⭐⭐ P1

**功能**:
- iOS Widget(锁屏 + 主屏):每日颜色 + 名字
- Daily Push:"今天的颜色是 Crimson Veil — 来添加到你的灵感板"
- Apple Watch complication

**为什么有效**:
- iOS app 已上线但当前体验薄弱,Widget 是"被看到 5 次/天"的入口
- ColorArchive 与 iOS 视觉系统天然契合(高质量色卡)

**技术实现**:
- 复用 `getColorOfDay()`(server/colors.js + Swift port 已就绪)
- Widget Extension(SwiftUI),3 个 size class
- APNs 推送(Apple Push):配合后端 `email-scheduler.js` 的 cron

**估时**:7–10 天(包含 App Store 重新审核)

---

### B3. 个人色彩日志 Color Journal ⭐⭐ P1

**功能**:用户每天可以"保存今天的颜色"+ 一句话灵感笔记。30 天后形成个人色彩日历,可以导出为图片/PDF。

**为什么有效**:
- 给用户一个"持续创作"的理由(创作 > 消费 → 留存 ↑↑)
- 输出物再次成为分享物(参考 A1 的飞轮)
- 自然形成 UGC,为后续社区铺垫

**技术实现**:
- 后端:`color_journal` 表(user_id、date、color_id、note)
- 前端:新增 `/journal/` 路由,日历视图 + 导出
- Pro 专属:可以选择整年导出为 PDF 海报(¥99 单卖也可)

**估时**:6 天

---

## 6. 主战线 C — 付费转化漏斗优化(Revenue)

> 目标:把 Free → Pro 转化从估计的 < 0.5% 提到 2%+。

### C1. 明确化 Free vs Pro 的"差异感" ⭐⭐⭐ P0

**目前问题**:Free 用户做完几乎所有事,看不到 Pro 真正的"额外价值"。

**改造**:
- **导出限制**:Free 导出 PNG/SVG/Tailwind 各 1 次/天(目前未限),Pro 无限
- **AI 限制**:已有(anon 3/free 10/pro ∞),但要在 UI 里更明显
- **历史保留**:Free 只保留最近 10 个 palette,Pro 无限
- **Brand Kit 数量**:Free 1 个,Pro 无限
- **导出分辨率**:Free PNG 1080px,Pro 4K
- **去水印**:Free 导出图带极淡水印,Pro 去除

**关键**:每个限制必须立即触发"升级模态框",且模态框里写清楚"还差 1 次就升 Pro"。

**估时**:3–4 天(主要是 ProGate 组件扩展 + UI 文案)

**衡量指标**:
- 升级模态框展示 → 点击 → 付费的漏斗
- 7 天 Pro 试用 → 自动续费率

---

### C2. 一次性"季度色板"小额订阅 ⭐⭐ P1

**功能**:¥99/季,每季度收到一个"主题色板包"(Spring/Summer/Autumn/Winter)+ 限定壁纸 + Figma 文件。

**为什么**:
- ¥499/月对个人用户偏高;¥99/季是冲动消费区间
- 强制每季度回访("我订阅了,要看看这季的色板")
- 已有 Seasonal Spring 2026 pack (¥299)即资产

**估时**:2 天(主要是 Stripe 配置 + 邮件模板)

---

### C3. Team Plan + 团队协作 palette ⭐ P2(暂缓)

不在 90 天范围,但要为它留架构余地(`projects` 表已有 `share_id`,扩展 `team_id` 即可)。

---

## 7. 副战线 D — 招牌差异化功能(Signature)

> 目标:做 1–2 个让人记住"这是 ColorArchive 独有"的功能。

### D1. 颜色考古馆 / Color Origins ⭐⭐ P1

**功能**:每个颜色详情页(目前只有色彩参数)增加"前世今生":
- 这个色相在历史上叫什么名字
- 哪个文化中是禁忌色 / 神圣色
- 哪部电影/画作/品牌用过它
- 心理学解读

**实现**:
- 不是手写 5,446 篇,而是按色相 + 明度 + 饱和度 9×3×3 = 81 个语义簇生成"原型故事",再让 AI 微调每个色的措辞
- 已有 `color-stories.json`,扩展即可
- 数据源:Wikipedia + 公开色彩词典

**为什么这个会让人记住**:
- 没有任何竞品做这个深度的内容
- 极强 SEO 价值("crimson meaning"、"颜色的历史"等长尾词)
- 是"档案馆"概念的真正落地

**估时**:10–14 天(内容生成 + 校对 pipeline)

---

### D2. 实时趋势引擎 ⭐ P2(数据依赖,暂缓)

抓取 IG/Pinterest/Behance 公开 API,每周生成"本周流行色"。需要先解决数据 ToS 和反爬问题,Q3 再做。

---

## 8. 副战线 E — 中文渠道与 SEO 长尾(Discovery)

> 目标:打通中文流量入口。

### E1. 小红书内容工厂 ⭐⭐ P1

**功能**(后端 + 内容):
- 每日自动生成一张"今日颜色"小红书封面图(已有 IG image generator 可复用)
- 文案:"今天的颜色叫 [名字],适合 [场景]"
- 后台一键复制到小红书发布(或半自动:`/admin/xiaohongshu/`)

**估时**:4 天

---

### E2. 品牌色板 SEO 落地页 ⭐⭐ P1

**功能**:`/brands/[brand-slug]/` 自动生成的"知名品牌色板"页面。
- 用 `analyze-url` AI 端点抓取品牌官网
- 静态生成 200–500 个高搜索量品牌(Apple、Notion、Tesla、Spotify、星巴克…)
- 每个页面自带"复制 CSS"、"导出 Figma"、"看看类似的 ColorArchive 颜色"
- 长尾搜索词:"Apple color palette"、"Notion brand colors hex"

**为什么**:
- "Brand X color palette" 是色彩领域最高搜索量长尾词之一
- 一旦排名上去,就是稳定流量
- 与现有 5,446 颜色直接挂钩(给出"最接近的 Archive 颜色")

**风险**:商标 / 法律层面,只用公开可见的色彩参数 + 标注"非官方,色彩参考"。

**估时**:5–7 天(脚本生成 + SEO meta + 法律免责声明)

---

### E3. 中文 i18n 完整覆盖 + 中文域名 ⭐ P2

- 当前 i18n 只覆盖导航 / hero / 部分页面
- 把所有 23+ 工具页中文化,覆盖 100% UI 文案
- 中文 SEO meta 单独优化(不能直接翻译)
- 考虑 `colorarchive.cn` 域名 + ICP 备案(长期决策)

---

## 9. 工程债与基础(必须先扫除)

这些不直接拉新,但不解决会让上面所有方案打折。

| 项 | 严重度 | 估时 |
|----|--------|------|
| 修复 React #418 hydration error(zh locale,/palette-audit/) | P1 | 0.5 天 |
| ESLint 174 issues 分批清理(106 errors + 68 warnings) | P2 | 2 天 |
| e2e 测试覆盖核心 flow(签到 / 购买 / Pro gating) | P1 | 3 天 |
| Sentry 真实告警接入(目前只是 capture,没人看) | P1 | 0.5 天 |
| 数据库:加 `daily_active`、`streak` 等增长指标表 | P0 | 1 天 |
| 增长仪表板:DAU / K-factor / 留存可视化(扩展 `/analytics/`) | P0 | 2 天 |

---

## 10. 不做的事(明确)

防止精力分散,90 天内不做:

- ❌ 新工具(已经 23+ 个,边际效用递减)
- ❌ Android app(iOS 还没真正用起来)
- ❌ Marketplace / UGC 大社区(架构成本高,先用 Color Journal 试水)
- ❌ Enterprise / SSO(没有付费个人用户基数,做企业版是浪费)
- ❌ 重做现有页面 UI(视觉够用,改了也没增长)
- ❌ 加更多语言(EN/ZH 都没满,加 JA/KO 没意义)

---

## 11. 90 天 Sprint 拆解

### Sprint 1(Week 1–2):工程债清扫 + 增长仪表板
- 修 hydration #418
- 加 `daily_active` / `streak` 表
- 扩展 `/analytics/` 显示 DAU、K-factor、cohort 留存
- e2e 覆盖 Pro gating flow
- **里程碑**:能看到准确的 DAU 数字

### Sprint 2(Week 3–4):Daily Streak + Free/Pro 限制
- B1 完整上线
- C1 完整上线
- iOS app 接入 Streak 显示(不依赖新版本审核,远程配置)
- **里程碑**:Day-7 留存数据出现

### Sprint 3(Week 5–6):Your Year Color
- A1 完整上线 + 营销 push(Twitter/小红书/Pinterest)
- **里程碑**:单日 5,000+ 次访问 /your-color/

### Sprint 4(Week 7–8):AI Image → Brand Kit
- A2 完整上线
- E2(品牌色板 SEO 落地页)同步上线
- **里程碑**:Pro 转化数据出现

### Sprint 5(Week 9–10):Color Journal + iOS Widget
- B2 + B3 上线
- **里程碑**:DAU 1,000+

### Sprint 6(Week 11–12):颜色考古馆 + 复盘
- D1 上线
- 用前 10 周数据复盘下一阶段方向
- **里程碑**:DAU 3,000+ / MRR ¥10,000+

---

## 12. 风险与依赖

| 风险 | 影响 | 缓解 |
|------|------|------|
| AI 端点滥用(A2、D1 都依赖 AI) | 成本失控 | 已有 anon 3/day 限速,Pro 也设上限 |
| iOS Widget 依赖 App Store 审核 | 延期 | 提前 2 周提交 v1.2 |
| Your Year Color 没火 | 时间成本 | 即使不火,也能用作邮件 nurture 素材;沉没成本可控(7 天) |
| 中文渠道反爬 / 政策风险 | 流量打折 | 小红书做半自动,不做爬虫 |
| 病毒功能法律风险(品牌色板页面) | 商标投诉 | 全站 disclaimer + 24h 移除机制 |

---

## 13. 衡量与验证

每周看 5 个数字:

1. **DAU**(目标曲线:50 → 300 → 1,000 → 3,000)
2. **K-factor**(目标:从 0 → 0.3+)
3. **D7 留存率**(目标:从未知 → 30%+)
4. **Free → Pro 转化率**(目标:< 0.5% → 2%+)
5. **MRR**(目标:¥0 估计 → ¥10,000+)

如果任一周连续 2 周不动:暂停后续 Sprint,重新审视假设。

---

## 14. 给 Reviewer 的明确问题

请帮忙判断以下决定是否合理:

1. **优先级排序**:把 Streak(B1) + Free/Pro 限制(C1) 放在 Sprint 2 而不是 Sprint 1,合理吗?(逻辑:数据先,产品改造后)
2. **Your Year Color(A1)** 真的能像我预期那样有病毒性吗?如果你认为不行,该换成什么?
3. **不做的事**清单是否过于保守?有没有该砍的反而留了,该留的反而砍了?
4. **AI Image → Brand Kit(A2)** 已经被 Khroma、huemint、Recraft 等做过,我们的差异化是否成立?
5. 90 天目标 DAU 3,000 是否过于激进/保守?
6. **副战线 E2(品牌色板 SEO 落地页)** 法律风险是否真的可控?
7. 是否漏掉了一个明显该做但我没列的方向?

---

## 附录 A:已废弃 / 不做的想法记录

- ❌ Color version control(像 git 那样的 palette 历史) — 太工程化,不解决用户痛点
- ❌ Slack/Discord bot — 用户基数小,边际收益太低
- ❌ Movie/TV/Anime palette generator — 版权风险高
- ❌ 拍照即得 palette(iOS native) — 已有 image-palette 网页版,Native 重做收益小
- ❌ "Color of the Year" 全民投票 — 没有足够基数支撑投票公正性

---

(end of plan)
