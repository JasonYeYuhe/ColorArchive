import * as vscode from "vscode";

// ─── Color families from ColorArchive ─────────────────────────────────────────

const HUE_ROOTS = [
  "Crimson", "Scarlet", "Ruby", "Vermillion", "Ember", "Tangerine", "Coral", "Apricot",
  "Saffron", "Amber", "Canary", "Citrine", "Honey", "Chartreuse", "Olive", "Lime",
  "Moss", "Leaf", "Clover", "Emerald", "Mint", "Seafoam", "Celadon", "Jade",
  "Teal", "Lagoon", "Cyan", "Aqua", "Cerulean", "Azure", "Steel", "Sapphire",
  "Cobalt", "Indigo", "Iris", "Amethyst", "Violet", "Orchid", "Plum", "Mulberry",
  "Magenta", "Fuchsia", "Mauve", "Peony", "Rose", "Blush", "Garnet", "Merlot",
];

const LIGHTNESS_BANDS = [
  "Veil", "Whisper", "Mist", "Pearl", "Bloom", "Silk", "Tone",
  "Radiant", "Core", "Velvet", "Dusk", "Shadow", "Nocturne", "Ink",
];

const CHROMA_BANDS = ["Faint", "Muted", "Dust", "Soft", "Clear", "Vivid", "Bright", "Pure"];

// Hue degrees for local color generation (matching canonical data)
const HUE_DEGREES: Record<string, number> = {
  Crimson: 0, Scarlet: 5, Ruby: 10, Vermillion: 15, Ember: 20, Tangerine: 25,
  Coral: 30, Apricot: 40, Saffron: 45, Amber: 50, Canary: 55, Citrine: 60,
  Honey: 70, Chartreuse: 75, Olive: 80, Lime: 90, Moss: 100, Leaf: 110,
  Clover: 115, Emerald: 120, Mint: 130, Seafoam: 140, Celadon: 145, Jade: 150,
  Teal: 160, Lagoon: 170, Cyan: 175, Aqua: 180, Cerulean: 190, Azure: 200,
  Steel: 205, Sapphire: 210, Cobalt: 220, Indigo: 230, Iris: 240, Amethyst: 245,
  Violet: 250, Orchid: 260, Plum: 270, Mulberry: 280, Magenta: 290, Fuchsia: 300,
  Mauve: 305, Peony: 310, Rose: 320, Blush: 330, Garnet: 340, Merlot: 350,
};

const LIGHTNESS_VALUES: Record<string, number> = {
  Veil: 98, Whisper: 94, Mist: 90, Pearl: 84, Bloom: 76, Silk: 68, Tone: 60,
  Radiant: 54, Core: 48, Velvet: 42, Dusk: 34, Shadow: 28, Nocturne: 20, Ink: 14,
};

const CHROMA_VALUES: Record<string, number> = {
  Faint: 10, Muted: 18, Dust: 26, Soft: 34, Clear: 54, Vivid: 74, Bright: 84, Pure: 92,
};

interface PickedColor {
  id: string;
  name: string;
  hex: string;
}

// Generate all 5,376 chromatic colors locally
function generateAllColors(): PickedColor[] {
  const colors: PickedColor[] = [];
  for (const root of HUE_ROOTS) {
    const hue = HUE_DEGREES[root];
    for (const light of LIGHTNESS_BANDS) {
      for (const chroma of CHROMA_BANDS) {
        const name = `${root} ${light} ${chroma}`;
        const id = `${root.toLowerCase()}-${light.toLowerCase()}-${chroma.toLowerCase()}`;
        const hex = hslToHex(hue, CHROMA_VALUES[chroma], LIGHTNESS_VALUES[light]);
        colors.push({ id, name, hex });
      }
    }
  }
  return colors;
}

let cachedColors: PickedColor[] | null = null;
function getAllColors(): PickedColor[] {
  if (!cachedColors) cachedColors = generateAllColors();
  return cachedColors;
}

// ─── Scale generation (same algo as main site) ──────────────────────────────

const SCALE_STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];

const STEP_LIGHTNESS: Record<number, number> = {
  50: 97, 100: 93, 200: 86, 300: 76, 400: 63, 500: 50,
  600: 39, 700: 29, 800: 20, 900: 13, 950: 8,
};

const STEP_SAT: Record<number, number> = {
  50: 0.55, 100: 0.65, 200: 0.80, 300: 0.90, 400: 0.97, 500: 1.00,
  600: 0.97, 700: 0.90, 800: 0.80, 900: 0.68, 950: 0.55,
};

