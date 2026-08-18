# Human TODO — ColorArchive

> Things the autopilot can't do. Jason handles these when he picks up the project.
> Last updated: **2026-08-18** — 付费面 A 类交付。**最急的一条:后端要部署** —— 在那之前,
> 取消订阅仍会当场收回客户已付费的时间,而 /support 和 /account 两处都书面承诺了不会。
> 另外还有 LS 后台的 Team 变体、退款政策冲突、packs 三封邮件的去留。
>
> 2026-08-16 (weekly roundup drafted — first real changelog since Jul 26.
> **New and time-sensitive: any Complete Archive customer is holding a bundle with 70
> colors missing from four of its exports and needs a re-download note.** Off-repo copies
> of the old counts still need a sweep.)

## ⚠️ 2026-08-18 — 付费面 A 类做完了,四件事只有你能做

全部细节见 `docs/paid-surface-phase-a-2026-08-18.md`。这四条我做不了:

### 1. 后端要部署(**优先**,本轮改动一半在 server/)

改了:`entitlement.js`(新)、`pricing.js`(新)、`routes/webhook.js`、
`routes/apple-notifications.js`、`email.js`、`email-scheduler.js`、`scripts/conversion-digest.cjs`。

scp 到 droplet → `pm2 restart colorarchive-server` → 验 `/health` = 200。

**在部署之前,取消订阅仍然会立刻收回客户已经付过钱的时间**(见下)。
本地 `better-sqlite3` 原生模块和当前 Node 版本不匹配,所以带 db 的模块只做了
`node --check` 语法校验 —— 部署后请确认 `/health` 与一条真实 webhook 日志。

### 2. Lemon Squeezy 后台:确认没有 Team 变体

代码里的 Team Pro 幽灵 SKU(¥1,499/月 · ¥11,999/年)已删干净。但 LS 是**托管结账页**,
变体列表在他们后台。**如果那上面还挂着一个 Team variant,它依然可买** —— 而站点这边
没有任何东西认识它。这是唯一剩下的路径,只有你能看。

### 3. 退款政策:两处文案直接冲突,得你定

| 页面 | 说法 |
|---|---|
| `/support` | "We offer a **7-day money-back guarantee** on all Pro purchases." |
| `/commerce-disclosure` | 数字商品**概不退款** |

我没有替你选 —— 这是政策不是 bug。定了之后两处一起改。

### 4. packs:重建店面,还是彻底退役?

`00d7a04` 删掉了 `palette-packs.ts` 和所有 `/packs/*` 页面,只留了 301 到 `/pro/`。
但 **day 3/7/14 三封邮件还在报价卖它们,而且互相矛盾**(Palette Pack Vol. 1
day3/7 报 ¥599、day14 报 ¥499;Complete Archive day7 报 ¥2,499、day14 报 ¥2,799)。
free-pack 欢迎邮件还在向**每一个新订阅者**报价 ¥2,799 的 All Access Bundle。

我做了最小处置:free-pack 里那段升级块**删掉**;三封报价邮件用
`PACK_PRICE_MAILS_ENABLED = false` **暂停**(翻回 true 即原样恢复)。
day 21/30 只链接不报价,**故意没动**(能跳转的 301 不是死链)。

**要你决定的是:把店面建回来,还是把这三封彻底退役。** 履约不受影响,老买家照常能下载。

---

## ⚠️ 2026-08-16 — Complete Archive buyers may need a re-download email

`0b89daf` and `d19fd68` fixed two defects in the ¥2,499 Complete Archive bundle:
four flagship exports rebuilt the archive from HUE × LIGHTNESS × CHROMA and so
held **5,376** colors with all **70 neutral greys missing**, and four shipped a
literal `${ARCHIVE_SIZE}` in their header comment. Both are fixed, regenerated,
and now guarded by `assertBundleIntegrity()` before the zip is written.

Verified independently this run: the JSON parses to 5,446, the CSS holds 5,446
custom properties, and the bundle is free of un-interpolated `${`.

**What only you can do:** check the prod DB for Complete Archive orders. Anyone
who downloaded before 2026-08-15 has the bad file.

- **If there are buyers** → email them that the bundle was regenerated and ask
  them to re-download. They paid for 5,446 colors and four of their export
  formats shipped 5,376.
- **If there are none** → nothing to do; close this item.

Deliberately kept out of the Facebook post. A public "our paid bundle was
missing 70 colors" is a confession to an audience that mostly didn't buy it; the
right channel is a direct note to the people actually affected.

## 📮 2026-08-16 — weekly roundup is drafted and unposted

`docs/daily-posts-queue.md` → **Weekly Roundup — 2026-08-16**. FB + X copy, every
claim verified against code and the live site (all ten new collection URLs return
200; counts read from the modules: 5,446 / 261 / 333 / 44). X variant is 276
characters and URL-free.

Nothing has been published — the queue is manual-post-only and an unattended run
does not publish to a public Page. Review and post when you're ready.

**Standing exclusion recorded in the queue:** `/20040303/` (`bf331d8`) is private
and `noindex` and must never enter public copy. It is in the commit log as a
`feat(...)`, so it will keep looking like a launch to anything reading only the
log.

## ✅ 2026-08-10 — the hover/dark specificity backlog is cleared (74 → 0)

All 33 components fixed by inserting a `dark:hover:*` partner beside each
resting `dark:*` value. `src/lib/__tests__/dark-mode-classes.test.ts` now asserts
zero rather than ratcheting.

**One thing left deliberately alone.** Two of the house hover conventions produce
a change too subtle to perceive on a dark panel:

| resting | hover | contrast change |
|---|---|---|
| `dark:bg-white/5` | `dark:hover:bg-white/10` | 1.17:1 |
| `dark:bg-neutral-100` | `dark:hover:bg-neutral-300` | 1.09:1 |

Both are already used across the codebase — nine and thirteen files respectively
— so they were followed rather than improved. Changing them only where this pass
happened to touch would leave two conventions side by side, which is worse than a
uniformly weak hover. If you want them stronger (`/15` and `neutral-400` measure
1.37 and 2.37), it should be one deliberate pass over every use.

## ✅ Both editorial items are done (2026-08-10)

**Guide titles** — 327 of 333 ran past the SERP cut. Not truncated: each title
already carried its own keyword phrase before a colon or a connective, so the
`<title>` is now the shortest such phrase that no other guide has claimed
(src/lib/guide-seo-title.ts). 327 over-length -> 12, zero duplicates, median 43.
The on-page H1 still shows the full title.

**Ten shadowed collections** — they shared ids with live ones and rendered at no
URL. Each now has an id and title describing what it actually is: Golden Hour
Amber, Magic Hour, Nordic Ice Light, Midnight Botanicals, Aged Copper & Bronze,
Desert Last Light, Marine Depth, Abyssal Bioluminescence, Autumn Russet & Gold,
Shinrin-yoku. 251 -> 261 collections. Tests now fail the build on a duplicate id
OR a duplicate title.

## ✅ 2026-08-10 — Design Notes is retired. Here is the number that decided it.

The report fired on schedule. Over the full 14 clean days:

| | |
|---|---|
| sessions that saw the signup form | **292** |
| signups | **0** |
| true rate, 95% confidence | **under 1.0%** |

That is an answer, not an absence of one. The form was viewability-gated — 292
people had it in view for a continuous second — and a weak headline still earns
1–2%. Zero out of 292 is the format, not the pitch, and the rule-of-three ceiling
says the best case is under one in a hundred.

Consistent with everything else this audience has done: the recruitment banner on
/word-to-color/ took 3,857 impressions for ~0 responses, and the whole site has 8
email subscribers after months.

**What changed**

- The weekly drafting routine is PAUSED, not deleted — the reason is in its name
  on claude.ai/code/routines, and flipping `enabled` back on restores it.
- The slot on guide detail pages now carries the guide's own tool links instead.
  That is the action these readers demonstrably take: 19 tool clicks against 0
  subscribes over the same window, and those links were 404ing for a third of
  guides until last week, so the real rate should be better than 19.
- Nothing was destroyed. W31 stays approved and unsent, the sender still works,
  `design_notes_deliveries` is still empty. If you ever want the format back, the
  pipeline is intact.

**If you disagree** — the opposite reading is that the pitch was wrong and
deserves one more fortnight with new copy. I took the other branch because 0/292
does not look like a copy problem. Re-enabling is two clicks.

## 🤝 Resend key in the routine prompt — owner-acknowledged, not an open action

The `support-email-responder` routine embeds a live Resend API key as a literal
in its prompt. Owner reviewed and decided on 2026-08-10 not to rotate it.

Recorded so it stops being re-raised every audit. If that changes: rotating means
updating `server/.env` on the droplet too, since it is the same key.

## 📤 2026-08-12 — the off-repo sweep, actually checked. Most of it was wrong.

The previous version of this section was a **list of assumptions**, written without
opening a single listing. Each one is now verified against the live page. Four of the
six were already correct; the one real defect was somewhere nobody had looked.

| where | what it actually says | verdict |
|---|---|---|
| App Store description | "5,446 colors", "9 families" | ✅ **already correct.** The other figures ("10 professional tools", "6 formats", "20+ collections") describe the iOS app, not the website — the old entry confused the two. Changing it needs a whole new version submission. **Leave it.** |
| Figma Community description | "5,446 algorithmically curated colors" ×2 | ✅ **already correct** |
| Figma plugin *name* | "ColorArchive — 5,400+ Curated Colors" | ⚠️ true but understated; the name comes from the manifest, so changing it is a code publish → full re-review. Not worth it for 46 colours. |
| VS Code `package.json` | "5,400+ curated colors" | ⚠️ same trade: republish triggers re-review |
| **Indie Hackers product page** | **"3,066 curated colors"** ×2 (tagline + description) | ❌ **genuinely stale — 44% below reality.** Free to edit, no review. **The one worth doing.** |
| **X bio (@ColorArxiv)** | "5,000+ named colors" and **`colorarchive.me`** | ❌ the count is understated, but **the website link is the pre-migration domain**. It 301s to .org today, so it works — it is just wrong, and it depends on a redirect being kept forever. |
| AlternativeTo | 404 | never listed. The "pending since 04-02" note was optimistic. |
| SaaSHub | HTTP 522 | site down at time of checking; recheck later |

Useful thing found while checking: your own 2026-06-10 IH post records that for Figma,
**"listing text/images don't re-trigger review"** — only code publishes do. So listing
*copy* is always safe to edit there; only the manifest-derived name is not.

