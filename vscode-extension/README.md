# ColorArchive VS Code Extension

Browse 5,400+ curated colors and generate design tokens directly in your editor.

## Commands

- **ColorArchive: Pick a Color** — Browse by family/lightness/chroma, copy or insert
- **ColorArchive: Insert CSS Variable** — Pick a color and insert as `var(--color-*)`
- **ColorArchive: Insert Tailwind Class** — Pick a color and insert as `text-[#hex]`
- **ColorArchive: Generate Color Scale** — Input a hex, get a full 50-950 scale in CSS/Tailwind/JSON

## Install

```bash
cd vscode-extension
npm install
npm run compile
```

Then press F5 in VS Code to launch the Extension Development Host.

## Package

```bash
npm run package
```

This creates a `.vsix` file you can install locally or publish to the VS Code Marketplace.
