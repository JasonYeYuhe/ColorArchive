# 下阶段计划的三方外部评审(2026-08-22)

评审对象:`docs/dev-plan-2026-08-22-phase-b.md` **第 1 稿**。
三份**独立**评审全部给出「立刻停止付费面投入」。加上 08-18 那两份,**5/5**。

复核结论见计划第 3 稿 §3:**采纳 11 条、部分驳回 2 条**。
**Codex 那份最有价值** —— 它抓到两条另外两家都没抓到的事实错误
(订单普查 7/9 而非 6/8;`track("export")` 只在成功时发,所以「0 触达」是错误归因),
并给出了三份里唯一具体的替代建议(去拿第一手问题证据,而不是猜文案)。

调用方式(踩过的坑都记在 `docs/handoff-2026-08-22.md`):
```
agy --print "$(cat brief.md)" --model gemini-3.1-pro-high < /dev/null
agy --print "$(cat brief.md)" --model gemini-3.7-flash-high < /dev/null
codex exec --skip-git-repo-check "$(cat brief.md)" < /dev/null
```

---

## 1. Gemini 3.1 Pro

Here is the adversarial, specific review you asked for. This plan is indeed "decorating a tollbooth in a wasteland," and it is riddled with contradictions and busywork meant to delay a painful decision.

### 1. Unsupported Claims
**The Claim:** *"B2/B1 的真实作用是「排除掉『是不是文案太烂』这个解释」, 不是「预期能带来收入」。"* (§6.1)
**Why it is completely unsupported:** You cannot exclude *any* explanation with this sample size. §0.5 shows exactly **3 sessions** saw the upgrade modal in 21 days. If you change the copy and get 0 clicks next month instead of 1, you haven't "excluded" bad copy; you've just flipped a coin three times. The plan actually admits this in the very next bullet point (§6.2: *"这个数太小... B2 做完也无法判断有没有变好"*), which means §6.1 is a delusional justification fabricated to give you permission to write code.

### 2. Circular Reasoning & Unactionable Measurement
**Unactionable Measurement:** 
Look at B1.1. You want to *"先量清楚三条路各自被点了多少, 再谈改"* (measure the split of the three paywall paths). §0.6 shows those paths received exactly **1** `pro_click` and **1** `email_unlock` in 21 days. You are proposing building telemetry to segment two clicks. That is the definition of measuring something you cannot act on.

**Circular Reasoning:**
§4 claims the value of running this 3.5-week timebox is to give the paid surface *"一个诚实的机会"* (an honest chance). But in §5, you write that the scope is *"刻意压得很小"* (deliberately kept small) precisely *because* the leading indicators are zero. You cannot give something an "honest chance" by intentionally half-assing the intervention because you already know it's dead. You have designed a fake test to run down the clock on a conclusion you've already reached.

### 3. B0: Correctly Prioritised or Busywork?
**It is pure, unadulterated busywork.**
B0 proposes writing code (B0.1, B0.2, B0.3) so the automated report stops counting your own test purchases. But you are the *only* person reading this report, and §0.1 proves you already manually audited the transaction and know it was yours. When your entire revenue pipeline consists of one real transaction and one fake transaction a month, you do not build automated attribution filters. You look at the Stripe/Gumroad dashboard. Writing code to prevent yourself from fooling yourself is a profound waste of engineering time. 

### 4. §6.3 Assessment (Does Hayley's renewal write the verdict?)
Analytically, it is an **overreaction to n=1 and a fundamental category error.**
Hayley's renewal is a metric of *Retention* (did the product provide ongoing value to her over a month). B1 and B2 are experiments in *Acquisition* (can the paywall convince new people to buy). They are completely decoupled. If Hayley cancels, it means the product didn't hold her; it tells you absolutely nothing about whether the B1 paywall copy works. Using the churn of a single legacy user to scientifically invalidate top-of-funnel acquisition tests is logically incoherent. (Though emotionally, her leaving will probably kill your morale, which is the real reason you wrote this clause).

