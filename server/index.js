require("dotenv").config();

// IMPORTANT: Sentry must load BEFORE express + route modules so it can patch
// Node's http/https for auto-instrumentation. Idempotent + safe when DSN unset.
const { Sentry, enabled: sentryEnabled } = require("./sentry");

const express = require("express");
const cors = require("cors");
const { isLoopbackIp } = require("./client-ip");

const app = express();
app.set("trust proxy", 1);
const PORT = process.env.PORT || 3001;
const allowedOrigins = new Set([
  process.env.FRONTEND_ORIGIN || "https://colorarchive.org",
  ...(process.env.NODE_ENV !== "production"
    ? ["http://localhost:3000", "http://127.0.0.1:3000"]
    : []),
]);

// Match subdomains of the configured domain (e.g. preview.colorarchive.org)
const SITE_DOMAIN = (process.env.FRONTEND_ORIGIN || "https://colorarchive.org")
  .replace(/^https?:\/\//, "")
  .replace(/\/$/, "");
const ALLOWED_ORIGIN_RE = new RegExp(
  `^https:\\/\\/[\\w-]+\\.${SITE_DOMAIN.replace(/\./g, "\\.")}$`
);

app.use(
  cors({
    origin(origin, callback) {
      // The Figma plugin UI is a data: URL iframe, which sends the literal
      // string "null" as its Origin. Auth on these endpoints is bearer-token,
      // not cookie, so reflecting the null origin is safe.
      if (!origin || origin === "null" || allowedOrigins.has(origin) || ALLOWED_ORIGIN_RE.test(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// OG image route — no CORS needed (accessed by crawlers)
app.use("/og", require("./routes/og"));

// Generated images (Instagram posts/stories) — public static files
const path = require("path");
app.use("/generated", express.static(path.join(__dirname, "generated"), {
  maxAge: "7d",
  immutable: true,
}));

// JSON body parser for all routes. Cap the body so a hostile client can't
// exhaust memory with a giant payload (the webhook raw-log forwards full LS
// event bodies, which are well under this); oversized bodies get a 413.
app.use(express.json({ limit: "100kb" }));

// --- Proxy-header self-check -------------------------------------------------
//
// Between 2026-04-02 and 2026-07-26, nginx set X-Real-IP but never
// X-Forwarded-For. With `trust proxy = 1` above, that made `req.ip` resolve to
// the loopback address for EVERY caller, so every per-IP rate limit in this API
// silently became one bucket shared by the whole internet — so any one noisy
// caller could throttle everybody — and /auth/verify degraded into a one-actor,
// site-wide login denial-of-service. It went unnoticed for four months because
// nothing ever checked. (An earlier version of this comment said "1,025 real
// analytics writes 429'd in a fortnight". That was retracted: 1,024 of those were
// a single flooding address on a single day, correctly throttled. See client-ip.js.)
//
// This is the check. It samples the first request after boot and reports through
// /health, so a regression surfaces in seconds instead of months. Must be
// mounted BEFORE the routes below — as trailing middleware it would only run for
// requests no route handled, which is almost none of them.
//
// It deliberately does NOT throw, exit or refuse traffic. The Lemon Squeezy
// subscription webhooks are served by this same process, and declining to take
// someone's money because a proxy header is misconfigured would turn a
// measurement bug into a revenue bug.
// Re-checked periodically, not latched at boot. A one-shot sample cannot see an
// nginx change that does not also restart Node — which is exactly how the original
// regression would recur, since `systemctl reload nginx` leaves this process
// running.
//
// The discriminator is the PRESENCE of an X-Forwarded-For header, not the socket
// address. An earlier attempt skipped callers whose socket was loopback, reasoning
// that a local `curl 127.0.0.1:3001/health` should not poison the state — but nginx
// proxies over loopback too, so that condition skipped EVERY request and left the
// sentinel permanently "unchecked". A sentinel that never fires is worse than the
// latched one it replaced. A direct local caller sends no XFF and is ignored; a
// proxied request always carries one, and then `req.ip` is the thing worth judging.
const PROXY_CHECK_INTERVAL_MS = 10 * 60 * 1000;
let proxyHeaderState = { checked: false, ok: null, at: 0 };
app.use((req, _res, next) => {
  const due = !proxyHeaderState.checked || Date.now() - proxyHeaderState.at > PROXY_CHECK_INTERVAL_MS;
  const proxied = Boolean(req.headers["x-forwarded-for"]);
  if (due && proxied) {
    const loopback = isLoopbackIp(req.ip);
    const wasOk = proxyHeaderState.ok;
    proxyHeaderState = { checked: true, ok: !loopback, at: Date.now() };
    // Only shout on the transition, so a persistent misconfiguration does not
    // bury the logs at one line per ten minutes forever.
    if (loopback && wasOk !== false) {
      console.error(
        "[proxy-headers] req.ip resolved to %s — nginx is probably missing " +
          "`proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;`. " +
          "EVERY per-IP rate limit is currently ONE GLOBAL BUCKET. " +
          "Fix: server/deploy/nginx-colorarchive.conf",
        req.ip
      );
    } else if (!loopback && wasOk === false) {
      console.log("[proxy-headers] recovered — req.ip resolves to a real client address again");
    } else if (!loopback && wasOk === null) {
      console.log("[proxy-headers] ok — req.ip resolves to a real client address");
    }
  }
  next();
});

app.use("/subscribe", require("./routes/subscribe"));
app.use("/unsubscribe", require("./routes/unsubscribe"));
app.use("/auth", require("./routes/auth"));
app.use("/me", require("./routes/me"));
app.use("/admin", require("./routes/admin"));
app.use("/webhook", require("./routes/webhook"));
app.use("/webhooks", require("./routes/webhook"));
app.use("/analytics", require("./routes/analytics"));
app.use("/pageviews", require("./routes/pageviews"));
app.use("/instagram", require("./routes/instagram"));
app.use("/pinterest", require("./routes/pinterest"));
// Boot the Pinterest admin helper so the org token is loaded/refreshed
// before the autopilot (Phase 2b) tries to publish.
require("./pinterest-admin").init();
// AI is mounted defensively, unlike everything else in this list.
//
// This one process also carries the Lemon Squeezy subscription webhooks, the
// Apple notification endpoint, auth and analytics. A `require` that throws at
// module scope — a syntax error, a missing dependency, a bad env read in the new
// budget module — would abort startup for ALL of it, so a mistake in the
// least valuable feature on the box (5 real requests per fortnight) could stop
// us from taking someone's money. That trade is never worth making, so AI
// degrades to an honest 503 instead of taking the payment path with it.
try {
  app.use("/ai", require("./routes/ai"));
} catch (err) {
  console.error("[FATAL-ish] AI routes failed to load — serving 503 for /ai:", err);
  if (sentryEnabled) Sentry.captureException(err);
  app.use("/ai", (_req, res) =>
    res.status(503).json({ error: "AI features are temporarily unavailable." })
  );
}
app.use("/projects", require("./routes/projects"));
app.use("/events", require("./routes/events"));
app.use("/apple-notifications", require("./routes/apple-notifications"));
app.use("/trending", require("./routes/trending"));

app.get("/health", (_, res) =>
  res.json({
    ok: true,
    uptime: process.uptime(),
    // "degraded" rather than a failing status code: monitors should see this,
    // but nothing upstream should start failing over because of it.
    proxyHeaders: proxyHeaderState.checked
      ? proxyHeaderState.ok
        ? "ok"
        : "degraded: req.ip is loopback (X-Forwarded-For missing)"
      : "unchecked",
    // A wrong model id has silently broken AI twice now (see routes/ai.js).
    // Required lazily so a failure to load the AI stack can't break /health —
    // that would defeat the isolation the guarded mount above provides.
    aiModel: (() => {
      try {
        return require("./ai-budget").modelHealth();
      } catch {
        return "unknown";
      }
    })(),
  })
);

// Global error handlers
process.on("unhandledRejection", (reason) => {
  console.error("[FATAL] Unhandled rejection:", reason);
  if (sentryEnabled) {
    Sentry.captureException(reason);
  }
});

process.on("uncaughtException", (err) => {
  console.error("[FATAL] Uncaught exception:", err);
  if (sentryEnabled) {
    Sentry.captureException(err);
    // Best-effort flush before exit — PM2 will restart us.
    Sentry.close(2000).finally(() => process.exit(1));
  } else {
    process.exit(1);
  }
});

// Sentry error handler must be the LAST middleware before any custom error
// handler. Captures any error that bubbles out of a route.
if (sentryEnabled) {
  Sentry.setupExpressErrorHandler(app);
}

// Bind to loopback only.
//
// This listened on 0.0.0.0 with ufw inactive, so http://<public-ip>:3001/health
// answered 200 straight off the internet — nginx was bypassable. That alone
// defeats every rate limit in this process: `trust proxy = 1` means Express
// trusts one hop of X-Forwarded-For, and a caller reaching Node directly IS that
// hop, so it can mint a fresh bucket per request by rotating a header it fully
// controls. Adding X-Forwarded-For at the nginx layer would have handed that
// bypass real teeth.
//
// nginx already proxies to http://localhost:3001, and nothing else references
// the port externally (checked: only DEPLOY.md's proxy_pass, an SSRF test
// fixture, and scripts/verify-preorder.cjs, all localhost), so restricting the
// bind surface costs nothing. Overridable for container setups that need it.
const BIND_HOST = process.env.BIND_HOST || "127.0.0.1";

app.listen(PORT, BIND_HOST, () => {
  console.log(`ColorArchive server running on ${BIND_HOST}:${PORT}`);

  try {
    require("./email-scheduler").startScheduler();
  } catch (err) {
    console.error("[WARN] Email scheduler failed to start:", err);
  }

  try {
    require("./ig-scheduler").startScheduler();
  } catch (err) {
    console.error("[WARN] Instagram scheduler failed to start:", err);
  }

  try {
    require("./pin-scheduler").startScheduler();
  } catch (err) {
    console.error("[WARN] Pinterest scheduler failed to start:", err);
  }

  try {
    require("./cache-warmer").startScheduler();
  } catch (err) {
    console.error("[WARN] Cache warmer failed to start:", err);
  }
});
