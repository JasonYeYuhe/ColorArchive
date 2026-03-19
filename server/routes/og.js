const express = require("express");
const router = express.Router();

/**
 * GET /og/color/:hex
 * Returns an SVG OG image for a color (1200x630).
 * Twitter/Facebook/LinkedIn will render this as the share preview.
 */
router.get("/color/:hex", (req, res) => {
  const hex = `#${req.params.hex.replace(/^#/, "")}`;
  const name = req.query.name || hex;

  // Calculate relative luminance to pick text color
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  const textColor = luminance > 0.5 ? "#1a1a1a" : "#ffffff";
  const subtextColor = luminance > 0.5 ? "#555555" : "#cccccc";

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="${hex}"/>
  <text x="80" y="280" font-family="system-ui, -apple-system, sans-serif" font-size="72" font-weight="600" fill="${textColor}">${escapeXml(String(name))}</text>
  <text x="80" y="350" font-family="ui-monospace, monospace" font-size="42" fill="${subtextColor}">${escapeXml(hex.toUpperCase())}</text>
  <text x="80" y="560" font-family="system-ui, -apple-system, sans-serif" font-size="24" fill="${subtextColor}" opacity="0.7">ColorArchive</text>
</svg>`;

  res.setHeader("Content-Type", "image/svg+xml");
  res.setHeader("Cache-Control", "public, max-age=86400, s-maxage=604800");
  res.send(svg);
});

function escapeXml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

module.exports = router;