### 5. Is running another 3.5 weeks defensible?
**No. Stop now.**
The plan explicitly states in §4.1: *"如果 owner 现在就想停, 数据已经支持停"* (The data already supports stopping). The external reviewers were 100% correct. You have 0 organic conversions, 0/5 interview replies, and ~16 sessions a day (~500/mo). Waiting until September 15th will not magically generate the statistical power needed to prove anything, because your traffic volume is too low. You are using the timebox as an emotional crutch to procrastinate admitting the paid strategy failed. 

### 6. The Single Highest-Value Thing This Plan is NOT Doing
**Executing the pivot to "公用事业" (public utility) *today*.**
The plan is hyper-fixated on optimizing the absolute bottom of a funnel (paywall buttons, analytics, attribution filters) for a product that has no top-of-funnel traffic. The highest value action you can take right now is to stop writing code for a tollbooth nobody visits, freeze or remove the paid gates, accept the result, and reclaim the next 3.5 weeks of your life to work on something that actually has a pulse.

---

## 2. Gemini 3.7 Flash

Here is an adversarial, unsweetened critique of the development plan.

---

### 1. Claims NOT Supported by the Evidence Cited

* **Claim 1: Prioritizing AI quota as the primary surface.**
  > *Quote (§2 B2 Title):* `「/brand-generator/ 的 AI 配额闸(唯一有人真正撞到的付费面)」`
  > *Contradiction:* This is flatly contradicted by the plan's own data in §0.6. In 21 days, `word_paywall_hit` registered **91 sessions / 91 events**, while `upgrade_modal_shown` on `/brand-generator/` registered **3 sessions / 6 events**. The word paywall has **30x** the traffic and exposure of the AI quota modal. Labeling a surface touched by 3 users in 3 weeks "the only paid surface people actually hit" is factual distortion to justify working on AI features.

* **Claim 2: B0 is a blocking dependency for downstream results.**
  > *Quote (§5.1):* `「B0(1 天) —— 判定可信度。不做完这个,后面做什么都读不出结果。」`
  > *Contradiction:* The site has logged 9 orders in its lifetime, averaging 0 to 1 transactions per month. The owner knows their own two personal email addresses. On September 15, reading the truth requires a 5-second SQL query or manual inspection of 0–2 rows. Claiming that automated report filtering is a prerequisite to "reading any results" is false.

* **Claim 3: Attributing interview silence to email deliverability.**
  > *Quote (§6.4):* `「0/5 回信可能只是邮件进了垃圾箱,不一定是『没人想聊』。B 类开工前值得花 5 分钟确认送达状态」`
  > *Contradiction:* A 0/5 response rate on cold/semi-cold outreach to casual website visitors is standard baseline behavior (normal response rates are 0–10%). Conjuring spam-folder theories is rationalization to avoid accepting user indifference.

* **Claim 4: A single renewal carries immense informational weight.**
  > *Quote (§0.4):* `「续费成功 = 留存 1/1;失败/取消 = 留存 0/1。无论哪个方向,它的信息量都大于本计划里任何一项改动。」`
  > *Contradiction:* An $n=1$ renewal carries near-zero statistical or business signal. A $3.47 renewal can happen because someone forgot an auto-renew subscription or liked one palette; a cancellation can happen because a credit card expired. Treating $n=1$ as a decisive cohort retention metric is pseudo-science.

---

### 2. Circular Reasoning and Unactionable Metrics

* **The Micro-Sample Carousel:**
  1. §0.5 rejects export gates because $n=0$ (0 exports in 21 days).
  2. It replaces it with the AI quota gate because $n=3$ (`upgrade_modal_shown` in 21 days).
  3. §6.2 immediately admits: `upgrade_modal_shown 3 会话 —— 这个数太小, B2 做完也无法判断有没有变好。`
  4. It concludes that B2 must therefore be evaluated *qualitatively* ("saying the right thing to expired users") rather than by conversion.
  * **The circularity:** You abandon an unmeasurable feature to work on another unmeasurable feature, concede it cannot be measured quantitatively, and redefine success as "having edited the copy."