**Two edits are yours** (both need a login, neither needs a review):
1. IH product tagline + description: `3,066` → `5,446`
2. X bio: `5,000+` → `5,446`, and `colorarchive.me` → `colorarchive.org`

## 🔴 2026-08-12 — the paid Complete Archive bundle was shipping 5,376 colours, not 5,446

Found while checking whether the "5,400+" marketing line was safe to make exact. It
was not: **the ¥2,499 bundle was missing all 70 neutral greys**, so "5,400+" was an
overstatement of what buyers received.

Root cause: four of the flagship exports rebuilt the archive from
`HUE × LIGHTNESS × CHROMA` (48 × 14 × 8 = 5,376) instead of reading the `colorMap`
that the other exports use — and `colorMap` is the one with the `!== 5446` assertion
on it. So the bundle contained **two different colour sets depending on which file you
opened**:

| file | before | after |
|---|---|---|
| `complete-archive-all-colors.json` | 5,376, zero greys | **5,446** |
| `complete-archive-all-colors.css` | 5,376 | **5,446** |
| `complete-archive-tailwind-tokens.css` | 5,376 | **5,446** |
| `complete-archive-scss-maps.scss` | no grey maps | **+5 grey maps** |
| swift / xml / dart / figma / framer | 5,446 already | unchanged |

The bundled README was worse: it described the archive as
`36 hues x 14 lightness levels x 4 chroma bands = 2016 colors`. Every number in that
sentence was wrong. Labels now interpolate from the catalogs, so they cannot say 2016
again.

**Nobody has to be told, because nobody bought it.** Both outside reviewers advised
sending a "we've completed the bundle" email; I checked the orders table before
drafting one. All eight orders the site has ever taken:

| pack | orders |
|---|---|
| `pro-monthly` | 4 |
| `seasonal-spring-2026` | 4 |
| **`complete-archive`** | **0** |
| **`all-access-bundle`** (delivers the same zip) | **0** |

Zero test orders, zero refunds. So the defect was real and shipped, and its blast
radius was nil. No customer has been contacted and none needs to be. Worth keeping in
view when weighing how much to invest in the paid packs at all: the ¥2,499 product has
never sold a copy, and the only things that have sold are a ¥499/mo subscription and a
¥9-tier seasonal pack.

## 📮 2026-08-09 — weekly roundup drafted; the in-repo number fixes are done

Drafted in `docs/daily-posts-queue.md` under **Weekly Roundup — 2026-08-09**. **Nothing was
published** — same reason as last week: this file is manual-post-only by convention, and
publishing to the Facebook Page is a public, irreversible action I won't take unattended.

**The number correction matters more than the post.** The 2026-08-08 audit found three
user-facing surfaces claiming **25, 25 and 23+ tools** against an array that actually held
**44**, and `llms.txt` claiming **360+ guides** against a real **333**. We were selling
ourselves short on tools and overstating guides simultaneously. Both now interpolate from
the data and are locked by `src/lib/__tests__/content-links.test.ts` (10/10 green), so they
can't drift again. Two follow-ons for you:

- **The Jul 26 post went out saying "43 free tools."** Real count is 44 — that entry
  miscounted the same array. Too small to warrant a correction post, but the number is
  wrong in a published post, and anything reusing that copy should say 44.
- **Anywhere off-repo that quotes these counts is still wrong** — the test only guards
  files in this repo. App Store description, Figma plugin listing, directory submissions
  (IH / SaaSHub / AlternativeTo), and social bios are all outside it. Worth a sweep.

**Second no-release week in a row.** 8 commits, all repair: the audit's three fix batches
plus the retired-`/tools/*` redirects and the Design Notes decision cron. So the draft is
again a spotlight, not a changelog — this time **Tailwind Color Finder**, verified in code
this run (hex → top-5 nearest classes by CIEDE2000 ΔE, copy chips, full v4 palette, each
color cross-named into the archive; palette generated from the installed Tailwind OKLCH
definitions, not hand-typed). It's been mentioned once ever, buried in the Jul 26 list.

To decide: (1) **post it or skip** — third spotlight in four weeks, and spotlights with no
release behind them have diminishing returns; skipping is fine. (2) **The repair work is
deliberately not the public lead** — "we fixed 137 dead links" is a confession, and it'd be
the second self-correction post running after last week's privacy item. Only the redirect
line made it in, as housekeeping at the foot of the post. (3) **X variant stays URL-free**
(~$0.015 vs ~$0.20 per post). Note the **2026-08-10 Design Notes decision mails tomorrow** —
you may want to hold the post until that lands, in case it changes what's worth saying.

## 📮 2026-08-02 — weekly roundup drafted, awaiting your approval before posting

Drafted in `docs/daily-posts-queue.md` under **Weekly Roundup — 2026-08-02**. **Nothing
was published** — this file is manual-post-only by convention, and publishing to the
Facebook Page is a public, irreversible action I won't take unattended.

The thing worth your attention: **this week had no user-facing release.** 27 commits,
all internal (identity/rate-limit bug, crawler filtering, AI gate, `:3002` email vector +
firewall, backup runbook, CI). Zero new colors, tools, collections or guides — the tool
count is still 43, same as the Jul 26 post claimed. So the draft is deliberately **not** a
changelog; it's a single-topic spotlight on the Delta E explainer pointing at `/compare/`
(verified: that page really does show CIEDE2000 and CIE76 side by side).

Three things to decide:

1. **Post it, or skip the week?** A tool spotlight with no release behind it is defensible,
   but skipping is also fine — there's no news pressure here.
2. **Design Notes has 0 subscribers.** W31 was approved but has no recipients, so no mail
   went out. The recruitment slot has been live on guide detail pages since Jul 25; ~382
   guide views over five clean days → 0 signups. That's a conversion problem, and another
   weekly post won't move it. Worth deciding whether the format continues.
3. **The X variant must stay URL-free** — a link takes the per-post API cost from ~$0.015
   to ~$0.20, which is what drained the credits in May.

## 🚨 2026-07-26 (remote) — our analytics had been silently dropping writes for four months

**Nothing to do here, but you should know what changed.** Deployed and verified end to end.

nginx never set `X-Forwarded-For`, so with `trust proxy = 1` every caller looked like
`127.0.0.1` and **every per-IP rate limit in the API was one bucket shared by the whole
internet.** Proof: `ai_usage` held exactly 2 identifiers across all of 2026-04-02..07-26,
and both hashes match the two loopback addresses byte for byte.

What it actually cost us — not the AI feature:

- ~~1,025 analytics writes from real browsers were rejected with 429~~ — **I OVERSTATED
  THIS AND AM RETRACTING IT.** An audit re-ran the logs: 1,024 of those 1,025 came from a
  SINGLE address on a SINGLE day (174.173.86.177, 20 Jul), and that address sent 5,561
  analytics writes in total. It was a flood machine and the limiter was doing exactly its
  job. The entire 14-day window contains **one** other 429. So our funnel numbers are **not**
  meaningfully understated by lost writes, and you should not treat pre-07-26 rates as a
  floor on that basis. What remains true and is separately proven: the buckets really were
  collapsed for four months (two loopback hashes matched byte-for-byte), and `/auth/verify`
  really was a site-wide login DoS.
- `/auth/verify` was a **site-wide magic-link login DoS**: its key collapsed to a
  constant, so 5 verifications per 15 minutes was the ceiling for everyone, and one
  actor could have held all users out. No sign anyone did.
- Port **3001 answered 200 straight off the public internet** (ufw inactive), so nginx
  was bypassable — which by itself defeated every rate limit here. Now bound to
  loopback; verified refused from outside.

Verified after deploy: `/health` reports `proxyHeaders: "ok"`, a **new per-IP bucket
appeared** (2 → 3, first in four months), **zero 429s** in the following 500 requests
with 82 analytics writes succeeding, payment webhooks still 401-on-unsigned, AI returns
200 in 1.8s (was 10.2s).

### Two things worth your attention

1. **I nearly broke a paid promise and backed it out.** I had drafted a 50/day cap for
   Pro's AI (it was `Infinity`, which is real cost exposure). Codex caught that
   "unlimited AI" is written into the **Terms of Service**, the Pro page, the upgrade
   modal, both languages of sales copy and two emails. Silently capping our one paying
   subscriber would have been a broken contract she'd have discovered from a 429.
   **Pro stays unlimited.** Containment is a burst limiter + a global $0.50/day spend
   breaker instead — a system-wide safety valve, not a per-account quota.
   → If you ever *do* want a Pro cap, set `AI_PRO_DAILY_LIMIT`, but **change all six
   copy locations in the same deploy.**
2. **`GOOGLE_AI_API_KEY` is still shared with OpenClaw** (`~/Documents/credits.md`).
   Per-project spend attribution is impossible, a runaway on either side degrades the
   other, and the new spend breaker is per-process so it cannot see OpenClaw's usage.
   → Worth a separate key for ColorArchive when convenient. Not urgent at $0.02/month.

### ~~Still open (needs code, not you)~~ — DONE, same day

The AI gate is now measurable and, more importantly, **can now return a verdict of
"delete it"**. Two things you should know:

**1. Your Monday email changes.** `gate-report.cjs` (Mondays 09:00 UTC) was about to
send another PROCEED/STOP verdict on the Auditor — the product cancelled on 07-20.
It now carries the AI gate instead. Subject line becomes
`[ColorArchive] AI gate: <verdict> — impressions N/150, requests N`.
The acquisition funnel numbers are still in there, labelled as context only.

**2. The gate can fail, which the first two versions could not.** §8 originally
needed ≥100 successful AI generations before it would judge whether generations
happen — and the observed peak is 13/month. No demand meant no verdict, forever.
That is the same mechanism that kept the Auditor alive for months. It is now a
one-sided binomial test: **if ≤1 of the first 150 people who actually see the AI
module click it, that deletes the feature** (p=0.010 at zero clicks). You can check
the threshold by hand: n=150→1, 200→2, 250→3, 300→4, 400→7.

**Correction — I said "roughly two weeks" and that was wrong.** I sized it off
colour-detail's 6,133 views/30d, which we now know was ~97% crawler. On the first
clean day `/colors/*` took **18** human pageviews, not ~200, and the AI card sits
~1,500px down a 13,000px page. Measured so far: **3 distinct sessions have seen it
in ~1.5 days**. At that rate n=150 is **~75 days — a verdict around early October**,
not mid-August.

The gate is still sound; it is just slower than I told you. It is also already
working — real traffic has produced `ai_module_impression`, `ai_generate_click` and
`ai_generated` since the instrumentation went live, so the pipeline is proven end to
end. Whether to speed it up (move the module above the fold, or judge on a surface
where humans actually are) is a call for the next phase, and the plan covers it.

