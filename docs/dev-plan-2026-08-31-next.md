# 下阶段开发计划(2026-08-31 · 第 2 稿,评审后重写)

> 承接 `docs/dev-plan-2026-08-25-next.md` 与 `docs/w3-diagnosis-2026-08-25.md`。
> 数字取自 Azure 生产库(`172.207.80.109`),只读 SELECT,2026-08-31 05:xx UTC。
>
> **第 1 稿的结论是「这不是增长阶段,因为没有任何干预可测」。**
> **Gemini 3.1 Pro 和 3.7 Flash 各自独立把这句话判成了「用严谨包装的怯懦」,而它们是对的。**
> 我据此重查数据,找到了一个第 1 稿完全没看见、而且**可测**的干预点(§2)。
>
> ⚠️ 同时我也复核了评审的每一条,**其中三条不成立**(§7),没有照单全收。

---

## §0 这一阶段和上一阶段的根本区别

上一阶段(08-25 → 08-31)做完的事,改变了**能不能相信数字**这件事本身:

| | 08-25 之前 | 现在 |
|---|---|---|
| `color_copied` | 只覆盖 55 个复制点里的 2 个组件,`/colors/*` 恒为 0 | 全站覆盖,`/colors/*` **首次出现** |
| `word_generated`(§5 锚点) | 对 Pro / 被墙 / 已解锁 / 未解析四类**永不发**,深度硬顶在 5 | 全部可见,带 `counted`/`reason`/`depth` |
| 事件投递 | `sendBeacon` 被拒时**静默丢弃**,无任何计数 | 被拒改走 fetch,送不出的计入 `_dropped` |
| 生产代码 | 与仓库的差异只能靠 md5 考古 | `/root/ColorArchive` 是 git 仓库,`git status` 即漂移 |
| 机器 | 无快照、无告警、无 APM | 增量快照(周)+ 三条 Azure 告警(已端到端验证邮件送达) |

**所以这一阶段第一次具备了「用数据下决定」的前提。上一阶段没有。**

---

## §1 新事实(全部本次实测,标注 n)

### 1.1 §5 锚点健康,功能没有被砍的风险

30 天:**engaged visits 2,894 · 锚点(钉死旧定义)582 · `page_read` 2,216**。
判据是「≥300/月留、<150/月连续两月砍」。**582 远在留的一侧,这条不用再想。**

### 1.2 第一次看见付费墙之后的世界 —— 但**它没有告诉我们任何东西**

`depth` 不封顶后的分布(自 08-27,约 4 天,**106 个去重会话**):

```
depth 1: 106 会话   2: 58   3: 35   4: 24   5: 14   6: 7
逐档存活率:        54.7%  60.3%  68.6%  58.3%  50.0%
```

第 1 稿写「从 5 到 6 存活率约 50%」,暗示这是个信号。**Gemini Pro 指出这是过度解读,它对了:**
**50% 落在其它每一档(54.7–68.6%)的自然衰减区间里,付费墙那一档没有任何异常阻力。**
n=14 时二项 95% CI 宽达 [24%, 76%],信噪比为零。

→ **真正学到的是「depth=6 存在」这个事实本身**(过去 `count` 卡在 5,所以「所有人都停在 5」是记录假象)。
**但衰减曲线是平的,没有证据说 5 这个数字卡住了谁。** 见 §5 W1 的判据修正。

### 1.3 唯一的召回机制事实上不存在

- **历史累计 11 个订阅者**(近 30 天 3 个,近 7 天 1 个)
- `email_form_impression` **584 次 / 458 会话** → `email_subscribed` **3 个会话** = **0.65%**
- 渠道分解里**没有任何一条邮件带回来的访问**

W3 诊断说「问题是获取到的人不回来,所以量不会复利」。
**现在可以补一句更难受的:唯一能让人回来的机制,规模是 11 个人。**

### 1.4 复制埋点修好了,但量小到还不能用

14 天 `color_copied` 路径分布首次出现 `/colors/*`(`moss-silk-vivid` 2 次、`apricot-pearl-soft` 1 次)。
**修复生效了**,但 3 个事件不足以支撑任何结论。`color_copy_failed` **上线 6 天为 0**
—— digest 会自己印「这不等于没有失败」。

### 1.5 `_dropped` 非 0

5 个事件 / 3 次补报。量很小,但证明 beacon 拒收是真实存在的,
**08-27 之后的计数上抬有据可依**(digest 已印这条断点警告)。

---

## §2 🔴 第 1 稿这一节的推理是错的,而改正它挖出了整份计划的核心

第 1 稿说:AI 助手引荐 222 会话/30 天,但生成率 1.8% vs 搜索 35.1%,是 1/19,所以「不为 AI 引荐做优化」。