function hexToHSL(hex: string): { h: number; s: number; l: number } {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
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

function hslToHex(h: number, s: number, l: number): string {
  const hN = h / 360, sN = s / 100, lN = l / 100;
  if (sN === 0) {
    const v = Math.round(lN * 255).toString(16).padStart(2, "0");
    return `#${v}${v}${v}`.toUpperCase();
  }
  const q = lN < 0.5 ? lN * (1 + sN) : lN + sN - lN * sN;
  const p = 2 * lN - q;
  function hue2rgb(pp: number, qq: number, t: number): number {
    let adj = t;
    if (adj < 0) adj += 1;
    if (adj > 1) adj -= 1;
    if (adj < 1 / 6) return pp + (qq - pp) * 6 * adj;
    if (adj < 1 / 2) return qq;
    if (adj < 2 / 3) return pp + (qq - pp) * (2 / 3 - adj) * 6;
    return pp;
  }
  const r = Math.round(hue2rgb(p, q, hN + 1 / 3) * 255);
  const g = Math.round(hue2rgb(p, q, hN) * 255);
  const b = Math.round(hue2rgb(p, q, hN - 1 / 3) * 255);
  return `#${[r, g, b].map(c => c.toString(16).padStart(2, "0")).join("").toUpperCase()}`;
}

function generateScale(hex: string): { step: number; hex: string }[] {
  const { h, s } = hexToHSL(hex);
  const baseSat = Math.max(s, 20);
  return SCALE_STEPS.map((step) => ({
    step,
    hex: hslToHex(h, Math.round(Math.min(100, baseSat * STEP_SAT[step])), STEP_LIGHTNESS[step]),
  }));
}

// ─── Commands ────────────────────────────────────────────────────────────────

async function pickColor(): Promise<PickedColor | undefined> {
  // Quick pick from families
  const family = await vscode.window.showQuickPick(HUE_ROOTS, {
    placeHolder: "Choose a color family (hue root)",
  });
  if (!family) return;

  const lightness = await vscode.window.showQuickPick(LIGHTNESS_BANDS, {
    placeHolder: `${family} — choose lightness`,
  });
  if (!lightness) return;

  const chroma = await vscode.window.showQuickPick(CHROMA_BANDS, {
    placeHolder: `${family} ${lightness} — choose chroma`,
  });
  if (!chroma) return;

  const id = `${family.toLowerCase()}-${lightness.toLowerCase()}-${chroma.toLowerCase()}`;
  const name = `${family} ${lightness} ${chroma}`;

  // Fetch hex from API
  try {
    const res = await fetch(`https://api.colorarchive.org/colors/${id}`);
    if (res.ok) {
      const data = (await res.json()) as { hex?: string };
      if (data.hex) return { id, name, hex: data.hex };
    }
  } catch {
    // Fallback: use the color ID as label
  }

  // Fallback: notify and return nothing
  vscode.window.showWarningMessage(`Could not fetch color data for ${name}`);
  return undefined;
}

// Shared action menu for a picked color
async function showColorActions(color: PickedColor, context: vscode.ExtensionContext): Promise<void> {
  // Save to recent
  const recent: PickedColor[] = context.globalState.get("recentColors", []);
  const updated = [color, ...recent.filter(c => c.id !== color.id)].slice(0, 20);
  await context.globalState.update("recentColors", updated);

  const action = await vscode.window.showQuickPick(
    [
      { label: "Copy HEX", value: color.hex },
      { label: "Copy CSS Variable", value: `var(--color-${color.id})` },
      { label: "Copy Tailwind Class", value: `text-[${color.hex}]` },
      { label: "Insert at Cursor", value: color.hex },
    ],
    { placeHolder: `${color.name} — ${color.hex}` },
  );
  if (!action) return;

  if (action.label === "Insert at Cursor") {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      editor.edit((edit) => { edit.replace(editor.selection, action.value); });
    }
  } else {
    await vscode.env.clipboard.writeText(action.value);
    vscode.window.showInformationMessage(`Copied: ${action.value}`);
  }
}