* **Measuring What Cannot Be Acted On:**
  * **§2 B1.1:** `「付费墙面板现在同时给出『登录』『订阅解锁』『Go Pro』三条路... 先量清楚三条路各自被点了多少,再谈改」`. Over 21 days, `email_unlock` was clicked 1 time, `pro_click` 1 time. Segmenting 2 total clicks across 3 paths over the next 2 weeks will produce noise like $(1, 0, 0)$ or $(0, 1, 0)$. You cannot make statistical or product decisions based on single-digit click distributions.

---

### 3. Is B0 Correctly Prioritized or Busywork?

**It is pure, grade-A engineering busywork.**

* **Why it exists:** It creates the illusion of rigorous progress without exposing the product to market feedback.
* **The reality:** You are a solo developer managing a database with 1 real customer and ~9 lifetime transactions. Writing automated whitelist/blacklist filters, defining `server/owner-emails.js`, and adding guard tests to prevent your own script from tricking *you* about your *own* purchases is defensive engineering theatre.
* Spending 20–25% of the sprint (1 full day out of 4–5 days) on B0 when you could verify the entire dataset on judgment day with `SELECT email, amount FROM orders WHERE created_at > '2026-08-18'` is unjustified.

---

### 4. §6.3 on Hayley’s Renewal: Right or Overreaction to $n=1$?

* **Methodologically:** It is a gross overreaction to $n=1$. One user's $3.47 renewal decision tells you nothing about market demand, willingness to pay, or pricing elasticity.
* **Pragmatically:** **It is the right decision to terminate.**
  * The only reason this project is still spending engineering cycles on monetization is psychological inertia anchored to the fact that "there is 1 active paying subscriber."
  * If that subscriber churns, the revenue drops to $0.00/mo. If losing that single anchor breaks the illusion and stops further wasted effort on a dead commercial funnel, pulling the plug immediately on August 22 is the most rational operational move available.

---

### 5. Is Running Another 3.5 Weeks Defensible, or Should It Stop Now?

**It should stop immediately. Running another 3.5 weeks is indefensible.**

Here is why:
1. **The bottleneck is not "funnel bugs" or "bad copy":** Phase A already fixed all critical bugs (receipts, premature revocation, entitlement gates). The funnel is technically intact.
2. **The conversion baseline is zero:**
   * 91 paywall hits $\rightarrow$ 1 pro click (1.1% CTR) $\rightarrow$ 0 checkouts.
   * 3 AI modal impressions $\rightarrow$ 1 click $\rightarrow$ 0 checkouts.
   * 5 interview requests $\rightarrow$ 0 replies.
3. **Sample size math makes 3.5 weeks futile:** At ~500 engaged sessions/month, another 3.5 weeks will generate ~400 sessions and ~70–80 paywall impressions. Even if copy optimization doubled click-through rates from 1% to 2%, your expected new paying customers is still **0** (or at best 1 anomalous conversion).
4. **The plan itself admits defeat:** §4 states `数据已经支持停` (the data already supports quitting), and §6.1 states `B0 之外的所有工作, 期望值都很低... 不是『预期能带来收入』`.
5. Running for another 3.5 weeks just to "give the plan an honest chance" is spending 25+ hours of skilled labor to generate zero statistically actionable data, confirming Reviewer 2's verdict: *a paralysis plan masquerading as data-driven in a zero-data environment.*

---

### 6. The Single Highest-Value Thing This Plan Is NOT Doing

**Accepting that ColorArchive is a low-intent, utility-tier search destination and executing a clean strategic pivot:**

The plan is obsessed with optimizing extraction mechanisms (paywalls, modals, attribution scripts) on 500 monthly sessions. The single highest-value action is:

