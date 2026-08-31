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

> 🔴 **已于 2026-08-31 实施,而实施过程推翻了本节的三个数字。先读 §9,再读本节。**
> 本节保持原样是为了留下推理链(和 §7 一样的处置),**但下面这些数字不要拿去用**:
>
> | 本节说 | 实测 | 在哪 |
> |---|---|---|
> | 基线 1.6% | **guides 是 0.34%**;1.6% 是被首页抬起来的混合基线(13 次转化里 7 次落在 `/`) | §9.1 |
> | 内容页 = guides / `/brand-generator/` / `/css-colors/` | 后两个是 **22 和 6 个会话**,约占分母 1%;实际只做了 guides | §9.2 |
> | 3 倍 / 1.2 个月 | 判据已换成「**到达工具页**」(基线 1.02%),**6 周检出 3.4 倍** | §9.6 |
>
> 判据换掉的原因不是嫌它慢,是它**看不见处理组的成功路径** —— 见 §9.7 第 1 条。

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
-- 🔴 W1 的判据不在这里了。这一段原本的查询【不要再跑】,它按 landing_path 分组,
-- 而 landing_path 是 localStorage 里的「首次触达」、终身不变(src/lib/attribution.ts),
-- 所以它算的是「这个浏览器有史以来第一页不是工具页」,不是「这次访问落在内容页」。
-- 它还把 word_generated 当分子,而卡片带 ?q= 过去的词是免费落地词、永不发事件(§9.7 第 1 条)。
-- 改用:  node /root/ColorArchive/server/scripts/w1-readout.cjs
-- 下面这条只用来看「内容页 vs 工具页」的历史形状,不作 W1 判据:
WITH s AS (SELECT DISTINCT session_id,
    CASE WHEN landing_path='/word-to-color/' THEN 'tool' ELSE 'content' END lt
  FROM events WHERE datetime(created_at)>=datetime('now','-30 days')
   AND COALESCE(session_id,'')<>'' AND COALESCE(landing_path,'')<>''),
 g AS (SELECT DISTINCT session_id FROM events
  WHERE datetime(created_at)>=datetime('now','-30 days') AND event_name='word_generated'
    AND COALESCE(json_extract(props_json,'$.surface'),'word_tool')='word_tool')
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
-- 🔴 surface 过滤是 2026-08-31 加的,不能删。W1 的卡片(guide-word-card.tsx)是
-- word_generated 的第二个发出方,它也带 depth —— 但那是「文章里查了几个词」,
-- 和这条曲线要问的「付费墙前走了多深」是两回事。09-08 的 14 天窗口正好包含 W1 上线后的
-- 那几天,不过滤就会把两种语义混进同一条曲线,而这条曲线是 W3(动不动免费额度)的输入。
SELECT CAST(json_extract(props_json,'$.depth') AS INT) depth,
       COUNT(DISTINCT NULLIF(session_id,'')) sessions FROM events
 WHERE event_name='word_generated' AND json_extract(props_json,'$.depth') IS NOT NULL
   AND COALESCE(json_extract(props_json,'$.surface'),'word_tool')='word_tool'
   AND datetime(created_at)>=datetime('now','-14 days') GROUP BY depth ORDER BY depth;
-- 锚点(必须钉死旧定义)
-- 与 server/scripts/gate-report.cjs 保持逐字一致(含 surface)。counted=0 今天已经
-- 挡掉了卡片,但那是「实体权限规则」的副作用,不是「这个锚点测的是哪个面」的声明。
SELECT COUNT(DISTINCT NULLIF(session_id,'')) anchor FROM events
 WHERE datetime(created_at)>=datetime('now','-30 days') AND event_name='word_generated'
   AND COALESCE(json_extract(props_json,'$.counted'),1)=1
   AND COALESCE(json_extract(props_json,'$.surface'),'word_tool')='word_tool';
