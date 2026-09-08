# Dev plan — 2026-09-08 — the paid surface

Second draft. The first was reviewed by Gemini 3.1 Pro (4/10) and Gemini 3.8 Flash
(5.5/10); both found the same three faults, and both were right. What changed, and why,
is recorded in §8 — read that before re-proposing anything the first draft contained.

Every number is measured against production (the Azure SQLite DB, the deployed bundle,
or the live page) on 2026-09-07/08 unless marked otherwise.

The brief was "make the paid features better — Figma, Pinterest, the site's own
exclusives." The evidence reframes it, and the reframing is the plan.

---

## §0 EXECUTION RECORD — 2026-09-08, and the four places this plan was wrong

Items 0, 1, 1.5 and 2 shipped (`b5091b1`, `2b19b71`, `c98e6e7`). Every assertion in
§3 was re-verified against HEAD before anything was edited, because this plan is a
document and documents are not evidence. Four of its claims did not survive.

**1. 0a undercounted by half, and missed the largest surface.** The plan named three
stale "3 a day" strings. There were six. The biggest was not on a marketing page at
all: `colorDetail.buildDesc` renders on all 5,446 `/colors/[slug]/` pages, in en and
zh. That same string also claimed Pro "adds Figma tokens" while the complete Figma
token file is an ungated `<a href="/downloads/…">` on `/palette/`. Both fixed.
`terms-page.tsx:16` was already correct and was deliberately left alone — a
grep-and-replace would have broken the one page that had it right.

**2. 0c's premise is false. Not done, on purpose.** The plan says to remove
"Unlimited saved projects" and the `/account` API-key section as false claims. Both
features work: `server/routes/projects.js` is mounted at `/projects`, enforces
`FREE_PROJECT_LIMIT = 3` versus unlimited for Pro, and accepts API keys;
`SaveToProjectButton` renders on 8 pages and `/projects/` is linked from `/account`.
They are true claims about working features with no users. That is a demand problem,
and deleting shipped features is an owner's decision, not a hygiene sweep's.

**3. 0d's "all 261 collection pages" does not exist.** `collection-detail-page.tsx`
contains zero `PRO` literals — verified by grep, exit 1. The real badge sites were
three on `/palette/` and the format tabs in `palette-export-panel.tsx`. Also:
`brand-system-panel.tsx` keeps its "Pro" pill, because its whole panel really is
withheld — 0d would have removed an honest badge.

**4. 🔴 Item 2 was not "purely additive", and its stated justification was false.**
Two separate problems, both measured:

  *The guide links.* `getGuideSeedWord()` indexes `seeds[hash % seeds.length]`, so
  appending 27 words renumbers it. Of 333 guides, 55 use that fallback and **54 of
  the 55 would have silently changed which word they link to** — on the content→tool
  path W1 is currently measuring. Fixed by freezing `GUIDE_SEED_POOL` at 474 while
  `wordToColorSeeds` grows; verified 0 of 333 changed.

  *The colours.* §3.2 says the pages are "definitionally correct" because the archive
  defines these colours. **The route does not use the archive** — it renders
  `generateColorFromWord()`, a hash, and states the result as fact in its FAQ.
  Measured across all 48 roots: median hue error **86°**, and **22 of 48 more than
  90° off**. Scarlet rendered cyan; aqua rendered red; fuchsia rendered green. Nine
  of the 21 already-published root pages were >90° wrong and had been telling
  visitors that ember is blue and rose is green.

  So the narrow half of item 3 — curating the 48 roots — is a **precondition of item
  2**, not something to gate on item 2's SEO read-out. Shipped together
  (`hue-root-colors.ts`). This is not the mood-word curation the review cut: these
  are the archive's own vocabulary, and every other word keeps the hash byte-for-byte.
  Owner decided both this and the tool/page coherence question on 2026-09-08.