* **Tear down the paywalls, transition the site to a zero-maintenance public utility (公用事业), and stop writing code for it.**
  * At 500 sessions/month (where 45% of search traffic lands on a free word-to-color tool), user intent is transactional and ephemeral. Nobody wants a monthly subscription for a color reference tool they check twice a year.
  * Paywalls on 500 sessions create negative user experience and zero revenue.
  * Freeing up 100% of your time to work on a product with actual commercial intent and distribution leverage will generate infinitely more value than polishing a payment gate on an empty highway.

---

## 3. Codex (gpt-5.6-sol, ultra effort)

## 1. Claims not supported by the cited evidence

- “¥550 (= ¥499 + 10% 消费税, `amount_minor=54969`)”

  The arithmetic is wrong. ¥499 × 1.10 = ¥548.90, not ¥550. If `54969` uses two decimal places, it means ¥549.69. Display rounding may produce ¥550, but the claimed equality is false.

- “8 笔历史订单里 6 笔是 owner 自己”

  This conflicts with the supplied measured fact: 8 of 9 historical orders were owner purchases. Even adding the new owner order gives 7 of 9, not 8 of 9. The order census has not been reconciled.

- “没有任何 `checkout_*` 事件” is “另一条独立判据” proving the purchase does not count.

  No. Missing analytics means “unattributed,” not “not real.” Ad blockers, cookie loss, another device, direct checkout, or tracking failure can all remove the event path. It is also not independent: an owner buying directly is especially likely to skip the normal funnel.

- “报表已经把这笔钱报成收入了” describes a reporting error.

  The email said “1 payment,” and there was one genuine processor payment. That is correct as gross payment reporting. It is wrong only as an external-customer acquisition metric. The plan is conflating accounting revenue, external revenue, and attributed acquisition.

- “B0……是其余一切的前提” and “不做完这个，后面做什么都读不出结果。”

  False. There are nine historical orders and at most a handful of new ones. The verdict can be manually audited in minutes. B1/B2 event results also do not depend on the revenue digest.

- “站点在 ~500/月，稳稳在‘转公用事业’这一档。”

  The current value is above the chosen threshold. “Stable” is not established by overlapping 7-, 21-, and 30-day windows. Those are mostly the same traffic observed three ways. Nor does an arbitrary ≥300 threshold prove “utility” is the economically correct strategy.

- “这是这个站历史上第二个真实数据点。”

  A renewal by the same customer is not a second independent customer datapoint. It is one longitudinal observation from the same person, possibly driven by automatic billing or inertia.

- “续费成功 = 留存 1/1；失败/取消 = 留存 0/1。”

  That notation creates fake precision. A failed charge is not churn while retries or dunning remain possible. The plan itself just fixed `past_due` handling, yet now proposes treating the first failed renewal attempt as definitive churn.

- “A 类的修复直接作用在她这次续费上。”

  Mostly false. A receipt happens after successful payment. Correct cancellation semantics matter only if she cancels. `past_due` handling matters only if payment fails. These fixes protect correctness; they do not cause renewal.

- “21 天 0 次 export” therefore “export 闸 21 天 0 触达.”

  Zero `export` events proves zero recorded exports. It does not prove nobody saw or attempted to use the gated export unless that event fires on blocked attempts. The plan repeats the same attribution mistake it claims to correct.

- “AI 配额闸（唯一有人真正撞到的付费面）”

  If this means site-wide, its own data disproves it: 91 sessions hit the word paywall. If it means only `/brand-generator/`, it needs to say so.

- “≥2 笔且都通过归因过滤，才算信号。”

  Two is an arbitrary decision threshold, not an evidence-backed signal threshold. Worse, it counts orders rather than unique first-time external customers. One person buying twice could satisfy it. B0 also fails to define initial purchases versus renewals, so Hayley’s renewal could be mixed into “新增” unless accidentally excluded by missing checkout events.

