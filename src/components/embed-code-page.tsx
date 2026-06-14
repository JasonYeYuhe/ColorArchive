"use client";

import { useCallback, useState } from "react";
import { SITE_URL } from "@/src/lib/site-config";
import { buildColorBadgeHtml, buildPaletteBadgeHtml } from "@/src/components/embed-badge-button";

const IFRAME_CODE = `<iframe src="${SITE_URL}/embed/?utm_source=embed&utm_medium=iframe" width="360" height="500" frameborder="0" style="border-radius:12px;border:1px solid #e5e7eb"></iframe>`;

const BADGE_CODE = buildColorBadgeHtml({ hex: "#2563EB", name: "Cobalt", id: "cobalt-core-vivid" });

const PALETTE_BADGE_CODE = buildPaletteBadgeHtml({
  title: "Coastal palette",
  path: "/all-colors/",
  hexes: ["#0EA5E9", "#22C55E", "#FACC15", "#F97316", "#E11D48"],
});

function CodeBlock({ code, codeKey, copiedKey, onCopy }: {
  code: string;
  codeKey: string;
  copiedKey: string | null;
  onCopy: (key: string, code: string) => void;
}) {
  return (
    <div className="relative">
      <pre className="overflow-x-auto rounded-lg border border-gray-200 bg-gray-50 p-4 pr-20 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200">
        <code>{code}</code>
      </pre>
      <button
        onClick={() => onCopy(codeKey, code)}
        className="absolute right-3 top-3 rounded-md bg-neutral-900 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-neutral-800"
      >
        {copiedKey === codeKey ? "Copied!" : "Copy"}
      </button>
    </div>
  );
}

export function EmbedCodePage() {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copy = useCallback((key: string, code: string) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    });
  }, []);

  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="mb-4 font-display text-3xl font-light tracking-tight text-gray-900 dark:text-white sm:text-4xl">
        Embed ColorArchive — Free Color Widgets &amp; Badges
      </h1>
      <p className="mb-8 text-lg text-gray-600 dark:text-gray-400">
        Add a free color tool to your site in two ways: a full interactive color-picker
        widget, or a lightweight HTML color badge for blog posts and docs. Both are free,
        and both link back to the ColorArchive collection of 5,446 curated colors.
      </p>

      {/* Option 2 first: the badge (most useful + best for SEO) */}
      <section className="mb-12">
        <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
          Option 1 — HTML color badge (best for blogs &amp; docs)
        </h2>
        <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
          A self-contained, inline-styled link — no JavaScript, no iframe. It renders
          anywhere you can paste HTML and links back to the color. Grab a badge for any
          specific color from its page (the <strong>Embed</strong> button), or start with
          this example:
        </p>

        <div className="mb-4 rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-950">
          <div className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-400">Preview</div>
          {/* Controlled, escaped HTML from our own builder */}
          <div dangerouslySetInnerHTML={{ __html: BADGE_CODE }} />
        </div>
        <CodeBlock code={BADGE_CODE} codeKey="badge" copiedKey={copiedKey} onCopy={copy} />

        <h3 className="mb-2 mt-8 font-semibold text-gray-900 dark:text-white">Palette badge</h3>
        <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
          Showcasing a set of colors? Use a palette badge:
        </p>
        <div className="mb-4 rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-950">
          <div className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-400">Preview</div>
          <div dangerouslySetInnerHTML={{ __html: PALETTE_BADGE_CODE }} />
        </div>
        <CodeBlock code={PALETTE_BADGE_CODE} codeKey="palette" copiedKey={copiedKey} onCopy={copy} />
      </section>

      {/* Option 1: interactive iframe widget */}
      <section className="mb-12">
        <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
          Option 2 — Interactive color-picker widget
        </h2>
        <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
          An embeddable iframe widget that lets your visitors explore hex, RGB, and HSL
          values, see the color family, and browse related colors from the archive.
        </p>
        <div className="mb-4 flex justify-center rounded-xl border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-900">
          <iframe
            src="/embed/"
            width="360"
            height="500"
            style={{ borderRadius: 12, border: "1px solid #e5e7eb" }}
            title="ColorArchive Embed Widget Preview"
          />
        </div>
        <CodeBlock code={IFRAME_CODE} codeKey="iframe" copiedKey={copiedKey} onCopy={copy} />

        <h3 className="mb-2 mt-6 font-semibold text-gray-900 dark:text-white">Set an initial color</h3>
        <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">
          Add a <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs dark:bg-gray-800">?color=</code> hex
          (without the #). The widget is responsive from 300px wide; recommended 360 × 500.
        </p>
        <CodeBlock
          code={`<iframe src="${SITE_URL}/embed/?color=FF5733" width="360" height="500" frameborder="0" style="border-radius:12px;border:1px solid #e5e7eb"></iframe>`}
          codeKey="iframe-color"
          copiedKey={copiedKey}
          onCopy={copy}
        />
      </section>

      {/* Branding info */}
      <section className="mb-10">
        <h2 className="mb-3 text-xl font-semibold text-gray-900 dark:text-white">
          Attribution
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Each widget and badge includes a small &ldquo;ColorArchive&rdquo; link. Please keep
          it visible — it&rsquo;s what keeps these tools free, and it points your readers to the
          full archive of 5,446 curated colors, palette collections, and design tools.
        </p>
      </section>
    </main>
  );
}
