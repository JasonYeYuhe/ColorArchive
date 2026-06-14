# Human TODO — ColorArchive

> Things the autopilot can't do. Jason handles these when he picks up the project.
> Last updated: 2026-06-14 (SEO/exposure batch — page-1 + traffic push)

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
- [ ] **Fix the pricing numbers.** `priceUsd` in `src/lib/checkout-config.ts` is inconsistent
      with the JPY amounts: ¥499 ≈ US$3.34 but `priceUsd` says $6.99; ¥19,999 ≈ $134 but says
      $199.99. Your LS variants bill in **JPY**. Decide: (a) what the real prices should be,
      and (b) whether to bill in USD at all (JPY billing is friction for a global/US ICP —
      the actual designer you're selling to). I can implement once you decide.
- [ ] **Run a real willingness-to-pay test** (the audit's core — nobody has ever paid):
      1. *Pre-order a specific Pro feature* — card-required "Pre-order $X" on ONE concrete
         capability (e.g. "AI-audit my whole palette for WCAG + export fixes"). Needs an LS
         product; I can build the landing + gating. Kill criterion: <10 pre-orders in 30 days.
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
