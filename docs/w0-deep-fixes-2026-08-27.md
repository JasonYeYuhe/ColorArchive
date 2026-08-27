# W0 的两条深层埋点问题 —— 已修(2026-08-27)

> 来源:`docs/w0-findings-2026-08-25.md` 末尾「🔴 W0 之外发现的两个更深的问题(未修,需要 owner 决定)」,
> 以及 `docs/handoff-2026-08-27.md` 待办第 3 条。
>
> **两条都修了,而且都是往「不改变任何既有判据」的方向修的。**
> 没有动任何付费闸、额度、UI —— 只动了「什么东西会被记录下来」。

---

## 先说一个把第 2 条的严重程度改小、又把它改大的事实

`gate-report.cjs:81` 的 §5 锚点用的是 **`DISTINCT_VISITS`(会话级)**,不是事件级。
findings 里列的四类压制,在会话级的后果并不相同,所以先去生产库量了一遍(30 天,只读 SELECT):

| | 会话 |
|---|---:|
| 摸过 `/word-to-color%` 的会话 | **699** |
| 其中发过 `word_generated` 的 | **554** |
| **有页面、无 `word_generated`** | **145(20.7%)** |

那 145 个会话发了什么:

| 事件 | 会话 | 对应 findings 的哪一类 |
|---|---:|---|
| `word_paywall_restored` | **64** | 第 3 类「本次已被墙」 |
| `page_read`(仅) | 71 | 可能是第 2 类,也可能是真的没打字 —— **区分不了** |
| `word_paywall_email_unlock` | 3 | 第 4 类 |
| `word_paywall_pro_bypass` | 2 | 第 1 类 |

**改小的地方**:锚点现在是 554/月,判据是「≥300/mo 留、<150/mo 连续两月砍」。
554 → 699 都远在 300 以上,**所以这个 bug 今天并不改变 §5 的结论**。它不是急事。

**改大的地方**:压制掉的**恰好是最投入的那批人** —— 付费的、给了邮箱的、第二次回来的。
一条「留还是砍」的判据,系统性地看不见自己最好的用户,**偏差方向是「砍」**。

另外 `count` 的分布证实了 findings §1.5 的怀疑,而且比怀疑更干脆:

```
count:  1→556   2→343   3→249   4→190   5→149   (没有 6,一个都没有)
```

`word_paywall_hit` 恰好也是 149 个会话。**「在上限 5 处堆积」是结构性的,不是行为** ——
过了 5 之后我们对这个人零可见度。

### 一个读代码读错、被浏览器实测纠正的点

我一开始以为「被墙 = 输入框禁用 = 本来也没东西可记」。**错了。**
`word-color-generator-page.tsx:466` 的 `<input>` **没有 `disabled`**,
`gated` 只控制 `resultVisible`(:413)—— 结果面板换成付费墙,人照样在打字。
浏览器实测确认:被墙状态下敲新词,新代码稳定发出事件。**那 64 个会话是真的在用产品。**

---

## 修法 1 —— `word_generated` 移到额度判定之上

`track()` 从早返回**下面**挪到**上面**,并带三个新 prop:

| prop | 含义 |
|---|---|
| `counted` | 这次是否真的扣了免费额度。**`true` = 旧定义** |
| `reason` | 没扣的原因:`pro` / `unresolved` / `gated` / `unlocked` / `disabled`(优先级与原早返回条件逐项对齐) |
| `depth` | **本次访问**生成的词数,**不封顶** —— `count` 做不到,它 5 就到头了 |

`count` 的含义**一个字没动**(持久化额度序号 1..5),因为 `conversion-digest.cjs` 拿它画掉档曲线。

### 旧序列可以精确重建 —— 这是整件事的重点

```sql
WHERE event_name='word_generated'
  AND COALESCE(json_extract(props_json,'$.counted'), 1) = 1
```

改动前写入的行没有 `counted` 键,而它们**按构造全都是扣额度的**,这就是 `COALESCE` 的意思。

**在生产库上验过这是恒等变换**:

