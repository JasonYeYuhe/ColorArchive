# User-interview recruitment & outreach plan — 2026-06-15

> Companion to `docs/user-interview-script.md` (the questions) and the V2 plan
> (`docs/dev-plan-2026-05-31.md` §7 exit gate). **This doc = how to actually get the ~10
> people in front of you.** Goal: 10 real, used-the-product interviewees, 15–20 min each.
> The interviews are the single source of "who/why/why-pay" — code can't produce this.

## Why now (the one thing to internalize)

Both willingness-to-pay probes are live (word-to-color paywall + the ¥4,999 `/preorder/`
card test). But the funnel is empty because there's no traffic / no qualitative signal yet.
The interviews answer the question the data can't: **is there a segment that actually wants
this and will pay — or is word-to-color traffic just casual info-seekers?** (The baseline
suspicion is they're NOT the same people.) 10 good interviews settle the S2 exit gate.

**Discipline (from the script — do not skip):** ask about *past behavior* ("what did you do
last time"), never hypotheticals; don't pitch or explain; put the pay question last; record
verbatim quotes. Quality > quantity — 10 real users beats 100 survey fillers.

---

## Self-serve survey — LIVE (2026-06-15)

A 9-question Google Form is published and public ("Anyone with the link"). It's the
**breadth** instrument that complements the 1:1 interviews (the **depth** instrument):
Q9 "open to a 20-min call?" funnels willing respondents straight into interviews.

**Live link (drop into emails + distribution posts):**
`https://docs.google.com/forms/d/e/1FAIpQLSf5dTPy9ccPgXdKx2SOf7ICKu5AHucxkm3VoWzBfaZXEZOm2Q/viewform`

Questions (behavioral, per the script): role · how they found us · what they were working on ·
which tool used most · what they did next · ever paid for a design tool (past behavior) ·
what would make it worth paying for · email · open to a call.

**Reward = 1 free month of Pro, via a Lemon Squeezy 100%-off code — LIVE:**
- Code **`SURVEY1MON`** (LS → Discounts, Active), **100% off**, scoped to **ColorArchive Pro —
  Monthly variant** only — so a redeemer gets one ¥499 month free, NOT a free year/lifetime.
- Wired into the form's **confirmation message**: *"Thanks! Here's your free month of Pro — use
  code SURVEY1MON at checkout: https://colorarchive.org/pro"*
- To verify in the discount's **Settings**: redemption cap + expiry, and first-payment-only (so
  it's not free-monthly-forever). An older `SURVEY1MO` discount is Draft/inactive — safe to delete.

**⚠️ Don't contaminate the WTP test:** make it **1 month only** (not lifetime); keep this free
code **off** `/pro`, `/preorder`, and the paywall — distribute it only via the survey/emails. The
paywall + preorder "will they pay" signal must stay clean. Treat survey answers to the pay
question as *stated* preference (weaker than the *revealed* signal from the paid surfaces).

**Owner finishing toggles — DONE:** email-collect set to "Do not collect" (Q8 captures email, no
forced Google login); confirmation message set with the `SURVEY1MON` code. **The survey is fully
live and ready to distribute** — drop the link into recruitment emails + distribution posts.

## The pool — recruit in this priority order

| Priority | Source | Why first | Size today |
|---|---|---|---|
| 1 | **The 5 registered users** | Warmest — already signed up, already interested | ~5 |
| 2 | **New email leads as they arrive** | The word-to-color paywall (email-unlock, `source: "word-to-color"`), `/preorder/` reservations, and COTD subscribers are now first-party handles. Email each new one within a day. | 0 today, grows with traffic |
| 3 | **Anyone who clicks the paywall / preorder** | Highest intent on the whole site — they hit a paid surface on purpose. | grows with traffic |
| 4 | **Community outreach by referrer** | GSC/PostHog show top sources = word-to-color search + **ChatGPT (#2)** + Reddit. Recruit where those people already are. | unlimited |

> Pool 2–4 only fill up once distribution drives traffic — so **run this in parallel with
> the distribution plan** (`docs/distribution-plan-2026-06-15.md`). Start today with Pool 1
> + community posts (Pool 4), which don't need site traffic.

## Incentive

**1 free month of Pro** for a 20-minute call (already promised in the script). Keep it simple
— no cash, no gift cards (avoids "professional survey-taker" noise). Mention it *after* they
show interest, not in the headline, so you attract real users not freebie-hunters.

## Logistics to set up first (15 min, one-time)

- **Booking link:** create a free Cal.com or Calendly with 20-min slots → paste the link in
  every message below (placeholder: `[BOOKING_LINK]`). Removes back-and-forth.
- **Reply inbox:** send from / reply to `support@colorarchive.org` (forwards to Gmail).
- **Recording + notes:** ask consent on the call; log each interview's 6 fields from the
  script (identity / source / real use case / would-return / pay points / current free
  alternative) in one sheet so patterns surface after ~10.

---

## Ready-to-send copy (English — most users are EN)

### A. Email — the 5 registered users (send first, today)

> **Subject:** Quick favor — 20 min about how you use ColorArchive? (free month of Pro)
>
> Hi [name],
>
> I'm the maker of ColorArchive. You signed up a while back and I'd genuinely love to learn
> how you actually used it — what you were working on, what worked, what didn't.
>
> Would you be up for a 20-minute call this week? No pitch, just questions — your honest
> take shapes what I build next. As a thank-you I'll add **a free month of Pro** to your
> account.
>
> Grab any slot that works: **[BOOKING_LINK]** (or just reply with a time).
>
> Thanks either way,
> [you]

### B. Email — new leads (paywall unlock / preorder / COTD), automated-ish

> **Subject:** You tried Word-to-Color — mind telling me how it went?
>
> Hi! You recently used ColorArchive's Word-to-Color tool. I'm the maker and I'm doing a
> handful of short user chats this month. Could I borrow **20 minutes** to hear what you were
> actually trying to do with it? I'll give you **a free month of Pro** as thanks.
>
> Book here if you're open to it: **[BOOKING_LINK]**. No worries if not — and thanks for
> using it!

### C. Reddit / Indie Hackers / forum post (value-first; check each sub's rules)

> Good subs: **r/SideProject, r/userexperience, r/web_design (research flair), r/Frontend,
> IndieHackers**. Lead with the ask for *their* experience, disclose you're the maker, never
> hard-sell.
>
> **Title:** I built a free color tool (word → color + a 5,446-color archive). Looking for 10
> users to tell me how they actually use it — 20 min, free month of Pro
>
> **Body:** I made ColorArchive (free, no signup to try). I'm trying to understand who it's
> actually useful for before I build more. If you've used a word-to-color or palette tool for
> real work, I'd love a 20-min call — I mostly listen. Free month of Pro as thanks. Comment
> or DM and I'll send a booking link. (Maker here, not selling anything.)

### D. X / Twitter (post + reply to relevant threads)

> Building ColorArchive (free word→color + 5,446 named colors). I want to talk to 10 people
> who use color tools for real work — 20 min, I listen, free month of Pro. Designers / devs /
> creators welcome. Reply or DM 🎨

### E. 小红书 / design communities (zh)

> 在做一个免费配色工具 ColorArchive(输入词→生成颜色 + 5446 个命名色)。想找 10 位真正用配色工具
> 做事的朋友聊 20 分钟,只听你怎么用、不推销,送 1 个月 Pro。设计 / 前端 / 内容创作都欢迎,评论或私信我。

---

## 7-day outreach sequence

| Day | Action |
|---|---|
| 1 | Set up booking link + tracking sheet. Email the 5 registered users (A). |
| 2 | Post C in r/SideProject + r/userexperience. Post D on X. |
| 3 | Post E on 小红书 design topic + one designer Discord/Slack. |
| 4 | Follow up (one nudge) with non-responders from Day 1. Reply to 3–5 relevant X/Reddit threads with D. |
| 5 | IndieHackers post (C). Start emailing any new leads (B) as they arrive. |
| 6–7 | Run the first calls. Keep emailing new leads within a day of signup. |

Target: **3–4 booked by end of week 1, 10 done within ~3 weeks.** If after a solid push you
can't get 10 real users to even talk, that itself is a strong signal for the V2 exit gate.

## Tracking template (one row per person)

`name | source(reg/paywall/preorder/reddit/...) | booked? | done? | identity | real use case | would-return | pay point mentioned | current free alt`

After ~10: look for (a) a recurring *type* of person (= ICP emerging), (b) a shared strong
pay-point, (c) whether word-to-color users and would-pay users are the *same* people. Feed
the verdict into `dev-plan-2026-05-31.md` §7 — continue to S3, or take the off-ramp.

## Optional code support (only if you want it later)

- A lightweight **"talk to the maker, get a free month" banner** on `/word-to-color/` (the
  #1 page) → captures interview leads at the source. Small, flag-gated, ~30 min. Say the word.
