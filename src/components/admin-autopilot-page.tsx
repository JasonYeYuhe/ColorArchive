"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/src/components/auth-provider";
import {
  fetchAdminAutopilotStatus,
  type AutopilotStatus,
} from "@/src/lib/auth-client";

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

function formatCurrency(amount: number, currency: string) {
  const c = currency.toUpperCase();
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: c,
      maximumFractionDigits: c === "JPY" ? 0 : 2,
    }).format(c === "JPY" ? amount : amount / 100);
  } catch {
    return `${amount} ${c}`;
  }
}

export function AdminAutopilotPage() {
  const { analyticsAccess, status: authStatus } = useAuth();
  const [state, setState] = useState<LoadState>("idle");
  const [data, setData] = useState<AutopilotStatus | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!analyticsAccess) return;
    setState("loading");
    setError("");
    try {
      const json = await fetchAdminAutopilotStatus();
      setData(json);
      setState("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setState("error");
    }
  }, [analyticsAccess]);

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
        <button
          type="button"
          onClick={load}
          disabled={state === "loading"}
          className="rounded-full border border-neutral-300 bg-white px-4 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-50"
        >
          {state === "loading" ? "Refreshing…" : "Refresh"}
        </button>
      </header>

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
                        </div>
                        <div className="ml-4 shrink-0 text-neutral-400">
                          {formatCurrency(o.amount, o.currency)} ·{" "}
                          {formatRelative(o.created_at)}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          <footer className="text-[11px] text-neutral-400">
            fetched {formatRelative(data.generated_at)}
          </footer>
        </div>
      )}
    </main>
  );
}