**两个评审都指出这是归因混淆,它们对了。** 搜索来访者 **639/1,450 直接落在 `/word-to-color/`(工具页)**,
AI 来访者落在 guides 和 `/brand-generator/`(内容页)。**我拿工具页的转化率去比文章页的转化率。**

做该做的同落地页对比,结果推翻了我的框架,也推翻了评审的框架:

| 渠道 | 落地页 | 会话 | 生成过词 | 转化率 |
|---|---|---:|---:|---:|
| AI | 内容页 | 217 | **0** | 0.0% |
| AI | 工具页 | 5 | 4 | **80.0%** |
| 搜索 | 内容页 | 811 | 13 | **1.6%** |
| 搜索 | 工具页 | 639 | 496 | **77.6%** |

### 决定转化的是落地页,不是渠道

落在工具页的人 **77–80% 会用产品,不分渠道**;落在内容页的 **0–1.6%,也不分渠道**。
AI 与搜索在内容页上的差(0/217 vs 13/811)按 rule of three,AI 的 95% 上界是 1.4%,
**与搜索的 1.6% 重叠 —— 统计上不可区分。**

→ **「AI 渠道质量差」这个说法撤回。** 它和搜索在同类页面上表现一样差。
→ 但**评审说的「为 AI 做优化」也不对** —— 该做的不是渠道优化,是**内容页到工具的路由**,
   而那对搜索(811 会话)的价值是 AI(217)的 3.7 倍。

### 这就是第 1 稿说「不存在」的那个可测干预

**每月 1,028 个会话落在内容页,其中 98.4% 从不碰工具;而工具本身转化率 78%。**

功效计算(两比例,α=0.05,power=0.8):基线 1.6%,要检出 3 倍(→4.8%),
每组约需 **484 会话**。内容页落地 811/月,50/50 分流 = 405/组/月 → **约 1.2 个月**。
**这是可测的**,和付费墙的 37.7 个月/组不是一个量级。

## §3 约束(修正了第 1 稿的一处算术错误)

1. **付费墙 A/B 仍然不可能:37.7 个月/组。** 未变。
2. 🔴 **邮件捕获 A/B:第 1 稿写「5.5 个月/组」,错了,实际约 11 个月/组。**
   Gemini Pro 抓到:458 曝光/月是**全站总量**,50/50 分流后**每组每月只有 229**,
   2,500 ÷ 229 ≈ **10.9 个月**。我把总流量当成了单组流量。
   ⚠️ **这和 08-25 那次 Codex 抓到的「A/B 月数少算一半」是同一个错误的第二次发作。**
3. **「问用户」已三次归零** —— 但那三次是**对匿名访客发问卷**。
   对**已付费客户**做 1 对 1 访谈是完全不同的动作,没试过(见 §5 W4,需 owner 授权)。

### 但「任何干预都不可测」是错的 —— 这是第 1 稿最大的问题

两个评审都指出:用大样本 A/B 的功效公式去证明微型产品「不可测量」,是把
**统计显著性**当成了**商业行动**的前置条件。它们对了,而且 §2 给出了具体反例:
**内容页→工具的路由,811 会话/月,基线 1.6%,检出 3 倍只要约 1.2 个月。**

**正确的表述是:小效应不可测,大效应可测。** 不是「什么都不可测」。

---

## §4 这个站真正的问题

1,450 个搜索会话里 509 个真用了产品(35%),但历史累计只有 **2 个外部付费客户**
(2026-07-22 Hayley、08-26 James;另有 08-20 一笔 ¥550 是 owner 自己),
唯一的召回机制有 **11 个订阅者**。

**产品被用,但不被买,也不被记住。** §5 的顺序反映这个判断:
先修「用了却走了」(W1,可测),再谈「用了却不买」(W3,只能前后对比)。

---

## §5 计划本体

### W1 · 立刻 — 内容页到工具的路由(**本阶段唯一的主要开发项**)

**问题**:1,028 会话/月落在内容页(guides / `/brand-generator/` / `/css-colors/` 等),
**98.4% 从不碰工具**;而落在工具页的人 78% 会用。

**做什么**:在内容页正文里插入一个**带上下文预填的工具入口**
(例:色彩理论 guide 里放一个已填好该文示例词的 word→color 卡片),不是页脚链接。

**判据**:内容页落地会话的 `word_generated` 转化率,基线 **13/811 = 1.6%**。
- 检出 3 倍(→4.8%)需约 484/组,内容页落地 811/月 → **50/50 分流约 1.2 个月**
- **这次可以做 A/B**,因为效应量假设是 3 倍不是 5%
- 若不想分流,前后对比也可以:13 → 39 是肉眼可见的

