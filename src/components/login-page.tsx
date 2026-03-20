"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  API_URL,
  fetchAdminOrders,
  fetchOrders,
  type AdminOrder,
  resendAdminOrderEmail,
  resendOrderEmail,
  type AccountOrder,
} from "@/src/lib/auth-client";
import { useAuth } from "@/src/components/auth-provider";
import { useLocale } from "@/src/components/locale-provider";
import { licenseTiers, supportPolicy } from "@/src/lib/license-tiers";

type FormState = "idle" | "loading" | "success" | "error";
type VerifyState = "idle" | "loading" | "success" | "error";
type OrdersState = "idle" | "loading" | "success" | "error";
type AdminState = "idle" | "loading" | "success" | "error";

function sanitizeNextPath(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/favorites";
  }

  return value;
}

function describeDestination(path: string) {
  if (path.startsWith("/analytics")) {
    return "analytics";
  }

  if (path.startsWith("/admin/orders")) {
    return "the admin orders queue";
  }

  if (path.startsWith("/palette")) {
    return "your palette";
  }

  if (path.startsWith("/favorites")) {
    return "your favorites";
  }

  if (path.startsWith("/login")) {
    return "your account";
  }

  return "your account";
}

function formatSyncTime(timestamp: number | null) {
  if (!timestamp) {
    return "Not synced yet";
  }

  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    month: "short",
    day: "numeric",
  }).format(timestamp);
}

function formatOrderCurrency(amount: number, currency: string) {
  const normalizedCurrency = currency.toUpperCase();
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: normalizedCurrency,
    maximumFractionDigits: normalizedCurrency === "JPY" ? 0 : 2,
  }).format(normalizedCurrency === "JPY" ? amount : amount / 100);
}

