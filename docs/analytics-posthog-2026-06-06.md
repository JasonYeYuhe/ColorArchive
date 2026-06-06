# PostHog Product Analytics — Web + iOS (2026-06-06)

> Delivers V2 plan P0.1 ("接第三方分析"). First time ColorArchive can compute real
> **DAU / retention / conversion funnels** — the existing first-party `pageviews` table has
> no visitor id, so it can't. PostHog sits *beside* the observability stack, not on top of it:
> **Sentry = crashes · New Relic = frontend RUM · Datadog = backend APM · PostHog = product analytics.**

## Tooling decision

PostHog Cloud **EU** (`https://eu.i.posthog.com`), free tier (1M events/mo). Chosen over
Datadog/New Relic because those are observability tools billed per host/session: bending them
to product analytics means hand-built NRQL retention + the web(Browser)/iOS(Mobile) event models
don't unify, and Datadog RUM would double-instrument the web frontend (violating the documented
`NR = 前端 RUM / 勿双埋同一服务` split in `credits.md`). PostHog is purpose-built, free at this
scale, and a different layer, so it complements rather than conflicts.

## Privacy posture (web + iOS)

- **Cookieless.** Web persists the anonymous `distinct_id` in `localStorage` (never a cookie);
  retention still works across sessions. iOS uses the SDK's local storage.
- **No PII.** Events never carry email/name. Logged-in users are `identify()`-ed by their opaque
  numeric backend id; `tier` (free/pro) is the only person property.
- `person_profiles: "identified_only"` (web) — anonymous traffic stays event-only.
- **No session replay** on either platform.
- **No-op until configured** — empty key ⇒ the whole integration is dead code (mirrors the
  empty-DSN Sentry pattern). Safe to ship before the key exists.

## Event taxonomy (names identical across web + iOS)

| Event | When | Key props | Web hook | iOS hook |
|-------|------|-----------|----------|----------|
| `$pageview` / `$screen` | route change / screen open | `path` / screen name | `posthog-provider.tsx` (usePathname) | `ContentView` tab change, `ProPaywallView` |
| `tool_used` | a tool is opened | `tool` | page tracker (known tool slugs) | `ToolsHomeView` nav destination |
| `login` | auth succeeds | `method` (`magic_link`/`google`) | `auth-provider` verify + `login-page` google | `ColorArchiveApp` deep-link verify |
| `sign_up` | account *just* created | `method` | same, gated on `created_at` < 2 min | same, gated on `createdAt` |
| `favorite_toggled` | favorite add/remove | `action`, `color_id` | `favorite-button.tsx` | `FavoritesStore.toggle` |
| `export` | palette exported | `format`, `method`/`type` | 4 export components | `PaletteBuilderView` ExportSheet |
| `upgrade_clicked` | upgrade CTA tapped | `source` | `pro-gate.tsx` (×3) | `ProGateView`, `ProfileView` |
| `checkout_clicked` | checkout/IAP started | `plan`/`product`, `provider` | `checkout-button.tsx` (already existed) | `StoreManager.purchase` |
| `purchase` | IAP result (iOS only) | `product`, `result` | — (LS webhook server-side) | `StoreManager.purchase` |

Plus PostHog **autocapture** (web) and **application lifecycle events** (iOS app open/install →
DAU/retention) come for free. Every existing first-party `track()` call (`checkout_clicked`,
`checkout_redirected`, `ai_generated`, `upgrade_modal_shown`, …) now *also* flows to PostHog,
because `src/lib/track.ts` fans out to both destinations under the same event names.

## How it's wired

**Web** (`src/lib/posthog.ts` + `src/components/posthog-provider.tsx`)
- `track()` (`src/lib/track.ts`) now calls `phCapture()` in addition to the first-party beacon.
- `<PostHogProvider/>` in `app/layout.tsx` inits the SDK + fires `$pageview`/`tool_used` per route.
- `auth-provider.tsx` calls `phIdentify` on session, `phReset` on logout, `trackAuthSuccess` on login.

**iOS** (`ios/ColorArchive/AnalyticsBootstrap.swift`)
- `AnalyticsBootstrap.start()` in `ColorArchiveApp.init()` (right after `SentryBootstrap.start()`),
  reading `PostHogAPIKey` / `PostHogHost` from Info.plist build settings — empty ⇒ no-op.
- All call sites reference only the always-defined `AnalyticsBootstrap` wrappers, so the app
  compiles whether or not the PostHog SPM package has been resolved (`#if canImport(PostHog)`).
- SPM package `https://github.com/PostHog/posthog-ios` (product `PostHog`, ≥ 3.0.0) added to the
  Xcode project, mirroring the Sentry wiring.

## Verification done

- ✅ `npm run typecheck` passes.
- ✅ Local `next dev` boots clean; `/` and `/word-to-color/` render 200; no SSR error from the
  `posthog-js` import; integration no-ops gracefully with an empty key.
- ✅ `plutil -lint` on `project.pbxproj` = OK; all new SPM/source references resolve internally.
- ⚠️ **iOS needs Xcode build verification** (pbxproj/SPM changes) — not done here by design.

## What you still need to do

1. **Create a free PostHog project** (EU Cloud) → copy the **Project API Key** (`phc_…`).
2. **Web:** set `NEXT_PUBLIC_POSTHOG_KEY` (+ optional `NEXT_PUBLIC_POSTHOG_HOST`) in **Vercel**
   env (Production/Preview) *and* your local `.env.local`. Redeploy. Then open the site and watch
   PostHog → **Activity → Live events** for `$pageview`, `tool_used`, etc.
3. **iOS:** open the project in **Xcode** → let SPM resolve `posthog-ios` → set the
   `PostHogAPIKey` build setting (Info.plist `INFOPLIST_KEY_PostHogAPIKey`, currently empty) to the
   same key → **build & run** to confirm. This is the next build's only analytics wiring step.
4. **iOS privacy (before submitting a build with the key set):** add a **Product Interaction**
   entry to `PrivacyInfo.xcprivacy` and the App Store privacy label. The manifest is intentionally
   left accurate for the empty-key (no-collection) state today. Snippet to add:
   ```xml
   <dict>
       <key>NSPrivacyCollectedDataType</key>
       <string>NSPrivacyCollectedDataTypeProductInteraction</string>
       <key>NSPrivacyCollectedDataTypeLinked</key>
       <false/>
       <key>NSPrivacyCollectedDataTypeTracking</key>
       <false/>
       <key>NSPrivacyCollectedDataTypePurposes</key>
       <array>
           <string>NSPrivacyCollectedDataTypePurposeAnalytics</string>
       </array>
   </dict>
   ```
5. **Optional:** in PostHog project settings, toggle "Discard client IP data" for stricter privacy
   (loses country-level geo). Consider a reverse proxy if ad-blockers prove to be an issue.