Run it yourself any time:

```bash
ssh root@143.198.85.72 'cd /root/ColorArchive/server && node scripts/ai-gate-report.cjs'
```

### ⚠ Your traffic number has been wrong, and it is about to look like a crash

Measured over 14 days of nginx logs: **7,567 of 26,420 analytics writes (≈29%) came
from self-identified crawlers** — AhrefsBot 3,438 and accelerating to ~750/day,
Baiduspider-render 3,404, bingbot 1,258. A separate single IP wrote 2,781 pageviews
+ 2,780 events behind an ordinary desktop Chrome user-agent. Both are now filtered.

**So from 2026-07-26 the daily row counts in `events` and `pageviews` drop.** Two numbers,
because they measure different things and I ran them together at first:
- **~31% of REQUESTS** are now dropped — measured in the first clean window, 12 of 39.
- **~22% fewer ROWS**, which is the figure that matters for any denominator. Lower than the
  request number because a large share of crawler requests were already being rejected as
  malformed and never became rows anyway.

That is a correction, not a collapse. Do not compare a window after today against one
before it without accounting for the boundary — the reports warn you when a window
straddles it.

The honest summary is therefore narrower than what I first told you: our funnel numbers
were **inflated by bot writes**, not also missing a thousand real ones.

### Privacy policy was wrong, and I fixed it — worth a read

I was about to add more analytics on top of an analytics stack the policy never
mentioned, so this came first. Live before today: **PostHog, Sentry and the Google
Gemini API were named nowhere**, and §11 stated outright that the iOS app used no
third-party analytics SDK — while `AnalyticsBootstrap.swift` line 3 is
`import PostHog`, and that sentence is tied to our App Store privacy labels.

The one that actually mattered: **users type brand briefs and mood descriptions into
the AI tools and that text goes to Google.** A reader of the policy had no way to
know. Now disclosed, with a plain-language "don't put confidential information in
these tools" line.

Also fixed in the cookie policy: it claimed localStorage data "never leaves your
device unless you are logged in" (untrue since PostHog shipped) and still listed
**Stripe**, months after Lemon Squeezy replaced it.

Nothing for you to do unless you disagree with any wording: `/privacy/` and
`/cookie-policy/`, both now dated July 26, 2026.

### 🔴 ROTATE THE RESEND KEY — found 2026-07-27, only you can do it

Your `support-email-responder` cloud routine has the **Resend API key written in
plaintext inside its prompt**. I compared fingerprints without printing either value:
it is byte-identical to the `RESEND_API_KEY` in `/root/ColorArchive/server/.env` —
which is also the key stride-server uses.

So one key now lives in: ColorArchive's `.env`, stride's `.env`, a cloud routine
prompt stored on Anthropic's side, **and this conversation's transcript**, because
listing the routines printed it here.

Treat it as compromised and rotate it. That is a Resend account action, so it is not
mine to do. Two things to change at the same time, or the new key lands right back in
the same hole:

1. **Stop the routine needing a key at all.** It already has the Gmail connector
   attached and already uses `gmail_create_draft` for anything complex — so it can
   send through Gmail instead of curling Resend with an embedded credential. I did
   not change it myself: it sends real mail to real customers, and switching how that
   goes out is your call, not a cleanup I should make quietly.
2. While you are in there: that routine still targets `support@colorarchive.me` and
   links `colorarchive.me` URLs throughout — the pre-migration domain.

### 🔒 Security — one fixed, one still yours (2026-07-27 audit)

**1. ~~`stride-server` on :3002 is an unauthenticated email-send vector~~ — FIXED
2026-07-27.** Recording what it was, because the shape is worth remembering:

`stride-server` set `trust proxy 1` while listening on `0.0.0.0`, so on the direct
port `req.ip` was whatever the caller claimed. Proven with read-only GETs: the same
forged `X-Forwarded-For` decremented one bucket (99 → 98), a different value got a
fresh 99. That made **every** per-IP limiter there a no-op — including the 3-per-15-min
gate on the unauthenticated `POST /auth/request-link`, which sends mail via Resend on
**the same API key ColorArchive uses**. Anyone who found port 3002 had an unmetered
mail sender, and the damage would have landed on us: burn that key and our magic-link
login and transactional email stop.

What I did, lowest-lockout-risk first:
- **Bound stride to `127.0.0.1`** (`index.js`, same `BIND_HOST` pattern as
  ColorArchive; backup at `/root/stride-index.js.bak.*`). nginx already fronted it at
  `stride-api.colorarchive.me` and already set X-Forwarded-For correctly, so this cost
  nothing. Verified after: the domain still returns 200, direct `:3002` refuses, and
  **forged XFF no longer works** — three requests with two different forged values
  decremented one bucket continuously (98 → 97 → 96).
- **Enabled ufw** (allow 22/80/443, default deny incoming, enabled at boot). Before
  touching it I enumerated every listening socket: only 22, 80 and 443 were externally
  bound; 3001, 3002, 5000, 5001, 5012, 8126 and 53 were already loopback. I installed a
  5-minute auto-`ufw disable` dead-man's switch first in case I locked us out, verified
  SSH on a fresh connection plus every service, then removed it. Verified after:
  ColorArchive API 200, stride API 200, site 200, payment webhook 401, port 80 still
  301s, and :3001/:3002/:5000/:8126 all refuse from outside.

**Still yours to do, but no longer urgent:** the two apps share one `RESEND_API_KEY`.
That is now a blast-radius concern rather than an open hole — the mail endpoint is
properly rate-limited again. I can't create the second key for you (it's an account
action on Resend), but when convenient: issue a separate key for stride and swap it in
`/root/stride-server/.env`.

**2. `server/.env` exists only on the droplet.** It is gitignored, absent from the
Mac, and covered by no backup. `.env.example` documents 19 of the 29 live keys —
missing ones include **both Lemon Squeezy payment secrets**. The database is backed
up; the credentials that make it a business are not. If the droplet died today you
would keep the data and lose the ability to take money. Same for
**Correction to what I said earlier about the backup script:** a copy WAS in git —
just the wrong one. The tracked copy was an April generation at the repo root; the
one root's crontab actually runs was a July rewrite living only on the droplet. The
consequence was real: `docs/backup-runbook.md` documented gzipped
`colorarchive-*.db.gz` snapshots, and **zero such files exist** — the live script
writes uncompressed `data-*.sqlite`. Following the runbook during a real restore
died at step 5. Now fixed: the live script is committed at
`server/scripts/backup-sqlite.sh`, the stale root copy and its README (which pointed
at `/root/colorarchive-api/`, a path dead since the domain migration) are deleted,
and the restore + drill commands are corrected and **tested on the droplet**
(`integrity_check` → ok, 14 users). Your actual protection was never at risk: 76
offsite copies on the Mac, newest 19M, integrity ok.

### ⚠️ Two scheduled things that will misbehave, but not urgently

**~~Design Notes has no sender cron~~ — FIXED 2026-07-27.** The drafting routine wrote
to `docs/design-notes/` in the repo; the sender read a directory on the droplet;
nothing carried the file between them, and that directory did not exist. The first
approved issue would have gone nowhere.

Now wired: `server/scripts/send-design-notes-cron.sh`, cron **Fri 10:00 UTC** — the
draft lands Thu 01:00 UTC, so you get ~33 hours to approve. It stages the issues
straight out of `origin/main` using `git fetch` + `git archive`, which write only to
`.git` and stream from the object store — **it never touches the droplet's working
tree**, because that tree IS production here and a `git pull` would have silently
reverted the rate-limit fixes. Verified after a live dry run: HEAD still 6caeded,
32 local modifications intact, today's fixes all still present.

Dry run output: `staged 1 issue file(s)` → `no approved issues (drafts are skipped by
design)`. So it is live and will keep doing nothing until you flip a
`status: draft` to `status: approved`. **The approval is still the only thing that
can send mail** — running on a schedule cannot cause an unapproved send.

**`daily-traffic-check` has a stale baseline.** Its SKILL.md hardcodes "真实流量基线约
160 PV/天" and flags ">500 PV" as a possible bot anomaly. Actual traffic is ~1,300
PV/day, so that anomaly rule has been firing every single day for over a week, and
after today's bot filter it will read the drop as a decline. Worth a 1-line update
next time you touch it.

**One thing that does need you — 2 minutes in the PostHog console, no code.**
The project has `session_recording_opt_in=True`, `capture_console_log_opt_in=True`
and `anonymize_ips=False`. Replay is off *only* because of a client-side flag in
`src/lib/posthog.ts:68`, so the policy sentence "Session recording is disabled" is
true today but one bad deploy from being false. Flip all three at the project level
(recording off, console capture off, IP anonymisation on) so the written promise is
structurally guaranteed rather than depending on a line of our code:
us.posthog.com → project 456902 → Settings.

**Also cleaned up, and worth knowing because it was in the database:** the AI brand
generator was storing what people typed. Real rows included
`"Health & Wellness + Tech (Wearable Technology)"` and
`"salt air, glass water, seafoam"` — somebody's actual creative brief, kept
first-party and forwarded to PostHog. Removed; the gate never read those fields.
The historical rows are still in `events` if you ever want them purged.

## 📣 2026-07-26 (autopilot) — weekly roundup queued for manual posting

> The Jul 19–26 roundup is written and waiting in `docs/daily-posts-queue.md` under
> **Weekly Roundup — 2026-07-26** (Facebook + Twitter/X copy). Unlike the last two weeks,
> this one is a **real changelog**: 10 new tool routes, CIEDE2000 ΔE in /compare/ and
> /name/, OKLCH/Lab in /convert/, and iOS v1.3 live. Every number in the copy (including
> "43 free tools") was verified against the code, not the commit messages.
>
> Not auto-posted — the queue file is explicitly manual and publishing is owner-authorized
> only.
>
> **Your items:**
> - [ ] **Post the roundup to the Facebook Page and X** (copy is ready to paste; ~2 min).
>       Worth pinning — it's the first post in three weeks with real news in it.
> - [ ] Optional: a second, standalone Screen Test post later in the week. It's the
>       strongest SEO-intent tool of the batch and it's currently buried in a 10-item list.

## 🎯 2026-07-25 (remote) — conversion P0 shipped + a dead unsubscribe fixed

