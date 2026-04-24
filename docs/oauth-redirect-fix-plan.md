# Fix Plan — Google OAuth `redirect_uri_mismatch` (2026-04-20)

> **STATUS (2026-04-24 via Chrome MCP verification): RESOLVED. No further action required.**
>
> Claude verified GCP OAuth client `546004192441-qcgog7153c5lsu1qesm771n21oeshm72` in
> the `main-analog-442915-s5` project (labeled "ColorArchive Web Login"):
>
> - **Authorized redirect URIs** — both `.me` (URI 1) and `.org` (URI 2) present:
>   - `https://api.colorarchive.me/auth/google/callback`
>   - `https://api.colorarchive.org/auth/google/callback`
> - **Authorized JavaScript origins** — all four present: `.me`, `api.me`, `.org`, `api.org`
> - **Authorized domains** (consent screen / Branding tab) — both `colorarchive.me` and
>   `colorarchive.org` registered
> - **Client "Last used"**: 2026-04-15 — the `.org` entry was added on or before that date,
>   predating the 2026-04-20 bug report
>
> End-to-end verification (2026-04-24 02:06 UTC):
>
> ```
> curl -sI 'https://api.colorarchive.org/auth/google/start' | grep Location
> → Location: https://accounts.google.com/o/oauth2/v2/auth?...&redirect_uri=https%3A%2F%2Fapi.colorarchive.org%2Fauth%2Fgoogle%2Fcallback&...
> ```
>
> Navigating that Location URL in a fresh browser renders the Google "Choose an account"
> consent screen with the heading "to continue to **colorarchive.org**" — no 400 error.
>
> If the user still sees a 400, it is almost certainly stale browser state (cached OAuth
> error page). Fix: hard-refresh, or clear cookies for `accounts.google.com`.
>
> **Soak cleanup (Part 3 below) — still optional:** consider removing the legacy `.me`
> entries from the client once no `.me` OAuth hits show up in Droplet logs for 30 days.

---

## Symptom
User taps "Sign in with Google" (web, rendered on any browser incl. mobile Safari on iOS) → Google returns **Error 400: redirect_uri_mismatch**. Reported from iPhone but **not iOS-specific**; any browser hitting the flow right now will fail.

## Root Cause
- Post-migration backend sends `redirect_uri=https://api.colorarchive.org/auth/google/callback` (confirmed via `curl -sI https://api.colorarchive.org/auth/google/start`).
- Google Cloud Console OAuth client `546004192441-qcgog7153c5lsu1qesm771n21oeshm72.apps.googleusercontent.com` still only whitelists the legacy `.me` URI.
- Domain migration checklist (`memory/project_migration_remaining.md`) missed this item — it only tracked App Store / directory platforms.

No iOS native code is involved: the iOS app (`ios/ColorArchive/`) has **no** Google Sign-In UI; `LoginView.swift` is magic-link only. The user must have opened the web app in Safari (or via the "ColorArchive Web" link in Profile) and tapped the web button there.

## Fix — Two parts

### Part 1: Google Cloud Console (manual, ~3 min, primary fix)
1. Open https://console.cloud.google.com/apis/credentials
2. First confirm **Authorized domains** on the OAuth consent screen includes `colorarchive.org` — Google will refuse saving a redirect URI whose host is not an authorized domain. If missing, add it.
3. Locate OAuth 2.0 Client ID `546004192441-qcgog7153c5lsu1qesm771n21oeshm72`.
4. Edit → **Authorized redirect URIs** → add:
   - `https://api.colorarchive.org/auth/google/callback` (new canonical)
5. Edit → **Authorized JavaScript origins** → add `https://colorarchive.org` if missing (not strictly needed for the server redirect flow today, but aligns with `docs/google-auth-checklist.md` expectations and future-proofs in-browser SDK usage).
6. Keep the existing `.me` entries for now — short soak period (see Part 3).
7. Save.

### Part 2: Verification (curl + real browser)
1. `curl -sI 'https://api.colorarchive.org/auth/google/start'` — confirm `Location:` header sends `.org` redirect_uri.
2. Follow that Location URL in a fresh browser window — expect Google consent screen (not error 400).
3. Complete the full sign-in flow with a real account — expect redirect to `https://colorarchive.org/login?auth=google-success&next=/favorites` and session cookie set.
4. `ssh root@143.198.85.72 'pm2 logs colorarchive-api --lines 40 --nostream'` — confirm no `[google callback]` errors.
5. Also verify from mobile Safari (user's original failure path).

### Part 3: Post-fix housekeeping
1. Update `memory/project_migration_remaining.md` to check off OAuth / add a note about Google Cloud Console.
2. Update `docs/google-auth-checklist.md` if anything was wrong (last updated 2026-03-20, pre-migration).
3. **Soak + cleanup (T+1 week):** after confirming `.org` flow is healthy in logs, remove `.me` redirect URI / JS origin / authorized domain from the GCP OAuth client. Leaving them long-term is unnecessary attack surface.
4. (Optional, v1.x) Add a server-side preflight that validates `GOOGLE_REDIRECT_URI` against a probe endpoint at boot to catch this class of mismatch earlier.

## Why NOT code-rollback (rejected option)
Alternative: set `GOOGLE_REDIRECT_URI=https://api.colorarchive.me/auth/google/callback` on Droplet → reuses existing whitelist → no GCP change needed.

- Pros: pure env-var flip, no Google Console access.
- **Cons (real reason, corrected per Codex review):** session cookie is built **host-only** (`Set-Cookie` has no `Domain=` attribute — see `server/auth.js:42-53`). A callback hitting `api.colorarchive.me` would set a cookie scoped to `api.colorarchive.me` only. But the frontend hardcodes the API origin to `https://api.colorarchive.org` (`src/lib/api-config.ts:1`), so subsequent `/auth/session` requests from the browser would go to `.org` — where the cookie was never set — and the user would appear logged-out immediately after completing OAuth.

Rejected — do the 3-minute GCP change properly.

## Risk
**Low.** Adding a redirect URI to a GCP OAuth client is purely additive. Existing `.me` URI stays. No code change, no deploy. Reversible in seconds.

## Out-of-band
No iOS app changes. No backend code changes. No deploy.

## Author-added note
After completing Part 1, also check that the "API Error" chip the user mentioned was just a consequence of the failed callback — verify no residual error persists after the fix.