- “B2/B1 的真实作用是排除掉‘是不是文案太烂’这个解释。”

  This is the plan’s central falsehood. §6.2 simultaneously admits B2 “无法判断有没有变好.” An experiment that cannot measure an effect cannot eliminate the copy hypothesis.

## 2. Circular or non-actionable reasoning

The plan contains a direct contradiction:

> “B2 做完也无法判断有没有变好。”

versus:

> “B2/B1 的真实作用是排除……‘是不是文案太烂’。”

Both cannot be true. The former is correct.

Other dead-end measurement:

- B2 has three exposed sessions in 21 days. At the same rate, a change deployed around the end of August gets roughly two additional exposed sessions before 09-15. Adding `surface` to those events produces metadata, not knowledge.
- B1 says “先量清楚” three routes but gives no sample requirement or rule mapping the result to a particular change.
- “Only one change” does not make causality legible without a control and adequate volume. Traffic variation alone overwhelms these counts.
- B1 and B2 would both change during the same verdict window, while §4 only counts aggregate purchases. Even a sale would not identify which change mattered.
- “Correct copy” is the qualitative acceptance criterion, but the plan never defines the new copy, the hypothesis, or what “correct” means.
- Checking Resend delivery can find bounces. It cannot determine whether messages landed in spam or were read.
- Requiring an analytics event path before recognizing a processor-confirmed customer makes the measurement self-validating: only conversions visible to the instrumentation are permitted to exist.

## 3. B0: priority or busywork?

The underlying distinction is necessary; the proposed one-day B0 project is busywork.

For the 09-15 verdict, manually label `lsinv_8238482` as an owner purchase and inspect every new order. At this volume, that is more reliable than building another classification subsystem.

If the reports will continue long-term, make one small durable correction with three separate fields:

- Gross processor payments — includes the owner’s genuine charge.
- Unique first-time external paying customers — excludes owner/test/refunded orders and renewals.
- Attribution status — tracked or unattributed.

Do not discard a genuine external payment because its analytics path is missing. And do not call the owner’s genuine payment nonexistent revenue; call it non-external revenue.

B0 is reporting hygiene, not the prerequisite for a revenue experiment.

## 4. Should one failed renewal cancel B1/B2?

No. That reasoning overreacts to n=1 and confuses several outcomes.

A confirmed nonrenewal after the retry/dunning period is one negative retention observation. It does not prove that acquisition copy cannot work for other people. A successful automatic renewal would likewise not prove product-market fit.

The plan is also asymmetrical: a failure stops the experiment, while a success implicitly permits continued work. That is one-sided optional stopping.

Practically, B1/B2 should still be cancelled—but because they have negligible expected information value, not because Hayley happened to churn. Same action, different and much sounder reason.

## 5. Should it run another 3.5 weeks?

No. Stop development now.

The 0 new customers since 08-18 and 0/5 replies are individually weak because both windows are tiny. The decisive fact is that the proposed work cannot accumulate enough exposure:

- B2: 3 modal sessions per 21 days, meaning perhaps 2 post-change observations before the verdict.
- B1: 1 Pro click from 91 paywall hits. Another roughly 60 hits would predict substantially less than one click before checkout is even considered.
- Entire history: one real customer and eight owner purchases out of nine orders.

Spending a solo developer week on this is not “giving revenue an honest chance.” It is performing an experiment the plan already knows cannot answer its question.

If personal closure matters, leave the existing surface untouched, passively count unique external first-time customers until 09-15, and enforce the exit rule. Continuing observation is defensible. Continuing B1/B2 development is not.

## 6. Highest-value missing work

Obtain first-party problem evidence from actual users—starting with a direct, short conversation with Hayley and then an in-product question on the word-to-color page if she is unreachable.

That page supplies 45% of search clicks and reaches roughly 500 engaged sessions per month. Ask what people are trying to accomplish and what deliverable would be worth paying for. The failed five-email batch means the research channel failed; it does not justify replacing customer knowledge with guessed paywall copy.

