# Next-Phase Development Plan (2026-04-17)

## Landscape — what actually matters right now

Today we landed two large launches in the same session:
1. **Lemon Squeezy commerce** — ColorArchive Pro live with Monthly/Yearly/Lifetime variants
2. **Pinterest Standard access + daily autopilot** — one Color-of-the-Day pinned per day to our board

Memory survey says:
- **Sprint 2 feature set is complete** (8/8 shipped)
- **Domain migration** has only manual platform steps left (App Store metadata, directory URLs) — not a code task
- **Commerce**: end-to-end LS purchase flow has never been exercised by a real buyer (or a test-mode buyer). Memory still tracks this as "Stripe pending" — stale.
- **Pinterest autopilot**: live at 1 pin/day. 256 collections + 315 guides + 5,446 colors sitting as untapped inventory. Pinterest growth curves want 5–15 pins/day.
- **Observability**: the only way to know if autopilot ran today is to SSH and grep `pm2` logs. No admin dashboard, no heartbeat check.

## Candidate directions, ranked

| # | Direction | Payoff | Risk | Blocks on user? |
|---|---|---|---|---|
| A | Pinterest content expansion (collections + guides) | **High** — 5–10× pin volume, compounds today's launch | Low — reuses Phase 2a infra | No |
| B | Autopilot observability (admin status endpoint + minimal dashboard) | Medium — solves a real blind spot | Low | No |
| C | LS commerce validation (test-mode purchase, webhook inspector, refund rehearsal) | **High** — unvalidated commerce silently losing sales is a P0 failure mode | Medium — needs a test card transaction but everything else can be automated | Partial (user may want to witness) |
| D | Cross-platform OAuth redirect-URI audit (find the next `.me` vs `.org` landmine) | Medium — today we already caught one (Pinterest); others probably exist | Low | Needs creds for ≥1 provider |
| E | Pro churn / usage telemetry (how many AI generations, exports, WCAG audits per Pro user?) | Medium — needed for retention decisions, but premature if we don't have paying customers yet | Low | No |
| F | Sprint 3 feature work (unscoped) | Unknown | Unknown | Needs product direction |

## Recommendation (revised after Codex review)

**Phase 0 preempts the rest: LS commerce e2e validation.** Codex pushed back hard: the plan originally called commerce-validation failure "P0" but then demoted it to "opportunistic". That's inconsistent. Ship Phase 0 first. Then A + B.

**Main track (Phases 3a–3c): "Autopilot Maturation"** — Pinterest expansion and observability, same shape as before but with Codex's P1 fixes applied:
- Commerce observability reads from the **existing Express DB** (which `server/routes/webhook.js` already writes to), not a new flat file
- Admin page reuses the **existing signed-in admin pattern** (`app/admin/orders/page.tsx`), not a localStorage bearer
- Pin volume **ramps 1→2→3/day behind a flag**, not straight to 3

Why this combo:
- **Compounds today's ship.** Pinterest infrastructure is fresh in my head; pattern is proven. Adding collections + guides is straightforward content extension, not new engineering.
- **Observability was missing even before today.** IG scheduler and now Pinterest scheduler both run silently. An admin status endpoint unblocks fast triage on any failure.
- **No user-blocking dependencies.** Everything in this plan I can execute alone, commit, deploy, and verify.
- **Low risk.** Reuses `requireAdminBearer`, `pinterest-admin` helpers, existing token store. No new admin surface area.

Directions C (full commerce validation), D (OAuth sweep), E (usage telemetry) are all worthy but should be separate plans — I'd recommend picking one of them next after this plan lands.

## Detailed plan

### Phase 0 — LS commerce end-to-end validation (~2h)

**Goal:** prove that purchase → webhook → server DB → Pro unlock → email receipt actually works in prod. Fix anything that's broken.

