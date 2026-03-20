"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { fetchAdminOrders, resendAdminOrderEmail, type AdminOrder } from "@/src/lib/auth-client";
import { useAuth } from "@/src/components/auth-provider";

type LoadState = "idle" | "loading" | "success" | "error";

const PRODUCT_OPTIONS = [
  "Palette Pack Vol. 1",
  "Brand Color Starter Kit",
  "Creator Bundle",
  "Complete Archive Token Set",
  "Dark Mode UI Kit",
  "Seasonal: Spring 2026",
];

function formatCurrency(amount: number, currency: string) {
  const normalizedCurrency = currency.toUpperCase();
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: normalizedCurrency,
    maximumFractionDigits: normalizedCurrency === "JPY" ? 0 : 2,
  }).format(normalizedCurrency === "JPY" ? amount : amount / 100);
}

export function AdminOrdersPage() {
  const { analyticsAccess, status } = useAuth();
  const [state, setState] = useState<LoadState>("idle");
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const LIMIT = 25;
  const [error, setError] = useState("");
  const [resendState, setResendState] = useState<Record<string, "idle" | "sending" | "sent">>({});

  const [emailFilter, setEmailFilter] = useState("");
  const [productFilter, setProductFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(
    (p: number, email: string, product: string, from: string, to: string) => {
      if (!analyticsAccess) return;
      setState("loading");
      setError("");

      fetchAdminOrders({ email: email || undefined, product: product || undefined, dateFrom: from || undefined, dateTo: to || undefined, page: p, limit: LIMIT })
        .then((payload) => {
          setOrders(payload.orders);
          setTotal(payload.total);
          setPage(p);
          setState("success");
        })
        .catch((err: unknown) => {
          setState("error");
          setError(err instanceof Error ? err.message : "Could not load admin orders");
        });
    },
    [analyticsAccess],
  );

  useEffect(() => {
    if (!analyticsAccess) return;
    load(1, "", "", "", "");
  }, [analyticsAccess, load]);

  function handleFilterChange(email: string, product: string, from: string, to: string) {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      load(1, email, product, from, to);
    }, 400);
  }

  function handleEmailChange(value: string) {
    setEmailFilter(value);
    handleFilterChange(value, productFilter, dateFrom, dateTo);
  }
  function handleProductChange(value: string) {
    setProductFilter(value);
    handleFilterChange(emailFilter, value, dateFrom, dateTo);
  }
  function handleDateFromChange(value: string) {
    setDateFrom(value);
    handleFilterChange(emailFilter, productFilter, value, dateTo);
  }
  function handleDateToChange(value: string) {
    setDateTo(value);
    handleFilterChange(emailFilter, productFilter, dateFrom, value);
  }

  async function handleResend(orderId: string) {
    try {
      setResendState((current) => ({ ...current, [orderId]: "sending" }));
      await resendAdminOrderEmail(orderId);
      setResendState((current) => ({ ...current, [orderId]: "sent" }));
      window.setTimeout(() => {
        setResendState((current) => ({ ...current, [orderId]: "idle" }));
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not resend admin order email");
      setResendState((current) => ({ ...current, [orderId]: "idle" }));
    }
  }

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <main className="px-4 py-4 sm:px-6 sm:py-6">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6">
        <section className="rounded-[2rem] border border-black/6 bg-white/80 px-6 py-10 shadow-[0_24px_80px_rgba(15,23,42,0.08)] sm:px-10 sm:py-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-black/8 bg-white/90 px-3 py-1 text-xs font-medium uppercase tracking-[0.22em] text-neutral-500">
            <span className="inline-block h-2 w-2 rounded-full bg-neutral-900" />
            Admin actions
          </div>
          <h1 className="mt-6 max-w-4xl text-4xl font-semibold tracking-[-0.04em] text-neutral-950 sm:text-6xl">
            Order resend and buyer support queue
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-neutral-600 sm:text-lg">
            Lightweight admin surface for order follow-up. Use this to resend downloads, open pack
            pages, or jump straight into buyer support without digging through email.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Link
              href="/analytics"
              className="rounded-full border border-black/8 bg-neutral-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800"
            >
              Back to analytics
            </Link>
            <Link
              href="/login?next=/admin/orders"
              className="rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
            >
              Account page
            </Link>
          </div>
        </section>

        {status !== "authenticated" ? (
          <section className="rounded-[1.75rem] border border-amber-200 bg-amber-50 p-6 text-sm text-amber-800 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
            <div>Sign in with an allowlisted admin account to view this page.</div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href="/login?next=/admin/orders"
                className="inline-flex rounded-full border border-amber-200 bg-white px-4 py-2 text-sm font-medium text-amber-800 transition hover:bg-amber-100"
              >
                Sign in
              </Link>
              <Link
                href="/analytics"
                className="inline-flex rounded-full border border-amber-200 bg-white px-4 py-2 text-sm font-medium text-amber-800 transition hover:bg-amber-100"
              >
                Back to analytics
              </Link>
            </div>
          </section>
        ) : null}

        {status === "authenticated" && !analyticsAccess ? (
          <section className="rounded-[1.75rem] border border-amber-200 bg-amber-50 p-6 text-sm text-amber-800 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
            <div>This signed-in account does not have admin order access.</div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href="/login?next=/login"
                className="inline-flex rounded-full border border-amber-200 bg-white px-4 py-2 text-sm font-medium text-amber-800 transition hover:bg-amber-100"
              >
                Open account
              </Link>
              <Link
                href="/analytics"
                className="inline-flex rounded-full border border-amber-200 bg-white px-4 py-2 text-sm font-medium text-amber-800 transition hover:bg-amber-100"
              >
                Analytics
              </Link>
            </div>
          </section>
        ) : null}

        {analyticsAccess ? (
          <section className="rounded-[1.75rem] border border-black/6 bg-white/82 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
            {/* Filter bar */}
            <div className="mb-4 flex flex-wrap gap-3">
              <input
                type="text"
                placeholder="Search email…"
                value={emailFilter}
                onChange={(e) => handleEmailChange(e.target.value)}
                className="rounded-xl border border-black/10 bg-white px-3 py-2 text-sm text-neutral-700 placeholder-neutral-400 outline-none focus:border-neutral-400 sm:w-56"
              />
              <select
                value={productFilter}
                onChange={(e) => handleProductChange(e.target.value)}
                className="rounded-xl border border-black/10 bg-white px-3 py-2 text-sm text-neutral-700 outline-none focus:border-neutral-400"
              >
                <option value="">All products</option>
                {PRODUCT_OPTIONS.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => handleDateFromChange(e.target.value)}
                className="rounded-xl border border-black/10 bg-white px-3 py-2 text-sm text-neutral-700 outline-none focus:border-neutral-400"
              />
              <input
                type="date"
                value={dateTo}
                onChange={(e) => handleDateToChange(e.target.value)}
                className="rounded-xl border border-black/10 bg-white px-3 py-2 text-sm text-neutral-700 outline-none focus:border-neutral-400"
              />
            </div>

            {state === "loading" ? (
              <div className="text-sm text-neutral-500">Loading…</div>
            ) : null}

            {state === "error" ? <div className="text-sm text-red-600">{error}</div> : null}

            {state === "success" ? (
              <>
                <div className="mb-3 text-xs text-neutral-400">
                  Showing {orders.length > 0 ? (page - 1) * LIMIT + 1 : 0}–{(page - 1) * LIMIT + orders.length} of {total} orders
                </div>
                <div className="grid gap-3">
                  {orders.length === 0 ? (
                    <div className="rounded-[1.2rem] border border-dashed border-black/10 px-4 py-6 text-center text-sm text-neutral-400">
                      No orders match the current filters.
                    </div>
                  ) : null}
                  {orders.map((order) => (
                    <article
                      key={`admin-order-${order.orderId}`}
                      className="rounded-[1.2rem] border border-black/6 bg-neutral-50 px-4 py-4"
                    >
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div>
                          <div className="text-lg font-semibold tracking-[-0.02em] text-neutral-950">
                            {order.product}
                          </div>
                          <div className="mt-2 text-sm text-neutral-500">
                            {order.email} · {formatCurrency(order.amount, order.currency)}
                          </div>
                          <div className="mt-1 text-xs uppercase tracking-[0.14em] text-neutral-400">
                            Order {order.orderId}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => void handleResend(order.orderId)}
                            disabled={resendState[order.orderId] === "sending"}
                            className="rounded-full border border-black/8 bg-neutral-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:opacity-50"
                          >
                            {resendState[order.orderId] === "sending"
                              ? "Sending…"
                              : resendState[order.orderId] === "sent"
                                ? "Sent"
                                : "Resend email"}
                          </button>
                          <a
                            href={`mailto:${order.email}?subject=${encodeURIComponent(`ColorArchive support · ${order.product}`)}`}
                            className="rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
                          >
                            Email buyer
                          </a>
                          {order.packUrl ? (
                            <a
                              href={order.packUrl}
                              className="rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
                            >
                              Pack page
                            </a>
                          ) : null}
                          {order.downloadUrl ? (
                            <a
                              href={order.downloadUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
                            >
                              Download ZIP
                            </a>
                          ) : null}
                        </div>
                      </div>
                    </article>
                  ))}
                </div>

                {totalPages > 1 ? (
                  <div className="mt-4 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => load(page - 1, emailFilter, productFilter, dateFrom, dateTo)}
                      disabled={page <= 1}
                      className="rounded-full border border-black/8 bg-white px-4 py-2 text-sm text-neutral-600 transition hover:bg-neutral-50 disabled:opacity-40"
                    >
                      ← Previous
                    </button>
                    <span className="text-xs text-neutral-400">Page {page} of {totalPages}</span>
                    <button
                      type="button"
                      onClick={() => load(page + 1, emailFilter, productFilter, dateFrom, dateTo)}
                      disabled={page >= totalPages}
                      className="rounded-full border border-black/8 bg-white px-4 py-2 text-sm text-neutral-600 transition hover:bg-neutral-50 disabled:opacity-40"
                    >
                      Next →
                    </button>
                  </div>
                ) : null}
              </>
            ) : null}
          </section>
        ) : null}
      </div>
    </main>
  );
}