**Also corrected, from §5 rather than §3:** the analytics write cap is 200/day per
**caller IP** (`bot-detect.js` → `getRateLimitKey` → `req.ip`), not "per source" as
§5.4 says. That is why adding `word_paywall_outcome` is safe. And if the tracking
table exceeds 50,000 callers in a day, new callers pass **unchecked** — the cap
silently stops applying, which §5 does not mention.

**What item 1 did not need:** "verify the price is on the wall and comes from
checkout-config" was already true at HEAD. No change made.

Owner decisions taken on 2026-09-08: free unlock → **24-hour pass, existing browsers
grandfathered**; one-time pass → **deferred** until the wall reads out, because a
second offer during the measurement window makes the pre-registered comparison
uninterpretable.

---

## §1 The five facts this plan is built on

**1.1 Pro is bought as exactly one thing: removal of the word cap.**
All three active subscribers (users 25, 33, 41), across their entire logged-in history,
produced 43 `word_paywall_pro_bypass` events and **zero** events on any other Pro
surface — no exports, no AI generations, no audits, no saved projects, no API keys. All
five real invoices are monthly; no yearly or lifetime has ever sold.

**1.2 Everything else Pro sells is unused, or free on the same page.**
`export` has fired **5 times in the site's history** (all the same collection ZIP, none
by a paying user). The `projects` table has **0 rows ever**, while `/pro/` sells
"Unlimited saved projects". **0 of 23 users** have generated an API key. `/palette/`
badges Figma Tokens and Style Dictionary PRO, then offers those formats for all 5,446
colours as free static downloads below the fold. And `ProGate` renders its locked branch
as `opacity-40 pointer-events-none` around `{children}` — the payload is in view-source.
**Pro currently sells a copy button, not data.**

**1.3 The volume is at the wall, not at `/pro/`.** Weekly, agent traffic excluded:

| week | generated a word | hit the wall | clicked Pro | clicked checkout |
|---|---|---|---|---|
| W32 | 119 | 31 | 0 | 0 |
| W33 | 121 | 35 | 2 | 1 |
| W34 | 183 | 44 | 3 | 0 |
| W35 | 199 | 47 | 1 | 2 |

**6 of 157 sessions over four weeks = 3.8%.** `/pro/` receives **24 sessions in 30
days**. Tool use is the one thing growing: 119 → 199.

**1.4 🔴 27 of the 48 hue roots 404 on the only converting route.**
`/word-to-color/<root>/` returns 404 for **crimson, scarlet, vermillion, tangerine,
coral, canary, citrine, chartreuse, lime, leaf, mint, celadon, teal, cyan, aqua,
cerulean, azure, steel, cobalt, indigo, iris, violet, mulberry, magenta, fuchsia,
mauve, blush** — 21 of 48 work. These are the site's own vocabulary and exactly what a
person types into Google ("what colour is coral"). Every paying subscriber arrived from
search onto this route. This is the largest additive gap in the business and it was
missing from the first draft entirely.

**1.5 There is no colour-science gap.** APCA-W3, W3C DTCG tokens, Style Dictionary,
Figma export and OKLCH all already ship. That hypothesis is falsified; building more of
it would be building the thing nobody has used five times.

---

## §2 What this plan is

Fix the false claims, widen the one funnel that produces revenue, stop the leak beside
the paywall, and stop paying attention to surfaces with no return.

---

## §3 The work, in execution order

### 0. Hygiene sweep — one day, everything below is text (hours)

Four separate false statements, fixed in one pass.

- **0a.** `/support/` says free accounts get "3 a day"; the policy is
  `{ anonymous: 3, free: 10 }`. Same stale number in `cancel-page.tsx:67` and
  `free-resources-page.tsx:129`.
- **0b.** 261 collection pages claim "Unlimited access to all collections" as a Pro
  benefit while shipping the collection's CSS export in the static HTML above the gate.
- **0c.** `/pro/` sells "Unlimited saved projects" (0 rows ever) and `/account` shows an
  API-key section no endpoint has ever accepted a key for. Remove both.