export function LoginPage() {
  const { t } = useLocale();
  const searchParams = useSearchParams();
  const router = useRouter();
  const {
    analyticsAccess,
    googleEnabled,
    lastSyncAt,
    logout,
    requestMagicLink,
    status,
    user,
    verifyMagicLink,
  } = useAuth();
  const [email, setEmail] = useState("");
  const [formState, setFormState] = useState<FormState>("idle");
  const [verifyState, setVerifyState] = useState<VerifyState>("idle");
  const [ordersState, setOrdersState] = useState<OrdersState>("idle");
  const [orders, setOrders] = useState<AccountOrder[]>([]);
  const [adminOrders, setAdminOrders] = useState<AdminOrder[]>([]);
  const [error, setError] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);
  const [ordersError, setOrdersError] = useState("");
  const [adminState, setAdminState] = useState<AdminState>("idle");
  const [adminError, setAdminError] = useState("");
  const [resendState, setResendState] = useState<Record<string, "idle" | "sending" | "sent">>({});

  const token = searchParams.get("token");
  const loginError = searchParams.get("error");
  const authState = searchParams.get("auth");
  const nextPath = useMemo(() => sanitizeNextPath(searchParams.get("next")), [searchParams]);
  const googleSuccess = authState === "google-success";
  const destinationLabel = useMemo(() => describeDestination(nextPath), [nextPath]);

  useEffect(() => {
    if (!loginError) {
      return;
    }

    const messages: Record<string, string> = {
      "google-failed": "Google sign-in could not be completed.",
      "google-invalid": "Google sign-in returned an invalid response.",
      "google-not-configured": "Google sign-in is not configured yet.",
      "google-state": "Google sign-in expired. Please try again.",
    };

    setError(messages[loginError] ?? "Could not complete sign-in.");
  }, [loginError]);

  useEffect(() => {
    if (!token || verifyState !== "idle" || status === "loading") {
      return;
    }

    const loginToken = token;

    if (user) {
      setVerifyState("success");
      window.setTimeout(() => {
        router.replace(nextPath);
      }, 300);
      return;
    }

    let cancelled = false;

    async function handleToken() {
      setVerifyState("loading");
      setError("");

      try {
        await verifyMagicLink(loginToken);
        if (cancelled) {
          return;
        }

        setVerifyState("success");
        window.setTimeout(() => {
          router.replace(nextPath);
        }, 900);
      } catch (err) {
        if (cancelled) {
          return;
        }

        setError(err instanceof Error ? err.message : "Could not verify link");
        setVerifyState("error");
      }
    }

    void handleToken();

    return () => {
      cancelled = true;
    };
  }, [nextPath, router, status, token, user, verifyMagicLink, verifyState]);

  useEffect(() => {
    if (!googleSuccess || status !== "authenticated") {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      router.replace(nextPath);
    }, 1400);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [googleSuccess, nextPath, router, status]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email) {
      return;
    }

    setFormState("loading");
    setError("");

    try {
      await requestMagicLink(email, nextPath);
      setFormState("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send link");
      setFormState("error");
    }
  }

  async function handleLogout() {
    try {
      await logout();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not log out");
    }
  }

  useEffect(() => {
    if (!user) {
      setOrders([]);
      setOrdersState("idle");
      setOrdersError("");
      return;
    }

    let cancelled = false;

    async function loadOrders() {
      setOrdersState("loading");
      setOrdersError("");

      try {
        const payload = await fetchOrders();
        if (cancelled) {
          return;
        }

        setOrders(payload.orders);
        setOrdersState("success");
      } catch (err) {
        if (cancelled) {
          return;
        }

        setOrdersState("error");
        setOrdersError(err instanceof Error ? err.message : "Could not load orders");
      }
    }

    void loadOrders();

    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    if (!user || !analyticsAccess) {
      setAdminOrders([]);
      setAdminState("idle");
      setAdminError("");
      return;
    }

    let cancelled = false;

    async function loadAdminOrders() {
      setAdminState("loading");
      setAdminError("");

      try {
        const payload = await fetchAdminOrders();
        if (cancelled) {
          return;
        }

        setAdminOrders(payload.orders);
        setAdminState("success");
      } catch (err) {
        if (cancelled) {
          return;
        }

        setAdminState("error");
        setAdminError(err instanceof Error ? err.message : "Could not load admin queue");
      }
    }

    void loadAdminOrders();

    return () => {
      cancelled = true;
    };
  }, [analyticsAccess, user]);

  function handleGoogleLogin() {
    setGoogleLoading(true);
    window.location.assign(`${API_URL}/auth/google/start?next=${encodeURIComponent(nextPath)}`);
  }

  async function handleResend(orderId: string) {
    try {
      setResendState((current) => ({ ...current, [orderId]: "sending" }));
      await resendOrderEmail(orderId);
      setResendState((current) => ({ ...current, [orderId]: "sent" }));
      window.setTimeout(() => {
        setResendState((current) => ({ ...current, [orderId]: "idle" }));
      }, 2000);
    } catch (err) {
      setOrdersError(err instanceof Error ? err.message : "Could not resend order email");
      setResendState((current) => ({ ...current, [orderId]: "idle" }));
    }
  }

  async function handleAdminResend(orderId: string) {
    try {
      setResendState((current) => ({ ...current, [`admin-${orderId}`]: "sending" }));
      await resendAdminOrderEmail(orderId);
      setResendState((current) => ({ ...current, [`admin-${orderId}`]: "sent" }));
      window.setTimeout(() => {
        setResendState((current) => ({ ...current, [`admin-${orderId}`]: "idle" }));
      }, 2000);
    } catch (err) {
      setAdminError(err instanceof Error ? err.message : "Could not resend admin order email");
      setResendState((current) => ({ ...current, [`admin-${orderId}`]: "idle" }));
    }
  }

  if (token && (verifyState === "loading" || verifyState === "success")) {
    return (
      <main className="px-4 py-4 sm:px-6 sm:py-6">
        <section className="mx-auto max-w-3xl rounded-[2rem] border border-black/6 bg-white/80 px-6 py-12 shadow-[0_24px_80px_rgba(15,23,42,0.08)] sm:px-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-black/8 bg-white/90 px-3 py-1 text-xs font-medium uppercase tracking-[0.22em] text-neutral-500">
            <span className="inline-block h-2 w-2 rounded-full bg-neutral-900" />
            {t("login.accountSync")}
          </div>
          <h1 className="mt-6 text-4xl font-semibold tracking-[-0.04em] text-neutral-950 sm:text-5xl">
            {verifyState === "loading" ? t("login.signingYouIn") : t("login.loginComplete")}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-neutral-600">
            {verifyState === "loading"
              ? t("login.verifyingLink")
              : t("login.syncComplete")}
          </p>
        </section>
      </main>
    );
  }

  if (googleSuccess && (status === "loading" || status === "authenticated")) {
    return (
      <main className="px-4 py-4 sm:px-6 sm:py-6">
        <section className="mx-auto max-w-3xl rounded-[2rem] border border-black/6 bg-white/80 px-6 py-12 shadow-[0_24px_80px_rgba(15,23,42,0.08)] sm:px-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-black/8 bg-white/90 px-3 py-1 text-xs font-medium uppercase tracking-[0.22em] text-neutral-500">
            <span className="inline-block h-2 w-2 rounded-full bg-neutral-900" />
            {t("login.accountSync")}
          </div>
          <h1 className="mt-6 text-4xl font-semibold tracking-[-0.04em] text-neutral-950 sm:text-5xl">
            {status === "loading" ? t("login.finishingGoogle") : t("login.googleComplete")}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-neutral-600">
            {status === "loading"
              ? t("login.connectingGoogle")
              : `Your favorites, palette, downloads, and purchase history are ready. Redirecting to ${destinationLabel} now.`}
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="px-4 py-4 sm:px-6 sm:py-6">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <section className="rounded-[2rem] border border-black/6 bg-white/80 px-6 py-10 shadow-[0_24px_80px_rgba(15,23,42,0.08)] sm:px-10 sm:py-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-black/8 bg-white/90 px-3 py-1 text-xs font-medium uppercase tracking-[0.22em] text-neutral-500">
            <span className="inline-block h-2 w-2 rounded-full bg-neutral-900" />
            {t("login.accountSync")}
          </div>

          <h1 className="mt-6 max-w-3xl text-4xl font-semibold tracking-[-0.04em] text-neutral-950 sm:text-6xl">
            {t("login.heading")}
          </h1>

          <p className="mt-4 max-w-2xl text-base leading-7 text-neutral-600 sm:text-lg">
            ColorArchive now supports account sync. Use a magic link today, or Google sign-in, to
            keep favorites, palettes, downloads, and purchase history tied to one account.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              t("login.noPassword"),
              t("login.favSync"),
              t("login.downloadsSync"),
            ].map((item) => (
              <div
                key={item}
                className="rounded-[1.4rem] border border-black/6 bg-neutral-50/90 px-4 py-4 text-sm font-medium text-neutral-700"
              >
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
          <div className="space-y-6">
            <div className="rounded-[1.75rem] border border-black/6 bg-white/82 px-6 py-8 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
              {user ? (
                <>
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
                    {t("login.signedIn")}
                  </div>
                  <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-neutral-950">
                    {user.email}
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-neutral-600">
                    Your local favorites and palette are now tied to this account. Purchased packs
                    appear below with direct downloads, receipt links, and resend actions.
                  </p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <Link
                      href="/favorites/"
                      className="rounded-full border border-black/8 bg-neutral-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800"
                    >
                      {t("login.openFavorites")}
                    </Link>
                    <Link
                      href="/palette/"
                      className="rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
                    >
                      {t("login.openPalette")}
                    </Link>
                    <Link
                      href="/packs/"
                      className="rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
                    >
                      {t("login.browsePacks")}
                    </Link>
                    {analyticsAccess ? (
                      <>
                        <Link
                          href="/analytics"
                          className="rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
                        >
                          {t("login.openAnalytics")}
                        </Link>
                        <Link
                          href="/admin/orders"
                          className="rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
                        >
                          {t("login.adminOrders")}
                        </Link>
                      </>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => void handleLogout()}
                      className="rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
                    >
                      {t("login.logOut")}
                    </button>
                  </div>
                  <p className="mt-5 text-xs uppercase tracking-[0.16em] text-neutral-400">
                    {t("login.lastSync")} {formatSyncTime(lastSyncAt)}
                  </p>
                </>
              ) : formState === "success" ? (
                <>
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600">
                    {t("login.emailSent")}
                  </div>
                  <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-neutral-950">
                    {t("login.checkInbox")}
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-neutral-600">
                    We sent a one-time sign-in link. It stays valid for 30 minutes and signs you in
                    on the device where you open it.
                  </p>
                  <button
                    type="button"
                    onClick={() => setFormState("idle")}
                    className="mt-6 rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
                  >
                    {t("login.sendAnother")}
                  </button>
                </>
              ) : (
                <>
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
                    {t("login.signIn")}
                  </div>
                  <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-neutral-950">
                    {t("login.requestLink")}
                  </h2>
                  <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="you@example.com"
                      className="h-12 rounded-full border border-black/10 bg-white px-4 text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/20"
                    />
                    <button
                      type="submit"
                      disabled={formState === "loading"}
                      className="rounded-full border border-black/8 bg-neutral-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:opacity-50"
                    >
                      {formState === "loading" ? t("login.sendingLink") : t("login.emailMeLink")}
                    </button>
                  </form>
                  {googleEnabled ? (
                    <>
                      <div className="my-4 flex items-center gap-3">
                        <div className="h-px flex-1 bg-black/8" />
                        <div className="text-[10px] uppercase tracking-[0.18em] text-neutral-400">
                          {t("login.or")}
                        </div>
                        <div className="h-px flex-1 bg-black/8" />
                      </div>
                      <button
                        type="button"
                        onClick={handleGoogleLogin}
                        disabled={googleLoading}
                        className="flex w-full items-center justify-center gap-2 rounded-full border border-black/8 bg-white px-4 py-3 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50 disabled:opacity-60"
                      >
                        {googleLoading ? (
                          <svg className="animate-spin h-4 w-4 text-neutral-400" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                          </svg>
                        ) : null}
                        {googleLoading ? t("login.redirectingGoogle") : t("login.continueGoogle")}
                      </button>
                    </>
                  ) : (
                    <div className="mt-4 rounded-2xl border border-black/6 bg-neutral-50 px-4 py-3 text-sm leading-6 text-neutral-600">
                      Google sign-in is not enabled right now. Magic link login still works and
                      keeps your favorites, palette, and purchase history tied to one account.
                    </div>
                  )}
                  <p className="mt-4 text-sm leading-6 text-neutral-600">
                    No password. One link. Favorites, palette builder, downloads, and order history
                    sync after you sign in.
                  </p>
                </>
              )}

              {error ? (
                <div className="mt-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3">
                  <p className="text-sm text-red-700">{error}</p>
                  {loginError?.startsWith("google-") ? (
                    <button
                      type="button"
                      onClick={() => { setError(""); handleGoogleLogin(); }}
                      className="mt-2 text-xs font-medium text-red-600 underline hover:text-red-800"
                    >
                      {t("login.tryGoogleAgain")}
                    </button>
                  ) : null}
                </div>
              ) : null}
            </div>

            {user ? (
              <div className="rounded-[1.75rem] border border-black/6 bg-white/82 px-6 py-8 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
                      {t("login.ordersDownloads")}
                    </div>
                    <h3 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-neutral-950">
                      {t("login.yourPackHistory")}
                    </h3>
                  </div>
                  <div className="rounded-full border border-black/8 bg-neutral-50 px-3 py-1 text-xs font-medium uppercase tracking-[0.14em] text-neutral-500">
                    {orders.length} {t("login.orders")}
                  </div>
                </div>

                {ordersState === "loading" || ordersState === "idle" ? (
                  <p className="mt-5 text-sm text-neutral-500">{t("login.loadingOrders")}</p>
                ) : null}

                {ordersState === "error" ? (
                  <p className="mt-5 text-sm text-red-600">{ordersError}</p>
                ) : null}

                {ordersState === "success" && orders.length === 0 ? (
                  <p className="mt-5 text-sm leading-6 text-neutral-600">
                    No purchases are tied to this email yet. Once you buy a pack with the same
                    address, it will appear here with direct download links.
                  </p>
                ) : null}

                {orders.length > 0 ? (
                  <div className="mt-5 grid gap-3">
                    {orders.map((order) => (
                      <article
                        key={`${order.orderId}-${order.created_at}`}
                        className="rounded-[1.2rem] border border-black/6 bg-neutral-50 px-4 py-4"
                      >
                        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                          <div>
                            <div className="text-lg font-semibold tracking-[-0.02em] text-neutral-950">
                              {order.product}
                            </div>
                            <div className="mt-2 text-sm leading-6 text-neutral-600">
                              {formatOrderCurrency(order.amount, order.currency)}
                              {" · "}
                              {new Intl.DateTimeFormat("en-US", {
                                dateStyle: "medium",
                                timeStyle: "short",
                              }).format(new Date(order.created_at))}
                            </div>
                            <div className="mt-1 text-xs uppercase tracking-[0.14em] text-neutral-400">
                              Order {order.orderId}
                            </div>
                            {order.attribution.source || order.attribution.utmCampaign ? (
                              <div className="mt-2 text-xs text-neutral-500">
                                Attributed to {order.attribution.source ?? "unknown source"}
                                {order.attribution.utmCampaign
                                  ? ` · ${order.attribution.utmCampaign}`
                                  : ""}
                              </div>
                            ) : null}
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {order.downloadUrl ? (
                              <a
                                href={order.downloadUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="rounded-full border border-black/8 bg-neutral-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800"
                              >
                                {t("login.downloadZip")}
                              </a>
                            ) : null}
                            <button
                              type="button"
                              onClick={() => void handleResend(order.orderId)}
                              disabled={resendState[order.orderId] === "sending"}
                              className="rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50 disabled:opacity-50"
                            >
                              {resendState[order.orderId] === "sending"
                                ? t("login.sending")
                                : resendState[order.orderId] === "sent"
                                  ? t("login.sent")
                                  : t("login.resendEmail")}
                            </button>
                            {order.packUrl ? (
                              <a
                                href={order.packUrl}
                                className="rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
                              >
                                {t("login.packPage")}
                              </a>
                            ) : null}
                            {order.receiptUrl ? (
                              <a
                                href={order.receiptUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
                              >
                                {t("login.receipt")}
                              </a>
                            ) : null}
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>

          <aside className="space-y-6">
            <div className="rounded-[1.75rem] border border-black/6 bg-white/78 px-6 py-8 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
                {t("login.whatSyncs")}
              </div>
              <div className="mt-5 space-y-4 text-sm leading-6 text-neutral-600">
                <p>
                  <code className="rounded bg-neutral-100 px-1.5 py-0.5 text-xs text-neutral-700">
                    Favorites
                  </code>{" "}
                  are stored under your account so the same saved shelf follows you on a new browser
                  or laptop.
                </p>
                <p>
                  <code className="rounded bg-neutral-100 px-1.5 py-0.5 text-xs text-neutral-700">
                    Palette builder
                  </code>{" "}
                  choices are merged with whatever you already had locally, then synced back to the
                  account.
                </p>
                <p>
                  Purchased packs now appear on this page with direct download, receipt, and resend
                  email actions.
                </p>
              </div>
                <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/favorites/"
                  className="rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
                >
                  {t("login.favorites")}
                </Link>
                <Link
                  href="/palette/"
                  className="rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
                >
                  {t("login.paletteBuilder")}
                </Link>
                <Link
                  href="/packs/"
                  className="rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
                >
                  {t("login.packs")}
                </Link>
                {analyticsAccess ? (
                  <>
                    <Link
                      href="/analytics"
                      className="rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
                    >
                      {t("login.analytics")}
                    </Link>
                    <Link
                      href="/admin/orders"
                      className="rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
                    >
                      {t("login.adminOrders")}
                    </Link>
                  </>
                ) : null}
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-black/6 bg-white/78 px-6 py-8 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
                {t("login.licenseSupport")}
              </div>
              <div className="mt-5 grid gap-3">
                {licenseTiers.map((tier) => (
                  <div
                    key={tier.id}
                    className="rounded-[1rem] border border-black/6 bg-neutral-50 px-4 py-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold text-neutral-950">{tier.label}</div>
                        <div className="mt-1 text-xs uppercase tracking-[0.14em] text-neutral-400">
                          {tier.priceNote}
                        </div>
                      </div>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-neutral-600">{tier.summary}</p>
                    <div className="mt-3 text-sm leading-6 text-neutral-600">
                      {tier.rights[0]}.
                    </div>
                  </div>
                ))}
                <div className="rounded-[1rem] border border-black/6 bg-neutral-50 px-4 py-4 text-sm leading-6 text-neutral-600">
                  Purchase support usually replies within {supportPolicy.purchaseResponseWindow.toLowerCase()}.
                  Coverage includes {supportPolicy.resendCoverage.toLowerCase()}.
                </div>
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href="mailto:hello@colorarchive.me?subject=ColorArchive%20purchase%20support"
                  className="rounded-full border border-black/8 bg-neutral-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800"
                >
                  {t("login.purchaseSupport")}
                </a>
                <Link
                  href="/support/"
                  className="rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
                >
                  {t("login.supportPage")}
                </Link>
              </div>
            </div>

            {analyticsAccess ? (
              <div className="rounded-[1.75rem] border border-black/6 bg-white/78 px-6 py-8 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
                      {t("login.adminQueue")}
                    </div>
                    <h3 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-neutral-950">
                      {t("login.recentOrderActions")}
                    </h3>
                  </div>
                  <Link
                    href="/admin/orders"
                    className="rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
                  >
                    {t("login.openFullQueue")}
                  </Link>
                </div>

                {adminState === "loading" || adminState === "idle" ? (
                  <p className="mt-5 text-sm text-neutral-500">{t("login.loadingAdmin")}</p>
                ) : null}

                {adminState === "error" ? (
                  <p className="mt-5 text-sm text-red-600">{adminError}</p>
                ) : null}

                {adminState === "success" ? (
                  <div className="mt-5 grid gap-3">
                    {adminOrders.slice(0, 3).map((order) => (
                      <article
                        key={`admin-${order.orderId}`}
                        className="rounded-[1rem] border border-black/6 bg-neutral-50 px-4 py-4"
                      >
                        <div className="text-sm font-semibold text-neutral-950">{order.product}</div>
                        <div className="mt-2 text-sm text-neutral-500">
                          {order.email} · {order.orderId}
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => void handleAdminResend(order.orderId)}
                            disabled={resendState[`admin-${order.orderId}`] === "sending"}
                            className="rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50 disabled:opacity-50"
                          >
                            {resendState[`admin-${order.orderId}`] === "sending"
                              ? t("login.sending")
                              : resendState[`admin-${order.orderId}`] === "sent"
                                ? t("login.sent")
                                : t("login.resendEmail")}
                          </button>
                          <a
                            href={`mailto:${order.email}?subject=${encodeURIComponent(`ColorArchive support · ${order.product}`)}`}
                            className="rounded-full border border-black/8 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
                          >
                            {t("login.emailBuyer")}
                          </a>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : null}
          </aside>
        </section>
      </div>
    </main>
  );
}