**Changes:**
- In LS dashboard, toggle **Test mode** on
- Do one real end-to-end test purchase each for Monthly, Yearly, Lifetime variants (3 total, all in test mode, no real money)
- Watch `pm2 logs colorarchive-server --lines 200` while each happens; capture the webhook flow
- Cross-check with the server DB: the `orders`/`subscriptions` tables (per `server/routes/webhook.js:47-50,153-210`) should have matching rows
- Verify: buyer email receives Resend-sent receipt; Pro flag flips on the test account; `/thanks` page shows correctly post-redirect
- If any step fails, fix inline (bug fix + commit + redeploy), then re-test
- Write a new file `docs/ls-commerce-validation-2026-04-17.md` recording the test results, webhook sample payloads, and any bugs found/fixed

**Verification:** three successful test-mode purchases end-to-end, each producing a valid row in the DB plus a receipt email.

**Risks:** a test purchase requires a test card (LS provides one). User may want to witness; alternative is test-mode accepts the LS-provided test card `4242 4242 4242 4242` without real funds.

### Phase 3a — OG image routes for collections & guides (~2h)

**Goal:** make collections and guides pinnable. Pinterest needs a 1200×630 image URL for each `media_source`; today only `/colors/[slug]/opengraph-image.tsx` exists.

**Changes:**
- `app/collections/[slug]/opengraph-image.tsx` — dynamic OG for collections, shows 4–6 swatches from the collection's `colorIds` + collection name
- `app/guides/[slug]/opengraph-image.tsx` — dynamic OG for guides, shows guide title + hero color swatch
- Both use `next/og` ImageResponse (same pattern as color page OG)
- Both honor `trailingSlash:true` the same way the color OG does

**Verification:**
- `curl .../collections/warm-autumn-sunset/opengraph-image/` → PNG 1200×630
- `curl .../guides/color-theory-basics/opengraph-image/` → PNG 1200×630
- Render a few in browser to confirm they look good

**Risks:** OG routes go through Vercel's serverless runtime. Cost is negligible but we should confirm rendering time stays <3s. If a guide has 20 colors and the OG tries to render all, we truncate.

### Phase 3b — Content rotation in pin-scheduler (~3h)

**Goal:** expand the daily autopilot beyond Color-of-the-Day so we pin ~3 items/day on rotation (color + collection + guide).

**Changes:**
- `server/pin-scheduler.js` — add `pickDailyContent(date)` that deterministically returns:
  - One color (COTD, already implemented)
  - One collection (hash date → index into collections list, skipping recently-pinned ones)
  - One guide (same)
- Refactor `runDailyPin()` into `runDailyRotation()` which emits one pin per content type with 30s spacing (Pinterest rate-friendly, avoids spam heuristics)
- Dedup keys extended: `YYYY-MM-DD-color-{id}`, `YYYY-MM-DD-collection-{slug}`, `YYYY-MM-DD-guide-{slug}`
- New env var `PIN_SCHEDULER_CONTENT_TYPES=color` — starts at color-only (current behavior) and the rotation **opt-in** by explicitly setting `color,collection,guide` once we've observed a week of healthy single-pin runs. No ramp = no Pinterest anti-spam surprise on a recent account (Codex P1).
- New env var `PIN_SCHEDULER_MAX_PER_DAY=1` — hard cap, bumped via env when ramping. 1 → 2 → 3 over successive weeks, not in one step.
- Hard code ceiling of 5 to prevent typos from producing runaway pinning

**Verification:**
- Dry-run via `PIN_SCHEDULER_DRY_RUN=true node -e "require('./server/pin-scheduler').runDailyRotation()"` — confirms 3 payloads, correct OG URLs, no API calls
- Live: restart with dry-run off, observe 3 new pins on the board within the 45s initial-check window

**Risks:**
- Collection/guide OG images may not render in time for Pinterest's fetcher. If Pinterest hits the OG URL during a cold Vercel function, it can take 5–10s; if Pinterest times out we get error 2786 again. Mitigation: pre-warm URLs with a local `fetch` before calling `publishPin` for collections/guides.
- "Skipping recently-pinned" needs a window — say, don't re-pin the same collection for 30 days. Implement via pin-log scan.

### Phase 3c — Autopilot admin status endpoint + opportunistic commerce log (~2h)

**Goal:** a single HTTP endpoint, bearer-gated, that shows whether each autopilot is healthy + last-run timestamps + recent activity + basic counters. Also adds a minimal commerce log so we have *some* visibility into LS webhook activity.