- **0d.** Remove the PRO badges wherever the payload is already rendered on screen
  (`/palette/` ×3, the export panel, all 261 collection pages). A badge over readable
  text is an unenforced claim — the same defect class as the rest of this item.
- **0e.** The Figma Community listing sells "Pro: sync your saved palettes" for a
  feature that is free, has 0 rows, and is unreachable. Listing edits are free and
  trigger no re-review.
- **0f.** Correct the Pinterest figure (see §3.4) in the three places it is asserted.

**Criterion.** Two halves, and only the second is durable. Immediate: grep the deployed
pages for each string — binary, and it is a build check, not a business result; the plan
should not pretend otherwise. Durable: extend `price-copy.test.ts` to **derive** the
free-tier number from `FREE_EXPORTS_PER_DAY` instead of matching a literal, and add a
guard that fails when a `ProGate` wraps only a copy button while its payload renders
outside the gate. Mutation-test both.

🔴 **Risk, named because 0d creates it:** removing the badges tells visitors these
exports are free, which makes putting them behind a real gate later harder. That is
accepted deliberately — the alternative is leaving an unenforced claim on 261 pages —
but it should be a decision, not a surprise.

### 1. The wall — start the measurement clock the same week (days)

~40 sessions/week reach it against `/pro/`'s ~6/month. Everything else in this plan
targets pages a few dozen people see a month, so this goes early to start the clock, not
because it is the biggest change.

Copy and instrumentation, not a redesign:
- Verify the price is on the wall and comes from `checkout-config`, not a literal.
- Instrument the wall's outcome as one bounded event: `{paid, email_unlock, left}`.
- Apply the decision from 1.5 below about the free door.

**Criterion — corrected, and this correction matters.** The first draft pre-registered
"≥8% or ≤1% is readable" from a 6/157 baseline. **That was wrong**: ±3pp is the
single-proportion CI, not the threshold for comparing two proportions. Computed
properly, at n≈157 per arm:

| post-period rate | p-value | verdict |
|---|---|---|
| 8.0% | 0.115 | **not readable** |
| 9.3% | ≈0.05 | the smallest readable increase (~2.4× baseline) |
| 10.0% | 0.030 | readable |
| 1.0% | 0.102 | **not readable** |

So: **only an increase to ≥9.3% is readable in four weeks, and the decrease side is not
readable at all.** Pre-register that. Anything else is reported as "no conclusion" — and
note honestly that this criterion is unlikely to fire, which is a fact about the
traffic, not a reason to lower the bar afterwards.

### 1.5 The free email door — a leak, not a documentation problem (hours)

An email subscribe **permanently** removes the same cap Pro charges ¥499/mo for. **6
people have used it; 3 have paid.** The first draft proposed *disclosing* it on `/pro/`
and beside the paywall. Both reviewers independently called that the single most likely
mistake in the plan — advertising a free permanent bypass next to the paid button.

Proposal: **change the unlock from permanent to bounded** (a 24-hour pass, or +10
words). That closes the leak and makes disclosure honest at the same time, because there
is then no permanent free door to hide.

🔴 **This is an owner decision, not a developer one** — it changes what six existing
people were given. If the answer is "keep it permanent", then the disclosure half ships
alone and the leak is accepted knowingly.

**Criterion.** None available. At 3 payers and 6 unlockers, no version of this is
measurable within a quarter. It is a pricing-integrity decision, and the plan says so
rather than attaching a number.

### 2. The 27 missing hue-root pages (hours–days) — the highest-value additive item

Pre-render `/word-to-color/<root>/` for the 27 roots that 404. Zero subjective
judgement: the archive already defines every one of these colours, so the page is
definitionally correct. It is purely additive, breaks no existing route, and widens the
exact Google→`/word-to-color/` funnel that produced 100% of revenue.

