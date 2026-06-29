# ColorArchive — Multi-platform review + competitive analysis (2026-06-29)

> **Sources (multi-model):** Claude Opus 4.8 (synthesis) · 5 Claude code-review agents (web, server, iOS, Figma, VS Code, reading real source) · 4 Claude competitive-research agents · **Gemini 3.1 Pro** · **Gemini 3.5 Flash**.
> **Frame:** pre-launch validation, hard exit gate ~2026-07-15, build-gate = STOP (no net-new product features until WTP validated). Every item is tagged **[DO NOW — gate-safe]** or **[AFTER VALIDATION]**.

---

## 0. The one thing every model agreed on (highest confidence)

**The bottleneck is distribution, not features — so connect the surfaces you already have and route existing traffic into `/preorder`.** Two grounded, embarrassingly-cheap gaps surfaced independently by the web agent *and* both Gemini models:

- **Color-detail pages (5,000+ pages, the site's highest-traffic surface) have NO Auditor CTA at all.** Adding `<AuditorPreorderCta from="color-detail" />` is an S-effort change that exposes the pre-order to the bulk of the 26k/30d pageviews.
- **`palette-audit-page.tsx` imports `AuditorPreorderCta` but never renders it** — a literal one-line gate-safe fix on the exact page where a user just saw their palette fail.

Everything else is secondary to wiring existing high-intent traffic to the gate.

---

## 1. DO-NOW shortlist (gate-safe, ranked by leverage)

| # | Action | Where (real files) | Effort | Backed by |
|---|--------|--------------------|--------|-----------|
| 1 | **Add Auditor CTA to color-detail pages + render the already-imported CTA on palette-audit results** (gate it on `lowContrastCount>0 \|\| duplicateGroups>0`) | `color-detail-page.tsx`, `palette-audit-page.tsx`, `auditor-preorder-cta.tsx` | S | web agent, Gemini Pro+Flash, a11y-comp |
| 2 | **Connect generator → live `/preview` → contrast → colour-blind → export into ONE flow** (all pieces already exist; pure plumbing via query params) | `palette-generator-page.tsx`, `palette-preview-page.tsx`, `palette-export-panel.tsx`, `colorblind.ts` | M | palette-comp, Gemini Flash |
| 3 | **Server: wrap payment webhook writes in `db.transaction()`; fix the AI rate-limit check-then-increment race; add Sentry breadcrumbs/alerting to `/ai/*`** (a bad model name 404'd silently for ~5 weeks) | `server/routes/webhook.js`, `server/ai-rate-limit.js`, `server/routes/ai.js` | M | server agent |
| 4 | **Repurpose `/analyze` (URL colour extractor) to also run a contrast check** → show failures → pitch the Auditor with the user's *own* brand colours | `analyze` page + `server/routes/ai.js` `/ai/analyze-url` | M | Gemini Pro+Flash |
| 5 | **DTCG-spec-correct token export** (`$value/$type/$description`, group `$type` inheritance, downloadable `.tokens.json`) + self-documenting `$description` carrying the colour name + achieved contrast | `token-generator-page.tsx`, reused by `palette-audit.ts` for the Auditor's "fixed token export" | M | tokens-comp, Gemini Flash |
| 6 | **Word-paywall hydration fix** — compute `gated` in a `useMemo` (reads `isUnlocked()`+`readCountedWords()` every render) so unlocked content doesn't flash before the gate re-arms | `word-color-generator-page.tsx` (~L104, L158-165) | S | web agent |
| 7 | **Real APCA (Lc) formula alongside WCAG-2** on the contrast checker (dual "compliance floor / readability ceiling" badge) | `contrast-page.tsx` | M | a11y-comp |
| 8 | **Sharpen the auto-fix to prefer the nearest *named archive* colour** (ΔE in LCH) that clears the target ratio — this is the moat, not a synthetic hex nudge | `palette-audit-page.tsx` SuggestionsList, `color-utils.ts` | M | a11y-comp (the differentiator) |
| 9 | **Figma plugin "fake-door" Auditor** — an "Audit (Beta)" tab: paste/scan a palette, free 3-pair limit, then CTA → `/preorder?utm_source=figma&context=auditor-preview` | `figma-plugin/ui.html`, `code.js` | M | figma agent, Gemini Pro+Flash |
| 10 | **Close the checkout/measurement funnel** — fire `checkout_success` on `/thanks`, `checkout_cancelled` on `/cancel`, and a `recruit_banner_impression` event | `thanks-page.tsx`, `cancel-page.tsx`, `word-color-generator-page.tsx` | S | web agent |
| 11 | **iOS real bugs:** only call `transaction.finish()` *after* backend sync succeeds (else Pro entitlement is silently lost); guard the `AuthStore.checkSession()` race with a timeout | `ios/.../StoreManager.swift`, `AuthStore.swift` | S | iOS agent |
| 12 | **Embeddable "name this colour" widget** (Name-That-Color pattern, but a 5,446-name space) + bind the existing colour-blind sim onto colour-detail pages | `identify` + `embed`, `color-detail-page.tsx`, `colorblind.ts` | M | naming-comp, Gemini Flash |
| 13 | **Single-intent converter landing pages** (`/convert/hex-to-rgb`, `/rgb-to-cmyk`, …) reusing existing conversion logic — pure SEO surface expansion | `app/convert`, `color-convert.ts` | M | naming-comp |
| 14 | **iOS quick wins:** lazy colour load off the main thread (launch perf), email-format validation on login, optional social-proof on the paywall | `ColorStore.swift`, `LoginView.swift`, `ProPaywallView.swift` | S | iOS agent |
| 15 | **VS Code:** surface "WCAG contrast (Pro)" in the marketplace description; drop the unreliable `fetch` fallback (compute locally) | `vscode-extension/package.json`, `src/extension.ts` | S | vscode agent |

---

## 2. Per-platform detail

### Web (core product) — *production-ready for validation, 3 small bugs + funnel gaps*
- **Bugs:** word-paywall hydration flash (#6 above); `pro-gate.tsx` date-boundary off-by-one on the daily export reset; colour-detail related-swatch has no hover affordance; recruit banner has no impression event (can't compute CTR).
- **Currency — verify, don't blindly change:** the web agent flagged `JP¥` as "redundant." **It is deliberate** (2026-06-14 anti-RMB fix, commit `0720fce`): a bare `¥` reads as RMB to Chinese users, making ¥19,999 look like ~$2,750 instead of ~$125 — which Gemini *Flash* independently flagged as a conversion-killer. **Keep `JP¥`**; the only refinement worth making is locale-aware labels for non-CJK visitors. (A good example of one agent being wrong and the cross-check catching it.)
- **Gate-safe polish:** items #1, #4, #10 above; add an "Auditor — coming soon" card to the hero so every homepage visitor sees it; ensure `<html lang>` is set.
- **After validation:** ship the Auditor; **Palette Diff** tool (compare two palettes for WCAG conflicts → Auditor upsell); **Team accounts** (note `teamPlanConfig` already exists in `checkout-config.ts` but is unused); Figma Plugin 2.0 (push palettes → Figma Variables).

### Server (Express + better-sqlite3) — *strong security fundamentals, real reliability gaps*
- **High:** payment-webhook completion writes order + subscriber + email non-transactionally (`webhook.js`) → wrap in `db.transaction()` with email *after* commit. AI rate-limit reads then increments non-atomically (`ai-rate-limit.js`) → concurrent requests bypass the cap; do an atomic check+increment. The default Gemini model name 404'd on **every** AI call for ~5 weeks silently (now `gemini-2.5-flash`) → add `/ai/*` observability/alerting. *(Aside: `gemini-3.1-flash` / `gemini-3.5-flash` are now live on the API key — a free quality upgrade if you want it.)*
- **Med:** in-memory rate-limit Maps (auth/events/pageviews) leak under load; no Gemini token/$ budget caps + no input-length caps on `/ai/*`; missing composite indexes (`events(event_name,created_at)`, `orders(attributed_source,created_at)`, `subscribers(channel,...)`).
- **Low:** Apple JWS path doesn't assert `environment==='Production'`; `referral_code` lacks a UNIQUE constraint.
- **After validation:** a **public `/api/v1/colors` product** (usage-based revenue), a webhook **retry/dead-letter queue**, a `/me/usage` metrics endpoint, and an AI-provider abstraction (graceful Gemini→fallback).

### iOS (SwiftUI + StoreKit 2) — *clean, near feature-parity; not a thin wrapper but not yet native-differentiated*
- **Bugs:** `transaction.finish()` is called even when backend sync fails → lost entitlement (#11); `AuthStore.checkSession()` can drop a concurrent foreground check with no timeout; `StoreManager.loadProducts()` lacks auto-retry/backoff; `ColorRecord.textColor` decides black/white from lightness only (use WCAG luminance — there's already `ColorConvert.relativeLuminance()`); `SpotlightIndexer` detached task isn't de-duped/cancelled.
- **Polish:** lazy colour generation off the launch path; "Report a bug" → Sentry; email validation on login; clearer Ask-to-Buy pending copy; optional paywall social proof.
- **After validation (ranked):** Spotlight **App Intents / Siri Shortcuts** ("Open Cerulean"), **eyedropper/camera capture**, **Share extension**, **Color-of-the-Day widget**, iCloud palette sync. These earn the "native" positioning.

### Figma plugin — *polished v1.1.0, but the funnel dead-ends at the web*
- No in-plugin Pro/Auditor path — designers (the exact Auditor ICP) discover features but have nothing to convert into. **In-plugin fake-door Auditor (#9) is the single highest-value add here.** Also: the **API key is shown in plaintext** in the Projects tab (mask it + warn); add a brand-scale tooltip; gate Projects to Pro.

### VS Code extension — *lightweight (334 LOC), lots of untapped dev-funnel*
- No auth/upsell, no inline diagnostics, no colour decorations, and an unreliable `fetch` fallback (compute locally instead). **After validation:** inline contrast **linting** on CSS/Tailwind with quick-fix swaps from the archive, colour **hover/decoration** providers, token **completions**, and a sign-in → Pro path. Today: fix the marketplace copy + keywords (#15).

---

## 3. Competitive — what to borrow (and the moat)

### Palette generators — *Coolors, Realtime Colors, Huemint, Khroma, Color Hunt*
- **Borrow [do-now]:** live-UI preview *inside* the generator (Realtime Colors); spacebar-to-generate habit (Coolors); lock/assign colour **roles** with per-role contrast badge; framework export presets (**Tailwind v4 `@theme`**, shadcn `oklch` vars, PNG card); make every curated/collection/famous palette **"Open in generator / Preview on UI"** instead of dead-ending.
- **Borrow [after-val]:** per-pair target-contrast slider on AI palettes (Huemint matrix); taste-trained generation from favourites (Khroma).
- **Moat:** be the **only** tool where palette → live preview → WCAG/CVD audit → framework export → **named** library live in one connected flow. Competitors each own one slice and dead-end you between them; ColorArchive already has every piece built — the moat is connecting them (plumbing, gate-safe).

### Accessibility — *Stark, Polypane, WhoCanUse, Adobe Leonardo, axe*
- **Borrow [do-now]:** real APCA dual-readout; archive-sourced auto-fix; a cited demographic line next to CVD results ("~1 in 12 men…").
- **Borrow [after-val]:** whole-system N×N matrix; cross-CVD grid; shareable/printable report; CI + Figma integration; target-ratio → ranked archive colours (Leonardo's inversion).
- **Moat:** the **5,446 named colours as the fix source** — every rival nudges lightness to invent a synthetic hex; ColorArchive returns a *named, catalogued, linkable* colour that's both accessible **and** a reusable token. The fix links to `/colors/{id}` → **fix-as-discovery flywheel** feeding the catalog/SEO. Sold as a one-time founder price, it undercuts Stark's per-seat subscription for the solo/indie ICP already landing on `/palette-audit` and `/contrast`.

### Design tokens — *Tokens Studio, Style Dictionary, Adobe Leonardo, Supernova*
- **Borrow [do-now]:** spec-correct **W3C DTCG** JSON; Style-Dictionary-native output that round-trips; **self-documenting tokens** (`$description` = colour name + achieved ratio).
- **Borrow [after-val]:** token references/aliases (semantic layer), multi-mode tokens (light/dark + an `a11y/high-contrast` mode), Figma **Variables** push via the existing plugin.
- **Moat:** *accessibility-first named tokens* — "export tokens that are provably AA/AAA and still on-brand" is a lane Leonardo (no curated palette) and Tokens Studio (a11y as a side-check) don't own. **Guardrail:** Specify shut down in 2024 — a standalone token pipeline has no moat; treat tokens as the **output format of the validated Auditor job**, which is exactly the gate=STOP posture.

### Naming / SEO — *encycolorpedia, colornames.org, Name That Color, Pantone*
- **Borrow [do-now]:** per-colour reference **depth** (conversions + CVD + tints/shades + "similar named colours") on every detail page; single-intent **converter landing pages**; an embeddable **"name this colour"** widget for backlinks; an editorial **trend report / annual signature colour** (Pantone-lite, earned media) using existing `color-trends`/`seasons`/`journal`.
- **Moat:** curated **+** algorithmic hybrid (richer, less-thin pages than per-hex competitors); **own the programmatic verticals no one occupies** — colours by **decade / region / industry / brand** (all data already exists) is whitespace encycolorpedia/colorhexa have no answer to. **Avoid the colornames.org trap:** a growing dataset with zero monetization capture is worthless — keep Pro/packs/pre-order coupled to the high-intent surfaces.

---

## 4. The single highest-leverage move (next 30 days) — unanimous

**Hijack your own traffic into the validation gate.** You have ~26k pageviews/30d pooling on colour-detail pages, word-to-color, and SEO guides, and a pre-order at near-zero traffic. Don't build the Auditor — build the *paths to it*:

1. Contextual `AuditorPreorderCta` on colour-detail pages, palette-audit results, the hero, and the Figma plugin (items #1, #9).
2. A **fake-door Auditor** on `/preorder`: accept a palette via query param (from the palette builder / `/analyze`), run a quick client-side contrast check on the user's *own* colours, show a blurred "full report + PDF + fixed tokens" behind the ¥4,999 founder offer (items #4, #9). 100% gate-safe — no Auditor code, just the offer in front of warm traffic.
3. Watch the gate weekly. **<10 real pre-orders by 2026-07-15 → off-ramp** (pivot to monetizing packs via the SEO converter pages); ≥10 → build the Auditor, leading with the named-archive auto-fix moat.

---

*Note on method: Gemini 3.1 Pro and 3.5 Flash gave strong strategic alignment (both independently nailed the "interception, not building" thesis and the JP¥/RMB risk) but hallucinated several exact filenames; the 9 Claude agents reading real source supplied the accurate paths and the concrete bugs. This report uses the agents' grounded specifics and the models' strategic convergence as the high-confidence signal.*