SQL
```

⚠️ **`/root` 是 700,非 root 的 shell 展不开它下面的 glob** —— `sudo ls /root/x/*.db` 会**静默返回空**,
要用 `sudo bash -c "ls ..."`。
⚠️ **`SSHOPT="-o IdentityAgent=none …"` 变量展开会让 ssh 报错**,flags 必须内联。
⚠️ **depth 各档不互斥**,不要把它们相加(评审就是这么错的)。

---

## §9 W1 已实施 —— 以及 §5 W1 的判据被我自己的数据推翻了一次

> 2026-08-31,本节由实现 W1 的那次会话写入。所有数字重新查过 Azure 生产库。

### 9.1 🔴 §5 W1 的「1.6% 基线 / 1.2 个月」不成立 —— 这是同一个错误的第三次发作

§5 W1 用 `13/811 = 1.6%` 当基线,算出 484/组、1.2 个月。**数字没算错,基线取错了。**
把那 13 次转化按落地页拆开:

| 落地页 | 转化数 |
|---|---:|
| `/`(首页) | **7** |
| `/decades/` | 2 |
| `/guides/*` | **2** |
| `/brands/bilibili/` | 1 |
| `/about/` | 1 |

**13 次里有 7 次来自首页**,而首页只有 105 个会话(转化率 6.67%,是 guides 的 20 倍)。
`1.6%` 是一个被首页抬起来的**混合基线**,而首页恰恰不是 W1 要改的页面。

W1 真正要改的那些页面的真实基线:

| 页面 | 30 天会话 | 转化 | 转化率 |
|---|---:|---:|---:|
| `/guides/*` | 597 | 2 | **0.34%** |
| `/colors/*` | 713 | 0 | 0% |
| `/brands/*` | 180 | 1 | 0.56% |

⚠️ **这和 §3.2 的邮件 A/B 错误、和 08-25 被 Codex 抓到的那次,是同一类错误的第三次:
把一个异质总体的合计比率当成某个子群的比率。** 前两次是分母搞错(把总流量当单组),
这次是分子搞错(把首页的转化算进内容页的基线)。

### 9.2 §5 W1 点名的三个页面里,两个是噪声

计划写「guides、`/brand-generator/`、`/css-colors/`」。实测 30 天:
- `/brand-generator/` = **22 个会话**(而且 `posthog.ts:131` 把它列为 TOOL,不是内容页)
- `/css-colors/` = **6 个**,进不了前 40
- `/guides/*` = **597 个**

**点名的三个里,两个加起来占内容页分母的约 1%。**

### 9.3 `/colors/*` 看着最大,但故意没有做

`/colors/*` 有 713 个会话,是内容页里最大的一块 —— 我一度打算一起做。按渠道拆开之后放弃了:

| 页面 | 搜索 | 直接 | AI |
|---|---:|---:|---:|
| `/colors/*` | 42 | **630** | 1 |
| `/guides/*` | 288 | 180 | 122 |

`/colors/*` 有 **88% 是 direct**,而 direct 这一整块 1,076 个会话的转化是**恰好 0**。
在 14 天干净窗口里,`/colors/*` 的搜索+AI 会话只有 **27 个**。
把它接进实验会给分母灌进约 1,300 个几乎不可能转化的会话,**把处理组的效应稀释掉**,
换来 27 个真人。这是主动伤害,不是覆盖率提升。

### 9.4 真实的功效表(供给 850/月,实测)

guide 落地会话按周:203 / 189 / 17 / 151 / 146 / 8。
**17 和 8 是埋点缺口不是流量缺口**(`e401e0f` 08-10 拆掉、`2584d70` 08-17 装回),
所以当前真实供给是 **~195/周 ≈ 850/月**,50/50 分流 = **425/组/月**。

基线 0.3%(区间 0.25–0.52%,只压在 2–4 个事件上):

| 效应 | 目标率 | n/组 | 月数 |
|---|---:|---:|---:|
| 3x | 0.9% | 2,600 | **6.1** ← 太慢 |
| 5x | 1.5% | 972 | 2.3 |
| **7x** | **2.1%** | **638** | **1.5** |
| 10x | 3.0% | 349 | 0.8 |
| 20x | 6.0% | 147 | 0.3 |

**所以判据不是「跑到显著为止」,是一个有停止日的决策规则(§9.6)。**
3x 需要 6 个月,而一个需要 6 个月才能证明的 3x,本来也不值得为它等 —— 内容页现在是 0.3%,
工具页是 77%。这个干预要么是大效应,要么是没效应,不存在「小幅改善」这个有意义的中间态。

### 9.5 已实施(本次提交)

| 文件 | 作用 |
|---|---|
| `src/lib/experiment.ts` | 50/50 分臂。`ca_w1_v1` 存 localStorage —— 和 `ca_attr_v1` 同寿命,臂和落地页永不脱节;`persisted:false` 标记会重掷的浏览器 |
| `src/lib/guide-seed-word.ts` | 预填词映射。333 篇全覆盖:**278(83.5%)用文章自己的主题词**(healthcare / fintech / wayfinding),55 篇回落到策展种子词,**0 篇乱码** |
| `src/components/guide-word-card.tsx` | 卡片本体 + A/B 包装。**两臂都挂载**,只有 children 不同 |
| `guide-detail-page.tsx` | 插在**第一个正文段之后**(实测距顶 1,213–1,489px,视口 720px → 折叠线以下两屏,CLS 为 0) |
| `word-color-generator-page.tsx` | 两个 emit 点补 `surface:"word_tool"` |
| `gate-report.cjs` | `wordSessions` 和 `wordSessionsAll` 都加 `surface` 过滤 |
| `cookie-policy-page.tsx` | 披露 `ca_w1_v1` |

**三条刻意的自我约束(每一条都对应一个会毁掉读数的陷阱):**

1. **卡片永不消耗免费额度。** 付费墙的 `colorarchive-word-gen-words` 是全站 localStorage 且不区分来源。
   卡片若写它,读者看五篇文章就烧光五次免费额度,而且落地词豁免**不会跟着 embed 走** ——
   他到 `/word-to-color/` 时已经被墙住了。**那是 W1 的反面。** 实测已验证:打完字后
   `colorarchive-word-gen-words` 和 `colorarchive-word-history` 都仍为 `null`。
2. 🔴 **卡片永不为预填词发事件。** 这是唯一一个会产出「自信但错误的 3x 胜利」的缺陷。
   主页的 `counted:false` 分支(`word-color-generator-page.tsx:396`)在落地词守卫**之上**,
   只要 `spendsQuota` 为假就发 —— 而 `proUser === null`(会话未解析)就为假。
   一个不设闸、预填好的 embed **按构造** `spendsQuota === false`,
   照抄就会在挂载 2 秒后为每一个处理组读者发出判据事件,零输入。
   `userTypedRef` 是那道守卫。**实测:卡片挂载后 4 秒,`word_generated` = 0。**
3. **分配事件每次访问只发一次。** StrictMode 双发 + 一次访问读五篇 = 五行,而分母是
   `COUNT(DISTINCT session_id)`,一行就够。事件量不是免费的:服务端超过 200/天/IP 会静默丢弃
   (`bot-detect.js`)却仍回 200。

**实测验证(dev,已逐条跑过):**
- 预填 `healthcare` / `fintech` / `travel` / `real estate` —— 都是文章自己的主题词
- 一个 debounce 窗口内敲三次(`mid` → `midnig` → `midnight jazz`)→ **恰好 1 个** `word_generated`,
  `depth:1`(打字碎片被 `recordLookup` 折叠),`counted:false, reason:"embed", surface:"guide_card"`
- 对照臂:卡片不存在,正文三段与今天逐字节相同,**但分配事件照发** → 分母对称
- 暗色:CTA 反色(白底黑字),正文 lab 84.9 / hex lab 66.1,均可读

### 9.6 🔴 预注册(判据在实现后被一次对抗评审改过一次,理由在 §9.7)

**开始**:本次部署当日。**停止**:部署后 **6 周(42 天)**,或任一臂合格会话达 **589**,以先到者为准。
两个条件脚本都会检查并打印,不需要人去记日期。

- **分母** `D(arm)` = `w1_assigned` 的去重 `session_id`,按 `props.arm` 分组,
  **且**该会话有 `page_read`(参与度闸,根 layout 发出,与臂无关),
  **且** `props.persisted = true`(排除会重掷硬币的浏览器)
- 🔴 **主分子** `N(arm)` = 上述会话里**到达过工具页**的
  (存在任一事件满足 `path LIKE '/word-to-color%'`)。
  **不是**「在工具页生成过词」—— 那个判据对处理组有系统性低估,见 §9.7 第 1 条。
  实测基线 **4/394 = 1.02%**(14 天干净窗口,guide 落地会话)
- **次分子 A**:在工具页 `word_generated`(原主判据)。**报告但不作判据** ——
  从卡片带 `?q=` 过去的词是「落地词」,免费且**永不发事件**,所以它专门低估卡片臂
- **次分子 B**:含卡片内生成(`surface='guide_card'`)
- **中间步**:`guide_tool_click{placement:"w1_card"}`(点了 CTA)、`w1_card_interact`(改过预填词)
- **同时必看**:两臂 `_dropped` 与每会话事件数

**功效(基线 1.02%,供给 425/组/月):**

| 效应 | 目标率 | n/组 | 周数 |
|---|---:|---:|---:|
| 2x | 2.0% | 2,272 | 23.1 ← 太慢 |
| **3.4x** | **3.5%** | **589** | **6.0** ← 停止线 |
| 4x | 4.1% | 416 | 4.2 |
| 5x | 5.1% | 279 | 2.8 |
| 10x | 10.2% | 98 | 1.0 |

**结论规则(先写死,不许事后改):**
- 提升 **≥3.4x** 且 p<0.05 → 成立。推广到 `/brands/*`(180 会话/30d)与其他内容模板
- 提升 **<2x** → 这就是 §6 的第一条证伪:「内容读者和工具用户是两拨人」。
  **撤掉卡片,315 篇 guides 的战略价值整体重估。不要改文案再跑一轮** ——
  `/word-to-color/` 的招募横幅(3,857 次曝光 → ~0)和 guides 的 Design Notes 邮件表单
  (292 个曝光会话 → 0)已经各自证明过一次「重写文案再试」在这个站上不成立
- 2x–3.4x 之间 → 真实但太小。**当作否定处理**,理由写进日志
- ⚠️ **p 值略微乐观,但幅度已实测,不要过度惩罚**:分臂单位是浏览器、计数单位是标签页,
  z 检验假设独立。**实测设计效应约 1.05**(标准误抬高约 2.3%)—— 因为这个站每个浏览器
  的会话数非常接近 1。
  🔴 **原来写的「p 刚好压线按未成立处理」是错的,已撤回**:589/组 正好只买到 3.4x @ 80% power,
  为了修正 2.3% 而丢掉 p=0.048 的结果,代价远大于收益。**按面值读 p,心里减一点信心就够了。**
  倍数不受聚类影响,只有 p 受影响。脚本每次运行都会打印实测数字

**读数**:`sudo node /root/ColorArchive/server/scripts/w1-readout.cjs`(**要 sudo** —— `/root` 是 700,azureuser 读不到 `data.db`) —— 两个停止条件、
主/次判据、漏斗中间步、健康度全部自己算好并打印。

---

## §9.7 实现后的对抗评审:19 条候选,11 条成立

实现完成后跑了一轮四视角对抗评审(每条发现再交给一个被要求**推翻**它的评审者)。
11 条成立并已修,8 条被推翻。**其中第 1 条会毁掉整个实验,而我自己没看见。**

1. 🔴 **主判据看不见处理组的成功路径(critical)。** 卡片 CTA 把词以 `?q=` 交给工具页,
   而工具页把 `?q=` 当成**落地词** —— 落地词免费、被预置进 counted 集合、
   提交时 `if (counted.has(norm)) return` 在发事件**之前**返回。
   所以一个点进去、拿到卡片承诺的颜色、心满意足离开的处理组读者,**一个事件都不发**。
   对照组没有对应的「静默成功」:它落在默认词「quiet luxury」上,必须真打字才有价值,而那会发事件。
   **卡片工作得越好,原判据记录到的转化越少** —— 直接把结果推进「<3x 就撤掉」那一档。
   实测两个判据在同一人群上差 2.5 倍(guide 落地会话 30 天:到达工具 5,在工具生成 2)。
   ✅ **改法是修温度计不是修病人**:主判据换成「到达过工具页」(`path LIKE '/word-to-color%'`),
   零客户端改动(`track()` 本来就盖 `path`),而且它才是 W1 真正在做的事 —— 路由。
   **副作用是判据变灵敏了**:6 周能检出 3.4x,原来要 7x。
2. **卡片 CTA 在暗色模式下悬停即隐形,而且会挂 CI。** `hover:bg-neutral-800` 配
   `dark:bg-white dark:text-neutral-950`,悬停时背景变深而字仍近黑。
   `dark-mode-classes.test.ts` 正是为这个而写,**实测确实红**。已补 `dark:hover:bg-neutral-200`。
   🔴 **附带纠正一条我一直照抄的「已知事实」:本机 vitest 不是起不来** ——
   单文件 `npx vitest run <file>` 427ms 跑完。「vitest 挂住」只对全量跑成立。
3. **输入框暗色下没有焦点可见性**(`outline-none` 去掉了浏览器焦点环,却没写
   `dark:focus:border-*`,WCAG 2.4.7 AA)。已补。
4. 🔴 **三篇 guide 的预填词是单个字母 "s"。** `cleanTag` 把 `[a-z\s'-]` 之外的字符换成空格,
   所以 `1970s` → `s`;`isSubjectTag` 只有长度上限没有下限,`s` 就当选了。
   已补下限 2。`1970s-earth-tone-color-guide` 现在得到 `earth tones`,`1950s-...` 得到 `mid-century`,
   `1980s-neon-...` 得到 `neon`。
5. **卡片复用 `guide_tool_click`,污染周报的 content→tool 序列。**
   `conversion-digest.cjs` 那一行是无过滤 `COUNT(*)`,部署日会因纯埋点原因抬高,
   而且是被 A/B 臂驱动的数字(实验结束还会再动一次)。已拆成两个数,老序列跨 08-31 连续。
6. **读数脚本漏了 `guide_tool_click{placement:"w1_card"}`**,而「预填词就是对的 → 直接点 CTA」
   这条**设计上的主路径**不产生 `w1_card_interact`(那个只在改词时发)。已补一列。
7. **6 周日历停止线永远早于 589/组,而脚本只判 589。** 已改成两个条件都算、都打印。
8. **`--since` 写错会静默返回全 0。** SQLite 的修饰符符号可省,`'42 days'` 是**未来**偏移,
   无法解析则返回 NULL —— 两种都是零行,而脚本会把它印成「数据还不够」。已加启动即校验并退出。
9. **分臂单位(浏览器)≠ 分析单位(标签页)** → z 检验把相关会话当独立,p 偏乐观。
   无法用代码消除,已改成每次运行都打印这条告诫,并写进 §9.6 的结论规则。
10. **隐私披露两处不合本页自己的规矩**:`ca_w1_v1` 那一条没说「随分析事件发送」
    (§3 里每一个会被发送的键都写了),而 §3 改了但 `LAST_UPDATED` 还停在 7 月 26 日
    (§7 承诺改了就会改日期)。都已修。

**被推翻的 8 条**里值得记的:`ca_w1_seen_v1` 不需要单独披露(§2 的立论是「性质」不是「穷举」);
`conversion-digest` 的 `wordDepth` 本来就被 `counted=1` 挡住;
读数脚本的 EXISTS 没有时间下界不构成实际偏差(实测)。

**方法论**:这一轮的价值几乎全在第 1 条,而它不是「代码写错了」,
是**判据和产品行为的交互**——单看任何一个文件都看不出来。

---

## §9.8 上线后再扫一轮:31 条候选,17 条成立 —— 最大的一条是「修了但没部署」

§9.7 那轮是**代码**评审。这一轮问的是「上线之后还剩什么」,而它挖出的头号问题不在代码里。

### 🔴 1. `/root/ColorArchive` **没有 git remote** —— 推 GitHub 不会动服务器

```
$ ssh azureuser@172.207.80.109 'sudo bash -c "cd /root/ColorArchive && git remote -v"'
(空)
```

所以 §9.5 表格里写的「`gate-report.cjs` / `conversion-digest.cjs` 已加 surface 过滤」
**对仓库成立,对生产不成立**。实测 md5:

| 文件 | 生产(部署前) | 仓库 | |
|---|---|---|---|
| `conversion-digest.cjs` | `a39f1de5…` | `705117f3…` | 陈旧 |
| `gate-report.cjs` | `5d77cf34…` | `e83c54ef…` | 陈旧 |
| `session-denominator.js` | `ff0b1bd5…` | `99073b28…` | 陈旧 |
| `w1-readout.cjs` | **不存在** | `43b5db32…` | 缺失 |

后果按紧急程度:
1. `conversion-digest.cjs` **每天 08:00 UTC 跑**,缺 surface 过滤 → **从第二天起**就会把卡片的
   `word_generated` 混进付费墙深度曲线。这正是 §8 注释里写「不能删」的那个过滤。
2. `gate-report.cjs` 周一 09:00 跑,缺 surface 过滤和新的 `NOT_PAGE_LOAD`。
3. `w1-readout.cjs` 不存在 → 10-12 那条「一条命令,不需要判断」会直接报 file not found。

⚠️ **这是 memory 里那条「迁移会静默回退脚本,迁后必须逐个 md5 比对」的第二次发作,
而这次不是迁移,是「我以为 git push 就等于部署」。** 服务器脚本没有任何自动同步。

**✅ 已于 2026-08-31 部署**(先备份为 `.bak-w1-20260831`,`node --check` 全过,md5 与仓库逐字一致,
**没有 `pm2 restart`,所以没有触发任何订阅邮件**):

| 文件 | md5 |
|---|---|
| `server/session-denominator.js` | `99073b28f9b4dc5d1a62004b927cee4c` |
| `server/scripts/gate-report.cjs` | `e83c54efca023545f25700ff809d0f87` |
| `server/scripts/conversion-digest.cjs` | `705117f35e2ba3c747551883848562e3` |
| `server/scripts/traffic-truth.cjs` | `27ca4a4234fa48c718aabda52fe1e8b3` |
| `server/scripts/w1-readout.cjs` | `43b5db32a30008877d43c352058ae88c` |

部署后在生产上实跑 `w1-readout.cjs`,输出正常(两臂 0 会话 —— 正确,我自己的两次测试访问
没有 `page_read`,被分母正确排除)。**10-12 跑之前先 `md5sum` 核对上表,不符就从仓库重发。**

### 🔴 2. `w1_assigned` 是 `session-denominator.js` 明文禁止的那种「页面加载事件」

那个文件的 TRAP 2 结尾写着:不要「靠加一个页面加载事件来修」guides 的会话数,
「那会把当初要排除的自动化流量重新放进来」。而 `w1_assigned` 正是:挂载即发、无停留、无手势。

实测规模:`/guides/` 30 天 **1,703 次浏览 vs 605 个发事件的会话**,
而全站 engagedVisits 是 **2,912** —— 不过滤就是 **15–20% 的台阶**,和 08-10 那次一模一样,只是方向相反。
**向上的台阶没人会去质疑,这才是它更危险的地方。**

✅ 已修:`session-denominator.js` 新增 TRAP 4 + `PAGE_LOAD_EVENTS` / `NOT_PAGE_LOAD` 导出 +
`GUIDES_PAGELOAD_EVENT_ADDED` 断点提示;`gate-report.cjs` 的 `engagedVisits`(全站唯一没有事件过滤的查询)
和 `traffic-truth.cjs` 的「DID SOMETHING」都加了过滤。实测过滤前后 2912 → 2910
(**差的 2 个正是我自己的测试访问**)。

### 3. 我自己写的读数脚本里有三个真 bug

1. 🔴 **分子没有相对 `w1_assigned` 的时间下界。** `ca_sid` 是每标签页且无超时,所以一个会话可以
   先用工具、后逛 guide。没有下界就把「先用了工具」算成「guide 把他路由过去了」。
   实测对照组 5/394 里有 1 个是这种 → 约 **0.25pp 的地板,两臂都有**。
   而 §9.6 判的是**倍数**,地板会确定性地压缩它:真实 3.4x 会读成
   `(1.02%×3.4 + 0.25%) / 1.27% = 2.9x` —— **正好掉进「2–3.4x 当作否定 → 撤掉卡片」那一档。**
   已加 `AND <e>.created_at >= a.created_at`。
2. **HEALTH 块的 join 把每个会话的事件数乘以它的分配行数**,而 N>1 恰好只发生在
   「写不了 sessionStorage」的浏览器 —— 也正是最可能丢 beacon 的那批。
   即这个块会在它本来要监测的那批会话上制造出它要监测的异常。已改成先按会话去重再 join。
3. **聚类告诫被我夸大了约 20 倍。** 实测设计效应 **1.05**(标准误 +2.3%),
   而我写的规则是「p 刚好压线按未成立处理」。589/组 正好只买到 3.4x @ 80% power,
   为修正 2.3% 而丢掉 p=0.048 的结果,代价远大于收益。**规则已撤回**,改成报实测数字。

### 4. 其余已修

- §5 W1 原文没改过,读者读到那里会拿到四个已被推翻的数字 → 已加醒目更正横幅指向 §9
- §8「直接可跑」的三条查询:W1 判据那条是旧的错查询(按 first-touch 的 `landing_path` 分组)、
  depth 查询没有 surface 过滤(**09-08 的窗口正好覆盖 W1 上线后几天**)、锚点查询与 `gate-report.cjs` 不一致 → 全部修正并**逐字跑过一遍**
- 文档里的读数命令**漏了 `sudo`**(`/root` 是 700,azureuser 读不到 `data.db`)→ 已补
- `CLAUDE.md` 写着「There is no test suite」—— **假的**,有 45 个测试文件,而且单文件跑得动。
  这条假陈述是 §9.7 第 2 条那个 CI 事故的**上游原因**,已改写成「单文件怎么跑 + 改 .tsx 后至少跑哪四个」
- `STRUCTURE.md` / `CLAUDE.md` 的计数陈旧:Collections 169→**261**、SEO guides 317→**333**、
  i18n keys ~750+→**931**、newsletter 349→**350**;
  `CLAUDE.md` 的「68+ collections」→ **261**;
  「pre-render **all** 3,066 color pages」→ 实际是 **5,446 里的 3,066**,
  **另外 2,380 是按需渲染** —— 而那 2,380 正是 Vercel 账单上 ISR 写入的那部分,
  说成「all」会让人以为没有这块敞口

### 5. 报告但**没有**动的(留给 owner 决定)

- **`bot-detect.js` 的 UA 正则没有 `lightpanda`。** Lightpanda 是给 AI agent 用的无头浏览器,
  而且**它老实自报 `Lightpanda/1.0`** —— 正则里有 `headlesschrome|phantomjs|puppeteer|playwright`,
  唯独漏了这个。属于「加一个词就能挡」的那类,但改过滤器会改变所有历史序列的可比性,**不该顺手改**
- **`screen_width` 是唯一能干净分开机器与人的信号**(30 天:direct 的 21,036 次浏览里
  15,841 次恰好报 1280px = 75.3%,而搜索只有 2.7%),**但它在 `pageviews` 表,而那张表没有 `session_id`**,
  所以任何按会话的读数都用不上它。要用就得加列,是独立的一件事
- 🔵 **但 W1 的分母不受机器人稀释**:那波爬虫扫的是 `/colors/*` 不是 `/guides/*`,
  guide 的 `page_read` 日序列在爬虫期间是平的(7/34/35/41/30/17/21/30/34/29/15/26)。
  **589/组 和 6 周不需要因此调整。**

---

## §9.9 三个决策(经 Codex 与 Gemini 3.7 Flash 各自独立给意见,owner 拍板)

### A · Vercel 构建机器:30 核 Turbo → 试 Standard(owner 执行,面板设置)

**先回答「16 小时 / $3.42 正常吗」:正常,而且算得干干净净。**

- 每次构建的日志头都是 `(Turbo Build Machine) / 30 cores, 60 GB` —— **08-26 那次也是,不是新变的**
- 实测两次真实构建:**2m45s 和 2m47s**,稳定
- 30 核 × 2m46s = **1.38 核·小时 ≈ $0.30 / 次**
- 16 ÷ 1.38 = **约 11–12 次构建**,与实数(9 次 READY + 账期边缘)吻合
- 单价 $3.42 ÷ 16h = **$0.214/核·小时**,与 8 月($26.17/124h)、7 月($30.51/145h)一致

**对比:8 月是 124 核·小时 ≈ 90 次构建。** `vercel-ignore.sh` 的效果是看得见的 ——
最近 20 次部署里 **11 次被跳过**(包括我今天两次只改 docs/server 的提交)。
按当前速度整个账期约 **80 核·小时 ≈ $17**,低于 8 月的 $26.17。

⚠️ **但别把这当成大胜:8 月账单 $99.49 里构建只占 26%,大头是 ISR 写入 $34.99。**
09-25 要核对的主要是那一项。

### ✅ A 已执行(2026-08-31 10:15 UTC)—— 但前提被现场推翻了一次

🔴 **原来的框架是错的:没有人「选了 Turbo」。项目用的是 Elastic(自动挡)。**

实际配置(API 读出,不是猜的):
```
"buildMachineType": "turbo",
"buildMachineSelection": "elastic",
"buildMachineElasticLastUpdated": 1774792994984   // ≈ 2026-03-29
```
面板上四个档:**Elastic**(推荐,4–30 vCPU,「auto-scaling hardware to balance speed and cost」)、
Standard(4 vCPU/8GB)、Enhanced(8/16)、Turbo(30/60)。
项目选的是 Elastic,而 **Elastic 从 3 月起就一直把这个 2m45s 的构建放在 30 vCPU 的顶档上**,
面板原话:「Your next deployment will build with a **Turbo** machine, dynamically adjusted based on recent build usage.」

→ 所以这不是「关掉一个手动升级」,是**否决自动挡的判断**。
Codex 提到过 Elastic「不能隔离扩展性问题,因为机器是 Vercel 动态选的」,但他假设我们没在用它 —— 我们正在用。

**已改为固定 Standard**,API 复核:
```
"buildMachineType": "standard",
"buildMachineSelection": "fixed"
```
**并且已经拿到实机确认** —— 之后一次构建的日志头是
`Build machine configuration: 4 cores, 8 GB`(原来是 `30 cores, 60 GB`)。

⚠️ **但整段构建时长还没测到,要如实说。** 三次强制触发都被项目自己的 `vercel-ignore.sh` 正确跳过了
(同 commit 重部署 → 无 diff;preview 重部署 → 同理;推一个指向 main 的分支 → Vercel 按 SHA 去重,根本没建)。
CLI 直传也不行:仓库磁盘上 81,746 个文件而 git 只跟踪 1,025 个,超过 15,000 上传上限。
**这些「失败」其实都是好消息 —— 跳过逻辑在每个方向上都工作正常。**

**所以下一次真实的代码推送就是这次测量**(autopilot 往 `src/lib/` 加内容也算)。判据:
- **< 15 分钟 → 留在 Standard**
- **> 20.6 分钟 → 换回 Elastic**(那是盈亏平衡点:30×2.75 = 82.5 CPU-分钟 ÷ 4 核)

生产未受影响:三次尝试全是 CANCELED 或 preview,`colorarchive.org` 仍在服务 06:53 那次构建
(`age: 12150` ≈ 3.4 小时)。

**决策依据**:Codex 查到 Vercel 各档**统一按 $0.0035/CPU-分钟**计价,
所以 4 核 Standard 的盈亏平衡点是 **20.6 分钟**;我们的构建是 2m45s,
其中约 45 秒是不可并行的(`npm ci`、编译、trace、156MB 缓存上传)。
→ **换 Standard 大概率落在 6–12 分钟,省约 $0.22/次 ≈ $11/月。**
判据:若超过 15 分钟就换回 Turbo。面板路径 `Settings → Build & Development → Build Machine`。

### B · `lightpanda` 加进 bot 过滤 —— ✅ 已做

`server/bot-detect.js` 的 UA 正则有 `headlesschrome|phantomjs|puppeteer|playwright`,
**唯独漏了 `lightpanda`** —— 一个给 AI agent 用的无头浏览器,而且**它老实自报 `Lightpanda/1.0`**,
正是这个过滤器注释里写明要挡的那一类。

**两个模型在这里分歧,而实测把它解掉了:**
Gemini 主张「打标记不要丢弃」(怕破坏正在跑的 A/B 分母);
Codex 主张「直接丢 + 记断点」(这个文件的既定策略就是 UA-only 丢弃,且有 07-26 的先例)。
**我先量了再决定:nginx 日志里 Lightpanda 对 `/events` 的 POST 一共 18 次(跨数天),
而总量约 768 次/天、67 个不同 IP —— 不到 1%。**
→ 低于噪声,既没有「要保护的台阶」,也没有「要清除的污染」。Codex 的做法成立,Gemini 的顾虑不成立。
→ 而且就算量大也不会偏:**一致地从两臂各扣掉一类流量,比值不变,只是 n 变小。**

顺带修掉一条**过期且有害**的注释:原文写「与 routes/ai.js 里的副本保持同步」,
但 `routes/ai.js:16` 现在是 `require("../bot-detect")` —— **只有一份定义了**,
那句话是在邀请别人再造一个副本。

**部署到 Azure 并 `pm2 restart`(bot-detect.js 被运行中的服务 require,不重启不生效)。**

🔴 **重启时间窗:除了已知的「周一 03:00–03:59 UTC 不要重启」(cache-warmer 的 `lastRunDate`
是内存变量),还有一条没人写下来的 —— 每天 `09:00–09:59 UTC` 是 COTD 邮件唯一被允许发送的一小时**
(`server/email-scheduler.js:193` `if (utcHour !== 9) return;`,注释写着
"Only send between UTC 09:00–09:59 to avoid spamming on restarts")。
而 `startScheduler()` 会在**启动时立刻跑一次**。

**我这次就是在 09:35 UTC 重启的,于是 6 封 COTD 当场发出。**
实测结果:**6 封、6 个不同收件人、每人一封,零重复**
(另外 6 个订阅者 `cotd_subscribed = 0`,正确地没收到)。
**净影响为零** —— 那一小时内的 hourly tick 本来也会发,只是提前了几分钟。

⚠️ **顺带把 §5 末尾那句话说准一点**:原文写「按天幂等,重启不会群发」。
**「不会重复发」是对的**(日期守卫 + 发完写回 `cotd_last_sent`),
但完整的说法是:**重启会把当天那一轮「还没发的」立刻触发**,
而它之所以在 04:51 那次没发,是因为 `04 !== 9` —— 不是因为幂等,是因为小时闸。
两个原因都成立,但只记住幂等会让人以为任何时间重启都安然无事。

新增 `server/__tests__/bot-detect.test.js`(4 个用例,70/70 通过)。
**允许列表比拦截列表更重要** —— 里面全是 08-31 生产日志里的真实 UA,
包括 Edge(含 "Edg")和 Claude 桌面浏览器(一天 304 次 `/events` 写入里占 13 次,
误判成机器人会是自己给自己砸一个坑)。另外钉死 `/i` 和「不许有 `/g`」——
模块级常量配 `/g` 会让 `.test()` 的 `lastIndex` 累进,同一个 UA 在两次调用间**真假交替**。

### C · `screen_width` / `session_id` —— **不做**,但把触发条件写下来

`pageviews` 有 `screen_width` 却**没有 `session_id`**,而 `events` 反过来。
所以唯一能干净分开机器与人的信号,任何按会话的读数都用不上。

**两个模型分歧最大**:Gemini 主张迁移(95% 把握),Codex 主张不动。**采纳 Codex,理由有三条,其中一条是他纠正了前提:**

1. 🔴 **那一列存的是 `window.innerWidth`,不是 `window.screen.width`**
   (`src/components/page-tracker.tsx:57`)。所以 1280px 是**视口宽度**的强相关,
   **不是干净的机器人标签** —— 一个把浏览器窗口拉成 1280 宽的真人长得一模一样。
2. `events` 本来就比 `pageviews` 干净得多(机器人占 pageviews 22.5%,占 events 1.5%),
   而所有决策都跑在 events 上。
3. 现在没有任何待决问题需要它,而**在实验进行中加埋点 = 再造一个断点**,
   正是这个项目反复栽的那一类。

⚠️ Gemini 反对方案 (b) 的理由(「会更快耗尽 200/天/IP 上限」)**是错的**:
那个上限数的是**请求数不是字节数**(`bot-detect.js:121` `overDailyCap(getRateLimitKey(req))`)。

**🔵 触发条件(满足任意一条就重开这个决策,做 Codex 的方案 (c) —— 每会话在首个 event 上带一次视口宽,不做迁移):**
- W1 读数里两臂的 `w1_assigned` 会话数出现**不对称**(一臂显著多),
- 或 `events` 里出现**枚举型**行为(同一会话在短时间内扫大量不同 `path`),
- 或每会话事件数出现不可能的值(`w1-readout.cjs` 的 HEALTH 块每次都印),
- 或 §5 锚点在**没有任何产品改动**的情况下阶跃。
