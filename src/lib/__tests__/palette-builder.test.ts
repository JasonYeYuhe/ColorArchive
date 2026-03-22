import { describe, it, expect, beforeEach, vi } from "vitest";
import type { ColorRecord } from "@/src/types/color";

// ---------------------------------------------------------------------------
// Mock window + localStorage before importing the module
// ---------------------------------------------------------------------------
let store: Record<string, string> = {};
type Listener = (...args: unknown[]) => void;
let listeners: Record<string, Listener[]> = {};

beforeEach(() => {
  store = {};
  listeners = {};

  vi.stubGlobal("window", {
    addEventListener: (type: string, fn: Listener) => {
      (listeners[type] ??= []).push(fn);
    },
    removeEventListener: (type: string, fn: Listener) => {
      listeners[type] = (listeners[type] ?? []).filter((f) => f !== fn);
    },
    dispatchEvent: (event: { type: string }) => {
      for (const fn of listeners[event.type] ?? []) fn(event);
      return true;
    },
  });

  vi.stubGlobal("localStorage", {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
  });

  vi.stubGlobal("Event", class MockEvent {
    type: string;
    constructor(type: string) { this.type = type; }
  });
});

// Dynamic import so mocks are in place when module initialises
async function loadModule() {
  // Clear module cache so each test suite gets fresh mocks
  const mod = await import("@/src/lib/palette-builder");
  return mod;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function makeColor(overrides: Partial<ColorRecord> & { id: string }): ColorRecord {
  return {
    name: overrides.id,
    hex: "#000000",
    rgb: "rgb(0,0,0)",
    hsl: "hsl(0,0%,0%)",
    hue: 0,
    saturation: 50,
    lightness: 50,
    family: "Red",
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe("palette-builder", () => {
  // We load once — the module reads window/localStorage at call time, not import time
  let mod: Awaited<ReturnType<typeof loadModule>>;

  beforeEach(async () => {
    mod = await loadModule();
  });

  describe("MAX_SIZE constant", () => {
    it("equals 6", () => {
      expect(mod.MAX_SIZE).toBe(6);
    });
  });

  describe("getPaletteIds", () => {
    it("returns empty array when storage is empty", () => {
      expect(mod.getPaletteIds()).toEqual([]);
    });

    it("returns stored ids", () => {
      store["colorarchive-palette"] = JSON.stringify(["a", "b"]);
      expect(mod.getPaletteIds()).toEqual(["a", "b"]);
    });

    it("returns empty array on invalid JSON", () => {
      store["colorarchive-palette"] = "not-json";
      expect(mod.getPaletteIds()).toEqual([]);
    });
  });

  describe("addToPalette", () => {
    it("adds a color id", () => {
      mod.addToPalette("color-1");
      expect(mod.getPaletteIds()).toEqual(["color-1"]);
    });

    it("prevents duplicates", () => {
      mod.addToPalette("color-1");
      mod.addToPalette("color-1");
      expect(mod.getPaletteIds()).toEqual(["color-1"]);
    });

    it("enforces max size of 6", () => {
      for (let i = 0; i < 8; i++) {
        mod.addToPalette(`c-${i}`);
      }
      const ids = mod.getPaletteIds();
      expect(ids).toHaveLength(6);
      expect(ids).toEqual(["c-0", "c-1", "c-2", "c-3", "c-4", "c-5"]);
    });

    it("dispatches a palette-builder-change event", () => {
      const dispatched: string[] = [];
      const origDispatch = window.dispatchEvent;
      (window as unknown as Record<string, unknown>).dispatchEvent = (event: Event) => {
        dispatched.push(event.type);
        return origDispatch.call(window, event);
      };

      mod.addToPalette("x");
      expect(dispatched).toContain("palette-builder-change");
    });
  });

  describe("addManyToPalette", () => {
    it("adds multiple colors at once", () => {
      mod.addManyToPalette(["a", "b", "c"]);
      expect(mod.getPaletteIds()).toEqual(["a", "b", "c"]);
    });

    it("skips duplicates within the batch", () => {
      mod.addManyToPalette(["a", "a", "b"]);
      expect(mod.getPaletteIds()).toEqual(["a", "b"]);
    });

    it("skips colors already in the palette", () => {
      mod.addToPalette("a");
      mod.addManyToPalette(["a", "b"]);
      expect(mod.getPaletteIds()).toEqual(["a", "b"]);
    });

    it("stops at max size", () => {
      mod.addManyToPalette(["a", "b", "c", "d", "e", "f", "g", "h"]);
      expect(mod.getPaletteIds()).toHaveLength(6);
    });
  });

  describe("removeFromPalette", () => {
    it("removes a color by id", () => {
      mod.addManyToPalette(["a", "b", "c"]);
      mod.removeFromPalette("b");
      expect(mod.getPaletteIds()).toEqual(["a", "c"]);
    });

    it("does nothing when id not present", () => {
      mod.addToPalette("a");
      mod.removeFromPalette("z");
      expect(mod.getPaletteIds()).toEqual(["a"]);
    });
  });

  describe("clearPalette", () => {
    it("removes all colors", () => {
      mod.addManyToPalette(["a", "b", "c"]);
      mod.clearPalette();
      expect(mod.getPaletteIds()).toEqual([]);
    });
  });

  describe("replacePalette", () => {
    it("replaces the entire palette", () => {
      mod.addManyToPalette(["a", "b"]);
      mod.replacePalette(["x", "y", "z"]);
      expect(mod.getPaletteIds()).toEqual(["x", "y", "z"]);
    });

    it("truncates to max size", () => {
      mod.replacePalette(["a", "b", "c", "d", "e", "f", "g", "h"]);
      expect(mod.getPaletteIds()).toHaveLength(6);
    });
  });

  describe("isPaletteColor", () => {
    it("returns true for a color in the palette", () => {
      mod.addToPalette("a");
      expect(mod.isPaletteColor("a")).toBe(true);
    });

    it("returns false for a color not in the palette", () => {
      expect(mod.isPaletteColor("missing")).toBe(false);
    });
  });

  describe("subscribeToPalette", () => {
    it("calls callback on change event and returns unsubscribe", () => {
      const cb = vi.fn();
      const unsub = mod.subscribeToPalette(cb);

      mod.addToPalette("a");
      expect(cb).toHaveBeenCalled();
      expect(cb).toHaveBeenCalledWith(["a"]);

      cb.mockClear();
      unsub();
      window.dispatchEvent(new Event("palette-builder-change"));
      expect(cb).not.toHaveBeenCalled();
    });

    it("reacts to storage events", () => {
      const cb = vi.fn();
      const unsub = mod.subscribeToPalette(cb);

      window.dispatchEvent(new Event("storage"));
      expect(cb).toHaveBeenCalled();

      unsub();
    });
  });

  // ---------------------------------------------------------------------------
  // Export builders
  // ---------------------------------------------------------------------------
  const sampleColors: ColorRecord[] = [
    makeColor({ id: "c1", name: "Cherry Red", hex: "#FF0000", hsl: "hsl(0,100%,50%)" }),
    makeColor({ id: "c2", name: "Sky Blue", hex: "#0080FF", hsl: "hsl(210,100%,50%)" }),
  ];

  describe("buildPaletteCssExport", () => {
    it("produces CSS custom properties", () => {
      const css = mod.buildPaletteCssExport(sampleColors);
      expect(css).toContain(":root {");
      expect(css).toContain("--palette-1: #FF0000;");
      expect(css).toContain("--palette-2: #0080FF;");
    });
  });

  describe("buildPaletteJsonExport", () => {
    it("produces valid JSON with name, hex, hsl, rgb", () => {
      const json = mod.buildPaletteJsonExport(sampleColors);
      const parsed = JSON.parse(json);
      expect(parsed).toHaveLength(2);
      expect(parsed[0]).toHaveProperty("name", "Cherry Red");
      expect(parsed[0]).toHaveProperty("hex", "#FF0000");
    });
  });

  describe("buildPaletteTailwindExport", () => {
    it("produces tailwind config with slugified keys", () => {
      const out = mod.buildPaletteTailwindExport(sampleColors);
      expect(out).toContain('"cherry-red"');
      expect(out).toContain('"sky-blue"');
      expect(out).toContain("tailwind.config.ts");
    });
  });

  describe("buildPaletteFigmaExport", () => {
    it("produces design token JSON", () => {
      const out = mod.buildPaletteFigmaExport(sampleColors);
      const parsed = JSON.parse(out);
      expect(parsed.palette["cherry-red"].$type).toBe("color");
      expect(parsed.palette["cherry-red"].$value).toBe("#FF0000");
    });
  });

  describe("buildPaletteStyleDictionaryExport", () => {
    it("produces style dictionary structure", () => {
      const out = mod.buildPaletteStyleDictionaryExport(sampleColors);
      const parsed = JSON.parse(out);
      expect(parsed.color.palette["cherry-red"].value).toBe("#FF0000");
    });
  });

  // ---------------------------------------------------------------------------
  // generatePaletteName
  // ---------------------------------------------------------------------------
  describe("generatePaletteName", () => {
    it("returns 'Empty Palette' for no colors", () => {
      expect(mod.generatePaletteName([])).toBe("Empty Palette");
    });

    it("returns a two-word name for a non-empty palette", () => {
      const colors = [makeColor({ id: "a", hue: 10, lightness: 80, family: "Red" })];
      const name = mod.generatePaletteName(colors);
      expect(name.split(" ")).toHaveLength(2);
    });

    it("is deterministic for the same input", () => {
      const colors = [
        makeColor({ id: "x", hue: 200, lightness: 50, family: "Blue" }),
        makeColor({ id: "y", hue: 210, lightness: 55, family: "Blue" }),
      ];
      expect(mod.generatePaletteName(colors)).toBe(mod.generatePaletteName(colors));
    });
  });
});
