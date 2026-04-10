# Google Auth Checklist

Last updated: 2026-03-20

Use this when verifying the first real Google sign-in flow for ColorArchive.

## Google Cloud OAuth Setup

In Google Cloud Console, confirm the OAuth client is configured with:

- Authorized JavaScript origin:
  - `https://colorarchive.org`
- Authorized redirect URI:
  - `https://api.colorarchive.org/auth/google/callback`

If you test locally, also add:

- `http://localhost:3000`
- `http://127.0.0.1:3000`

## Server Environment

Confirm these variables exist on the API server:

- `FRONTEND_ORIGIN=https://colorarchive.org`
- `GOOGLE_CLIENT_ID=...`
- `GOOGLE_CLIENT_SECRET=...`
- `GOOGLE_REDIRECT_URI=https://api.colorarchive.org/auth/google/callback`
- `ADMIN_EMAILS=...` if analytics should stay limited to specific accounts

## First-Pass Smoke Test

1. Open `/login/?next=/favorites`
2. Click `Continue with Google`
3. Complete Google sign-in with the intended account
4. Confirm you see the brief Google success state on `/login/`, then land back on the requested `next` path
5. Confirm:
   - account session exists
   - favorites sync starts
   - palette sync starts
   - `/login/` shows purchase history if the account has orders
6. If the account should have analytics access, open `/analytics/`
7. If analytics should be blocked, verify `/analytics/` stays denied

## Known Failure Modes

- `google-not-configured`
  - one or more Google env vars are missing on the server
- `google-state`
  - the Google auth flow expired or the callback did not match the stored state cookie
- `google-invalid`
  - callback came back without a valid `code` or `state`
- `google-failed`
  - token exchange or userinfo fetch failed; inspect server logs

## Current Code Expectations

- Google login preserves `next` path through `/auth/google/start`
- Magic-link login also preserves `next` path in the emailed login URL
- Session cookie is `Secure` + `HttpOnly` + `SameSite=Lax`
- Analytics access depends on signed-in state plus `ADMIN_EMAILS` allowlist when configured