**Do this before item 3**, and check for slug collisions with the 474 existing seed
words first — the population was enumerated (48 roots, 21 live, 27 missing), but
collisions have not been checked.

**Criterion.** Real and able to fail: GSC impressions for those 27 slugs, 30 days after
they are indexed, against a baseline of zero. If they attract no impressions, the
hypothesis that this vocabulary has search demand is wrong and the remaining SEO ideas
in this family should be dropped.

### 3. The word tool — scoped down to what is defensible (days)

`generateColorFromWord()` is MurmurHash3: `hue = hash % 360`. The colour has no
relationship to the word's meaning, so mood words return colours a person would call
wrong.

🔴 **The first draft's version of this item was cut by both reviewers and they were
right.** It proposed curating 128 mood words (nostalgia, trust, luxury, dreamy) from
`SEARCH_ALIASES` while hashing the other 73%. Three problems: the success criterion was
a tautology (asserting that a lookup table returns what the lookup table contains);
`SEARCH_ALIASES` is a *search filter* consumed at `color-search.ts:1801`, not a
word→colour function, so this is days of heuristic design, not wiring; and a hybrid
where `ocean` is curated blue but `oceanic` is hashed pink reads as broken, not as
partial.

**What survives:** curate only the **48 hue roots** — the same vocabulary as item 2.
Those are unambiguous (coral *is* a colour), they are the archive's own names, and
`coral` returning the archive's coral is definitionally right rather than a taste call.
The discontinuity objection largely dissolves, because these words are categorically
different from their neighbours in a way users already expect.

**Criterion.** Honest version: there is no revenue criterion at 1.5 Pro clicks/week, and
the unit test only proves the lookup was wired. The defensible test is the pair from
item 2: do the 48 root pages, once curated, attract GSC impressions and does
`word_generated` on those slugs behave like the existing 21? If item 2 shows the
vocabulary has no search demand, **this item does not get built.**

### 4. Pinterest — stop (hours)

85 pins on a near-perfect daily cadence, 2026-06-10 → 2026-09-07, have produced **zero
sessions, zero subscribers and zero orders** in our own database. The only 71
Pinterest-referred pageviews the site ever recorded pre-date the scheduler and are the
owner's own OAuth setup traffic.

🔴 **Pinterest rewrote its own analytics history.** Re-running the project's own read-out
today returns 100 impressions / 0 saves / 0 clicks; the same script on the same pins on
2026-08-31 returned **833 / 3 / 6**. Reproduced pin-by-pin. That 833 figure is asserted
as fact in a commit message, in `docs/dev-plan-2026-09-01-paid.md` §6.6, and in the
pin-image route's header comment. Correct all three with the restatement beside them.

Build nothing. **Criterion, with the threshold the first draft omitted:** on
**2026-10-13**, count Pinterest-referred sessions in our own `pageviews`/`events` — never
Pinterest's analytics. **If it is under 5, delete the cron.** Freezing and doing nothing
cannot fail; that threshold can.

### 5. Talk to the three subscribers (hours, owner-only)

At $10 MRR, losing one subscriber widens the monthly loss by ~32%. There is no
retention flow to build at n=3 — there is an email to write. The newest subscriber did
64 lookups in 5 days and went quiet; the earliest cancelled. Ask all three what they
were doing and whether it worked.

🔴 **Owner action, not agent action** — customer email needs authorisation, and one of
the three is owed a specific message anyway: they pressed yearly on 2026-08-31, were
billed monthly by the variant defect, and renew 2026-10-03.

---

## §4 Explicitly not doing

