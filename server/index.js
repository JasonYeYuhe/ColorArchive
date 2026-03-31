require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
app.set("trust proxy", 1);
const PORT = process.env.PORT || 3001;
const allowedOrigins = new Set([
  process.env.FRONTEND_ORIGIN || "https://colorarchive.me",
  ...(process.env.NODE_ENV !== "production"
    ? ["http://localhost:3000", "http://127.0.0.1:3000"]
    : []),
]);

const ALLOWED_ORIGIN_RE = /^https:\/\/[\w-]+\.colorarchive\.me$/;

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin) || ALLOWED_ORIGIN_RE.test(origin)) {
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

// JSON body parser for all routes
app.use(express.json());

app.use("/subscribe", require("./routes/subscribe"));
app.use("/auth", require("./routes/auth"));
app.use("/me", require("./routes/me"));
app.use("/admin", require("./routes/admin"));
app.use("/webhook", require("./routes/webhook"));
app.use("/webhooks", require("./routes/webhook"));
app.use("/analytics", require("./routes/analytics"));
app.use("/pageviews", require("./routes/pageviews"));
app.use("/instagram", require("./routes/instagram"));
app.use("/ai", require("./routes/ai"));
app.use("/projects", require("./routes/projects"));
app.use("/events", require("./routes/events"));

app.get("/health", (_, res) => res.json({ ok: true, uptime: process.uptime() }));

// Global error handlers
process.on("unhandledRejection", (reason) => {
  console.error("[FATAL] Unhandled rejection:", reason);
});

process.on("uncaughtException", (err) => {
  console.error("[FATAL] Uncaught exception:", err);
  // Let PM2 restart the process
  process.exit(1);
});

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
});