The business does not need a better tollbooth. It needs evidence that there is a valuable destination behind it.
26,088
Bottom line: stop B1/B2 now. As a revenue plan, this is bad. As a shutdown checklist, it is overbuilt. It explicitly admits the proposed changes cannot generate enough observations, then pretends those changes can settle whether the copy is the problem. They cannot.

Keep observing until 09-15 if honoring the precommitted date matters, but do not spend a week polishing gates.

## 1. Claims not supported by the cited evidence

- “¥550 (= ¥499 + 10% 消费税, `amount_minor=54969`)”

  The arithmetic is wrong. ¥499 × 1.10 = ¥548.90, not ¥550. If `54969` uses two decimal places, it means ¥549.69. Display rounding may produce ¥550, but the claimed equality is false.

- “8 笔历史订单里 6 笔是 owner 自己”

  This conflicts with the supplied measured fact: 8 of 9 historical orders were owner purchases. Even adding the new owner order gives 7 of 9, not 8 of 9. The order census has not been reconciled.

- “没有任何 `checkout_*` 事件” is “另一条独立判据” proving the purchase does not count.

  No. Missing analytics means “unattributed,” not “not real.” Ad blockers, cookie loss, another device, direct checkout, or tracking failure can all remove the event path. It is also not independent: an owner buying directly is especially likely to skip the normal funnel.

- “报表已经把这笔钱报成收入了” describes a reporting error.

  The email said “1 payment,” and there was one genuine processor payment. That is correct as gross payment reporting. It is wrong only as an external-customer acquisition metric. The plan is conflating accounting revenue, external revenue, and attributed acquisition.

- “B0……是其余一切的前提” and “不做完这个，后面做什么都读不出结果。”

  False. There are nine historical orders and at most a handful of new ones. The verdict can be manually audited in minutes. B1/B2 event results also do not depend on the revenue digest.

- “站点在 ~500/月，稳稳在‘转公用事业’这一档。”

  The current value is above the chosen threshold. “Stable” is not established by overlapping 7-, 21-, and 30-day windows. Those are mostly the same traffic observed three ways. Nor does an arbitrary ≥300 threshold prove “utility” is the economically correct strategy.

- “这是这个站历史上第二个真实数据点。”

  A renewal by the same customer is not a second independent customer datapoint. It is one longitudinal observation from the same person, possibly driven by automatic billing or inertia.

- “续费成功 = 留存 1/1；失败/取消 = 留存 0/1。”

  That notation creates fake precision. A failed charge is not churn while retries or dunning remain possible. The plan itself just fixed `past_due` handling, yet now proposes treating the first failed renewal attempt as definitive churn.

- “A 类的修复直接作用在她这次续费上。”

  Mostly false. A receipt happens after successful payment. Correct cancellation semantics matter only if she cancels. `past_due` handling matters only if payment fails. These fixes protect correctness; they do not cause renewal.

- “21 天 0 次 export” therefore “export 闸 21 天 0 触达.”

  Zero `export` events proves zero recorded exports. It does not prove nobody saw or attempted to use the gated export unless that event fires on blocked attempts. The plan repeats the same attribution mistake it claims to correct.

- “AI 配额闸（唯一有人真正撞到的付费面）”

  If this means site-wide, its own data disproves it: 91 sessions hit the word paywall. If it means only `/brand-generator/`, it needs to say so.

- “≥2 笔且都通过归因过滤，才算信号。”

  Two is an arbitrary decision threshold, not an evidence-backed signal threshold. Worse, it counts orders rather than unique first-time external customers. One person buying twice could satisfy it. B0 also fails to define initial purchases versus renewals, so Hayley’s renewal could be mixed into “新增” unless accidentally excluded by missing checkout events.

- “B2/B1 的真实作用是排除掉‘是不是文案太烂’这个解释。”

  This is the plan’s central falsehood. §6.2 simultaneously admits B2 “无法判断有没有变好.” An experiment that cannot measure an effect cannot eliminate the copy hypothesis.