export function activate(context: vscode.ExtensionContext) {
  // Command: Search Colors (instant search across all 5,376 colors)
  context.subscriptions.push(
    vscode.commands.registerCommand("colorarchive.searchColor", async () => {
      const colors = getAllColors();
      const items = colors.map(c => ({
        label: c.name,
        description: c.hex,
        color: c,
      }));
      const pick = await vscode.window.showQuickPick(items, {
        placeHolder: "Type to search 5,300+ colors by name or hex...",
        matchOnDescription: true,
      });
      if (pick) await showColorActions(pick.color, context);
    }),
  );

  // Command: Recent Colors
  context.subscriptions.push(
    vscode.commands.registerCommand("colorarchive.recentColors", async () => {
      const recent: PickedColor[] = context.globalState.get("recentColors", []);
      if (recent.length === 0) {
        vscode.window.showInformationMessage("No recent colors. Pick a color first.");
        return;
      }
      const items = recent.map(c => ({
        label: c.name,
        description: c.hex,
        color: c,
      }));
      const pick = await vscode.window.showQuickPick(items, {
        placeHolder: "Recent colors",
      });
      if (pick) await showColorActions(pick.color, context);
    }),
  );

  // Command: Pick a Color (3-level drill-down, also saves to recent)
  context.subscriptions.push(
    vscode.commands.registerCommand("colorarchive.pickColor", async () => {
      const color = await pickColor();
      if (!color) return;
      await showColorActions(color, context);
    }),
  );

  // Command: Insert CSS Variable
  context.subscriptions.push(
    vscode.commands.registerCommand("colorarchive.insertCSSVar", async () => {
      const color = await pickColor();
      if (!color) return;

      const editor = vscode.window.activeTextEditor;
      if (editor) {
        const cssVar = `var(--color-${color.id})`;
        editor.edit((edit) => {
          edit.replace(editor.selection, cssVar);
        });
        vscode.window.showInformationMessage(`Inserted: ${cssVar}`);
      }
    }),
  );

  // Command: Insert Tailwind Class
  context.subscriptions.push(
    vscode.commands.registerCommand("colorarchive.insertTailwind", async () => {
      const color = await pickColor();
      if (!color) return;

      const editor = vscode.window.activeTextEditor;
      if (editor) {
        const cls = `text-[${color.hex}]`;
        editor.edit((edit) => {
          edit.replace(editor.selection, cls);
        });
      }
    }),
  );

  // Command: Generate Color Scale
  context.subscriptions.push(
    vscode.commands.registerCommand("colorarchive.generateScale", async () => {
      const hex = await vscode.window.showInputBox({
        placeHolder: "#2563EB",
        prompt: "Enter a hex color to generate a 50-950 scale",
        validateInput: (v) => /^#?[0-9a-fA-F]{6}$/.test(v) ? null : "Enter a valid 6-digit hex color",
      });
      if (!hex) return;

      const prefix = await vscode.window.showInputBox({
        value: "brand",
        prompt: "Scale name prefix (used in variable names)",
        validateInput: (v) => /^[a-zA-Z_][a-zA-Z0-9_-]*$/.test(v) ? null : "Use letters, numbers, hyphens, or underscores only",
      });
      if (!prefix) return;

      const clean = hex.startsWith("#") ? hex : `#${hex}`;
      const scale = generateScale(clean);

      const format = await vscode.window.showQuickPick(
        ["CSS Variables", "Tailwind Config", "JSON", "SCSS Variables", "LESS Variables"],
        { placeHolder: "Export format" },
      );
      if (!format) return;

      let output: string;
      if (format === "CSS Variables") {
        output = `:root {\n${scale.map((s) => `  --color-${prefix}-${s.step}: ${s.hex};`).join("\n")}\n}`;
      } else if (format === "Tailwind Config") {
        output = `"${prefix}": {\n${scale.map((s) => `  ${s.step}: "${s.hex}",`).join("\n")}\n}`;
      } else if (format === "SCSS Variables") {
        output = scale.map((s) => `$color-${prefix}-${s.step}: ${s.hex};`).join("\n");
      } else if (format === "LESS Variables") {
        output = scale.map((s) => `@color-${prefix}-${s.step}: ${s.hex};`).join("\n");
      } else {
        output = JSON.stringify(Object.fromEntries(scale.map((s) => [s.step, s.hex])), null, 2);
      }

      const editor = vscode.window.activeTextEditor;
      if (editor) {
        editor.edit((edit) => {
          edit.replace(editor.selection, output);
        });
        vscode.window.showInformationMessage(`Generated ${scale.length}-step ${prefix} scale from ${clean}`);
      } else {
        await vscode.env.clipboard.writeText(output);
        vscode.window.showInformationMessage("Scale copied to clipboard");
      }
    }),
  );
}

export function deactivate() {}
