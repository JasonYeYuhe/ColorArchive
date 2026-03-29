"use client";

import { useCallback, useState } from "react";

const EMBED_CODE = `<iframe src="https://colorarchive.me/embed/" width="360" height="500" frameborder="0" style="border-radius:12px;border:1px solid #e5e7eb"></iframe>`;

export function EmbedCodePage() {
  const [copied, setCopied] = useState(false);

  const copyCode = useCallback(() => {
    navigator.clipboard.writeText(EMBED_CODE).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, []);

  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="mb-4 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
        Embed ColorArchive — Free Color Picker Widget
      </h1>
      <p className="mb-8 text-lg text-gray-600 dark:text-gray-400">
        Add a powerful color picker to your website for free. The embed widget lets your visitors
        explore hex, RGB, and HSL values, discover color families, and browse related colors from
        the ColorArchive collection of 5,000+ curated colors.
      </p>

      {/* Live preview */}
      <section className="mb-10">
        <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">Live Preview</h2>
        <div className="flex justify-center rounded-xl border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-900">
          <iframe
            src="/embed/"
            width="360"
            height="500"
            style={{ borderRadius: 12, border: "1px solid #e5e7eb" }}
            title="ColorArchive Embed Widget Preview"
          />
        </div>
      </section>

      {/* Embed code */}
      <section className="mb-10">
        <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">Embed Code</h2>
        <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">
          Copy and paste this code into your HTML to embed the widget:
        </p>
        <div className="relative">
          <pre className="overflow-x-auto rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200">
            <code>{EMBED_CODE}</code>
          </pre>
          <button
            onClick={copyCode}
            className="absolute right-3 top-3 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition-colors"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      </section>

      {/* Customization */}
      <section className="mb-10">
        <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
          Customization Options
        </h2>

        <div className="space-y-6">
          <div>
            <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">Size</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Adjust the <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs dark:bg-gray-800">width</code> and{" "}
              <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs dark:bg-gray-800">height</code> attributes.
              The widget is responsive and works from 300px wide. Recommended: 360 x 500.
            </p>
          </div>

          <div>
            <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">Initial Color</h3>
            <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">
              Set a default color by adding a{" "}
              <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs dark:bg-gray-800">?color=</code> query
              parameter with a hex code (without the #):
            </p>
            <pre className="overflow-x-auto rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200">
              <code>{`<iframe src="https://colorarchive.me/embed/?color=FF5733" width="360" height="500" frameborder="0" style="border-radius:12px;border:1px solid #e5e7eb"></iframe>`}</code>
            </pre>
          </div>

          <div>
            <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">Examples</h3>
            <ul className="list-inside list-disc space-y-1 text-sm text-gray-600 dark:text-gray-400">
              <li>
                Coral: <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs dark:bg-gray-800">?color=FF6B6B</code>
              </li>
              <li>
                Ocean blue: <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs dark:bg-gray-800">?color=0EA5E9</code>
              </li>
              <li>
                Forest green: <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs dark:bg-gray-800">?color=22C55E</code>
              </li>
              <li>
                Royal purple: <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs dark:bg-gray-800">?color=8B5CF6</code>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Branding info */}
      <section className="mb-10">
        <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
          Powered by ColorArchive
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          The embed widget includes a small &ldquo;Powered by ColorArchive&rdquo; link at the
          bottom. This attribution must remain visible per the terms of use. The link helps support
          the free service and directs interested users to the full ColorArchive experience with
          5,446 curated colors, palette collections, and design tools.
        </p>
      </section>
    </main>
  );
}