> Executed docs/dev-plan-2026-07-24-conversion.md P0 (commit f4170cd):
> - **Email capture on the two biggest sections** — guides (8,398/mo) → a new weekly
>   **Design Notes** list; color-detail (6,133/mo) → the existing daily color, in the slot
>   the cancelled Auditor CTA vacated. Placed after the content, never popups.
> - **Instrumented what was blind**: guide_tool_click on the 317 existing guide→tool links,
>   pro_cta_click on every /pro/ CTA, email_subscribed{source,list,isNew}.
> - **Survey banner off** (3,857 impressions/30d for ~0 returns on our best surface).
> - **⚠️ Found and fixed: /unsubscribe did not exist.** Every marketing email we've ever
>   sent — including the daily color going out right now — linked to a 404. Route + API +
>   page now live; opt-out is POST-only so inbox scanners can't unsubscribe people.
>
> **Design Notes delivery is human-gated by design.** A weekly cloud routine drafts an
> issue into `docs/design-notes/` (status: draft) and pushes it; nothing can be mailed until
> a human flips it to `status: approved`. See docs/design-notes/README.md.
>
> **Your items:**
> - [ ] **Each week (~1 min): read the drafted Design Notes issue** and either tell Claude
>       "approve it" or edit it. First draft arrives Thu 2026-07-30. If you'd rather not do
>       this weekly, say so — the alternative is dropping the guides hook back to the daily
>       color, which needs no approval.
> - [ ] Optional: routine settings at https://claude.ai/code/routines

## 🎯 2026-07-24 (remote) — Auditor pre-orders CLOSED (bleeding stopped)

> The cancelled Accessibility Auditor was still being sold: its CTA was live in 8 placements
> across 7 pages plus a /pro/ promo, and **3 people reached the ¥4,999 checkout in 30 days**.
> All shut down (commit d9fed32):
> - **Lemon Squeezy product 1146653 unpublished** — API-verified `status: draft`, public
>   checkout URL now returns 404. (Done merchant-side FIRST: the checkout URL is a build-baked
>   NEXT_PUBLIC_ env var, so code alone would have left a window where money could still land.)
> - All 8 CTAs + the /pro/ promo removed; `preorderConfig.closed` is a hardcoded kill switch
>   (clearing the env var alone would have fallen back to "reserve your founder price").
> - `/preorder/` is now an honest closed page — explains the bar, that it wasn't met, that
>   nobody was charged, and routes to the free tools that did ship.
> - Verified live on all 7 pages: zero pre-order CTAs remain.
>
> **Nothing for you to do here.** Next up is the rest of docs/dev-plan-2026-07-24-conversion.md
> (email capture on guides + color-detail, Pro CTA instrumentation) — it needs your 4 answers
> in §6 first, except the ones I can decide alone.

## 🎯 2026-07-21 (remote) — tools cycle shipped, what's left is decisions + data

