const express = require("express");
const router = express.Router();
const Anthropic = require("@anthropic-ai/sdk");

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

/**
 * POST /ai/brand-palette
 * Body: { industry, style, audience, keywords }
 * Returns: { colors: [{ role, hex, name, rationale }] }
 */
router.post("/brand-palette", async (req, res) => {
  const { industry, style, audience, keywords } = req.body ?? {};

  if (!industry && !style && !keywords) {
    return res.status(400).json({ error: "Please provide at least industry, style, or keywords." });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(503).json({ error: "AI feature not configured on this server." });
  }

  const prompt = `You are a professional brand color consultant with deep expertise in color psychology and design systems.

A client has described their brand:
- Industry: ${industry || "not specified"}
- Style / aesthetic: ${style || "not specified"}
- Target audience: ${audience || "not specified"}
- Keywords / values: ${keywords || "not specified"}

Generate a 6-color brand palette for this client. The palette must include:
1. Primary — the main brand color
2. Secondary — a supporting accent
3. Tertiary — a third accent for variety
4. Neutral Light — a very light neutral (near-white, tinted)
5. Neutral Dark — a dark neutral (near-black, tinted)
6. Highlight — a bright pop color for CTAs or alerts

For each color provide:
- role: one of "Primary", "Secondary", "Tertiary", "Neutral Light", "Neutral Dark", "Highlight"
- hex: a valid 6-digit hex code starting with #
- name: a poetic, evocative name for this color (1-3 words, e.g. "Midnight Cedar", "Pale Drift")
- rationale: one sentence explaining why this color fits the brand

Respond ONLY with a valid JSON object in this exact format:
{
  "palette": [
    { "role": "Primary", "hex": "#1a2e4a", "name": "Deep Navy", "rationale": "..." },
    ...6 colors total...
  ],
  "summary": "One paragraph (2-3 sentences) describing the overall palette mood and how it serves this brand."
}

No markdown, no explanation outside the JSON. Pure JSON only.`;

  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    });

    const text = message.content[0]?.type === "text" ? message.content[0].text : "";

    // Parse the JSON response
    let parsed;
    try {
      parsed = JSON.parse(text.trim());
    } catch {
      // Try to extract JSON from the response if there's any wrapping text
      const match = text.match(/\{[\s\S]*\}/);
      if (match) {
        parsed = JSON.parse(match[0]);
      } else {
        throw new Error("Could not parse AI response as JSON");
      }
    }

    // Validate structure
    if (!parsed.palette || !Array.isArray(parsed.palette) || parsed.palette.length === 0) {
      throw new Error("Invalid palette structure in AI response");
    }

    return res.json({
      palette: parsed.palette,
      summary: parsed.summary ?? "",
    });
  } catch (err) {
    console.error("[ai/brand-palette] Error:", err);
    return res.status(500).json({ error: "Failed to generate palette. Please try again." });
  }
});

module.exports = router;
