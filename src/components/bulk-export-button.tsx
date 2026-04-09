"use client";

import { useState } from "react";
import type { ColorCollection } from "@/src/lib/collections";
import { SITE_DOMAIN } from "@/src/lib/site-config";

/**
 * Bulk export a collection as a ZIP containing CSS, Tailwind, JSON, and SCSS tokens.
 * Pro-only feature — wrap with <ProGate> when using.
 */
export function BulkExportButton({ collection }: { collection: ColorCollection }) {
  const [loading, setLoading] = useState(false);

  async function handleExport() {
    setLoading(true);
    try {
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();
      const slug = collection.id;
      const colors = collection.palette;

      // CSS variables
      const css = `:root {\n${colors
        .map((c, i) => `  --${slug}-${i + 1}: ${c.hex};`)
        .join("\n")}\n}`;
      zip.file(`${slug}-tokens.css`, css);

      // Tailwind config
      const tw = `/** @type {import('tailwindcss').Config} */\nmodule.exports = {\n  theme: {\n    extend: {\n      colors: {\n        '${slug}': {\n${colors
        .map((c, i) => `          ${i + 1}: '${c.hex}',`)
        .join("\n")}\n        },\n      },\n    },\n  },\n};`;
      zip.file(`${slug}-tailwind.config.js`, tw);

      // JSON
      const json = JSON.stringify(
        {
          collection: collection.title,
          colors: colors.map((c, i) => ({
            index: i + 1,
            name: c.name,
            hex: c.hex,
          })),
        },
        null,
        2,
      );
      zip.file(`${slug}-colors.json`, json);

      // SCSS map
      const scss = `$${slug}-colors: (\n${colors
        .map((c, i) => `  '${i + 1}': ${c.hex},`)
        .join("\n")}\n);`;
      zip.file(`${slug}-colors.scss`, scss);

      // README
      const readme = `${collection.title}\n${"=".repeat(collection.title.length)}\n\n${collection.summary}\n\nColors:\n${colors
        .map((c, i) => `  ${i + 1}. ${c.name} — ${c.hex}`)
        .join("\n")}\n\nExported from ColorArchive (${SITE_DOMAIN})\n`;
      zip.file("README.txt", readme);

      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${slug}-tokens.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Bulk export failed:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={loading}
      className="inline-flex items-center gap-2 rounded-full border border-black/8 bg-neutral-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:opacity-50 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-100"
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
      </svg>
      {loading ? "Generating…" : "Download collection ZIP"}
    </button>
  );
}
