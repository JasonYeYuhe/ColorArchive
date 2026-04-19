const express = require("express");
const db = require("../db");
const router = express.Router();

// GET /trending — Top 24 colors by pageviews in the last 7 days
// Uses existing pageviews table — extracts color IDs from /colors/{id}/ paths
router.get("/", (req, res) => {
  const days = Math.max(1, Math.min(parseInt(req.query.days) || 7, 30));
  const limit = Math.max(1, Math.min(parseInt(req.query.limit) || 24, 50));
  const since = new Date(Date.now() - days * 86400000).toISOString();

  try {
    // Extract color slug from path like /colors/amber-core-vivid/
    const rows = db.prepare(`
      SELECT 
        REPLACE(REPLACE(path, '/colors/', ''), '/', '') as color_id,
        COUNT(*) as views
      FROM pageviews 
      WHERE created_at >= ?
        AND path LIKE '/colors/%/'
        AND path NOT LIKE '/colors/hex%'
        AND path NOT LIKE '%/vs/%'
      GROUP BY color_id
      ORDER BY views DESC
      LIMIT ?
    `).all(since, limit);

    return res.json({
      trending: rows,
      days,
      generatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("[trending] query error:", err.message);
    return res.status(500).json({ error: "Failed to fetch trending data" });
  }
});

// GET /trending/families — Trending color families by pageviews
router.get("/families", (req, res) => {
  const days = Math.max(1, Math.min(parseInt(req.query.days) || 7, 30));
  const since = new Date(Date.now() - days * 86400000).toISOString();

  try {
    // Count views per path prefix (color root name → first segment of ID)
    const rows = db.prepare(`
      SELECT 
        REPLACE(REPLACE(path, '/colors/', ''), '/', '') as color_id,
        COUNT(*) as views
      FROM pageviews 
      WHERE created_at >= ?
        AND path LIKE '/colors/%/'
        AND path NOT LIKE '/colors/hex%'
        AND path NOT LIKE '%/vs/%'
      GROUP BY color_id
      ORDER BY views DESC
      LIMIT 200
    `).all(since);

    // Group by hue root (first segment of color ID)
    const familyCounts = {};
    for (const row of rows) {
      const parts = row.color_id.split("-");
      // Neutral grays have 2-word roots like "warm-gray"
      const root = parts.length >= 3 && ["warm", "taupe", "true", "sage", "cool"].includes(parts[0])
        ? parts[0] + "-" + parts[1]
        : parts[0];
      familyCounts[root] = (familyCounts[root] || 0) + row.views;
    }

    const sorted = Object.entries(familyCounts)
      .map(([root, views]) => ({ root, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 20);

    return res.json({
      families: sorted,
      days,
      generatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("[trending/families] query error:", err.message);
    return res.status(500).json({ error: "Failed to fetch family trends" });
  }
});

module.exports = router;
