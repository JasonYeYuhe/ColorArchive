# Pinterest Standard Access — Development Plan (2026-04-17)

## Context

Pinterest Developer Platform approved our app **"ColorArchive Pin Saver"** (app ID `1559553`) for **Standard access** on 2026-04-15. Before this, the app had Trial access, which meant production reads but sandbox-only writes.

Current state:
- App ID `1559553`, secret stored in `server/.env`
- DO Droplet has `PINTEREST_SANDBOX=true` → all `POST /pins` go to `api-sandbox.pinterest.com`
- Frontend flow is live: user clicks "Save to Pinterest" on any color page → OAuth → picks board → pin created (but in sandbox, so nothing visible on real Pinterest)
- No autopilot / server-side pinning exists yet

## What Standard Access unlocks

1. **Production writes** — real pins created on real Pinterest
2. **Higher rate limits** — Standard is typically 10,000 requests/day vs Trial's lower ceiling
3. **All `v5` endpoints** available including board creation, pin analytics, etc.
4. **App marketable** — we can promote "Save to Pinterest" without the sandbox caveat

## Phase 1 — Production Switch (~15 min, must-do)

**Goal:** existing user-facing "Save to Pinterest" button creates real pins.

Changes:
1. DO Droplet `/root/ColorArchive/server/.env`: flip `PINTEREST_SANDBOX=true` → `false` (or delete the line — defaults to false in [pinterest.js:21](server/routes/pinterest.js:21))
2. `pm2 restart colorarchive-server`
3. Smoke test: connect our own Pinterest account via the live button on any color page, save a pin to a test board, verify it appears on `pinterest.com/{our-username}`
4. Delete the sandbox-only comment on [pinterest.js:20-27](server/routes/pinterest.js:20) — post-approval it's misleading; unify to a single production URL constant
5. Update [.env.example](server/.env.example) to drop `PINTEREST_SANDBOX` (or keep as optional dev flag with a comment)

**No code deploy required for the live switch — purely an env change on the Droplet.** The cleanup PR for code comments can ship with Phase 2.

## Phase 2 — Autopilot Pinning (main work)

**Goal:** auto-publish our own content (collections, guides, new palettes) to **our ColorArchive Pinterest account** on a cron schedule. This drives organic discovery from Pinterest → site.

### Why this is high-leverage
- We already have **256 collections + 315 guides + 5,446 color pages** = huge inventory of pinnable content
- Each has an OG image at `/{slug}/opengraph-image` — already renders 1200×630 visual
- Pinterest is a visual search engine; color + design content performs well
- Existing autopilot already writes newsletters, guides, collections — adding a Pinterest step fits the pattern

### Architecture (mirrors [instagram.js](server/routes/instagram.js) pattern)

New server routes in [server/routes/pinterest.js](server/routes/pinterest.js) (extend, not rewrite):

```
GET  /pinterest/admin/auth/start     — Redirect admin to Pinterest OAuth with ADMIN scope
GET  /pinterest/admin/auth/callback  — Exchange code, store long-lived token
POST /pinterest/admin/publish        — Create a pin on our account (admin-only, bearer-auth)
POST /pinterest/admin/refresh        — Refresh token before expiry
GET  /pinterest/admin/status         — Token expiry, connected username, last-pin timestamp (drop rate-limit quota claim — Pinterest doesn't expose a quota endpoint; we track our own count)
```

Admin auth gating (**revised after Codex review**): IG route currently has no real middleware — just a code comment. I'll introduce a proper middleware `requireAdminBearer` in `server/middleware/require-admin-bearer.js` that checks `Authorization: Bearer ${ADMIN_API_TOKEN}`, and apply it to both the new Pinterest admin routes AND retrofit it onto the IG `/publish` route in the same commit. No more implicit trust.

Token storage: Pinterest access tokens last 30 days; refresh tokens last 1 year. Store both in a JSON file on the Droplet (`server/.pinterest-admin-token.json`), mirroring the IG `TOKEN_FILE` approach. Hydrate into memory on boot.

Token refresh (**revised** — pick ONE strategy, mirror IG exactly): on server boot, run `autoRefreshToken()`; also call it every 12 hours via `setInterval`. No per-batch refresh, no "5 days before expiry" branching — simplicity wins. If a pin creation returns 401, that's the failure signal and we refresh+retry once.

### Autopilot integration

Add a new autopilot step `autoPinToPinterest()` that runs once per autopilot cycle:
1. Pick 1-2 fresh items from the most recent autopilot output (new collection OR new guide)
2. Compose pin payload:
   - `title`: item title (max 100 chars)
   - `description`: first 500 chars of item body + CTA ("See the full palette at colorarchive.org")
   - `link`: canonical URL
   - `media_source.url`: OG image URL
   - `board_id`: pre-configured board per content type (collections → "Color Collections" board; guides → "Color Theory" board)
3. `POST /pinterest/admin/publish` internally
4. Log to `autopilot-log.md` and `docs/autopilot-log.md`
5. Rate-limit: hard cap at 5 pins per autopilot run to stay well under Pinterest's spam thresholds

Board mapping config in `src/lib/pinterest-boards.ts`:
```ts
export const PINTEREST_BOARDS = {
  collections: process.env.PINTEREST_BOARD_COLLECTIONS ?? "",
  guides:      process.env.PINTEREST_BOARD_GUIDES ?? "",
  colors:      process.env.PINTEREST_BOARD_COLORS ?? "",
};
```

