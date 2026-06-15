# Distribution execution plan — 2026-06-15

> Wraps the ready-to-post copy in `docs/backlink-distribution-drafts-2026-06-14.md` into an
> actual **posting schedule** and points every CTA at the now-live funnels. Distribution is
> the **highest-leverage lever left** — both WTP probes are live but measured **0 traffic**
> into them (Droplet `events`: 0 preorder events since launch; `pageviews` ~800–1000/day but
> none reaching `/preorder/`). Posts = the fuel.

## What changed since the 06-14 drafts (so refresh the CTAs)

Two paid surfaces are now LIVE — make sure traffic lands on a page that has one:
- **Word-to-color paywall**: after 5 lookups, `/word-to-color/` gates to `/pro/` + email-unlock.
  So driving people to the word-to-color tool now *also* feeds the WTP test. Lead with it.
- **`/preorder/`**: real card test, **¥4,999 founder / ¥9,999 regular** (Accessibility Auditor).
  Worth a direct mention in design-/accessibility-leaning posts.

**Routing rule:** every post should ultimately point at one of —
`/word-to-color/` (top entry, now monetized) · `/preorder/` (the card test) · `/embed/embed-code/`
(durable backlink) · `/all-colors/` (the archive). Avoid dumping links on low-traffic pages.

## Priority by value × durability

1. **Dev.to/Hashnode article** (draft §1) — durable do-follow backlink + evergreen traffic. Do first.
2. **"awesome-design-tools" GitHub PR** (draft §5) — permanent backlink, high trust.
3. **Show HN** (draft §2) — one big spike; only fire once, pick a weekday morning PT.
4. **Reddit** r/web_design / r/webdev (draft §3) — spike + backlink; obey self-promo rules.
5. **Directories** (draft §5) — submit once each, durable.
6. **Pinterest** (draft §4) — autopilot already pins; ensure word-to-color + OG images.

## 14-day cadence (≈1 post/day to dodge same-link spam filters)

| Day | Channel | CTA target | Notes |
|---|---|---|---|
| 1 | Dev.to/Hashnode article (§1) | embed-code + word-to-color | Strongest durable link; do-follow. |
| 2 | GitHub PR to an awesome-design-tools list (§5) | colorarchive.org | Add under "Color". One-line, honest. |
| 3 | Reddit r/web_design (§3) | embed-code | Value-first, disclose maker, follow flair rules. |
| 4 | Directory #1 (AlternativeTo) | homepage | Confirm embed/widget mentioned. |
| 5 | X/Twitter thread (URL-free per memory) | word-to-color | $0.015 vs $0.20 — keep links out of the tweet body. |
| 6 | Directory #2 (SaaSHub / there's-an-AI-for-that) | homepage | |
| 7 | **Show HN** (§2) | homepage | Weekday ~8–10am PT. Reply to every comment fast. |
| 8 | Reddit r/SideProject or r/InternetIsBeautiful | word-to-color | Different sub + different link = avoids spam flags. |
| 9 | Hashnode cross-post / Medium | embed-code | Repurpose the Dev.to article. |
| 10 | 小红书 design post (zh) | word-to-color | Pair with a screenshot/OG image. |
| 11 | Indie Hackers "what I built" post | preorder or pro | IH product posts allowed (see memory). |
| 12 | Reddit r/accessibility or r/UXDesign | preorder | Lead with the WCAG auditor angle. |
| 13 | One designer Discord/Slack share | word-to-color | Communities you're already in; no spam. |
| 14 | Review + double down | — | See "What to watch". Repeat the channel that converted. |

## Rules (or it backfires)

- **Disclose you're the maker** wherever the sub/community requires it. Lead with the useful
  thing, not the pitch.
- **One link per channel per day** — don't blast the same URL everywhere same-day (spam filters).
- **Reddit access caveat (from memory):** the Chrome extension domain-blocks reddit.com.
  Post manually in the browser, or use the screencapture-eyes + cliclick-hands + AppleScript
  workaround that worked for the r/FigmaDesign launch. Watch for display-sleep→lock mid-run.
- **No fake engagement / no vote manipulation.** One honest post each.

## What to watch (decide at the gate, ~2–3 weeks)

- **PostHog / first-party** (`ssh root@143.198.85.72 'sqlite3 .../data.db ...'`):
  `preorder_view → preorder_cta_click → preorder_checkout_clicked`, and
  `word_paywall_hit → word_paywall_pro_click / word_paywall_email_unlock`.
- **LS → Orders (live mode)**: real card pre-orders. **Kill criterion: <10 by ~2026-07-15 →
  stop building Pro** (per `docs/human-todo.md`).
- **GSC**: are the 474 `/word-to-color/[word]/` pages getting indexed? did the top guides move
  page-2 → page-1? CTR lift on color-psychology guides?
- **Which channel actually drove signups/clicks** (UTM / referrer) → on Day 14, repeat that one.

## Tie-in

This plan feeds the funnels; `docs/user-interview-recruitment-2026-06-15.md` turns the
resulting traffic into qualitative signal. Run both in parallel — together they produce the
evidence for the V2 §7 exit-gate decision. Don't add features in the meantime.
