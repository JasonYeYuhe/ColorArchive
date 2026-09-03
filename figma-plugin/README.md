# ColorArchive Figma Plugin

Browse all **5,446 curated ColorArchive colors** directly inside Figma and FigJam. Apply fills, create swatches, save local paint styles, generate brand scales, sync saved projects, and inspect WCAG contrast for any selected layer.

- Community page: https://www.figma.com/community/plugin/1616829363158218051
- Live site: https://colorarchive.org

## Features

**Browse tab**
- Search 5,446 colors by name or hex (5,376 chromatic + 70 neutral grays — generated in-UI, mirrors `src/data/colors.ts`)
- Filter by color family (Red, Orange, Yellow …)
- Apply fill to selected layer(s)
- Create a swatch rectangle *(Figma Design only)*
- Save as local paint style `ColorArchive/Family/Name` *(Figma Design only)*
- Export the filtered set as CSS variables / Tailwind config / JSON (copies to clipboard)

**Inspect tab**
- Select any layer with a solid fill → instant WCAG analysis (works in Design *and* FigJam)
- Contrast ratio vs white and vs black with AAA / AA / AA Large / Fail badges
- "View on ColorArchive" deep-links to the color detail page
- "Use best text" applies the highest-contrast text color
- "Generate Brand Scale" creates 30 brand styles (Primary/Neutral/Semantic) from the selected fill *(Figma Design only)*

**Projects tab**
- Connect with a ColorArchive API key (from colorarchive.org/account)
- Lists your saved palettes; one click creates paint styles for a whole project *(Figma Design only)*
- The key persists across plugin sessions via `figma.clientStorage`

## Editor support

`manifest.json` declares `"editorType": ["figma", "figjam"]`. In FigJam, paint-style and rectangle APIs don't exist, so Swatch / Style / Brand Scale / Apply-project are disabled with a friendly note (never a crash). Apply Fill, Export, and Inspect work everywhere.

## ⚠️ The localStorage rule (cost us a review rejection — read this)

The plugin UI iframe is loaded from a **`data:` URL**. In that context `localStorage` / `sessionStorage` **always throw a `SecurityError`**, and a single unguarded access at script load **kills the entire UI script** (this exact bug caused the 2026-05-12 review rejection: `window.onmessage` never attached, Inspect stuck on its placeholder, FigJam crashed).

Rules:

1. **Persistence goes through `figma.clientStorage`** — main-thread only, async. The UI requests state via the `ui-ready` → `init` message round-trip and mutates it with `save-api-key` / `clear-api-key` messages (see `src/code.ts`).
2. The UI keeps `safeGetItem` / `safeSetItem` / `safeRemoveItem` try/catch wrappers as a belt; **never call `localStorage.` directly in `ui.html`**.
3. CI enforces this: the `figma-plugin` job in `.github/workflows/ci.yml` fails on any bare `localStorage.` usage in `ui.html` outside the wrapper definitions.

## Running locally (development)

1. Open the **Figma desktop app**
2. **Plugins → Development → Import plugin from manifest…**
3. Select `figma-plugin/manifest.json` from this repo
4. The plugin loads immediately (`code.js` and `ui.html` are pre-built)

## Building from TypeScript source

`src/code.ts` is the single source of truth for the main thread. **Never hand-edit `code.js`.** `ui.html` is not compiled — edit it directly.

```bash
cd figma-plugin
npm install
npm run build   # tsc → dist/code.js, then copied to code.js
```

## Desktop regression checklist (run before EVERY publish)

Use the Figma **desktop** app, console open via **Plugins → Development → Show/Hide console**. Zero plugin errors allowed.

**In a Figma Design file:**
- [ ] Apply Fill on a selected rectangle
- [ ] Swatch creates a 120×120 rounded rectangle at viewport center
- [ ] Style creates `ColorArchive/...` local paint style
- [ ] Export → CSS/Tailwind/JSON — paste the clipboard somewhere to verify actual content
- [ ] Inspect shows hex + WCAG for a selected solid fill
- [ ] **Select a layer BEFORE opening the plugin** → Inspect populates immediately (ui-ready handshake)
- [ ] Generate Brand Scale creates 30 styles
- [ ] Projects: connect an API key → **close and reopen the plugin → key still connected** (`figma.clientStorage` persistence)
- [ ] Disconnect → close and reopen → back to the connect form

**In a FigJam file:**
- [ ] Plugin opens without crash
- [ ] Swatch / Style / Brand Scale buttons disabled with the "Figma Design only" note
- [ ] Apply Fill works on a sticky/shape
- [ ] Export works (clipboard verified)
- [ ] Inspect works on a shape with solid fill

## Publish runbook

1. Bundle **all** code changes for the release into one version — every code publish triggers a fresh Figma review (text/image/tag edits on the Community listing do **not**).
2. Run the full regression checklist above (both editors).
3. `npm run build`, commit via feature branch + PR (model: PR #6), merge after verification.
4. Figma desktop → **Plugins → Manage plugins in development → ⋯ → Publish new version** (4-step wizard; listing fields pre-filled; version auto-increments).
5. **Do NOT touch the data-security questionnaire answers** (current truth: self-hosted backend, no Figma-API-derived data sent, no third-party requests). Changing them re-triggers review. Corollary: no analytics SDKs in the plugin, no new domains in `manifest.json` `networkAccess`.
   - 🔴 **2026-09-03 — READ BEFORE THE NEXT PUBLISH.** The working tree now contains an
     anonymous open-heartbeat (`ui.html`, `src/code.ts`): one POST to the already-allowlisted
     `api.colorarchive.org/events` per plugin open, carrying a randomly-minted install id
     persisted in `figma.clientStorage`. No SDK, no third party, no new domain, nothing derived
     from the Figma API — so rules 5's literal clauses still hold. **But it is new persistent
     pseudonymous data collection, so the questionnaire must be RE-READ and re-answered
     honestly before publishing, not assumed unchanged.** It is disclosed in the site privacy
     policy (`privacy-page.tsx`, "Figma plugin"). If you would rather not answer the
     questionnaire differently, delete the `if (msg.installId)` block in `ui.html` and ship
     without it — the rest of the change is inert.
6. Wait for the review email; record the new version in `docs/dev-plan-2026-06-10-figma-launch.md` §6.

## Files

| File | Purpose |
|------|---------|
| `manifest.json` | Plugin metadata (name, id, editor types, network allowlist) |
| `src/code.ts` | TypeScript source of the main thread — edit this |
| `code.js` | Compiled main thread (generated by `npm run build` — never hand-edit) |
| `ui.html` | Plugin UI, self-contained HTML/JS/CSS (not compiled — edit directly) |
| `thumbnail.png` | Community listing thumbnail |
| `package.json` | Version + dev dependencies for the TypeScript build |