> **Web tools expansion is code-complete** (commits d025419 → 09f224f → a2507c7 → 4d01923):
> screen-test suite (hub + dead-pixel + color-screens + gamma/banding/sharpness + archive
> color-distance + hue game + guided wizard with shareable report card), OKLCH/Lab in /convert/,
> ΔE in /compare/, /tailwind-colors/, /css-filter/, /color-wheel/, colorblind safe-fixes,
> /color-temperature/, /dark-mode-colors/, /duotone/, /paint-mix/, /name/ ΔE top-5.
> vitest 671/671. Every batch adversarially reviewed pre-commit (17 real bugs fixed, 6 false alarms).
>
> **Your items:**
> - [ ] **~2026-08-20: 30-day tools review** — GSC (screen-test/tailwind/css-filter query families)
>       + PostHog qualified actions (screen_test_completed, downstream_click, trial attribution)
>       per dev-plan-2026-07-20 §4 Phase 3. Ask Claude to run the复盘 — the decision rule is
>       qualified actions, NOT impressions.
> - [x] **iOS v1.3 IS LIVE (approved 2026-07-22, READY_FOR_SALE)** — Hue Challenge game
>       (web-parity verified) + typed AI errors + ASO refresh (subtitle "Palettes, Contrast
>       & Hex Codes", keywords rebuilt 94B). Auto-released via AFTER_APPROVAL; submission
>       `9d63d863` COMPLETE. Nothing left to click.
> - [ ] **~2026-08-12: iOS 3-week data gate** (clock started 07-22) — pull ASC analytics
>       (ONGOING request `dda726fa`) + PostHog hue_game events. Thresholds (pre-registered):
>       daily downloads ≥10 / game completion ≥30% / share-intent ≥10% → invest / maintain / shrink.
>       Ask Claude to run it.
> - [ ] Optional: fresh App Store screenshots featuring the Hue Challenge (skipped in v1.3 for
>       budget — worth doing if the game shows any traction).

## 🎯 2026-06-29 (remote) — multi-platform review + gate-safe fixes shipped
> Ran a multi-model review (Claude agents + **Gemini 3.1 Pro + 3.5 Flash** via the Google AI API
> key — the `gemini` CLI is dead, `IneligibleTierError`) across all 5 platforms + competitors →
> `docs/review-2026-06-29-multiplatform.md`. Then executed the gate-safe DO-NOW items one-by-one
> (each typecheck/build + Gemini 3.1 Pro reviewed). **Finding: the review was partly stale** — e.g.
> color-detail already had the Auditor CTA + colour-blind sim (06-24), the AI rate-limit "race" was a
> false positive (better-sqlite3 is synchronous), and most DB indexes already existed. So I verified
> every item against real code and only shipped genuine ones.
>
> **Shipped (commits 969ae93, 9d7586f, 6caeded + this one):**
> - **Web:** palette-audit results CTA; checkout funnel events (success/cancel/impression); real
>   **APCA-W3 0.1.9** in the contrast checker (was approximate); **archive-sourced auto-fix** for
>   failing pairs (the moat — a named token, not a synthetic hex); **W3C DTCG** token export with
>   self-documenting `$description`; `/analyze` contrast snapshot → Auditor funnel; generator
>   "Preview on UI" link.
> - **Server (deployed + verify-preorder.cjs 15/15 PASS):** wrapped the order-completed payment
>   writes in `db.transaction()` (atomic); 2 composite gate indexes.
> - **iOS — BUILT + SUBMITTED for you (1.2.1 / build 5, `WAITING_FOR_REVIEW`):** **real StoreKit bug fixed** —
>   `purchase()` finished the transaction BEFORE backend sync, so a failed sync lost the backend
>   record with no retry; now `syncPurchaseWithBackend` returns Bool and both paths `finish()` only
>   on success → StoreKit re-delivers + retries on next launch (local entitlement still granted
>   immediately). Plus email-validation on the login button. I archived + signed + uploaded via the
>   ASC API and submitted (1.2 was READY_FOR_SALE + build 4 already up, so this is the new patch 1.2.1;
>   metadata + 12 screenshots auto-carried from 1.2; release notes written; commit `5fcd0c7`).
>   **Set to `releaseType=MANUAL`**, so it will NOT auto-go-live. **➡️ Your only remaining iOS step:**
>   after Apple approves (~1 day), run **one sandbox purchase in TestFlight** to confirm the StoreKit
>   fix on a real device (the one thing I couldn't test here — code is compile-clean + Gemini
>   StoreKit-reviewed, change is conservative), then click **Release** in App Store Connect. Submission id
>   `b076bd95`. (Ask me to flip it to auto-release-on-approval if you'd rather skip the manual click.)
> - **VS Code:** marketplace description/keywords now mention WCAG/contrast (republish when you like).
>
> **NOT done (your call):** Figma in-plugin "fake-door" Auditor (#9) — high value but **republishing the
> plugin triggers a Marketplace re-review** (your red line), so I held it. The remaining review items are
> mostly post-validation scope (whole-system Auditor, Figma Variables push, CI integration, public API).


## 🎯 2026-06-27 (remote) — Pre-gate hardening P0 (WS-A measurement/fulfillment + WS-B security)
> Executed `docs/dev-plan-2026-06-27-pre-gate-hardening.md` P0. **No Auditor build — gate STOP still holds.**
> All gate_safe (fixed broken wiring + live security holes; no net-new product features, no new ISR/routes).
>
> **WS-A — the pre-order loop now actually measures + fulfills:**
> - **Headline bug fixed:** the Next LS webhook (`app/api/webhook/route.ts`) only forwarded *lifetime*
>   orders → every real ¥4,999 Auditor pre-order was silently dropped (no order row, no receipt, gate
>   stuck at 0). Now it detects the pre-order variant (custom_data.pack_id **or** variant-name match)
>   and forwards to `/webhooks/order-completed`, which writes `is_test`, takes an explicit
>   `attributed_source='preorder'`, skips the bogus download link, returns **500 on DB error** (so LS
>   retries; idempotent on the LS order id), and sends a dedicated **pre-order confirmation** mail.
> - Gate now **excludes test-mode orders** and exposes a **secondary numerator** (distinct email
>   reservers, `subscribers.source='preorder'`). Email reserve form fires `preorder_email_reserve`.
> - **⚠️ Gate semantics changed (please note):** the PROCEED criterion is now **Auditor pre-orders
>   specifically** (`orders.preorder` / `pack_id='preorder-auditor'`), not *all* orders — a stray
>   pack/Pro sale can no longer falsely trip "≥10 real pre-orders". All-orders count still shown as context.
> - Pre-order email form: no longer dumps reservers into the daily COTD list or sends the wrong
>   free-pack mail; dark-mode styling fixed; `/preorder?purchased=1` fires `preorder_purchase_confirmed`.
>
> **WS-B — un-merged security debt from `fix/security-hardening-2026-05-30` cherry-picked to main + deployed:**
> - **SSRF guard** on `/ai/analyze-url` (blocks private/loopback/link-local/metadata IPs v4+v6,
>   per-redirect re-validation, 2 MB streamed cap). Hardened beyond the original (closed an IPv6
>   `::ffff:7f00:1` localhost bypass Codex caught). 7 unit tests.
> - **Apple IAP:** production now rejects unverified (non-JWS) transactions (403) — closes self-grant-Pro.
> - **XFF spoofing:** all rate limiters + `/ai/usage` now key on `req.ip` (shared `getClientIp`), not the
>   spoofable `X-Forwarded-For[0]`.
> - **/subscribe:** per-IP rate limit + 100 kb JSON body cap + welcome mail only on first signup (was an
>   open email-bomb relay / subscriber-table flood vector).
> - B5: old FB token already rotated (see `project_facebook_token_expired`) — **no action needed**.
>
> **Droplet ops:** `server/scripts/gate-report.cjs` is now **version-controlled** (its is_test filter +
> pre-order numerator must stay in sync with `analytics.js`). The droplet had an untracked copy — it was
> removed during deploy so the tracked one takes over. New `server/scripts/verify-preorder.cjs` is a
> repeatable integration test for the loop (run on the droplet; self-cleans its test rows).
>
> **Manual when you flip on card checkout** (`NEXT_PUBLIC_PREORDER_CHECKOUT_URL`): set the LS checkout
> link's post-purchase redirect to `…/preorder?purchased=1`, and ideally add custom data
> `pack_id=preorder-auditor` (+ `attributed_source=preorder`). The webhook also name-matches as a
> fallback, so a missed custom-data field won't drop the order — but the redirect is what makes the
> on-site purchase-confirmed conversion readable in the gate.
>
> **P1 (same session, WS-C — conversion/quality/a11y polish, frontend-only, no droplet):**
> - **palette-audit perf:** a big paste no longer freezes the tab — `audit()` caps analysis to the
>   60 most-used colors (the O(n²) contrast matrix + O(n×5,446) matching were the freeze); a notice
>   shows when truncated. Text-only mitigation added to the contrast list ("all pairwise combinations")
>   — role-aware FG×BG inference stays deferred to post-gate (it's Auditor scope).
> - **ProGate quota:** free daily export was charged on *any* click in the wrapper (and on the upgrade
>   link) — now only a real export control counts, no keyboard double-charge, upsell link moved out.
> - **contrast checker a11y:** results region is now an `aria-live` status; hex/search inputs + archive
>   swatch buttons got accessible names. Pre-order CTA card got a visible keyboard focus ring.
> - Verified: typecheck + build green, **vitest 618/618**. (Codex review was rate-limited this run →
>   self-review + full test suite instead.)
>
> **P2 (same session, WS-D — cost/hygiene, final batch):**
> - **vs pages `noindex`:** `/colors/[a]/vs/[b]` (≈29M on-demand pairs) was indexable — crawlers
>   spidering it drove ISR-write cost ([[reference_vercel_cost]]). Now `robots:{index:false,follow:true}`
>   (still usable for humans; pairs with intent are reached via color pages). `/preorder/` added to
>   robots.ts Disallow (it's meta-noindex + acquires via on-site CTAs/posts, not search — real-user
>   UV is unaffected). These reduce crawler cost; **pre-gate cost red line kept** (no new ISR/routes).
> - **`.env.local.example`:** added `NEXT_PUBLIC_PAYMENT_PROVIDER` + `NEXT_PUBLIC_PREORDER_CHECKOUT_URL`;
>   dropped the stale Stripe comment.
> - **D3:** `send-preorder-broadcast.cjs` is now version-controlled in `server/scripts/` (was droplet-only,
>   like gate-report.cjs). Still dry-run by default; the actual `--send` is held for your approval.
> - `.gitignore` now also ignores `* 4.*` iCloud copies; ~1.9MB of stray `public/downloads/* N.*` dupes
>   removed locally. Verified typecheck + build green.
>
> **Card checkout — it's ALREADY live** (the `NEXT_PUBLIC_PREORDER_CHECKOUT_URL` env var was set back on
> 06-15; I confirmed prod `/preorder` shows the card button, not the email fallback). So there's nothing
> to "flip on" — and that's exactly why P0 mattered: until today a real card pre-order would've been
> silently dropped. While I had the LS dashboard open I also:
> - **Set the LS Confirmation modal** (product → Confirmation modal): button "Back to ColorArchive" →
>   `https://colorarchive.org/preorder/?purchased=1` + a pre-order-accurate title/message. So a buyer now
>   returns to the site and the `preorder_purchase_confirmed` funnel event fires (was: no return at all).
> - **Hardened the webhook detection** (`app/api/webhook/route.ts`): it now matches on `product_name` too,
>   so a real LS order is recognized regardless of how LS names the single variant (e.g. "Default"). This
>   removes any residual silent-drop risk → **`custom_data` is NOT needed.**
>
> **Genuinely remaining (yours):** (1) optionally run one LS **test-mode** purchase to watch the full live
> pipeline record an order (is_test=1, attributed_source=preorder, pre-order confirmation mail) — backend
> already verified via `verify-preorder.cjs`; (2) the distribution sprint to drive real /preorder traffic
> (the gate's real bottleneck); (3) approve `send-preorder-broadcast.cjs --send` if you want it sent.


## 🎯 2026-06-24 (remote) — Phase-2 gate ran = STOP-build; connected the offer to traffic
> Ran the Auditor §0 gate check on the prod DB. **Verdict: do NOT build the Auditor yet**
> (qualified /preorder UV 0 / target 500, paywall 32 / target 1000, orders 0 / target 10;
> /preorder = 0 views EVER). Root cause = the WTP experiment was never connected to traffic:
> the pre-order CTA only sat on `/palette-audit` + `/wcag-audit` (≈0 traffic), while the real
> firehose (`/word-to-color/` 13.4k/10d) had no link to the offer. Commercial loop is LIVE
> (prod /preorder shows a real card pre-order button → real LS order).
>
> **Shipped this commit (code, no Auditor build):** placed the existing `AuditorPreorderCta`
> on `word-to-color`, `color-detail`, `collections` (channel-stamped via `from`). Now real
> traffic can reach the offer; conversions read split by surface.
>
> **Automation shipped (droplet, not in repo — operational scripts like the backups):**
> - **Weekly gate report → your email.** `server/scripts/gate-report.cjs` + cron
>   `0 9 * * 1` (Mon 09:00 UTC). Reuses the `/analytics/gate` SQL + the §0 matrix, emails
>   yyyyy.yeyuhe@gmail.com a verdict (PROCEED/STOP) + numbers + on-site CTA clicks by surface.
>   First report already sent 2026-06-24 (STOP). Fires ~06-29 / 07-06 / 07-13 → covers the
>   07-02 tripwire window and the 07-15 gate. Log: `server/logs/gate-report.cron.log`.
> - **Pre-order broadcast — drafted + ready, NOT sent.** `server/scripts/send-preorder-broadcast.cjs`
>   (dry-run by default; `--send [--source=…] [--to=…] [--limit=…]`). Holding the send for your
>   approval (outward email to real people).
>
> **⚠️ Decision / finding:**
> - **The subscriber list is ~empty: 5 rows total (cotd 2, free-pack 1, test 1, debug 1) — only
>   ~3 real.** So the "email the warm list" lever has ~zero EV right now; nothing meaningful to
>   send to. The real upstream issue: huge anonymous traffic (13.4k/10d) but almost no captured
>   emails — email capture isn't converting. The broadcast is ready to fire the moment a real
>   list exists. **Say "send it" and I'll fire it (you can pick the source segment).**
> - **~07-02 / ~07-15:** read the weekly email (or admin `/analytics/gate`). Rule unchanged
>   (dev-plan-2026-06-19 §5): pre-orders ≥10 → build the Auditor; still ~0 → evidence-based off-ramp.
> - **Optional volume escalation:** if the word-to-color/color-detail/collections CTAs get clicks
>   but few pre-orders, add the CTA to home `/` (1k/10d) and the other browse pages.

## 💸 Vercel cost 2026-06-20 (remote) — diagnosed + 2 fixes shipped
> Owner asked why Vercel cost spiked. Pulled the actual usage dashboard (Pro, billing
> 5/25–6/25): **$73.93 total = $20 Pro + $53.93 on-demand overage.** Drivers, ranked:
> | Item | Usage | $ |
> |---|---|---|
> | Build CPU Minutes | 145 h | **$30.51** |
> | ISR Writes | 4.78M | **$19.13** |
> | Fast Origin Transfer | 199 GB | $12.01 |
> | ISR Reads | 20.65M | $8.26 |
> | Fluid CPU / Func Invocations / Mem | — | $3.90 |
>
> **Root causes:** (1) **~45 production builds since 6/1** of a 4,461-page site → 145
> build-CPU-h. (2) **Crawler traffic × on-demand pages**: 20.65M ISR reads + 4.78M writes +
> 1.03M fn calls + 199GB vs only ~26k human pageviews — almost all bots (incl. AI crawlers;
> saw PerplexityBot). The `/colors/[slug]/vs/[slug2]/` route (dynamicParams=true, ~28
> prebuilt of a ~29M combinatorial space) let crawlers spider color→vs→vs→vs → millions of
> on-demand ISR writes, **re-invalidated on every deploy**.
>
> **Shipped (this commit):**
> - **#1 — `scripts/vercel-ignore.sh`**: blanket-skip ALL `docs/*.md` + `.claude/*` (was an
>   enumerated list that silently built on any new/unlisted doc). Cuts future build count +
>   ISR re-write storms. Safe (build imports nothing from docs/.claude, no .md/mdx; verified).
> - **#2 — vs→vs links `rel="nofollow"`** (`src/components/color-vs-page.tsx`): caps the
>   exponential combinatorial crawl that drives the ISR writes. Color→vs entry links stay
>   followable; users can still click through. Zero deindex / no 404s / reversible.
>
> **Owner levers NOT yet done (need your call — they touch deploy cadence / SEO):**
> 1. **Cut deploy frequency further** — the autopilot's near-daily content roundups + multi-push
>    sessions are the build-cost multiplier (the ignore script only helps metadata-only pushes;
>    content/code pushes still do a full 4,461-page build). Batch autopilot content to e.g.
>    2×/week. Biggest remaining $ lever (~$20/mo). This is autopilot-cadence config (local), not repo.
> 2. **Build "mode" can't be made cheaper** — Vercel's default build container is already the
>    cheapest tier (enhanced machines cost MORE). The only real build-cost levers are fewer
>    builds (above) + fewer pages/build. Moving the 4,461 SSG pages → ISR would cut build time
>    but RAISE ISR writes (the #2 line item) — a wash, not a win. So: reduce frequency, not mode.
> 3. **If ISR writes stay high after #2**: stronger options = `noindex` the non-seed vs pages, or
>    `force-dynamic` the vs route (moves cost from ISR writes → cheaper fn invocations), or
>    robots-disallow `/colors/*/vs/`. All trade against SEO/crawl — pick one if monitoring shows need.
> **→ Re-check SCHEDULED for 2026-06-24 10:00 JST** (one-time task `vercel-cost-recheck-2026-06-24`;
>   runs the deploy-count proxy via Vercel MCP + dashboard if Chrome's up; auto-disables after).

## 📣 Distribution kit 2026-06-21 (remote) → `docs/distribution-kit-2026-06-21.md`
> The actual lever for the 07-15 gate. Hard data: 26k pageviews/30d, ~13k/wk to /word-to-color,
> but **0 /preorder visits ever, 0 orders** — pure distribution gap, not code. v3-aligned kit
> (supersedes the v2 06-15 plan's free-tool→HN hook): **hook = a11y-audit pain → /preorder**;
> **channels = a11y + design-systems communities + direct ICP outreach** (LinkedIn/X DMs, cold
> email). Has ready-to-send DM/email/post copy, an ICP target list, content-post angles, weekly
> quotas (≥40 ICP touches + ≥20 community contributions + ≥2 posts/wk → ~145 qualified UV/wk), and
> **pre-built UTM /preorder links per channel** that auto-attribute in the new `/analytics` gate +
> PostHog dashboard (r/accessibility tagged `a11y-community` so it counts as qualified, not generic
> reddit). Execution is yours (DMs/posts/emails); the prep is done. Tripwire ~07-02, gate ~07-15.

## 🔴 NEW 2026-06-20 (remote) — owner action items (B-meas + D1 done in code)

> This session shipped the two remaining code tracks (B-meas + D1) from the 2026-06-19 dev plan
> (distribution-first, exit-gate validation). **After this, code is done — the rest is YOUR
> distribution (Track A), ~3 weeks to the 07-15 gate.** Three things only you can do:
>
> 1. **Force-refresh social-card caches (~10 min, do before you start posting links).** The OG
>    fix changes what's served, but X/Facebook/LinkedIn cache the OLD card per URL. Paste each
>    URL you'll share into the validators to bust their cache + see the new card:
>    - X (Twitter): https://cards-dev.twitter.com/validator (login required)
>    - Facebook: https://developers.facebook.com/tools/debug/ → "Scrape Again"
>    - LinkedIn: https://www.linkedin.com/post-inspector/
>    Check at least: `/preorder/`, `/word-to-color/`, one `/guides/<slug>/`, one `/notes/<slug>/`,
>    one `/collections/<slug>/`. (All now serve a real per-page PNG card — verified in the build
>    + live for the already-deployed ones.)
>
> 2. **Build the PostHog dashboard (the "把看板做实" step — UI only, can't be coded).** Every event
>    now carries first-touch source as super-properties: `channel`, `utm_source`, `utm_medium`,
>    `utm_campaign`, `referrer_domain`, `landing_path`. In PostHog:
>    - **Funnel** (Product Analytics → Funnels): `$pageview` (path = /preorder…) → `preorder_view`
>      → `preorder_cta_click` → `preorder_checkout_clicked`. Add a **breakdown by `channel`**.
>    - Second funnel for the paywall: `word_paywall_hit`/`word_paywall_restored` →
>      `word_paywall_pro_click` / `word_paywall_email_unlock`, breakdown by `channel`.
>    - A trend of `$pageview` where path=/preorder, broken down by `channel` = the qualified-UV floor.
>
> 3. **Use the new first-party gate dashboard** at `/analytics` (admin login). There's now an
>    **"Exit-gate funnel (by channel)"** card at the top: /preorder UV (raw + qualified), paywall
>    triggers, real orders — each with the per-channel split. This is the 07-15 decision screen,
>    readable without PostHog. (Generic channels — hackernews / organic-search / direct / reddit /
>    unknown / unknown-referrals — are excluded from the *qualified* UV count per dev-plan §5
>    channel hygiene, so junk traffic can't silently meet the 500 floor.)
>
> **Caveat (known, deferred):** orders in the gate are split by **sign-up source tag**
> (free-pack / waitlist / preorder), NOT first-touch acquisition channel — labelled honestly in
> the UI. True channel attribution on the *numerator* would mean threading `channel` through the
> Stripe/LS purchase webhook; skipped this sprint (payment-path risk, no test suite, near-zero
> orders, and the gate decision uses orders.*total* anyway). Post-gate follow-up if needed.
>
> **Server deploy:** the backend changes (events/pageviews source columns + `/analytics/gate`
> endpoint) were deployed to the droplet this session (ssh + `pm2 restart colorarchive-server`);
> db.js migrations (ensureColumn) re-run idempotently on boot. Vercel auto-deploys the frontend.

## 🟢 B-meas + D1 shipped 2026-06-20 (remote) — exit-gate funnel readable by source + OG hygiene
> The 2026-06-19 dev plan's only two remaining code tracks. Adversarially reviewed (4-dim
> Workflow, 3 confirmed-high findings fixed before commit). typecheck + build green.
> - **B-meas (source-split funnel, end-to-end):** new `src/lib/attribution.ts` captures
>   first-touch UTM + referrer + landing ONCE on first load (persisted localStorage), derives a
>   `channel` bucket (linkedin/x/reddit/hackernews/producthunt/email/a11y-community/design-systems/
>   organic-search/direct/…). Threaded through `track()` (every funnel event), the `/pageviews`
>   beacon (the /preorder UV denominator), and PostHog super-properties (`phRegister`, so even
>   autocapture events break down by source — $pageview capture preserved). Server: `events` +
>   `pageviews` got channel/utm_*/referrer_domain/landing_path columns + indexes; new admin
>   `GET /analytics/gate` returns the exit-gate funnel split by channel; admin `/analytics` page
>   renders it. Subscriber attribution (`email-capture-form`, `cotd-subscribe-form`) switched from
>   lossy submit-time `searchParams` to persisted first-touch. **Why it mattered:** the funnel
>   carried ZERO source before — the gate's "≥500 *qualified* UV, split by source" was unreadable.
> - **D1 (post hygiene — no blank/small/generic share cards):** verified 9885f5b's PNG fix is live
>   (0 SVG og:image; /preorder + /word-to-color serve valid PNG). Added per-note OG cards
>   (`app/notes/[slug]/opengraph-image.tsx`). Fixed **8 page families** whose per-page dynamic OG
>   card was suppressed by a generic-PNG `images` override and/or rendered a small `summary` card:
>   word-to-color, guides, regions, brands, families, **stories, use-cases** (last two found by the
>   review), + notes. 9885f5b had only fixed collections+families; now all 9 dynamic-OG families
>   bind their per-page card with `summary_large_image`. Verified across the built HTML.

## 🟢 Perf follow-up shipped 2026-06-19 (remote) — og fix + RSC + algo + backend
> Owner approved doing all three remaining tracks. Done + verified from build artifacts:
> - **SVG og:image → PNG (distribution win, ~374 pages)**: collections + families [slug]
>   had working next/og PNG routes suppressed by a manual `openGraph.images:[svg]` override
>   → removed the override so the PNG route binds; notes (no route) → swapped to
>   `/og-image-v1.png`. **Verified: 0 `/generated/og/*.svg` left in any built HTML.** Social
>   share cards (X/FB/LinkedIn/Slack/Discord) now render instead of blank.
> - **#29 resolved (the homepage/9-page full-dataset RSC)**: instead of the API lazy-load,
>   used the cheaper NEED7 pattern — the 9 client pages now `import { colors }` (the ~151-line
>   deterministic generator) client-side instead of receiving the 5,446-record array as a
>   serialized prop. **index.rsc 996KB→32KB (−97%)**; all-colors/search/favorites/recent/
>   surprise/spectrum ~1MB→24KB each. (pick-for-me still 600KB — that's its `collections`
>   prop, a separate slim-able follow-up; not the colors array.)
> - **Color-relationship single-pass**: replaced `[...colors].filter().sort()[0]` in 5
>   functions with a `minByComparator` (O(n), strict-< keeps first-on-tie = byte-identical to
>   the stable sort). **Verified output-identical** (a color page still renders 51 unique hex,
>   unchanged). Cuts build CPU + speeds runtime callers (mood-palette/url-analyzer).
> - **Backend SQLite WAL (server/db.js)**: added `journal_mode=WAL` + `synchronous=NORMAL` +
>   `busy_timeout=5000` so reads don't block the high-volume event/pageview writes (no more
>   SQLITE_BUSY drops). **Deployed to the droplet** (ssh + pm2). `node --check` passed.
> - Still deferred: posthog eager-load (defer risks losing validation analytics);
>   pick-for-me/families `collections` prop slimming; per-note custom OG cards (notes use the
>   generic brand PNG for now).

## 🟢 Deep performance batch shipped 2026-06-19 (remote) — bundle + RSC payload
> A deep perf/structural audit (8 dims, adversarially verified, 34 findings) then a
> parallel apply pass. Root cause of the two ~1.38MB client chunks: **content datasets
> leaking into client bundles** because a pure helper (`tagToSlug`) / value-import sat in
> the same module as a 1.48MB JSON (newsletter) / 1.36MB array (guides), so tree-shaking
> kept the data. Fixes (typecheck + build green, wins measured from the build artifacts):
> - **Two ~1.38MB client content chunks ELIMINATED** (newsletter-issues.json + guides.ts)
>   from /notes, /use-cases, /collections, AND the homepage. Verified: `grep` for the
>   dataset markers in `.next/static/chunks/*.js` → **0 hits**; largest chunk now 448KB
>   (Sentry). Method: extracted `tagToSlug` to `src/lib/newsletter-slug.ts`; server-derive
>   related/featured guides and pass SLIMMED props (only rendered fields) from the server
>   pages into the client components (notes, use-cases, homepage hero, collections).
> - **RSC payloads slimmed**: `guides.rsc` 1322KB→**372KB** (−72%, dropped detail-only
>   `sections` prose); `collections.rsc` 611KB→**456KB** (−25%, dropped editorialNote/
>   promptWords/useCases); **every color page `.rsc` 1MB→36KB (−96%)** by computing the
>   tonal strip server-side and passing it instead of the full 5,446-color array (×3,066
>   pages ≈ ~3GB less build output, much smaller per-page payload).
> - **Render/algo**: single-pass family counts + `useDeferredValue` on /all-colors and
>   /search (no more 9–48 full scans + blocking keystroke on the 5,446 set); `colorsById`
>   Map for O(1) slug lookup. **Config/asset**: Cache-Control on /downloads, footer logo
>   `priority` removed, color OG route `force-dynamic` for consistency.
> - ⏸ **Still flagged (NOT done this batch)** — the audit's remaining high-value items:
>   - **🔴 SVG og:image rejected by social crawlers → blank share cards on ~374 pages**
>     (notes/collections/families). Real distribution bug (relevant to the dist. bottleneck);
>     needs the og:image to be a PNG/dynamic-OG route. Medium effort across page.tsx files.
>   - Homepage still serializes the full 5,446-color array into its RSC (~1MB) — the same
>     deferred #29 dataset-payload issue (needs `/api/colors` lazy-load + benchmark).
>   - color-relationship helpers do `[...colors].filter().sort()[0]` (~13ms/page build CPU)
>     → single-pass min-scan (output-identical) would cut build CPU; deferred (touches core,
>     no test suite — wants careful output-equivalence checks).
>   - posthog-js (~72KB gz) eager on every page — deferrable like New Relic, but NOT done
>     (deferring risks losing the pageview/funnel data the validation period needs).
>   - **Backend (server/*) — needs droplet deploy (ssh + pm2), NOT Vercel**: BACK1 = add
>     SQLite `WAL` + `busy_timeout=5000` + `synchronous=NORMAL` in `server/db.js` (prevents
>     event-write drops under concurrent read/write — worth doing); plus minor missing
>     indexes + a /trending cache. Owner to confirm before I deploy to the droplet.

## 🟢 Product-optimization batch shipped 2026-06-19 (remote) — 28 verified fixes
> Owner steer: "keep optimizing existing features" (not just distribute + wait). Ran a
> read-only multi-agent audit of all 70+ routes (adversarially verified, ranked), then a
> parallel implementation pass. **28 low-regret fixes to EXISTING features; no new features
> (red line held). typecheck + build both green.** Highlights:
> - **Real bugs**: word-to-color "Search by hex" CTA dead-ended on an ignored `?hex=` param
>   → now `/colors/hex/?c=` (the #1 page's highest-intent step); /all-colors + /archive
>   "Show more" capped at 960/720 so 82% of colors were unreachable (inert button) → cap =
>   full set; family-pill counts overstated when advanced filters active → count the filtered
>   set; AI Mood Palette "+ Save" showed "✓ Saved" but favorited nothing (exact-hex match) →
>   nearest-archive-color; ProGate burned the free-export quota on *format-toggle* clicks
>   (paywall slammed shut without exporting) → stopPropagation on toggles only.
> - **Dark mode** (a product that markets WCAG shipping unreadable dark pages): word-to-color
>   (#1 page, had ZERO dark: classes), brand-generator, favorites, recent, /pro comparison
>   table, upgrade modal, color-card palette chips — all given additive `dark:` variants.
> - **Conversion**: upgrade-modal price buttons were a fake plan-picker (both → /pro/) → real
>   CheckoutButtons that go straight to checkout; ProGate locked-overlay now gives anonymous
>   users a "Sign in for more" step before the paywall; /pro "Save 31%"→33% + FAQ 3-day-trial
>   copy + word-to-color "completely free" FAQ corrected; tool-upsell secondary CTA demoted.
> - **Perf**: New Relic browser agent was eager on every page's critical path → deferred to
>   requestIdleCallback (RUM unchanged). **A11y**: email-capture form + search combobox ARIA;
>   bigger tap targets. **Mobile**: copy-upsell toast no longer clips off 380px screens;
>   back-to-top no longer overlaps the palette pill.
> - ⏸ **Deferred (NOT shipped)**: the one "bigger" finding — the full 5,446-color dataset is
>   serialized into the home + /all-colors HTML payload (~120–180KB gzip). Real, but the audit
>   re-scored it **L-effort + INP-regression risk** (rgb/hsl/family are consumed across the
>   whole set by ~40 components), so it needs the `/api/colors` lazy-load path + benchmarking,
>   not a quick patch. Left as a separate follow-up for a deliberate session.

## 🟢 B3 + B5 shipped 2026-06-19 (remote) — pricing口径 fixed, conversion hygiene
> Owner decided the B3 pricing口径: **JPY-primary + corrected approximate USD** (keep
> billing in JPY; show an honest ≈USD at ~150 JPY/USD). Code-only, no LS changes needed.
> A read-only multi-agent audit (adversarially verified) then surfaced 5 low-regret
> conversion-hygiene fixes, all shipped in the same commit:
> - **B3**: fixed `priceUsd` in `checkout-config.ts` (monthly $6.99→**$3.49**, yearly
>   $49.99→**$26.99**, lifetime $199.99→**$129**); added preorder `priceUsd $33` /
>   `regularPriceUsd $67`. Reconciled stale USD on `/pro` promo card ("$49"→JP¥4,999 ≈$33)
>   and support FAQ ("$199.99"→$129).
> - **B5-1**: `/pro` JSON-LD `SoftwareApplication` Lifetime Offer price was **¥9,999**
>   (half the real ¥19,999) — a machine-readable price Google/Bing index. Fixed → 19999.
> - **B5-2**: 10 bare `href="/pro"` across upgrade-modal / pro-gate / projects / account /
>   tool-upsell-banner forced a 308 redirect (next.config `trailingSlash:true`) on the
>   paywall CTA — all → `/pro/`.
> - **B5-3**: `/preorder` + auditor CTA rendered bare `¥4,999` (zh users misread as RMB,
>   ~7× inflated) — propagated the existing `JP¥` disambiguation + added the ≈USD line.
> - **Deliberately NOT done**: the audit suggested dropping the `JP¥` prefix on /pro as
>   "non-standard"; rejected — `JP¥` is the intentional 2026-06-14 anti-RMB-misread fix.
>   Standardized the whole site ON `JP¥` instead. Mock-dashboard `¥48,200` on
>   palette-preview left as-is (decorative, not a price).
> typecheck + build both green.

## 🟢 WTP batch shipped 2026-06-15 — 1 quick human step + measure
> Code-doable growth levers are basically done; the remaining signal is validation +
> distribution + time. This batch wired the two remaining code probes; the rest is yours.

- [x] **Real card pre-order test — LIVE 2026-06-15.** LS one-time product created in the
      **ColorArchive** store, priced **¥4,999 founder / ¥9,999 regular** (JPY, the store
      currency — referenced the existing Pro scale; "$49" couldn't be billed since the store
      is JPY). `NEXT_PUBLIC_PREORDER_CHECKOUT_URL` set in Vercel Production via CLI; page now
      shows a card-required "Pre-order — ¥4,999" button. **Kill criterion: <10 real card
      pre-orders in 30 days (by ~2026-07-15) → stop building Pro.** Read orders in LS →
      Orders (live mode). Needs traffic — see the paywall + distribution drafts.
- [ ] **Delete the duplicate LS store "Color Archive"** (the one with a space — empty, ¥0,
      never activated, test-mode). Keep **"ColorArchive"** (the active one). Self-serve delete
      may not exist → email **hello@lemonsqueezy.com** (draft in the 2026-06-15 chat). The
      separate paused **Stripe account "Color Archive"** (`acct_1TFOUMGzX2t5YKlz`, payments
      paused / verification overdue) is unrelated to the live LS flow (LS is MoR, pays out to
      your bank) — leave it dormant unless you decide to go direct-Stripe later.
- [x] **word-to-color WTP paywall — BUILT + ENABLED** (your call "建并直接开"). After 5
      distinct word generations the result gates behind Pro + an email-unlock. SEO-safe
      (crawlers / shared links / the 474 static pages never hit it). Toggle off any time
      via the `WORD_PAYWALL_ENABLED` constant in `word-color-generator-page.tsx`.
- [ ] **Measure the new funnels (PostHog / first-party events), 2–3 weeks:**
      `word_paywall_hit` → `word_paywall_pro_click` (paid intent) vs `word_paywall_email_unlock`
      (lead). And the preorder funnel once the card test is on. First-party query is in the
      pre-order kit doc.
- **Measured 2026-06-15**: the preorder funnel had **0 events / 0 reservations** since the
  06-14 launch — NOT a tracking bug (pageviews ~800–1000/day, `track()` events do land).
  `/preorder/` just gets no traffic (buried behind low-traffic pages). It needs the paywall
  + distribution to feed it. **The two highest-leverage human tasks now have execution docs:**
  - [ ] **Post the distribution drafts** on a cadence → `docs/distribution-plan-2026-06-15.md`
        (14-day schedule, CTAs routed to the live paywall/preorder, disclosure + anti-spam rules).
  - [x] **User interviews → DROPPED in favor of the self-serve SURVEY (decided 2026-06-19).**
        No more scheduled 1:1 interviews. The survey (SURVEY1MON = free month of Pro), recruited
        via the /word-to-color banner (B4), is now the qualitative exit-gate input. Just keep
        survey responses flowing; no booking link / outreach needed.

## 🟢 SEO/exposure batch shipped 2026-06-14 — measure & follow up
> Goal: push page-2 pages to page 1 + grow traffic (Google + AI engines). All code
> is live; these are the human-only measurement/verification steps.
- [ ] **GSC: confirm the new /word-to-color/[word]/ pages get indexed** (474 pages,
      now in sitemap.xml + linked from a hub on the generator). Check Coverage + the
      "word to color" query family in 2–3 weeks.
- [ ] **GSC: watch avg position on the top guides** (blue-color-psychology-branding-guide,
      film-cinematography-color-guide, color-trends-2026-design-guide) — they got
      query-optimized titles + FAQ rich-result eligibility; expect CTR lift first.
- [ ] **Bing Webmaster Tools (optional):** IndexNow key `c0107a3b9f2d4e8a8b6c1d5e7f0a2b34`
      is auto-served at /<key>.txt and pinged on every prod deploy (postbuild). Nothing
      required, but you can verify submissions in Bing WMT → IndexNow.
- [ ] **Validate rich results:** run a couple guide URLs + a /word-to-color/[word]/ URL
      through Google's Rich Results Test to confirm FAQ/DefinedTerm markup is picked up.
- [ ] (Optional) Add more entries to `src/lib/guide-seo.ts` (FAQ/titles) and
      `src/lib/word-to-color-seeds.ts` (more words) — both are append-only and safe.

## 🟢 Core Web Vitals batch shipped 2026-06-14
- **Sentry session/error Replay turned OFF** (`instrumentation-client.ts`,
  `replaysOnErrorSampleRate: 0`) to drop ~50KB from every page. Error capture +
  10% perf tracing still on; only the visual before-crash replay is gone. Re-enable
  by raising that rate if you ever need replay debugging.
- **Google Ads gtag → `lazyOnload`** (`app/layout.tsx`) — off the critical path;
  conversions still queue via `dataLayer`. If you notice conversion under-reporting
  in Google Ads, switch it back to `afterInteractive`.
- **Product Hunt launch banner turned off** (`ph-launch-banner.tsx`,
  `PH_LAUNCH_ACTIVE=false`) — stale since the April launch + caused a layout shift.
  Flip back to `true` for any future launch.
- Kept intentionally (per credits.md observability split): NewRelic RUM, Sentry
  crashes, PostHog product, GTM ads.
- [ ] Optional: confirm CWV improved in NewRelic RUM / PageSpeed Insights in ~1 week.

## 🟢 Backlink engine shipped 2026-06-14 — post the drafts
- Code live: static HTML color-badge on every color page (the "Embed" button) + the
  embed landing (`/embed/embed-code/`, now discoverable in sitemap + footer); fixed the
  previously-broken widget attribution backlink.
- [ ] **Post the distribution drafts** in `docs/backlink-distribution-drafts-2026-06-14.md`
      (Dev.to article, Show HN, Reddit r/web_design, free-tool directories, Pinterest) —
      ~1/day to avoid same-link spam filters; disclose maker where required. These are the
      actual backlinks; the code just makes them easy to create.
- [ ] (Optional) PR ColorArchive into an "awesome-design-tools" GitHub list (durable backlink).

## 🟢 Conversion batch shipped 2026-06-14 + decisions for you
Shipped (code, safe + verdict-independent):
- Removed the **fabricated Pro testimonial** ("paid for itself in the first week" — false
  advertising with 0 real customers); replaced with an honest trust row (real guarantees).
- **`¥` → `JP¥`** on /pro/ + upgrade modal so it can't be misread as RMB (zh users were
  seeing ¥3,999 as ~$560 instead of ~$50).
- **Email capture on /word-to-color/** (the #1 page's dead-end) — builds the only durable
  handle on casual traffic. Subscribes tagged `source: "word-to-color"`.

🔴 **Decisions only you can make (I did NOT guess these):**
- [x] **Fix the pricing numbers — RESOLVED 2026-06-19 (B3).** Owner chose **JPY-primary +
      corrected approximate USD** (keep JPY billing; show an honest ≈USD). Implemented in
      `checkout-config.ts` + reconciled all stale USD surfaces — see the 2026-06-19 batch
      at the top of this file. Open sub-question still yours if you want it: **whether to
      bill in USD at all** (JPY billing is friction for a global/US ICP) — that needs new
      LS variants in USD, not a code change, so left for you to decide later.
- [ ] **Run the willingness-to-pay test** (the audit's core — nobody has ever paid):
      1. *Pre-order landing page* — **BUILT + live at `/preorder/`** (Accessibility Auditor,
         founder $49 / reg $99, ships Q3 2026, refund if not shipped). Linked from `/pro/`.
         Fires `preorder_view` / `preorder_checkout_clicked` events (first-party + PostHog).
         **To turn on the REAL card-required test (3 steps, ~15 min):**
         - a) In Lemon Squeezy, create a one-time "Accessibility Auditor — Pre-order" product
              at $49, get its checkout URL.
         - b) Set `NEXT_PUBLIC_PREORDER_CHECKOUT_URL=<that url>` in Vercel Production env.
         - c) Redeploy. The page auto-flips from the email fallback to a card-required
              "Pre-order — $49" button. (Until then it's collecting email reservations tagged
              `source: "preorder"` — a weaker but live signal.)
         - Drive traffic: linked from `/pro/` + contextual CTAs now live on `/palette-audit/`
           and `/wcag-audit/` (the exact ICP; clicks tracked as `preorder_cta_click {from}` so
           you can see which surface converts). Also post about it (the distribution drafts).
         - **KILL CRITERION: < 10 real card pre-orders in 30 days → the designer-Pro theory
           is not validated; do not keep building Pro features.** (Email reservations are NOT
           pass — only card-required pre-orders count.)
      2. *Paywall /word-to-color/ after N free generations* — the pain IS the signal. This
         WILL cut traffic; that's the point of the test. I can build it behind a flag, but
         it's your call since it touches your #1 traffic asset.
      The audit explicitly rejected a "$9 export of free color data" as validation theater —
      don't run that one.

## 🔴 P0 — this week (Figma launch window)

- [x] ~~Facebook token re-auth~~ — **DONE 2026-06-10 evening** (with Jason assisting the
      OAuth clicks): fresh Graph Explorer user token → discovered the app secret had been
      rotated in Meta console (old one in .env was dead) → new `FB_APP_SECRET` written to
      Droplet .env → 60-day long-lived user token + page token in `server/.env.facebook`
      (Droplet + local synced). **FB launch post published**: post id
      `1014363318430170_122113574726881547`. Daily pipeline restored.
- [x] ~~Pinterest token re-auth with write scopes~~ — **DONE 2026-06-10 evening**: the
      api.colorarchive.org admin OAuth callback turned out to be unregistered in the
      Pinterest app (that flow can never have worked); re-authed via the registered
      frontend callback (`colorarchive.org/pinterest/callback/`) + a temporary one-shot
      server patch that persisted the exchange into the admin token store (patch
      reverted, droplet reset to origin/main). Token now has all 4 scopes incl. writes,
      refresh works (boot-refresh confirmed). **Launch pin published**: pin id
      `855683997995147303` on board ColorArchive Pro. Daily rotation restored.
- [ ] **Watch for the Figma v1.1.0 (Community Version 3) review email** — published
      2026-06-10 with clientStorage key persistence + UTM links. If rejected, the fix
      playbook from review 1842708 applies (figma-plugin/README.md → publish runbook).
- [x] ~~Reddit r/FigmaDesign post~~ — **DONE 2026-06-10 evening**: posted via a
      screencapture-eyes + cliclick-hands workaround (the Chrome extension domain-blocks
      reddit.com, but native screencapture + cliclick + AppleScript drive the logged-in
      session). Title "I built a free plugin that puts 5,446 curated colors + WCAG
      contrast checks inside Figma", flair **design feedback**, maker disclosed, body asks
      what feedback is wanted (export formats / brand-scale steps) per the subreddit's
      feedback-flair rule. Confirmed live in the r/FigmaDesign feed. (Permalink not
      captured — reddit blocks unauthenticated JSON and the tab kept getting swapped.)
- [ ] **Reddit r/web_design (or r/UI_Design) post** — do a day or two after the
      FigmaDesign one to dodge same-link spam filters; softer accessibility-angle draft in
      docs/figma-plugin-launch-posts-2026-06-10.md §3. Disclose maker. (Same manual
      workaround works: screencapture + cliclick; watch for display-sleep→lock mid-run.)
- [x] ~~Product Hunt + Indie Hackers updates~~ — **DONE 2026-06-10 evening**:
      IH product-timeline post published (the global "create posts" gate doesn't apply
      to product posts); PH product page tagline/description refreshed (was "3066
      colors") + maker-update comment posted on the live launch thread. NOTE: a full PH
      *re-launch* was deliberately NOT fired (it was 4 AM PT — wasted slot); if wanted,
      schedule one for 12:01 AM PT with proper assets.

## 🟠 P1 — strategy critical path (V2 plan)

- [x] **S2 qualitative input = the self-serve SURVEY, not interviews (decided 2026-06-19).**
      1:1 interviews dropped. The survey (SURVEY1MON reward, recruited from the #1 traffic page)
      is the exit-gate qualitative signal; the borderline 7–9-preorder tiebreaker in the dev
      plan §5 now reads survey responses for a clear ICP + shared pain point.
- [ ] **StoreKit sandbox purchase test** (carried over): Xcode → sandbox tester → Pro
      purchase; watch `ssh root@143.198.85.72 'pm2 logs colorarchive-api --lines 40
      --nostream'` for `[DEPRECATION] apple-purchase got JSON (not JWS)`.
      iOS v1.2 build 4 is in App Store review (submitted 2026-06-07).
- [x] ~~App Privacy label~~ — **already done** (verified 2026-06-10: App Privacy published
      4 days ago with Crash Data + Product Interaction; the memo was stale). Bonus
      finding: **iOS v1.2 shows "Ready for Distribution" in ASC — the review passed.**

## 🟡 Carried over (still open)

- [x] **React hydration #418 on /palette-audit/** — FIXED 2026-06-18 (B1). Root cause was
      NOT the locale race (the locale system is hydration-safe — en-first, deferred via
      effect; `<html>` has suppressHydrationWarning; content is ErrorBoundary-wrapped). It's
      **browser extensions (Grammarly etc.) injecting into the page's `<textarea>`** before
      hydration — classic intermittent #418 on the only page with a prominent paste box.
      Fixed with `suppressHydrationWarning` on the textarea (`palette-audit-page.tsx`). Same
      pattern would apply to any other big textarea if one appears.
- [ ] **Domain migration Phase 2 leftovers** (see docs/domain-migration-checklist.md):
      Droplet `.env` final pass, Meta/Instagram redirect URI, Resend DNS, GSC domain
      change, LS webhook URL, external listings (PH/IH/AlternativeTo).
- [ ] TikTok video still "in review"? Follow up if stuck.
- [ ] Indie Hackers logo manual upload (pending since ~05-01).

## ✅ Closed this session (2026-06-10) — reference

- [x] Figma plugin v1.1.0 published (Community Version 3): API key persists via
      figma.clientStorage; UTM attribution on all outbound links; desktop regression
      passed in Design + FigJam (see figma-plugin/README.md checklist).
- [x] Community listing refreshed without re-review: truthful description, playground
      file attached, 16:9 cover + 2 carousel images, tags = design tokens / color
      palette / accessibility / tailwind / wcag, support email typo fixed
      (support@coloarchive.org → support@colorarchive.org).
- [x] Launch posts: X (tweet 2064653503738659311) + Instagram (media 18598880383063302)
      published 2026-06-10. Facebook + Pinterest blocked on the re-auths above.
- [x] PostHog funnel "Figma plugin funnel — visit → sign up → checkout"
      (us.posthog.com/project/456902/insights/8dStedB9) + weekly autopilot check
      (.claude/autopilot-tasks.md). UTM → PostHog attribution verified end-to-end.
- [x] api.colorarchive.org CORS: plugin iframe sends `Origin: null` and was blocked —
      /projects (and all bearer-auth routes) now allow it; deployed to Droplet + in repo.
- [x] figma-plugin CI job (tsc, ui.html syntax check, bare-localStorage guard).

## Done (older)
- [x] YouTube video — published
- [x] Twitter/X API — configured (URL-free posts only: $0.015 vs $0.20)
- [x] Pinterest — integrated (Standard access 2026-04-17; write scopes now broken, see P0)
- [x] Product Hunt — live listing created
- [x] VS Marketplace — extension v0.2.0 published; DNS TXT verified
- [x] iOS v1.1 approved; v1.2 build 4 submitted 2026-06-07 (PostHog + fixes)
- [x] LS live + first real purchase validated 2026-04-17/18
- [x] Frontend Sentry verified capturing (2026-04-24)
- [x] GCP OAuth .org redirect verified (2026-04-24)
- [x] SQLite backups on Droplet (docs/backup-runbook.md)
- [x] Figma plugin Community V2 approved 2026-06-09 (rejection fixes via PR #6)
