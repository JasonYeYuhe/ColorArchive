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

interface PickedColor {
  id: string;
  name: string;
  hex: string;
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
  const sN = s / 100, lN = l / 100;
  const a = sN * Math.min(lN, 1 - lN);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = lN - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
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
    const res = await fetch(`https://api.colorarchive.me/colors/${id}`);
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

export function activate(context: vscode.ExtensionContext) {
  // Command: Pick a Color
  context.subscriptions.push(
    vscode.commands.registerCommand("colorarchive.pickColor", async () => {
      const color = await pickColor();
      if (!color) return;

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
          editor.edit((edit) => {
            edit.replace(editor.selection, action.value);
          });
        }
      } else {
        await vscode.env.clipboard.writeText(action.value);
        vscode.window.showInformationMessage(`Copied: ${action.value}`);
      }
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

      const clean = hex.startsWith("#") ? hex : `#${hex}`;
      const scale = generateScale(clean);

      const format = await vscode.window.showQuickPick(
        ["CSS Variables", "Tailwind Config", "JSON"],
        { placeHolder: "Export format" },
      );
      if (!format) return;

      let output: string;
      if (format === "CSS Variables") {
        output = `:root {\n${scale.map((s) => `  --color-brand-${s.step}: ${s.hex};`).join("\n")}\n}`;
      } else if (format === "Tailwind Config") {
        output = `brand: {\n${scale.map((s) => `  ${s.step}: "${s.hex}",`).join("\n")}\n}`;
      } else {
        output = JSON.stringify(Object.fromEntries(scale.map((s) => [s.step, s.hex])), null, 2);
      }

      const editor = vscode.window.activeTextEditor;
      if (editor) {
        editor.edit((edit) => {
          edit.replace(editor.selection, output);
        });
        vscode.window.showInformationMessage(`Generated ${scale.length}-step scale from ${clean}`);
      } else {
        await vscode.env.clipboard.writeText(output);
        vscode.window.showInformationMessage("Scale copied to clipboard");
      }
    }),
  );
}

export function deactivate() {}
