# 交接 — ColorArchive(2026-09-05 晚)

> 取代 `docs/handoff-2026-09-05.md` 的「这一轮做什么」部分。那份里的**计划 §3 十项已全部完成**。
> 过程与证据在 `docs/autopilot-log.md` 顶部;计划本身新增了 **§4.5「执行后的更正」**。

## 一眼

| | |
|---|---|
| 计划 §3 十个批次 | **全部完成并在生产上验过**(`39d9913` → `ca4f255`) |
| 测试 | 48 文件 / 836 测试;server 70;tsc 干净;eslint 86 warnings(此前 87) |
| iOS v1.4 | 仍 `WAITING_FOR_REVIEW`,本轮没碰 `ios/` |
| 钱 | 未变。3 个月付,MRR $10.47。**本计划从不承诺改变 MRR** |

## 🔴 这一轮最该记住的四条

1. **计划自己有 4 条断言是假的**,其中 2 条会写出坏代码(见计划 §4.5)。
   「代码里写了 ≠ 事情成立」这条规矩,**对计划书本身同样适用**。
2. **验证配置要读构建产物。** Vercel 的 env 能不能验?能 —— Next 把 `NEXT_PUBLIC_*` 静态内联,
   没设的以 `process.env.X` 留在 bundle 里。而且要**带阳性对照**(设了的那个变量必须消失),
   否则「没找到」和「找错地方」分不开。
3. **一个不能失败的判据不是判据 —— 这次是我自己差点犯。** F3 的第一版测试 33 条全绿,
   但把函数换成「忽略参数、返回固定 6 色」的常量,**33 条还是全绿**。判据必须**亲手证伪一次**。
4. **`tool_used` 不是使用量**,它在每次路由变化时发(7 天 4,801 条)。11-02 读数时别读错。

## ⏰ 到期要读的

| 日期 | 事 | 判据 |
|---|---|---|
| **10-03** | GSC 守卫 | `/word-to-color/` 28 天点击基线 479,跌破 431 回滚 `word-color.ts` FAQ 措辞 |
| **10-03** | id41 第一次续费 | 他按年付被扣月付;流失 = F1 的 bug 直接丢客户 |
| **10-12** | W1 | `sudo node /root/ColorArchive/server/scripts/w1-readout.cjs`(改 F2 前基线:5/42 天,较小臂 75/589,"keep running") |
| **10-13** | Pinterest | `sudo node /root/ColorArchive/server/scripts/pin-analytics-readout.cjs` |
| **11-02** | 甲 + A1 + E 批 | 见下 |
| iOS 过审后 | `posthog-ios` | 扣掉 09-04 全天 70 条模拟器事件 |

### 11-02 要读的 E 批数字(窗口从 **2026-09-05 E1 上线**起算 30 天)

判据全部是「**30 天绝对数,不设目标,不能成功也不能失败**」——
基线是 0 是因为功能/仪器不存在,所以「>0」不是成功,只是第一次有数。

```sql
-- 后端 events(Azure 生产库)
SELECT json_extract(props_json,'$.tool')   AS tool,
       json_extract(props_json,'$.action') AS action,
       COUNT(DISTINCT session_id)          AS sessions,
       COUNT(*)                            AS events
FROM events
WHERE event_name='tool_action' AND created_at >= '2026-09-05'
GROUP BY 1,2 ORDER BY sessions DESC;

SELECT json_extract(props_json,'$.format') AS format,
       COUNT(DISTINCT session_id) AS sessions, COUNT(*) AS events
FROM events
WHERE event_name IN ('color_copied','color_copy_failed') AND created_at >= '2026-09-05'
GROUP BY 1 ORDER BY sessions DESC;
```

并排写上同口径的 `$autocapture` 基线:`/all-colors/` 筛选 ≈81 会话/月、复制 2/月;
`/brands/` 复制点击 39 会话/60 天。**事件名映射见计划 §4.5 的表**(计划里提的 15 个名字没有采用)。

`conversion-digest.cjs` 现在会按 `format` 分行,并给「今天才有的面」打 `*`。

## 本轮改了什么(一句话一项)

1. **E1** 16 个面加手势埋点(9 个零埋点工具页 + `/brands/` + `/regions/` + today/identify/mixer/seasonal)。
   复用生产已有的 `tool_action{tool,action}`;复制走站内既有的 `color_copied{format}`。**没有任何加载即发的事件。**
2. **F1** 年付/终身不再静默回退成月付 → 无 variant 链接时按钮禁用(月付照旧,3 笔成交都走月付)。
3. **F4** 格式 toggle 不再扣额度;对比卡解闸;`ProGateCounter` 死代码删掉。
4. **G1** 锁定态显示「<label> locked / n/N 已用 · 重置时间」;登录真的给 10/天(与 AI 配额一致)。
5. **G3-web** `/pro/` row5、family-detail、collection-detail(计划漏了)、brand-generator ×2、
   product-examples、terms 的假承诺改成真话。**`API access` 没删 —— 它是真的。**
6. **F2** 词页 `?q=` 每键一次 → 稳定 500ms 后一次。9 键 9 次 RSC → 1 次(实测)。
7. **E2** `/all-colors/` URL 同步改用原生 `history.replaceState`(不再每键一次软导航)+ 滚动连续加载。
8. **E3** `/brands/` 加 Tailwind 配置片段(归档链接本来就有,本轮是给它埋点)。
9. **E5** `/seasonal/` `/mixer/` 加「进归档」链接(`/today/` `/identify/` 本来就有)。
10. **F3** pick-for-me:引擎抽到 `src/lib/pick-for-me.ts`、中文能匹配了、调色板不再塌成一个亮度带、
    删掉匹配 0 个颜色的 `ivory` 和只匹配中性灰的 `sage`。

## 没做 / 押后(与计划一致)

G2(拆 8 个明文闸)押后到 11-02;R1、E4 砍掉;`server/email.js` 押后到下次必要的 restart;
不动词页墙的任何规则;没碰 `app/guides/[slug]`、`guide-word-card.tsx`、`experiment.ts`、
`word_generated` 的 props、`ios/`。

## 已知未解决

- **08-15 那个 45,768 事件的会话根因仍未诊断。** F2 **不是**它的解释(计划说的 pageview 机制不存在)。
  新的候选:每次 `router.replace` 会重挂载组件、重跑所有 mount effect —— 但没证据说明那个会话为何有那么多。
- **F2 的「impression 事件风暴」修复没有干净量化**(我的测量会话混进了约 24 次调试重载,
  且我在按时间戳分离之前就把行删了)。RSC 那一半(9→1)是干净的。
- `matchCollections` 导出了但没有测试覆盖;wedding/婚礼 现在只有 4 个片段(别的都是 5);
  三个头部 prompt 刚好卡在判据阈值上(bands=3、families=4),没有余量。
- ProGate 锁定时不发事件,所以 `used`/`locked` 在分析里看不见。诚实的仪器会在**渲染时**发,
  而 §0 在 W1 跑完前禁止新的加载即发事件。**10-12 之后再看。**

## 会话协议(不变)

开工前 `git fetch origin && git pull --rebase origin main`,读 `.claude/session-lock.json` 取锁;
推完把锁写回 null 并一起提交。改 `.tsx` 至少跑 `dark-mode-classes` / `copy-counts` / `content-links` /
`retired-routes` / `price-copy` / `i18n-keys`,再 `npm run typecheck`。**不要跑 `npx next build`。**
改 `server/` 要 scp → `sudo install` → 逐个 md5;**只有改 `index.js`/路由才 `pm2 restart`(会群发邮件)**。
