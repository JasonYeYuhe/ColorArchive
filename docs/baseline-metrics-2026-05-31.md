# ColorArchive 真实数据 Baseline — 2026-05-31

> 来源:生产后端 SQLite(`pageviews` / `events` / `orders` 表)只读查询。
> 用途:V2 计划书 S1「打开真实信号 · 找那 1 个入口」的交付物 + 后续对照基线。
> 站点数据起点:2026-03-19(约 2.5 个月运行)。

---

## 1. 流量量级

| 指标 | 值 |
|------|----|
| 累计 pageviews | 56,904 |
| 近 30 天 PV | 10,449 |
| 近 7 天 PV | 1,052 |
| 近 1 天 PV | 171 |
| 日均(近 21 天) | ~110–240 PV/天(5-14 有 592 峰值) |
| 设备分布(30d) | 桌面 80% / 移动 18% / 平板 2% |

**注意**:`pageviews` 表**没有 visitor/session ID**,无法计算真实独立访客、DAU、留存。这正是必须接第三方分析(PostHog)的硬理由——不是为了好看的仪表盘,而是现有埋点根本算不出留存。按 PV 粗估,真实日活人类访客在**几十到一百出头**量级。

---

## 2. TOP 入口(近 30 天)—— "那 1 个" 找到了

| 路径 | PV | 类型 |
|------|----|----|
| `/` | 1,325 | 首页 |
| **`/word-to-color/`** | **723** | **🔑 头号工具,远超其他** |
| `/guides/blue-color-psychology-branding-guide/` | 458 | SEO 指南 |
| `/all-colors/` | 121 | 核心浏览 |
| `/guides/film-cinematography-color-guide/` | 104 | SEO 指南 |
| `/guides/color-trends-2026-design-guide/` | 89 | SEO 指南 |
| `/collections/` | 88 | |
| `/trends/`, `/seasonal/` | 83 / 79 | |
| `/brand-generator/` | 61 | 工具(Pro) |
| `/colorblind/`, `/pick-for-me/` | 46 / 39 | 工具 |

**SEO guides 合计 2,236 PV / 368 篇** —— 内容是最大的入口板块,头部几篇(blue-psychology 458)集中了大头。

**结论**:用户为两件事而来——① **word-to-color(文字转颜色,免费/有趣/可分享)** ② **颜色心理学/搭配 SEO 指南**。没有任何 Pro 工具是主要入口(brand-generator 仅 61)。

---

## 3. 流量来源(近 30 天)

| 来源 | PV | 备注 |
|------|----|----|
| (direct) | 7,402 | 含大量无 referrer / bot |
| google.com | 562 | 传统搜索 |
| **chatgpt.com** | **399** | **🤖 AI 引擎,第二大外部源** |
| duckduckgo.com | 286 | |
| colorarchive.org/word-to-color?q=… | ~600(多条) | 站内 word-to-color 反复使用/被索引 |
| bing.com | 180 + 46 | |
| googleads.doubleclick / safeframe | 96 + 83 | 疑似广告/嵌入流量 |
| perplexity.ai | 42 | AI 引擎 |
| ecosia / facebook / copilot | 42 / 48 / 24 | |

**重磅发现**:**AI 搜索引擎(ChatGPT 399 + Perplexity 42 + Copilot 24 ≈ 465)是一个真实且被完全忽略的流量来源**,ChatGPT 单独就是第二大外部源。2026 年「生成式引擎优化(GEO)」是真实趋势,而 V1/V2 计划书都没提到。

---

## 4. 转化漏斗(惨淡,但这是真相)

| 阶段 | 数量 |
|------|------|
| events 总数 | 23 条(细粒度埋点几乎没用) |
| `upgrade_modal_shown` | 3 |
| `checkout_clicked` | 1 |
| `checkout_redirected` | 1 |
| subscribers(邮件订阅) | 4 |
| users(注册) | 5 |
| orders | 6,但**几乎全是测试/0 元** |

