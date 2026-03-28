"use client";

import { useState, useRef, useEffect } from "react";
import { CopyButton } from "@/src/components/copy-button";

// ─── Try-it panel ────────────────────────────────────────────────────────────

function TryIt({ baseUrl }: { baseUrl: string }) {
  const [url, setUrl] = useState(baseUrl);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function run() {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(url);
      const json = await res.json();
      setResult(JSON.stringify(json, null, 2));
    } catch (err) {
      setResult(`Error: ${err instanceof Error ? err.message : "Request failed"}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-4 rounded-xl border border-black/6 bg-neutral-50/80 dark:border-white/8 dark:bg-white/4">
      <div className="flex items-center gap-2 border-b border-black/6 px-4 py-3 dark:border-white/8">
        <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
          GET
        </span>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="flex-1 rounded-lg border border-black/8 bg-white px-3 py-1.5 font-mono text-xs text-neutral-700 focus:outline-none focus:ring-2 focus:ring-neutral-900/20 dark:border-white/10 dark:bg-neutral-900 dark:text-neutral-300"
        />
        <button
          type="button"
          onClick={run}
          disabled={loading}
          className="rounded-full bg-neutral-950 px-4 py-1.5 text-xs font-medium text-white transition hover:bg-neutral-800 disabled:opacity-50 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-100"
        >
          {loading ? "Loading..." : "Send"}
        </button>
      </div>
      {result && (
        <div className="relative">
          <div className="absolute right-3 top-3">
            <CopyButton value={result} label="Copy" variant="compact" copiedLabel="Copied" className="rounded-full border border-black/8 bg-white px-3 py-1.5 text-xs font-medium uppercase tracking-[0.14em] text-neutral-600 transition hover:bg-neutral-950 hover:text-white dark:border-white/10 dark:bg-white/8 dark:text-neutral-300 dark:hover:bg-white dark:hover:text-neutral-950" />
          </div>
          <pre className="max-h-80 overflow-auto p-4 text-xs leading-relaxed text-neutral-700 dark:text-neutral-300">
            <code>{result}</code>
          </pre>
        </div>
      )}
    </div>
  );
}

// ─── Param table ─────────────────────────────────────────────────────────────

interface Param {
  name: string;
  type: string;
  defaultVal: string;
  description: string;
}

function ParamTable({ params }: { params: Param[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs">
        <thead>
          <tr className="border-b border-black/6 dark:border-white/8">
            <th className="pb-2 pr-4 font-semibold uppercase tracking-[0.14em] text-neutral-500 dark:text-neutral-400">Name</th>
            <th className="pb-2 pr-4 font-semibold uppercase tracking-[0.14em] text-neutral-500 dark:text-neutral-400">Type</th>
            <th className="pb-2 pr-4 font-semibold uppercase tracking-[0.14em] text-neutral-500 dark:text-neutral-400">Default</th>
            <th className="pb-2 font-semibold uppercase tracking-[0.14em] text-neutral-500 dark:text-neutral-400">Description</th>
          </tr>
        </thead>
        <tbody>
          {params.map((p) => (
            <tr key={p.name} className="border-b border-black/4 dark:border-white/4">
              <td className="py-2 pr-4 font-mono font-medium text-neutral-800 dark:text-neutral-200">{p.name}</td>
              <td className="py-2 pr-4 text-neutral-500 dark:text-neutral-400">{p.type}</td>
              <td className="py-2 pr-4 font-mono text-neutral-400 dark:text-neutral-500">{p.defaultVal}</td>
              <td className="py-2 text-neutral-600 dark:text-neutral-400">{p.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Main ────────────────────────────────────────────────────────────────────

const LIST_PARAMS: Param[] = [
  { name: "q", type: "string", defaultVal: '""', description: "Search by name, hex, or semantic keyword (e.g. \"sunset\", \"ocean\", \"pastel\")" },
  { name: "family", type: "string", defaultVal: '"All"', description: "Filter by color family: Red, Orange, Yellow, Lime, Green, Teal, Blue, Purple, Pink" },
  { name: "sort", type: "string", defaultVal: '"hue"', description: "Sort order: hue, lightness, or name" },
  { name: "limit", type: "number", defaultVal: "50", description: "Max results per page (1–200)" },
  { name: "offset", type: "number", defaultVal: "0", description: "Pagination offset" },
];

const EXAMPLE_RESPONSE_LIST = `{
  "total": 280,
  "limit": 2,
  "offset": 0,
  "colors": [
    {
      "id": "teal-ink-muted",
      "name": "Teal Ink Muted",
      "hex": "#1D2A26",
      "rgb": "rgb(29, 42, 38)",
      "hsl": "hsl(160, 18%, 14%)",
      "hue": 160,
      "saturation": 18,
      "lightness": 14,
      "family": "Teal"
    },
    ...
  ]
}`;

const EXAMPLE_RESPONSE_DETAIL = `{
  "id": "sapphire-pure-vivid",
  "name": "Sapphire Pure Vivid",
  "hex": "#1A6BD9",
  "rgb": "rgb(26, 107, 217)",
  "hsl": "hsl(210, 74%, 50%)",
  "hue": 210,
  "saturation": 74,
  "lightness": 50,
  "family": "Blue",
  "relationships": {
    "analogous": [ ... ],
    "complementary": { ... },
    "triadic": [ ... ],
    "splitComplementary": [ ... ],
    "nearest": [ ... ]
  }
}`;

export function ApiDocsPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      {/* Header */}
      <div className="mb-10">
        <div className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
          Developer
        </div>
        <h1 className="text-3xl font-bold tracking-[-0.03em] text-neutral-950 dark:text-white sm:text-4xl">
          Color API
        </h1>
        <p className="mt-3 max-w-xl text-neutral-500 dark:text-neutral-400">
          Access all 3,000+ curated ColorArchive colors via a simple REST API. Free, no auth required, CORS enabled.
        </p>
      </div>

      {/* Base URL */}
      <div className="mb-8 flex items-center gap-3 rounded-xl border border-black/6 bg-white/60 px-5 py-3 dark:border-white/8 dark:bg-white/4">
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500 dark:text-neutral-400">
          Base URL
        </span>
        <code className="font-mono text-sm text-neutral-800 dark:text-neutral-200">
          https://colorarchive.me/api
        </code>
        <CopyButton value="https://colorarchive.me/api" label="Copy" variant="compact" copiedLabel="Copied" className="rounded-full border border-black/8 bg-white px-3 py-1.5 text-xs font-medium uppercase tracking-[0.14em] text-neutral-600 transition hover:bg-neutral-950 hover:text-white dark:border-white/10 dark:bg-white/8 dark:text-neutral-300 dark:hover:bg-white dark:hover:text-neutral-950" />
      </div>

      <div className="space-y-10">
        {/* ── Endpoint 1: List ── */}
        <section className="rounded-2xl border border-black/6 bg-white/60 p-6 dark:border-white/8 dark:bg-white/4">
          <div className="mb-4 flex items-center gap-3">
            <span className="rounded bg-emerald-100 px-2.5 py-1 text-[11px] font-bold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
              GET
            </span>
            <code className="font-mono text-sm font-semibold text-neutral-800 dark:text-neutral-200">
              /api/colors
            </code>
          </div>
          <p className="mb-5 text-sm text-neutral-600 dark:text-neutral-400">
            Search, filter, and paginate through 3,000+ colors. Supports semantic search — try queries like &quot;sunset&quot;, &quot;ocean&quot;, or &quot;minimal&quot;.
          </p>

          <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500 dark:text-neutral-400">
            Parameters
          </h3>
          <ParamTable params={LIST_PARAMS} />

          <h3 className="mb-2 mt-6 text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500 dark:text-neutral-400">
            Example Response
          </h3>
          <pre className="rounded-xl bg-neutral-50 p-4 text-xs leading-relaxed text-neutral-700 dark:bg-neutral-900/60 dark:text-neutral-300">
            <code>{EXAMPLE_RESPONSE_LIST}</code>
          </pre>

          <h3 className="mb-2 mt-6 text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500 dark:text-neutral-400">
            Try it
          </h3>
          <TryIt baseUrl="/api/colors?q=ocean&limit=3" />
        </section>

        {/* ── Endpoint 2: Detail ── */}
        <section className="rounded-2xl border border-black/6 bg-white/60 p-6 dark:border-white/8 dark:bg-white/4">
          <div className="mb-4 flex items-center gap-3">
            <span className="rounded bg-emerald-100 px-2.5 py-1 text-[11px] font-bold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
              GET
            </span>
            <code className="font-mono text-sm font-semibold text-neutral-800 dark:text-neutral-200">
              /api/colors/:id
            </code>
          </div>
          <p className="mb-5 text-sm text-neutral-600 dark:text-neutral-400">
            Get a single color by its slug or hex code. Returns the full color record plus relationships (analogous, complementary, triadic, split-complementary, nearest).
          </p>

          <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500 dark:text-neutral-400">
            Path Parameter
          </h3>
          <ParamTable
            params={[
              {
                name: "id",
                type: "string",
                defaultVal: "—",
                description: 'Color slug (e.g. "sapphire-pure-vivid") or 6-digit hex without # (e.g. "1A6BD9")',
              },
            ]}
          />

          <h3 className="mb-2 mt-6 text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500 dark:text-neutral-400">
            Example Response
          </h3>
          <pre className="rounded-xl bg-neutral-50 p-4 text-xs leading-relaxed text-neutral-700 dark:bg-neutral-900/60 dark:text-neutral-300">
            <code>{EXAMPLE_RESPONSE_DETAIL}</code>
          </pre>

          <h3 className="mb-2 mt-6 text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500 dark:text-neutral-400">
            Try it
          </h3>
          <TryIt baseUrl="/api/colors/sapphire-pure-vivid" />
        </section>

        {/* ── Usage examples ── */}
        <section className="rounded-2xl border border-black/6 bg-white/60 p-6 dark:border-white/8 dark:bg-white/4">
          <h2 className="mb-4 text-lg font-bold text-neutral-950 dark:text-white">
            Quick Start
          </h2>
          <div className="space-y-4">
            <div>
              <div className="mb-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500 dark:text-neutral-400">
                JavaScript / fetch
              </div>
              <pre className="rounded-xl bg-neutral-50 p-4 text-xs leading-relaxed text-neutral-700 dark:bg-neutral-900/60 dark:text-neutral-300">
                <code>{`const res = await fetch("https://colorarchive.me/api/colors?q=sunset&limit=10");
const { colors } = await res.json();
console.log(colors[0].hex); // "#8B2500"`}</code>
              </pre>
            </div>
            <div>
              <div className="mb-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500 dark:text-neutral-400">
                curl
              </div>
              <pre className="rounded-xl bg-neutral-50 p-4 text-xs leading-relaxed text-neutral-700 dark:bg-neutral-900/60 dark:text-neutral-300">
                <code>{`curl "https://colorarchive.me/api/colors?family=Blue&sort=lightness&limit=5"`}</code>
              </pre>
            </div>
          </div>
        </section>

        {/* ── Rate limits ── */}
        <section className="rounded-2xl border border-black/6 bg-white/60 p-6 dark:border-white/8 dark:bg-white/4">
          <h2 className="mb-3 text-lg font-bold text-neutral-950 dark:text-white">
            Notes
          </h2>
          <ul className="space-y-2 text-sm text-neutral-600 dark:text-neutral-400">
            <li>Responses are cached for 24 hours at the edge (CDN).</li>
            <li>No authentication required. No rate limiting (be reasonable).</li>
            <li>CORS is enabled for all origins.</li>
            <li>All 3,000+ colors are generated algorithmically — the dataset is stable and deterministic.</li>
          </ul>
        </section>
      </div>
    </main>
  );
}
