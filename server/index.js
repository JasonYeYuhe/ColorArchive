require("dotenv").config();

// IMPORTANT: Sentry must load BEFORE express + route modules so it can patch
// Node's http/https for auto-instrumentation. Idempotent + safe when DSN unset.
const { Sentry, enabled: sentryEnabled } = require("./sentry");

const express = require("express");
const cors = require("cors");

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
app.use("/ai", require("./routes/ai"));
app.use("/projects", require("./routes/projects"));
app.use("/events", require("./routes/events"));
app.use("/apple-notifications", require("./routes/apple-notifications"));
app.use("/trending", require("./routes/trending"));

app.get("/health", (_, res) => res.json({ ok: true, uptime: process.uptime() }));

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

app.listen(PORT, () => {
  console.log(`ColorArchive server running on port ${PORT}`);

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