**Changes:**
- `GET /admin/autopilot/status` (bearer-gated) returns:
  ```
  {
    pinterest: { connected, last_pin_at, total_pins_last_7d, last_error },
    instagram: { connected, last_post_at, last_story_at, total_posts_last_7d, last_error },
    email: { last_newsletter_at, next_scheduled },
    commerce: { last_lemonsqueezy_hook_at, total_purchases_last_7d }
  }
  ```
- `server/require-admin-bearer.js` — already exists, reuse
- `server/pinterest-admin.js` — `getStatus()` already exists, just extend with pin counters from `.pin-log.json`
- IG side: add a similar `getStatus()` if not already there; wire into the aggregate endpoint
- Commerce: read from **the existing Express DB** that `server/routes/webhook.js:47-50,153-210` already writes to (orders + subscriptions tables). Expose counters + last 10 events via `/admin/autopilot/status`. **No new flat file.** (Codex P1)
- Minimal HTML admin page at `app/admin/autopilot/page.tsx` that uses the **existing signed-in admin auth pattern** (`app/admin/orders/page.tsx:17-24` — reads the user's session token via `src/lib/auth-client.ts`, same as the orders admin page). **No localStorage bearer.** (Codex P1)

**Verification:**
- `curl -H "Authorization: Bearer $ADMIN_API_TOKEN" api.colorarchive.org/admin/autopilot/status` → JSON with all four channels
- Visit `/admin/autopilot/` in browser after pasting bearer into localStorage, see a simple health dashboard
- Confirm no leak of sensitive data (tokens, webhook secrets) in any response field

**Risks:**
- If the admin page stores the bearer in `localStorage`, any XSS on the site = admin token leak. Mitigation: the admin page is behind an obscure path (`/admin/autopilot/`) but that's not real security. Better: require the bearer on every load via a prompt, don't store. Trade-off: worse UX but this page is only hit by me.

## Rollout

1. Phase 3a — one commit, Vercel deploy, verify OG URLs render
2. Phase 3b — one commit, SSH pull + pm2 restart, smoke test dry-run first, then flip live
3. Phase 3c — one commit spanning both server (status endpoint) and Next.js (admin page), deploy both

Each phase gets a Gemini 3 Pro review between commit and merge, per the user's requested flow. Any P0/P1 findings addressed before moving to the next phase.

## Non-goals

- ❌ Twitter / X autopilot (separate feature, existing Twitter integration not touched today)
- ❌ LS subscription cancellation flow (Phase 2 of commerce, separate plan)
- ❌ iOS metadata + directory URL updates (user's manual task list, not code)
- ❌ Any new Pro features (feature-complete per Sprint 2)

## Codex review resolution (2026-04-17)

Codex verdict: **ship-with-changes**. All concerns folded into the plan above:
- P0 "LS commerce validation should preempt" → new **Phase 0** added, runs first
- P1 "commerce log duplicates DB state" → Phase 3c now reads the existing DB, no flat file
- P1 "localStorage bearer not a repo precedent" → Phase 3c now uses signed-in admin pattern
- P1 "3/day too aggressive for a recent account" → Phase 3b starts at 1/day, ramps via env var
- P2 "color OG is the simplest case" → Phase 3a's risk section already acknowledges this; no code change needed

Starting Phase 0 after this doc lands.

## Open questions for Codex review (original, pre-revision)

1. Collection/guide OG image routes — does rendering during Vercel's cold start reliably stay under Pinterest's fetch timeout? Any production examples this plan should mirror?
2. Pin-log-based dedup window (30 days for repeat content) — too short? Too long? What's Pinterest's anti-spam tolerance for near-duplicate pins?
3. Commerce log via file-append vs. Supabase table — plan says flat file for parity with autopilot. Is this too sketchy for actual purchase observability?
4. The 3 pins/day with 30s spacing — is that likely to trigger Pinterest's "new account spam" heuristics, given our account is recent?
5. Is there a higher-leverage direction I'm missing that warrants preempting this plan?
