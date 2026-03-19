require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN || "https://colorarchive.me",
    methods: ["GET", "POST"],
  })
);

// JSON body parser for all routes except the raw webhook
app.use((req, res, next) => {
  if (req.path === "/webhook/ls") return next();
  express.json()(req, res, next);
});

app.use("/subscribe", require("./routes/subscribe"));
app.use("/webhook", require("./routes/webhook"));

app.get("/health", (_, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`ColorArchive server running on port ${PORT}`);
});