## 2. Circular or non-actionable reasoning

The plan contains a direct contradiction:

> “B2 做完也无法判断有没有变好。”

versus:

> “B2/B1 的真实作用是排除……‘是不是文案太烂’。”

Both cannot be true. The former is correct.

Other dead-end measurement:

- B2 has three exposed sessions in 21 days. At the same rate, a change deployed around the end of August gets roughly two additional exposed sessions before 09-15. Adding `surface` to those events produces metadata, not knowledge.
- B1 says “先量清楚” three routes but gives no sample requirement or rule mapping the result to a particular change.
- “Only one change” does not make causality legible without a control and adequate volume. Traffic variation alone overwhelms these counts.
- B1 and B2 would both change during the same verdict window, while §4 only counts aggregate purchases. Even a sale would not identify which change mattered.
- “Correct copy” is the qualitative acceptance criterion, but the plan never defines the new copy, the hypothesis, or what “correct” means.
- Checking Resend delivery can find bounces. It cannot determine whether messages landed in spam or were read.
- Requiring an analytics event path before recognizing a processor-confirmed customer makes the measurement self-validating: only conversions visible to the instrumentation are permitted to exist.

## 3. B0: priority or busywork?

The underlying distinction is necessary; the proposed one-day B0 project is busywork.

For the 09-15 verdict, manually label `lsinv_8238482` as an owner purchase and inspect every new order. At this volume, that is more reliable than building another classification subsystem.

If the reports will continue long-term, make one small durable correction with three separate fields:

- Gross processor payments — includes the owner’s genuine charge.
- Unique first-time external paying customers — excludes owner/test/refunded orders and renewals.
- Attribution status — tracked or unattributed.

Do not discard a genuine external payment because its analytics path is missing. And do not call the owner’s genuine payment nonexistent revenue; call it non-external revenue.

B0 is reporting hygiene, not the prerequisite for a revenue experiment.

## 4. Should one failed renewal cancel B1/B2?

No. That reasoning overreacts to n=1 and confuses several outcomes.

A confirmed nonrenewal after the retry/dunning period is one negative retention observation. It does not prove that acquisition copy cannot work for other people. A successful automatic renewal would likewise not prove product-market fit.

The plan is also asymmetrical: a failure stops the experiment, while a success implicitly permits continued work. That is one-sided optional stopping.

Practically, B1/B2 should still be cancelled—but because they have negligible expected information value, not because Hayley happened to churn. Same action, different and much sounder reason.

## 5. Should it run another 3.5 weeks?

No. Stop development now.

The 0 new customers since 08-18 and 0/5 replies are individually weak because both windows are tiny. The decisive fact is that the proposed work cannot accumulate enough exposure:

- B2: 3 modal sessions per 21 days, meaning perhaps 2 post-change observations before the verdict.
- B1: 1 Pro click from 91 paywall hits. Another roughly 60 hits would predict substantially less than one click before checkout is even considered.
- Entire history: one real customer and eight owner purchases out of nine orders.

Spending a solo developer week on this is not “giving revenue an honest chance.” It is performing an experiment the plan already knows cannot answer its question.

If personal closure matters, leave the existing surface untouched, passively count unique external first-time customers until 09-15, and enforce the exit rule. Continuing observation is defensible. Continuing B1/B2 development is not.

## 6. Highest-value missing work

Obtain first-party problem evidence from actual users—starting with a direct, short conversation with Hayley and then an in-product question on the word-to-color page if she is unreachable.

That page supplies 45% of search clicks and reaches roughly 500 engaged sessions per month. Ask what people are trying to accomplish and what deliverable would be worth paying for. The failed five-email batch means the research channel failed; it does not justify replacing customer knowledge with guessed paywall copy.

The business does not need a better tollbooth. It needs evidence that there is a valuable destination behind it.