| Cut | Reason |
|---|---|
| Real server-side gating / blurring the payload | Irreversible; the loss cannot be sized. ⚠️ Note the circularity charge from review: only 4 sessions ever reached the locked overlay *because the gate does not enforce anything*, so "nobody reaches it" is weak evidence. The bar to revisit: name the number that would move, and show it is measurable first. |
| Per-gate daily counters (19 gates share one) | Days of work to loosen a quota that binds on nobody. |
| Figma variables, Inspect audit, telemetry heartbeat, plugin payments | Generic or incumbent-adjacent (Stark has 592k users); none would have produced any of the three subscribers. The plugin has 6 users and structurally cannot charge — `"capabilities": []`, no `permissions`. |
| Any Pinterest build | 90 days, 85 pins, zero of everything on our side. |
| Auth + rate limits on `/api/colors` and the AI endpoint | Real hygiene, wrong plan — cost/abuse, not paid surface. File separately. |

**Deliberately left open rather than cut: a one-time pass.** Flash argues palette choice
is a discrete task (user 41's 64 lookups in 5 days then silence supports it) and that two
$9 passes a month clears the deficit. Pro's counter is that it is unmeasurable at n=3 and
irreversible for existing subscribers. It is not scheduled here, but it is the strongest
un-taken idea in the packet and should be decided deliberately rather than by omission.

---

## §5 Measurement rules and the traps in this dataset

1. **Quarantine 2026-09-06.** Two `checkout_success` and eleven `checkout_clicked` rows
   that day were agent-generated during link testing. Clean all-time baseline: **6
   checkout sessions, 3 purchases.**
2. **Sessions, not pageviews.** ~56% of the `pageviews` table is single-viewport
   automated traffic and the automated share swings 18%–91% by month.
3. **No bot-resistant denominator before August.** `session_id` is missing from 86% of
   July's events; `page_read` did not exist before 2026-08-17.
4. The analytics endpoint **silently drops writes past 200/day/source** and still
   returns success.
5. `color_copied` covers **2 of ~55** copy points. `tool_used` is a route-change event,
   not usage.
6. **A criterion that cannot fail is not a criterion** — and a criterion that cannot
   fire is not one either. Where an item cannot be measured at this traffic, say so.

---

## §6 Owner decisions this plan does not make

1. **The free email unlock: bounded or permanent?** (§3 item 1.5 — blocks the wall work.)
2. **A one-time pass alongside the subscription?** (§4.)
3. **Email the three subscribers**, and specifically the one mis-billed on yearly.
4. **Keep the daily Pinterest pin** until 2026-10-13, or stop now?

---

## §7 Order

**0 (hygiene, one day) → 1 + 1.5 (the wall, start the clock) → 2 (the 27 root pages) →
3 (curate those roots, only if 2 shows demand) → 4 (Pinterest stop) → 5 (owner emails).**

Item 3 is explicitly gated on item 2's result. Both reviewers independently said the
first draft's order — putting the word-tool rewrite before the wall — was its worst
structural flaw.

---

## §8 What the review changed, so it is not re-proposed

| First draft | Why it changed |
|---|---|
| "±3pp, so ≥8% or ≤1% is readable" | **Wrong maths.** That is a single-proportion CI. Two-proportion comparison at n=157: 8% gives p=0.115. Smallest readable increase is 9.3%; the decrease side is unreadable. |
| Word tool as "the core item", judged by a unit test | Criterion was a tautology; `SEARCH_ALIASES` is a search filter, not a colour function; the hybrid creates an `ocean`/`oceanic` discontinuity. Scoped to the 48 roots and gated on item 2. |
| "Disclose the free email unlock" | Both reviewers: advertising a permanent free bypass beside the paid button is the likeliest mistake in the plan. Changed to bounding the unlock. |
| Order A→B→C→D | Put a multi-day unmeasurable refactor ahead of the only high-volume surface. Reordered. |
| The 27 hue-root 404s | **Absent entirely.** Both reviewers surfaced it; measured at 27 of 48. Now item 2. |
| Items B, E, F had no criteria | B and E folded into the hygiene sweep with a durable guard; F given a real threshold (<5 sessions ⇒ delete the cron). |
| Retention not mentioned | At n=3, losing one is ~32% of MRR. Added as item 5. |
