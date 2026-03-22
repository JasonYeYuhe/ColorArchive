"use strict";
/// <reference types="@figma/plugin-typings" />
// ColorArchive Figma Plugin — TypeScript source (single source of truth)
// Compiled to code.js via `npm run build`
figma.showUI(__html__, { width: 340, height: 560, themeColors: true });
// ─── Color conversion helpers ────────────────────────────────────────────────
function rgbToHex(r, g, b) {
    return '#' + [r, g, b]
        .map(v => Math.round(v * 255).toString(16).padStart(2, '0'))
        .join('')
        .toUpperCase();
}
function rgbToHsl(r, g, b) {
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    const l = (max + min) / 2;
    if (max === min)
        return { h: 0, s: 0, l: Math.round(l * 100) };
    const d = max - min;
    const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    let h;
    if (max === r)
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g)
        h = ((b - r) / d + 2) / 6;
    else
        h = ((r - g) / d + 4) / 6;
    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}
function hslToRgb(h, s, l) {
    const hN = h / 360, sN = s / 100, lN = l / 100;
    if (sN === 0)
        return { r: lN, g: lN, b: lN };
    const q = lN < 0.5 ? lN * (1 + sN) : lN + sN - lN * sN;
    const p = 2 * lN - q;
    function h2c(t) {
        if (t < 0)
            t += 1;
        if (t > 1)
            t -= 1;
        if (t < 1 / 6)
            return p + (q - p) * 6 * t;
        if (t < 1 / 2)
            return q;
        if (t < 2 / 3)
            return p + (q - p) * (2 / 3 - t) * 6;
        return p;
    }
    return { r: h2c(hN + 1 / 3), g: h2c(hN), b: h2c(hN - 1 / 3) };
}
// ─── WCAG helpers ────────────────────────────────────────────────────────────
function getRelativeLuminance(r, g, b) {
    const toLinear = (c) => {
        const s = c / 255;
        return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    };
    return 0.2126 * toLinear(Math.round(r * 255))
        + 0.7152 * toLinear(Math.round(g * 255))
        + 0.0722 * toLinear(Math.round(b * 255));
}
function contrastRatio(lum1, lum2) {
    const l = Math.max(lum1, lum2), d = Math.min(lum1, lum2);
    return Math.round(((l + 0.05) / (d + 0.05)) * 10) / 10;
}
// ─── Brand scale generation ─────────────────────────────────────────────────
const SCALE_STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
const STEP_LIGHTNESS = {
    50: 97, 100: 93, 200: 86, 300: 76, 400: 63, 500: 50,
    600: 39, 700: 29, 800: 20, 900: 13, 950: 8,
};
const STEP_SAT_FACTOR = {
    50: 0.55, 100: 0.65, 200: 0.80, 300: 0.90, 400: 0.97, 500: 1.00,
    600: 0.97, 700: 0.90, 800: 0.80, 900: 0.68, 950: 0.55,
};
/** Shift a semantic hue toward the brand hue for visual harmony. */
function harmoniseHue(targetHue, brandHue, weight = 0.12) {
    const diff = ((brandHue - targetHue + 540) % 360) - 180;
    return Math.round((targetHue + diff * weight + 360) % 360);
}
function generateBrandStyles(hex) {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    const { h, s } = rgbToHsl(r, g, b);
    const baseSat = Math.max(s, 20);
    const styles = [];
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
    const semantics = [
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
function sendSelectionInfo() {
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
    const fills = node.fills;
    const solid = Array.isArray(fills)
        ? fills.find((f) => f.type === 'SOLID' && f.visible !== false)
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
figma.ui.onmessage = (msg) => {
    var _a, _b, _c, _d, _e;
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
                node.fills = [{ type: 'SOLID', color: { r, g, b } }];
            }
        }
        figma.notify(`Applied ${(_a = msg.name) !== null && _a !== void 0 ? _a : ''} (${hex})`);
    }
    if (msg.type === 'create-swatch' && msg.hex) {
        const hex = msg.hex;
        const r = parseInt(hex.slice(1, 3), 16) / 255;
        const g = parseInt(hex.slice(3, 5), 16) / 255;
        const b = parseInt(hex.slice(5, 7), 16) / 255;
        const rect = figma.createRectangle();
        rect.name = `${(_b = msg.name) !== null && _b !== void 0 ? _b : ''} ${hex}`;
        rect.resize(120, 120);
        rect.cornerRadius = 16;
        rect.fills = [{ type: 'SOLID', color: { r, g, b } }];
        const viewport = figma.viewport.center;
        rect.x = viewport.x - 60;
        rect.y = viewport.y - 60;
        figma.currentPage.appendChild(rect);
        figma.currentPage.selection = [rect];
        figma.viewport.scrollAndZoomIntoView([rect]);
        figma.notify(`Created swatch: ${(_c = msg.name) !== null && _c !== void 0 ? _c : hex}`);
    }
    if (msg.type === 'create-style' && msg.hex) {
        const hex = msg.hex;
        const r = parseInt(hex.slice(1, 3), 16) / 255;
        const g = parseInt(hex.slice(3, 5), 16) / 255;
        const b = parseInt(hex.slice(5, 7), 16) / 255;
        const style = figma.createPaintStyle();
        style.name = `ColorArchive/${(_d = msg.family) !== null && _d !== void 0 ? _d : 'Color'}/${(_e = msg.name) !== null && _e !== void 0 ? _e : hex}`;
        style.paints = [{ type: 'SOLID', color: { r, g, b } }];
        figma.notify(`Created local style: ${style.name}`);
    }
    if (msg.type === 'generate-brand-scale') {
        const selection = figma.currentPage.selection;
        if (selection.length === 0) {
            figma.notify('Select a layer with a fill to generate brand scale.');
            return;
        }
        const node = selection[0];
        const fills = 'fills' in node ? node.fills : null;
        const solid = Array.isArray(fills)
            ? fills.find((f) => f.type === 'SOLID' && f.visible !== false)
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
    }
    if (msg.type === 'close') {
        figma.closePlugin();
    }
};
