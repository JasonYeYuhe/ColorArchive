# Human TODO — ColorArchive

> Things the autopilot can't do. Jason handles these when he picks up the project.
> Last updated: 2026-06-19 (deep perf/bundle batch + B3/B5 + 28-fix product batch)

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
