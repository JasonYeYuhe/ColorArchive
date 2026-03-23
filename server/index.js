require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3001;
const allowedOrigins = new Set([
  process.env.FRONTEND_ORIGIN || "https://colorarchive.me",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
]);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT"],
    credentials: true,
  })
);

// OG image route — no CORS needed (accessed by crawlers)
app.use("/og", require("./routes/og"));

// JSON body parser for all routes except the raw webhook
app.use((req, res, next) => {
  if (req.path === "/webhook/ls") return next();
  express.json()(req, res, next);
});

app.use("/subscribe", require("./routes/subscribe"));
app.use("/auth", require("./routes/auth"));
app.use("/me", require("./routes/me"));
app.use("/admin", require("./routes/admin"));
app.use("/webhook", require("./routes/webhook"));
app.use("/analytics", require("./routes/analytics"));
app.use("/pageviews", require("./routes/pageviews"));
app.use("/instagram", require("./routes/instagram"));

app.get("/health", (_, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`ColorArchive server running on port ${PORT}`);
  require("./email-scheduler").startScheduler();
});
