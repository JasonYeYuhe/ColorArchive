# Human TODO — ColorArchive

> Things the autopilot can't do. Jason handles these when he picks up the project.
> Last updated: 2026-06-10 (Figma plugin launch-week session)

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
- [ ] **Reddit posts** — the ONLY remaining launch-wave leg. Claude's browser extension
      domain-blocks reddit.com (automation policy), so this is genuinely manual: drafts
      in docs/figma-plugin-launch-posts-2026-06-10.md §3 (r/FigmaDesign now;
      r/web_design a day or two later to avoid same-link spam filters). Disclose maker.
- [x] ~~Product Hunt + Indie Hackers updates~~ — **DONE 2026-06-10 evening**:
      IH product-timeline post published (the global "create posts" gate doesn't apply
      to product posts); PH product page tagline/description refreshed (was "3066
      colors") + maker-update comment posted on the live launch thread. NOTE: a full PH
      *re-launch* was deliberately NOT fired (it was 4 AM PT — wasted slot); if wanted,
      schedule one for 12:01 AM PT with proper assets.

## 🟠 P1 — strategy critical path (V2 plan)

- [ ] **S2: the 10 user interviews** — still not started; script ready at
      docs/user-interview-script.md. This is the V2 exit-gate input; the plugin only
      adds a recruiting channel, it does not replace interviews.
- [ ] **StoreKit sandbox purchase test** (carried over): Xcode → sandbox tester → Pro
      purchase; watch `ssh root@143.198.85.72 'pm2 logs colorarchive-api --lines 40
      --nostream'` for `[DEPRECATION] apple-purchase got JSON (not JWS)`.
      iOS v1.2 build 4 is in App Store review (submitted 2026-06-07).
- [x] ~~App Privacy label~~ — **already done** (verified 2026-06-10: App Privacy published
      4 days ago with Crash Data + Product Interaction; the memo was stale). Bonus
      finding: **iOS v1.2 shows "Ready for Distribution" in ASC — the review passed.**

## 🟡 Carried over (still open)

- [ ] **React hydration error #418 on /palette-audit/** with zh locale — intermittent
      race between head localeScript and LocaleProvider; scoped to that page. Next step:
      add a zh-locale e2e path or bisect by removing the head localeScript.
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