```
raw_all = 554      pinned_old = 554      ← 一样
深度曲线 556/343/249/190/149            ← 一样,无 NULL 桶
```

---

## 修法 2 —— `track.ts` 不再吞掉 sendBeacon 的拒绝

`navigator.sendBeacon` 拒绝入队时**返回 false,不抛异常**,所以外面的 `try/catch` 从来接不住。
两件事:

1. **被拒的 beacon 现在落到 `fetch(…, {keepalive:true})`**。
   凡是「方法被 stub 成 false」的加固浏览器/内嵌 webview,事件**直接救回来**;而且 fetch 会回话。
2. 仍然送不出去的**被计数**,搭下一个成功的事件以 `_dropped` 送出。
   **计数器放 localStorage 不是模块变量** —— 最可能丢 beacon 的时刻是 unload,
   而模块变量正好在那一刻和页面一起死掉。

浏览器端到端实测(拦截 sendBeacon,不真发到生产):

| 步骤 | 观察 |
|---|---|
| beacon 返回 false | `refused` |
| **落到 keepalive fetch** | `fetch-rejected:word_generated` ← 旧代码没有这一步 |
| 计数并持久化 | `localStorage.ca_ev_dropped = "1"` |
| 传输恢复后补报并清账 | `_dropped: 1`,随后 key 被删除 |

### `_dropped` 是下界,三个方向都是

- 再也不成功发一次的浏览器,永远报不出自己的欠账;
- beacon 返回 `true` 只代表**入队**,之后死在网络上仍然不可见;
- 服务端**接受后丢弃**的(bot 过滤、200/天上限)回的是 **200**,这里完全看不到 ——
  那部分要读 `server/bot-detect.js`。

> 顺带在本地实测里撞到一个此前没写下来的:跨域 `sendBeacon` 带 `application/json`
> **不是 CORS 安全类型,要预检**。localhost 不在 API 允许名单里,所以那次落地词的
> beacon 返回 true 却被浏览器丢了 —— **这正是「返回 true ≠ 送达」的活样本**,
> 也是为什么上面那条下界说明必须写进代码注释。

---

## 消费端一起改了(否则修 A 弄坏 B)

| 文件 | 改了什么 | 不改会怎样 |
|---|---|---|
| `gate-report.cjs` | 锚点**钉死旧定义**,把「含盲区」的数并排印出来并标注「**不是**锚点」 | 锚点次日凭空跳 ~20%,和 08-10 一模一样的事故 |
| `conversion-digest.cjs` | `wordDepth` 加 `counted` 过滤 | `counted:false` 的行没有 `count` → 全挤进一个 `n = NULL` 桶,读成「第六档」 |
| `conversion-digest.cjs` | 新增 `events never delivered` 行 + **两条断点警告** | 计数器没人看 = 没有计数器 |

**两个脚本已 scp 到 droplet 并在真库上跑通**(`RESEND_API_KEY=""`,不可能发信),
`md5` 与仓库一致,旧版本备份在 `scripts/*.cjs.bak-20260827`。

> **部署顺序是有约束的,别弄反**:服务端脚本必须**先于**客户端上线。
> 反过来的话,`counted:false` 的行会被旧脚本原样计入锚点。
> 服务端脚本对历史数据是恒等的(554 = 554),所以先上是安全的 —— 已经先上了。

---

## 🔴 这次修复自己也是一个断点

`track.ts` 的修复会让**原本在丢事件的浏览器开始成功投递**。
于是 **2026-08-27 起,全站每一个计数都可能上抬,而没有任何一个人多做了一件事。**

这和 08-10 是同一个错误、相反的符号。所以 digest 里印了这条警告:

```
⚠ 2026-08-27 also made a refused beacon retry over fetch. A browser that was
  silently losing events now delivers them, so counts above may step up on that
  date with no change in behaviour. Do not read the step as growth.
```

**`_dropped` 是我们对这个抬升幅度唯一的估计。** 如果它一直是 0,抬升就可以忽略。

---

## 验证清单(全部实跑,不是推的)

