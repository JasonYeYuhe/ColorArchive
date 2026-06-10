/// <reference types="@figma/plugin-typings" />
// ColorArchive Figma Plugin — TypeScript source (single source of truth)
// Compiled to code.js via `npm run build`

figma.showUI(__html__, { width: 340, height: 560, themeColors: true });

// ─── Editor capability guards ────────────────────────────────────────────────
// createPaintStyle() and createRectangle() only exist in Figma Design — they
// throw "not a function" in FigJam/Slides/Dev Mode. Gate every use behind these.

function isFigmaDesign(): boolean {
  return figma.editorType === 'figma';
}

function paintStylesAvailable(): boolean {
  return isFigmaDesign() && typeof figma.createPaintStyle === 'function';
}

function rectanglesAvailable(): boolean {
  return isFigmaDesign() && typeof figma.createRectangle === 'function';
}

// ─── Color conversion helpers ────────────────────────────────────────────────

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b]
    .map(v => Math.round(v * 255).toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase();
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l: Math.round(l * 100) };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h: number;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  const hN = h / 360, sN = s / 100, lN = l / 100;
  if (sN === 0) return { r: lN, g: lN, b: lN };
  const q = lN < 0.5 ? lN * (1 + sN) : lN + sN - lN * sN;
  const p = 2 * lN - q;
  function h2c(t: number): number {
    if (t < 0) t += 1; if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  }
  return { r: h2c(hN + 1 / 3), g: h2c(hN), b: h2c(hN - 1 / 3) };
}

// ─── WCAG helpers ────────────────────────────────────────────────────────────

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

// ─── Brand scale generation ─────────────────────────────────────────────────

const SCALE_STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;

const STEP_LIGHTNESS: Record<number, number> = {
  50: 97, 100: 93, 200: 86, 300: 76, 400: 63, 500: 50,
  600: 39, 700: 29, 800: 20, 900: 13, 950: 8,
};

const STEP_SAT_FACTOR: Record<number, number> = {
  50: 0.55, 100: 0.65, 200: 0.80, 300: 0.90, 400: 0.97, 500: 1.00,
  600: 0.97, 700: 0.90, 800: 0.80, 900: 0.68, 950: 0.55,
};

interface BrandStyle {
  name: string;
  r: number;
  g: number;
  b: number;
}

/** Shift a semantic hue toward the brand hue for visual harmony. */
function harmoniseHue(targetHue: number, brandHue: number, weight = 0.06): number {
  const diff = ((brandHue - targetHue + 540) % 360) - 180;
  return Math.round((targetHue + diff * weight + 360) % 360);
}

function generateBrandStyles(hex: string): BrandStyle[] {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const { h, s } = rgbToHsl(r, g, b);
  const baseSat = Math.max(s, 20);

  const styles: BrandStyle[] = [];

  for (const step of SCALE_STEPS) {
    // Primary scale
    const primSat = Math.round(Math.min(100, baseSat * STEP_SAT_FACTOR[step]));
    const primRgb = hslToRgb(h, primSat, STEP_LIGHTNESS[step]);
    styles.push({ name: `Brand/Primary/${step}`, r: primRgb.r, g: primRgb.g, b: primRgb.b });

    // Neutral scale (low saturation, tinted with brand hue)
    const neutSat = Math.round(Math.min(100, 7 * STEP_SAT_FACTOR[step]));
    const neutRgb = hslToRgb(h, neutSat, STEP_LIGHTNESS[step]);
    styles.push({ name: `Brand/Neutral/${step}`, r: neutRgb.r, g: neutRgb.g, b: neutRgb.b });
  }

  // Semantic colors (harmonised with brand hue)
  const semantics: { role: string; hue: number; sat: number }[] = [
    { role: 'Success', hue: 142, sat: 72 },
    { role: 'Warning', hue: 38, sat: 95 },
    { role: 'Error', hue: 4, sat: 86 },
    { role: 'Info', hue: 217, sat: 91 },
  ];

  for (const sem of semantics) {
    const semHue = harmoniseHue(sem.hue, h);
    // Generate two key steps: 500 (main) and 100 (background)
    const main = hslToRgb(semHue, sem.sat, 50);
    styles.push({ name: `Brand/Semantic/${sem.role}`, r: main.r, g: main.g, b: main.b });
    const bg = hslToRgb(semHue, Math.round(sem.sat * 0.55), 93);
    styles.push({ name: `Brand/Semantic/${sem.role} Light`, r: bg.r, g: bg.g, b: bg.b });
  }

  return styles;
}

// ─── Selection inspector ────────────────────────────────────────────────────
// Works in both Figma Design and FigJam — only reads fills off the current
// selection (a synchronous, current-page read that is allowed in dynamic-page
// documentAccess mode).

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
  // fills can be figma.mixed (a Symbol) when a node has multiple differing fills.
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
// Note: the 'run' event can fire before the UI iframe has registered its
// onmessage handler, so its first message may be lost. The 'ui-ready'
// handshake below is the reliable path for the initial selection.
figma.on('run', sendSelectionInfo);

// ─── UI messages ────────────────────────────────────────────────────────────

interface PluginMessage {
  type: string;
  hex?: string;
  name?: string;
  family?: string;
  palette?: string[];
  key?: string;
}

// ─── API key persistence ────────────────────────────────────────────────────
// The UI iframe is a data: URL where localStorage/sessionStorage always throw
// SecurityError, so the API key must live in figma.clientStorage on this
// (main) thread. The UI asks for it via 'ui-ready' and mutates it via
// 'save-api-key' / 'clear-api-key'.

const API_KEY_STORAGE = 'ca_api_key';