(IDs populated after Phase 1 smoke test creates/picks boards manually.)

### Files touched

- **Extend** `server/routes/pinterest.js` — add admin section (~150 LOC)
- **Extend** `server/index.js` — no change needed, route already mounted
- **New** `server/lib/pinterest-admin.js` — token store + refresh helper (mirrors IG pattern)
- **New** `scripts/autopilot-pinterest.mjs` — standalone script that autopilot calls. **Does NOT hit HTTP endpoints** — directly `require()`s the admin helper (`server/lib/pinterest-admin.js`) in-process. This avoids the "how does the script authenticate to its own API" question entirely. The `/pinterest/admin/publish` HTTP endpoint exists for manual/ad-hoc admin use via curl with `Authorization: Bearer $ADMIN_API_TOKEN`, not for autopilot.
- **New** `docs/pinterest-admin-setup.md` — one-time OAuth bootstrap instructions for the admin
- **Update** `server/.env.example` — new vars (`PINTEREST_BOARD_*`)
- **Update** `STRUCTURE.md` — new endpoints + scripts

### Data model

No DB changes. Token store is a flat JSON file (consistent with IG pattern). Autopilot tracks already-pinned items via existing mechanism (newsletter-issues.json style — a new `pinterest-pin-log.json` with `{itemId, pinId, pinnedAt}` keyed by content).

### Testing

1. Unit: a smoke test script `scripts/test-pinterest-admin.mjs` that:
   - Verifies admin token loaded
   - Fetches our boards
   - Creates a test pin to a "Test" board
   - Deletes it via `DELETE /pins/{id}` (cleanup)
2. Integration: run autopilot in dry-run mode (`AUTOPILOT_DRY_RUN=true`) — script logs what *would* be pinned without calling the API
3. Manual: verify on `pinterest.com/{our-account}` after first real run

### Risks

| Risk | Mitigation |
|---|---|
| Pinterest flags autopilot as spam | Hard cap 5 pins/run, space content across boards, use real titles/descriptions (no keyword stuffing) |
| Token expiry mid-run | Refresh-on-boot + before every batch; fail-closed logging if refresh fails |
| OAuth state CSRF | Use `crypto.randomUUID()` state param + cookie (same pattern as IG) |
| Rate-limit burst on autopilot spike | Throttle with 2s delay between pins within same run |
| Pin to wrong account if token belongs to wrong user | Admin bootstrap flow shows connected username + confirms before saving |
| Missing OG image for older guides | Fallback to generic branded image via `/og-default.png` |

### Rollout

1. PR 1: Phase 1 cleanup (sandbox flag removal, env example update) — single commit, Vercel no-op since only touches server-side comments
2. PR 2: Phase 2 admin routes + admin token bootstrap — single commit. Does not activate until admin OAuth is completed manually. Safe to deploy behind inactive state.
3. Admin bootstrap: one-time browser visit to `/pinterest/admin/auth/start`, grant perms, verify status
4. Smoke test via `scripts/test-pinterest-admin.mjs`
5. PR 3: autopilot integration — pins from the next scheduled autopilot run. Start with dry-run enabled for 1-2 cycles, then flip live.

### What I'll NOT do in this plan

- ❌ No Pin *analytics* dashboard in our UI — not requested, adds scope
- ❌ No user-facing "share a palette as a pin board" — separate feature, bigger design surface
- ❌ No Pinterest Ads API — that's a separate Ads-scoped approval
- ❌ No migration of user-facing flow to admin flow — they coexist

## Timeline

- Phase 1: same day (env flip + smoke test, ~15 min)
- Phase 2 Admin routes: ~3-4 hours (follow IG template)
- Phase 2 Autopilot integration: ~2 hours
- Admin bootstrap + smoke test: ~30 min
- Total: ~6-7 hours of focused work over 1-2 sessions

## Codex review resolution (2026-04-17)

Codex verdict: **ship-with-changes**. Concerns addressed above. Condensed answers to the open questions:

1. **Flat JSON for tokens** — keep, consistent with IG pattern, single-host state
2. **Delete endpoint** — build `DELETE /pinterest/admin/pins/:id` for autopilot cleanup (un-publish bad pins)
3. **Rate cap** — default 1-2 pins/run, hard ceiling 5; spam heuristics are the real risk, not quota
4. **Autopilot log** — one-line success note in `autopilot-log.md`, detail in `pinterest-pin-log.json`

## Open questions (original, pre-review)

1. Is mirroring the IG admin-token pattern the right call, or should Pinterest tokens live in Supabase instead of a flat JSON file? (IG predates Supabase adoption for non-user state.)
2. Should I build `DELETE /pins/{id}` into the admin route set for cleanup, or rely on Pinterest's UI? (Leaning: yes, build it — lets us un-publish if autopilot generates a bad pin.)
3. Rate cap of 5 pins/autopilot-run — too aggressive or too conservative? Standard access quota is ~10k req/day, so even 50 pins/day is trivial in raw API terms, but Pinterest's anti-spam heuristics are stricter than rate limits suggest.
4. Should autopilot-pinned content also trigger a "Pinned to Pinterest" note in `autopilot-log.md`, or is that noise?