⚠️ **不要为 AI 引荐单独做** —— 同样的改动对搜索(811)的价值是 AI(217)的 3.7 倍,
一起受益,但优先级按搜索算。

### W2 · 2026-09-08 — W0 的 14 天读数

1. `color_copy_failed / (copied + failed)` —— 技术失败率(现 0/0,**0 不等于没有失败**)
2. `color_copied` 的路径分布 —— `/colors/*` 量级是否起来(现 14 天仅 3 个事件)
3. `word_intent_seen / word_intent_impression` —— 探针真实可达率
4. 🔴 **`depth ≥ 6` 会话数。判据从第 1 稿的 ≥40 下调为「报告数字 + CI,不设通过线」。**
   Gemini Flash 抓到:现速率 1.75/天 × 14 天 ≈ **24.5**,**≥40 是自然流量达不到的门槛**,
   等于给「永远不动免费额度」预设了借口。**这是我设错了,不是数据不够。**

### W3 · W2 之后 — 免费额度的前后对比(**只有 W2 读完才启动**)

评审建议直接砍额度做激进测试。**方向采纳,但不照做**:
- 采纳:在 λ 很低时,泊松前后对比是可测的。实测基线是 **2 个新客户 / 5 周 ≈ 0.4/月**;
  若干预后一个月出现 3 个新客户,`P(X≥3 | λ=0.4) ≈ 0.008`,**显著**
- 不照做:Pro 假设 λ=0.1 得出 P≈0.00018,**基线取小了**;而且砍额度会同时压低锚点(§1.1),
  **必须双指标同看**,否则会用一个下跌的分母买一个上涨的分子

### W4 · 随时 — 需要 owner 决定的两件

1. **给 2 个付费客户发访谈邀请。** 两个评审都建议,我同意 —— 但 memory 记着
   「未发客户邮件(owner 未授权)」,**这是 owner 的决定,不是我的**
2. **Vercel 账期核对(09-25 后)** + 索引合并。判据:ISR Writes 与 Build CPU 应大幅下降;
   🔴 **若没降,回头重查诊断,不要叠第四个修复**(`nofollow`/`noindex` 已各白拿一次信任)

### ✅ 已于 2026-08-31 04:51 UTC 部署完成

`1cf0f21`(调度器开关覆盖 `cache-warmer`)和 `b52fe1f`(CORS 改 403)。

🔴 **第 1 稿写「重启会真发一轮订阅邮件所以不能单独重启」—— 我没验就照抄了迁移简报,而它是错的。**
`email-scheduler.js:204` 有日期守卫
`AND (cotd_last_sent IS NULL OR cotd_last_sent < date('now'))`,发完在 :211 写回。
**按天幂等,重启不会群发。** 两个评审把它升级成「P0 定时炸弹」「域名会被拉黑」,**也都错了**。

**部署前把四个调度器的守卫逐个验过**:email 是 `follow_up_Nd_sent IS NULL` + `cotd_last_sent < date('now')`;
ig 是 `post-${todayStr()}` 已发跳过;pin 是 `alreadyPinnedToday` + 日配额;
cache-warmer 要求 `getUTCHours()===3`,而部署时是 04:51 UTC。

**实际重启结果**:四个调度器全部正常启动,**零副作用** ——
日志里是 `[ig-scheduler] Post already published today, skipping`,邮件没发,Pinterest 没发。
生产验证:恶意 Origin → **403**(原为 500)、无 Origin → 200、合法 Origin → 200,`proxyHeaders: ok`。

🔴 **顺带纠正我自己的一个夸大**:`1cf0f21` 的提交信息和第 1 稿都写 cache-warmer 会「向生产站打约 2,900 个请求」。
**实际是每次 250 个**(`BATCH_SIZE`,日志:`starting pass: 250 of 2380 long-tail slugs`)。
问题(开关没覆盖它)成立,但**量级我说大了近 12 倍**。

⚠️ **一个仍然存在的边界情况**:`lastRunDate` 是内存变量,重启会重置。
**如果在周一 03:00–03:59 UTC 之间重启,cache-warmer 会再跑一次 250 个请求。** 避开那个小时。

---

## §6 什么会推翻这份计划

- **W1 的路由改动没有把内容页转化率推离 1.6%** → 说明内容读者和工具用户是两拨人,
  那么内容(315 篇 guides)的战略价值需要整个重估
- **W2 的 `depth` 尾巴显示 5 这一档有异常阻力**(存活率显著低于其它档)→ 免费额度值得动
- **锚点连续两个月 < 150** → 触发「砍」判据(现 582)
- **`_dropped` 大幅上升** → 08-27 之后所有计数带断点重读

---

## §7 评审意见的裁决(哪些采纳、哪些不成立)

**采纳(4 条,都改了):**