async function readStoredApiKey(): Promise<string | null> {
  try {
    const stored = await figma.clientStorage.getAsync(API_KEY_STORAGE);
    return typeof stored === 'string' && stored.length > 0 ? stored : null;
  } catch (e) {
    return null; // storage unavailable — treat as not connected
  }
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  return {
    r: parseInt(hex.slice(1, 3), 16) / 255,
    g: parseInt(hex.slice(3, 5), 16) / 255,
    b: parseInt(hex.slice(5, 7), 16) / 255,
  };
}

figma.ui.onmessage = async (msg: PluginMessage) => {
  try {
    // UI finished loading → tell it which editor we're in, hand over the
    // stored API key, and replay the current selection so the Inspect tab
    // populates even when a layer was already selected before the plugin
    // opened.
    if (msg.type === 'ui-ready') {
      const apiKey = await readStoredApiKey();
      figma.ui.postMessage({ type: 'init', editorType: figma.editorType, apiKey });
      sendSelectionInfo();
      return;
    }

    if (msg.type === 'save-api-key') {
      if (typeof msg.key === 'string' && msg.key.length > 0) {
        await figma.clientStorage.setAsync(API_KEY_STORAGE, msg.key);
      }
      return;
    }

    if (msg.type === 'clear-api-key') {
      await figma.clientStorage.deleteAsync(API_KEY_STORAGE);
      return;
    }

    if (msg.type === 'apply-fill' && msg.hex) {
      const { r, g, b } = hexToRgb(msg.hex);
      const selection = figma.currentPage.selection;
      if (selection.length === 0) {
        figma.notify('Select a layer first, then apply a color.');
        return;
      }
      let applied = 0;
      for (const node of selection) {
        if ('fills' in node) {
          (node as GeometryMixin).fills = [{ type: 'SOLID', color: { r, g, b } }];
          applied++;
        }
      }
      if (applied === 0) {
        figma.notify('The selected layer can’t take a color fill.');
        return;
      }
      figma.notify(`Applied ${msg.name ?? ''} (${msg.hex})`);
      return;
    }

    if (msg.type === 'create-swatch' && msg.hex) {
      if (!rectanglesAvailable()) {
        figma.notify('Swatches can only be created in Figma Design.');
        return;
      }
      const { r, g, b } = hexToRgb(msg.hex);
      const rect = figma.createRectangle();
      rect.name = `${msg.name ?? ''} ${msg.hex}`;
      rect.resize(120, 120);
      rect.cornerRadius = 16;
      rect.fills = [{ type: 'SOLID', color: { r, g, b } }];

      const viewport = figma.viewport.center;
      rect.x = viewport.x - 60;
      rect.y = viewport.y - 60;

      figma.currentPage.appendChild(rect);
      figma.currentPage.selection = [rect];
      figma.viewport.scrollAndZoomIntoView([rect]);
      figma.notify(`Created swatch: ${msg.name ?? msg.hex}`);
      return;
    }

    if (msg.type === 'create-style' && msg.hex) {
      if (!paintStylesAvailable()) {
        figma.notify('Color styles can only be created in Figma Design.');
        return;
      }
      const { r, g, b } = hexToRgb(msg.hex);
      const style = figma.createPaintStyle();
      style.name = `ColorArchive/${msg.family ?? 'Color'}/${msg.name ?? msg.hex}`;
      style.paints = [{ type: 'SOLID', color: { r, g, b } }];
      figma.notify(`Created local style: ${style.name}`);
      return;
    }

    if (msg.type === 'generate-brand-scale') {
      if (!paintStylesAvailable()) {
        figma.notify('Brand styles can only be created in Figma Design.');
        return;
      }
      const selection = figma.currentPage.selection;
      if (selection.length === 0) {
        figma.notify('Select a layer with a fill to generate brand scale.');
        return;
      }
      const node = selection[0];
      const fills = 'fills' in node ? (node as GeometryMixin).fills : null;
      const solid = Array.isArray(fills)
        ? (fills as Paint[]).find((f): f is SolidPaint => f.type === 'SOLID' && f.visible !== false)
        : null;
      if (!solid) {
        figma.notify('Selected layer has no solid fill.');
        return;
      }
      const { r, g, b } = solid.color;
      const hex = rgbToHex(r, g, b);
      const brandStyles = generateBrandStyles(hex);

      for (const s of brandStyles) {
        const style = figma.createPaintStyle();
        style.name = s.name;
        style.paints = [{ type: 'SOLID', color: { r: s.r, g: s.g, b: s.b } }];
      }

      figma.notify(`Created ${brandStyles.length} brand styles from ${hex}`);
      figma.ui.postMessage({ type: 'brand-scale-done', count: brandStyles.length, hex });
      return;
    }

    if (msg.type === 'create-project-styles' && msg.palette && msg.name) {
      if (!paintStylesAvailable()) {
        figma.notify('Color styles can only be created in Figma Design.');
        figma.ui.postMessage({ type: 'project-styles-unavailable' });
        return;
      }
      let count = 0;
      for (let i = 0; i < msg.palette.length; i++) {
        const hex = msg.palette[i];
        if (!hex || !hex.startsWith('#')) continue;
        const { r, g, b } = hexToRgb(hex);
        const style = figma.createPaintStyle();
        style.name = `Project/${msg.name}/${i + 1} ${hex}`;
        style.paints = [{ type: 'SOLID', color: { r, g, b } }];
        count++;
      }
      figma.notify(`Created ${count} styles from project "${msg.name}"`);
      return;
    }

    if (msg.type === 'close') {
      figma.closePlugin();
      return;
    }
  } catch (err) {
    // Last-resort backstop so no handler can surface an uncaught TypeError
    // to the user (or a reviewer) — degrade to a friendly notice instead.
    const detail = err instanceof Error ? err.message : String(err);
    figma.notify(`ColorArchive: action not available here (${detail})`);
  }
};
