// ColorArchive Figma Plugin — TypeScript source
// Compiled output is code.js (checked in, no build step needed to run)

figma.showUI(__html__, { width: 340, height: 560, themeColors: true });

// ─── Selection inspector ─────────────────────────────────────────────────────

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b]
    .map(v => Math.round(v * 255).toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase();
}

function getRelativeLuminance(r: number, g: number, b: number): number {
  const toLinear = (c: number) => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * toLinear(Math.round(r * 255))
       + 0.7152 * toLinear(Math.round(g * 255))
       + 0.0722 * toLinear(Math.round(b * 255));
}

function contrastRatio(lum1: number, lum2: number): number {
  const l = Math.max(lum1, lum2), d = Math.min(lum1, lum2);
  return Math.round(((l + 0.05) / (d + 0.05)) * 10) / 10;
}

function sendSelectionInfo(): void {
  const selection = figma.currentPage.selection;
  if (selection.length === 0) {
    figma.ui.postMessage({ type: 'selection-empty' });
    return;
  }

  const node = selection[0];
  if (!('fills' in node)) {
    figma.ui.postMessage({ type: 'selection-no-fill' });
    return;
  }

  const fills = (node as GeometryMixin).fills;
  const solid = Array.isArray(fills)
    ? (fills as Paint[]).find((f): f is SolidPaint => f.type === 'SOLID' && f.visible !== false)
    : undefined;

  if (!solid) {
    figma.ui.postMessage({ type: 'selection-no-fill' });
    return;
  }

  const { r, g, b } = solid.color;
  const hex = rgbToHex(r, g, b);
  const lum = getRelativeLuminance(r, g, b);
  const vsWhite = contrastRatio(lum, 1.0);
  const vsBlack = contrastRatio(lum, 0.0);
  figma.ui.postMessage({ type: 'selection-color', hex, vsWhite, vsBlack, nodeName: node.name });
}

figma.on('selectionchange', sendSelectionInfo);
figma.on('run', sendSelectionInfo);

// ─── UI messages ─────────────────────────────────────────────────────────────

figma.ui.onmessage = (msg: { type: string; hex?: string; name?: string; family?: string }) => {
  if (msg.type === 'apply-fill' && msg.hex) {
    const hex = msg.hex;
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const selection = figma.currentPage.selection;
    if (selection.length === 0) {
      figma.notify('Select a layer first, then apply a color.');
      return;
    }
    for (const node of selection) {
      if ('fills' in node) {
        (node as GeometryMixin).fills = [{ type: 'SOLID', color: { r, g, b } }];
      }
    }
    figma.notify(`Applied ${msg.name ?? ''} (${hex})`);
  }

  if (msg.type === 'create-swatch' && msg.hex) {
    const hex = msg.hex;
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const rect = figma.createRectangle();
    rect.name = `${msg.name ?? ''} ${hex}`;
    rect.resize(120, 120);
    rect.cornerRadius = 16;
    rect.fills = [{ type: 'SOLID', color: { r, g, b } }];

    const viewport = figma.viewport.center;
    rect.x = viewport.x - 60;
    rect.y = viewport.y - 60;

    figma.currentPage.appendChild(rect);
    figma.currentPage.selection = [rect];
    figma.viewport.scrollAndZoomIntoView([rect]);
    figma.notify(`Created swatch: ${msg.name ?? hex}`);
  }

  if (msg.type === 'create-style' && msg.hex) {
    const hex = msg.hex;
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const style = figma.createPaintStyle();
    style.name = `ColorArchive/${msg.family ?? 'Color'}/${msg.name ?? hex}`;
    style.paints = [{ type: 'SOLID', color: { r, g, b } }];
    figma.notify(`Created local style: ${style.name}`);
  }

  if (msg.type === 'close') {
    figma.closePlugin();
  }
};