| 来源 | 意见 | 处置 |
|---|---|---|
| Pro | 邮件 A/B 月数少算一半(458 是总量不是单组) | §3.2 已改 5.5 → 10.9 个月 |
| Pro | depth 5→6 的 50% 是自然衰减,不是信号 | §1.2 已撤回过度解读 |
| 双方 | AI 渠道对比是归因混淆(工具页 vs 内容页) | §2 整节重写,结论撤回 |
| Flash | W1 的 ≥40 门槛自然流量达不到 | §5 W2 改为「报数字 + CI,不设通过线」 |
| 双方 | 「什么都不可测」是怯懦 | §3 已改为「小效应不可测,大效应可测」+ §5 W1 给出可测干预 |

🔴 **不成立(3 条,复核后驳回):**

1. **Flash:「§1.1 与 §1.2 矛盾,4 天 244 会话 vs 30 天 582」** —— **Flash 自己算错了。**
   depth 各档**不互斥**(到 depth 6 的会话在 1~6 每档都出现),把各档相加是重复计数。
   实测去重是 **106 个会话**,26.5/天 vs 锚点 19.4/天,**没有矛盾**。
2. **双方:「email-scheduler 重启即群发,是 P0,会被邮件商拉黑」** —— **代码有日期守卫,按天幂等**(见 §5 末)。
3. **Pro:泊松基线 λ=0.1/月** —— **取小了**。实测 2 个新客户/5 周 ≈ 0.4/月。
   结论(前后对比可测)仍成立,但显著性没有它算的那么夸张。

**方法论备注**:两个模型都倾向于把「我没见过守卫」当成「没有守卫」,
把单一指标异常升级成 P0。**它们的价值在于挑战框架,不在于事实核查 —— 事实要自己验。**

---

## §8 读数命令(直接可跑)

```bash
ssh -o IdentityAgent=none -i ~/.ssh/id_ed25519 -o IdentitiesOnly=yes -o BatchMode=yes \
  azureuser@172.207.80.109 'sudo sqlite3 /root/ColorArchive/server/data.db' <<'SQL'
.mode column
.headers on
-- W1 的判据:内容页落地 → 是否用了工具
WITH s AS (SELECT DISTINCT session_id,
    CASE WHEN landing_path='/word-to-color/' THEN 'tool' ELSE 'content' END lt
  FROM events WHERE datetime(created_at)>=datetime('now','-30 days')
   AND COALESCE(session_id,'')<>'' AND COALESCE(landing_path,'')<>''),
 g AS (SELECT DISTINCT session_id FROM events
  WHERE datetime(created_at)>=datetime('now','-30 days') AND event_name='word_generated')
SELECT lt, COUNT(*) sessions,
       SUM(CASE WHEN session_id IN (SELECT session_id FROM g) THEN 1 ELSE 0 END) generated,
       ROUND(100.0*SUM(CASE WHEN session_id IN (SELECT session_id FROM g) THEN 1 ELSE 0 END)/COUNT(*),2) pct
  FROM s GROUP BY lt;
-- W2 的四个数
SELECT event_name, path, COUNT(*) ev, COUNT(DISTINCT NULLIF(session_id,'')) s FROM events
 WHERE event_name IN ('color_copied','color_copy_failed')
   AND datetime(created_at)>=datetime('now','-14 days') GROUP BY event_name, path ORDER BY ev DESC;
SELECT event_name, COUNT(DISTINCT NULLIF(session_id,'')) s FROM events
 WHERE event_name IN ('word_intent_impression','word_intent_seen')
   AND datetime(created_at)>=datetime('now','-14 days') GROUP BY event_name;
SELECT CAST(json_extract(props_json,'$.depth') AS INT) depth,
       COUNT(DISTINCT NULLIF(session_id,'')) sessions FROM events
 WHERE event_name='word_generated' AND json_extract(props_json,'$.depth') IS NOT NULL
   AND datetime(created_at)>=datetime('now','-14 days') GROUP BY depth ORDER BY depth;
-- 锚点(必须钉死旧定义)
SELECT COUNT(DISTINCT NULLIF(session_id,'')) anchor FROM events
 WHERE datetime(created_at)>=datetime('now','-30 days') AND event_name='word_generated'
   AND COALESCE(json_extract(props_json,'$.counted'),1)=1;
SQL
```

⚠️ **`/root` 是 700,非 root 的 shell 展不开它下面的 glob** —— `sudo ls /root/x/*.db` 会**静默返回空**,
要用 `sudo bash -c "ls ..."`。
⚠️ **`SSHOPT="-o IdentityAgent=none …"` 变量展开会让 ssh 报错**,flags 必须内联。
⚠️ **depth 各档不互斥**,不要把它们相加(评审就是这么错的)。