**订单明细**:6 单里 4 单 source 标为 `test`/`free-pack`,2 单是 `Pro monthly` 且 **amount = 0**(试用/测试)。唯一接近真实的是 1 笔 299 JPY 的 Seasonal 包。**真实付费验证 ≈ 0**——从未有人为 Pro 订阅(¥499/月)真实付过钱。

---

## 5. 五个关键洞察(改变 V2 走向)

1. **不是"没流量",是"流量意图 ≠ 变现对象"**。有日均上百 PV 的真实流量,但来的人是查 word-to-color、读颜色科普的**信息型/泛用户**,而商业模式是面向**设计师的 ¥499/月 Pro 订阅**。这两拨人不是同一群人——这是核心 PMF 错配。

2. **"那 1 个入口"是 word-to-color + SEO guides,不是任何 Pro 工具**。如果走 Gemini 的"垂直击穿",标的就是它们,但必须先回答:word-to-color 的用户能被变现成什么?(它现在是纯免费引流,没有变现路径。)

3. **AI 引擎(GEO)是白捡的杠杆**。ChatGPT 已经在导流 399。主动优化"被 AI 引用"(结构化内容、可引用数据)几乎零成本,且是 2026 年增量红利。

4. **真实付费从未验证**。MRR≈0 不是"营销不够",是**根本没测过有没有人愿意为这个 Pro 付费**。LS 切 Live + 一次真实定价实验是当务之急。

5. **看不见留存**。现有埋点无 visitor ID,无法判断那上百日活里有多少人回来。接 PostHog 的唯一目的就是补上这个(visitor/session/留存/漏斗),而非自建。

---

## 6. 对 V2 的修正

- S1「找那 1 个入口」✅ 完成:答案是 **word-to-color + 颜色 SEO guides + AI 引擎流量**。
- 新增候选战线:**GEO(生成式引擎优化)**——让内容更容易被 ChatGPT/Perplexity 引用。
- ICP 收敛(P1.1 用户访谈)必须正面回答:**到底服务"查颜色的泛用户"还是"付费的设计师"?二者目前在打架。**
- 变现实验优先级 ↑:与其优化设计师 Pro 漏斗(没流量),不如先测 word-to-color 这股真实流量能否变现(哪怕极小额/打赏/导出付费)。

---

## 7. Google Search Console(2026-05-31 实查,近 ~90 天)

| 指标 | 值 |
|------|----|
| Total clicks | **202** |
| Total impressions | **26.4K** |
| Average CTR | **0.8%** |
| Average position | **13.2**(≈ Google 第 2 页) |

**Top 非品牌 queries**:`word to color generator` / `word to color` / `words to color` / `color generator from word`(word-to-color 家族霸榜)+ 长尾色词(`mulberry dust color`、`muted saffron color`、`amber hex code`、`boreal forest color palette`)。

**解读**:
- **"有曝光无点击"**:2.64 万次曝光说明 Google 已索引大量页面,但平均排名在第 2 页(13.2)→ CTR 仅 0.8% → 只换来 202 点击。**内容在 Google 眼里已存在,只是没爬到第 1 页。**
- **word-to-color 是 SEO + 直接流量双料头号入口**(GSC 非品牌词榜首 + 后端 PV 723)。
- 长尾色词(programmatic SEO 页)已被索引、有曝光,但排名不够高、CTR 低。

## 8. 合并真相:AI 引擎 ≳ Google 自然搜索

| 渠道 | 量级 |
|------|------|
| **ChatGPT 导流**(后端 referrer,30 天) | **399** |
| Google 自然搜索点击(GSC,90 天) | **202** |
| Perplexity + Copilot(30 天) | ~66 |

**对这个站,AI 引擎(ChatGPT 等)带来的流量已经 ≳ Google 自然搜索。** 这是 2026 年的结构性变化,V1/V2 计划书都漏了。两条由此而来的高 ROI 杠杆:
1. **GEO(让内容被 AI 引用)**——当前最被低估、近乎零成本的获客杠杆。
2. **释放已有 SEO**——不必狂扩新页(已有 26.4K 曝光卡在第 2 页),把现有页 title/meta/内容加厚 + 内链,**把第 2 页推到第 1 页**,放大现有曝光,比从 0 做新内容确定性高得多。
