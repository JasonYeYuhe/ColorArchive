# ColorArchive Figma Plugin

Browse all 2016 curated ColorArchive colors directly inside Figma. Apply fills, create swatches, save local styles, and inspect WCAG contrast for any selected layer.

## Features

**Browse tab**
- Search 2016 colors by name or hex
- Filter by color family (Red, Orange, Yellow …)
- Apply fill to selected layer
- Create swatch rectangle
- Save as local paint style (`ColorArchive/Family/Name`)

**Inspect tab**
- Select any layer with a solid fill → instant WCAG analysis
- Shows contrast ratio vs white and vs black (AAA / AA / AA Large / Fail)
- "View on ColorArchive" — deep-links to the full color detail page
- "Use best text" — applies the highest-contrast text color to selection

## Running locally (development)

1. Open Figma Desktop
2. **Plugins → Development → Import plugin from manifest…**
3. Select `figma-plugin/manifest.json` from this repo
4. The plugin loads immediately — no build step required (`code.js` and `ui.html` are pre-built)

## Building from TypeScript source

```bash
cd figma-plugin
npm install
npm run build   # tsc compiles src/code.ts → code.js
```

## Publishing to Figma Community

1. Ensure `manifest.json` has a unique `id` (already set)
2. Test thoroughly in development mode
3. Go to figma.com → Plugins → Publish
4. Upload the plugin files and submit for review

## Files

| File | Purpose |
|------|---------|
| `manifest.json` | Plugin metadata (name, id, entry points) |
| `code.js` | Main plugin logic (pre-built, runs in Figma sandbox) |
| `ui.html` | Plugin UI (runs in iframe) |
| `src/code.ts` | TypeScript source for `code.js` |
| `package.json` | Dev dependencies for TypeScript compilation |