- `npx vitest run src/lib/__tests__/track.test.ts` → **11 passed**
- **把缺陷放回去**(还原成丢弃 sendBeacon 返回值)→ **7/11 变红**,恢复后 11 全绿
- `npx vitest run src/lib/__tests__/word-lookup-depth.test.ts` → **8 passed**;
  **把缺陷放回去 2/8 变红**(见下面「补一条」)
- `npm test` → vitest **42 文件 / 768 全过** + node:test **63/63**
- `npm run typecheck` → 干净
- `npx eslint <改动文件>` → 0 error(1 条 warning 是**改动前就有**的,在 `useEffect` 的 disable 指令上,未动)
- 浏览器实测:新词发一次、重打旧词**不发**;**片段折叠后** `ccmid`→2、`ccmidnight`→仍 2、`zzlantern`→3
- droplet 上两个报表脚本在**真库**上跑通,输出已肉眼核对

---

## 🔴 补一条:上线 4.7 小时后自查发现 `depth` 是错的,已修

上线后回头看真实数据(**UTC 仍是 08-27,本地 JST 才跨日 —— 只跑了约 4.7 小时**),
生产 session `02b3d2df` 的序列长这样:

```
cnt=1 depth=1 → cnt=1 depth=2 → cnt=2 depth=3 → cnt=2 depth=4 → cnt=3 depth=5 → cnt=4 depth=6
```

**`depth=6` 不是「越过付费墙的第 6 个词」**,而是 6 次 debounce 提交里只有 4 个净词。
2 秒空闲判词,打字停顿会提交前缀("mid" → "midnight"),**额度路径会退掉这些片段,
而 `depth` 没有退** —— 于是它随打字速度膨胀,恰好是「看起来是 A、实际是 B」的老毛病,
而且是我自己新造的一个。

**修法**:把前缀折叠抽成 `src/lib/word-lookup-depth.ts` 的 `recordLookup()`,两个发射点共用。
和额度退款的唯一有意差别:**不豁免落地词** —— 落地词免费是**权限**规则,不是**计数**规则。

- 8 条单测;**把缺陷放回去 2 条变红**(正是两条片段折叠的断言)。
- 浏览器实测:`ccmid` → depth 2,`ccmidnight` → **仍是 2**,`zzlantern` → 3。

### 已经用旧定义写进库的行(小,但要说清楚)

**13 事件 / 4 会话**,`2026-08-27 13:18:36` → `16:37:45` UTC,其中 **5 行 `depth > count`**(真正被抬高的)。
没有标记位,**按 `created_at` 早于本次部署排除即可**。量太小,不值得回填。

### ⚠️ 本机 dev server 有个会骗人的坑(排查花了大半程)

改完之后连续三次「验证失败」,一度以为逻辑不对。真相是
**Turbopack dev 从内存图谱供应 chunk,而这台机器的文件监听没生效** ——
`.next/dev/static/chunks/*.js` 磁盘上**有**新代码,HTTP 返回的**没有**,`touch` 也不触发。

**判据(别再靠猜)**:在页面里 `fetch(chunkUrl, {cache:"reload"})` 然后 grep 一个只存在于新代码的字符串;
和磁盘上同名文件对比。**不一致 = 服务器陈旧,不是你的代码错了。**
**解法:`preview_stop` → `rm -rf .next` → `preview_start`**(单纯 HMR 或重新导航都不够)。

---

## 下一个会话要看什么

1. **`word_generated` 的 `reason` 分布** —— 头一次能看见 Pro / 被墙 / 已解锁 各占多少。
   预期 `gated` 最大(生产库里 64 vs 3 vs 2)。
2. **`depth` 超过 5 的尾巴** —— 这是过去完全不可见的部分。
   如果尾巴很长,「5 次免费够不够」这个问题的答案会和 §1.5 的猜测不一样。
3. **`_dropped` 是不是一直 0**。不是 0 的话,08-27 之后的所有计数都要带着那条断点警告读。
4. **不要拿「含盲区」那个数去对 ≥300 的阈值。** 阈值是照窄序列标定的,
   换宽序列等于**没人决定就把标准挪了**。要换,得先攒够它自己的两个干净月。
