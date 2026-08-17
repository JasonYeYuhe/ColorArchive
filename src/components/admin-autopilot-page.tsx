"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/src/components/auth-provider";
import {
  fetchAdminAutopilotStatus,
  type AutopilotStatus,
} from "@/src/lib/auth-client";
import { formatMinorCurrency } from "@/src/lib/format-money";

type LoadState = "idle" | "loading" | "success" | "error";

function formatRelative(iso: string | null | undefined): string {
  if (!iso) return "never";
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return "unknown";
  const diffMs = Date.now() - t;
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  return `${day}d ago`;
}

// The third copy of this formatter, with the same defect as the other two: it
// treated `amount` as minor units and divided by 100, except for JPY. All three
// now share src/lib/format-money.ts, and admin.js feeds them exact minor units.

export function AdminAutopilotPage() {
  const { analyticsAccess, status: authStatus } = useAuth();
  const [state, setState] = useState<LoadState>("idle");
  const [data, setData] = useState<AutopilotStatus | null>(null);
  const [error, setError] = useState("");
  const [includeTest, setIncludeTest] = useState(false);

  const load = useCallback(async () => {
    if (!analyticsAccess) return;
    setState("loading");
    setError("");
    try {
      const json = await fetchAdminAutopilotStatus({ includeTest });
      setData(json);
      setState("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setState("error");
    }
  }, [analyticsAccess, includeTest]);

  useEffect(() => {
    load();
  }, [load]);

  if (authStatus !== "authenticated" || !analyticsAccess) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-12 text-sm text-neutral-600">
        <h1 className="text-2xl font-semibold text-neutral-900">
          Autopilot Status
        </h1>
        <p className="mt-4">
          You need an analytics-access login to view this page.{" "}
          <Link className="underline" href="/login/?next=/admin/autopilot">
            Sign in
          </Link>
          .
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-10 text-sm">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">
            Autopilot Status
          </h1>
          <p className="text-xs text-neutral-500">
            Live health + recent activity for Pinterest autopilot and
            commerce webhooks.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1.5 text-xs text-neutral-600">
            <input
              type="checkbox"
              checked={includeTest}
              onChange={(e) => setIncludeTest(e.target.checked)}
              className="h-3.5 w-3.5"
            />
            show test rows
          </label>
          <button
            type="button"
            onClick={load}
            disabled={state === "loading"}
            className="rounded-full border border-neutral-300 bg-white px-4 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-50"
          >
            {state === "loading" ? "Refreshing…" : "Refresh"}
          </button>
        </div>
      </header>

      {data && data.test_rows_hidden > 0 && !includeTest && (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-[11px] text-amber-700">
          {data.test_rows_hidden} test row{data.test_rows_hidden === 1 ? "" : "s"} hidden. Toggle above to include.
        </div>
      )}

      {state === "error" && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-700">
          Failed to load status: {error}
        </div>
      )}

      {data && (
        <div className="space-y-6">
          {/* Pinterest */}
          <section className="rounded-2xl border border-neutral-200 bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-neutral-900">
                Pinterest
              </h2>
              <span
                className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                  data.pinterest.connected
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-red-50 text-red-700"
                }`}
              >
                {data.pinterest.connected ? "connected" : "disconnected"}
              </span>
            </div>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs text-neutral-600 sm:grid-cols-4">
              <div>
                <dt className="text-neutral-400">account</dt>
                <dd className="font-medium text-neutral-900">
                  {data.pinterest.username || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-neutral-400">today</dt>
                <dd className="font-medium text-neutral-900">
                  {data.pinterest.pins_today} pins
                </dd>
              </div>
              <div>
                <dt className="text-neutral-400">last 7d</dt>
                <dd className="font-medium text-neutral-900">
                  {data.pinterest.pins_last_7d} pins
                </dd>
              </div>
              <div>
                <dt className="text-neutral-400">last pin</dt>
                <dd className="font-medium text-neutral-900">
                  {formatRelative(data.pinterest.last_pin_at)}
                </dd>
              </div>
            </dl>

            {data.pinterest.recent_pins.length > 0 && (
              <div className="mt-6">
                <div className="mb-2 text-[11px] uppercase tracking-wider text-neutral-400">
                  recent pins (last 7d)
                </div>
                <ul className="divide-y divide-neutral-100">
                  {data.pinterest.recent_pins.map((p) => (
                    <li key={p.pinId || `${p.type}-${p.slug}-${p.at}`} className="py-2">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex-1 truncate">
                          <span className="mr-2 rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-neutral-500">
                            {p.type}
                          </span>
                          <a
                            href={p.link}
                            target="_blank"
                            rel="noreferrer"
                            className="text-neutral-900 hover:underline"
                          >
                            {p.title}
                          </a>
                          {p.dryRun && (
                            <span className="ml-2 text-[10px] text-amber-600">
                              dry-run
                            </span>
                          )}
                        </div>
                        <div className="ml-4 shrink-0 text-neutral-400">
                          {formatRelative(p.at)}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          {/* Commerce */}
          <section className="rounded-2xl border border-neutral-200 bg-white p-6">
            <h2 className="mb-4 text-base font-semibold text-neutral-900">
              Commerce
            </h2>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs text-neutral-600 sm:grid-cols-3">
              <div>
                <dt className="text-neutral-400">total Pro users</dt>
                <dd className="font-medium text-neutral-900">
                  {data.commerce.pro_users_total}
                </dd>
              </div>
              <div>
                <dt className="text-neutral-400">new Pro (7d)</dt>
                <dd className="font-medium text-neutral-900">
                  {data.commerce.new_pro_last_7d}
                </dd>
              </div>
              <div>
                <dt className="text-neutral-400">orders (7d)</dt>
                <dd className="font-medium text-neutral-900">
                  {data.commerce.orders_last_7d}
                </dd>
              </div>
            </dl>

            {data.commerce.recent_orders.length > 0 && (
              <div className="mt-6">
                <div className="mb-2 text-[11px] uppercase tracking-wider text-neutral-400">
                  recent orders
                </div>
                <ul className="divide-y divide-neutral-100">
                  {data.commerce.recent_orders.map((o) => (
                    <li key={o.order_id} className="py-2">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex-1 truncate">
                          <span className="text-neutral-900">{o.product}</span>
                          <span className="ml-2 text-neutral-400">
                            {o.email}
                          </span>
                          {o.is_test === 1 && (
                            <span className="ml-2 rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium uppercase text-amber-700">
                              test
                            </span>
                          )}
                        </div>
                        <div className="ml-4 shrink-0 text-neutral-400">
                          {formatMinorCurrency(o.amount, o.currency)} ·{" "}
                          {formatRelative(o.created_at)}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          {data.commerce.suspected_duplicates && data.commerce.suspected_duplicates.length > 0 && (
            <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
              <div className="mb-3 flex items-center gap-2">
                <h2 className="text-base font-semibold text-amber-900">
                  Suspected duplicate subscriptions
                </h2>
                <span className="rounded-full bg-amber-200 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-amber-800">
                  {data.commerce.suspected_duplicates.length}
                </span>
              </div>
              <p className="mb-4 text-[11px] text-amber-700">
                These Pro users share a card fingerprint (brand + last-four)
                with another active Pro user within the last 30 days. Not
                auto-cancelled — review and decide per row.
              </p>
              <ul className="divide-y divide-amber-200">
                {data.commerce.suspected_duplicates.map((dup) => (
                  <li key={dup.user_id} className="py-3 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <span className="font-medium text-amber-900">
                          user #{dup.user_id}
                        </span>
                        <span className="ml-2 text-amber-800">{dup.email}</span>
                        <span className="ml-2 text-amber-600">
                          · {dup.plan || "—"} · card {dup.card_fingerprint || "—"}
                        </span>
                      </div>
                      <div className="shrink-0 text-amber-600">
                        {formatRelative(dup.created_at)}
                      </div>
                    </div>
                    {dup.suspects.length > 0 && (
                      <div className="mt-1 text-amber-700">
                        ↳ matches: {dup.suspects.map((s) => `#${s.id} ${s.email}`).join(", ")}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <footer className="text-[11px] text-neutral-400">
            fetched {formatRelative(data.generated_at)}
          </footer>
        </div>
      )}
    </main>
  );
}
