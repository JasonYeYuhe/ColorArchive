const express = require("express");
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");

function getClient() {
  return new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
}

/**
 * POST /ai/brand-palette
 * Body: { industry, style, audience, keywords }
 * Returns: { palette: [{ role, hex, name, rationale }], summary }
 */
router.post("/brand-palette", async (req, res) => {
  const { industry, style, audience, keywords } = req.body ?? {};

  if (!industry && !style && !keywords) {
    return res.status(400).json({ error: "Please provide at least industry, style, or keywords." });
  }

  if (!process.env.GOOGLE_AI_API_KEY) {
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
    const model = getClient().getGenerativeModel({ model: "gemini-3-flash" });
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    let parsed;
    try {
      parsed = JSON.parse(text.trim());
    } catch {
      const match = text.match(/\{[\s\S]*\}/);
      if (match) {
        parsed = JSON.parse(match[0]);
      } else {
        throw new Error("Could not parse AI response as JSON");
      }
    }

    if (!parsed.palette || !Array.isArray(parsed.palette) || parsed.palette.length === 0) {
      throw new Error("Invalid palette structure in AI response");
    }

    return res.json({ palette: parsed.palette, summary: parsed.summary ?? "" });
  } catch (err) {
    console.error("[ai/brand-palette] Error:", err);
    return res.status(500).json({ error: "Failed to generate palette. Please try again." });
  }
});

/**
 * POST /ai/name-color
 * Body: { hex, name, hsl, family }
 * Returns: { names: [{ en, zh, description }] }
 */
router.post("/name-color", async (req, res) => {
  const { hex, name, hsl, family } = req.body ?? {};

  if (!hex) {
    return res.status(400).json({ error: "Missing hex value." });
  }

  if (!process.env.GOOGLE_AI_API_KEY) {
    return res.status(503).json({ error: "AI feature not configured on this server." });
  }

  const prompt = `You are a poetic color naming expert with deep knowledge of color psychology, art history, and language.

A designer is looking at this color:
- Hex: ${hex}
- HSL: ${hsl || "unknown"}
- Color family: ${family || "unknown"}
- Current archive name: ${name || "unknown"}

Generate 3 alternative evocative names for this color. Each name should feel poetic, memorable, and distinct from the others. One could be nature-inspired, one could be emotional/mood-based, and one could be cultural or historical.

For each name provide:
- en: the English name (2-4 words max)
- zh: the Chinese name (2-4 characters, poetic, not a direct translation)
- description: one short sentence (max 15 words) evoking what this color feels like

Respond ONLY with valid JSON in this exact format:
{
  "names": [
    { "en": "English Name", "zh": "中文名", "description": "One evocative sentence." },
    { "en": "English Name", "zh": "中文名", "description": "One evocative sentence." },
    { "en": "English Name", "zh": "中文名", "description": "One evocative sentence." }
  ]
}

No markdown, no explanation outside the JSON. Pure JSON only.`;

  try {
    const model = getClient().getGenerativeModel({ model: "gemini-3-flash" });
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    let parsed;
    try {
      parsed = JSON.parse(text.trim());
    } catch {
      const match = text.match(/\{[\s\S]*\}/);
      if (match) parsed = JSON.parse(match[0]);
      else throw new Error("Could not parse AI response as JSON");
    }

    if (!parsed.names || !Array.isArray(parsed.names)) {
      throw new Error("Invalid names structure in AI response");
    }

    return res.json({ names: parsed.names });
  } catch (err) {
    console.error("[ai/name-color] Error:", err);
    return res.status(500).json({ error: "Failed to generate names. Please try again." });
  }
});

/**
 * POST /ai/mood-palette
 * Body: { prompt: string }
 * Returns: { colors: [{ hex, name, description }], palette_name, mood_tag }
 */
router.post("/mood-palette", async (req, res) => {
  const { prompt } = req.body ?? {};

  if (!prompt || typeof prompt !== "string" || prompt.trim().length < 2) {
    return res.status(400).json({ error: "Please provide a mood or scene description." });
  }

  if (!process.env.GOOGLE_AI_API_KEY) {
    return res.status(503).json({ error: "AI feature not configured on this server." });
  }

  const safePrompt = prompt.trim().slice(0, 200);

  const instruction = `You are a creative color director who translates moods, scenes, and emotions into beautiful color palettes.

A user described this mood or scene: "${safePrompt}"

Create a 5-color palette that perfectly captures this feeling. Each color should contribute to the overall atmosphere.

For each color provide:
- hex: a valid 6-digit hex code starting with #
- name: a poetic, evocative name (2-4 words)
- description: one short sentence (max 12 words) describing what this color contributes to the mood

Also provide:
- palette_name: a beautiful 2-5 word name for the whole palette
- mood_tag: one word or short phrase capturing the vibe (e.g. "melancholic", "energetic", "serene")

Respond ONLY with valid JSON in this exact format:
{
  "palette_name": "Late Night Reverie",
  "mood_tag": "contemplative",
  "colors": [
    { "hex": "#1a1a2e", "name": "Midnight Ink", "description": "The deep silence of 3am streets." },
    { "hex": "#16213e", "name": "Ocean Floor", "description": "Cool depth beneath the surface." },
    { "hex": "#0f3460", "name": "Cobalt Dream", "description": "A hint of possibility in the dark." },
    { "hex": "#533483", "name": "Violet Thought", "description": "Where ideas form in the quiet." },
    { "hex": "#e94560", "name": "Dawn Signal", "description": "The single light breaking through." }
  ]
}

No markdown, no explanation outside the JSON. Pure JSON only.`;

  try {
    const model = getClient().getGenerativeModel({ model: "gemini-3-flash" });
    const result = await model.generateContent(instruction);
    const text = result.response.text();

    let parsed;
    try {
      parsed = JSON.parse(text.trim());
    } catch {
      const match = text.match(/\{[\s\S]*\}/);
      if (match) parsed = JSON.parse(match[0]);
      else throw new Error("Could not parse AI response as JSON");
    }

    if (!parsed.colors || !Array.isArray(parsed.colors) || parsed.colors.length === 0) {
      throw new Error("Invalid colors structure in AI response");
    }

    return res.json({
      colors: parsed.colors,
      palette_name: parsed.palette_name ?? "Untitled Palette",
      mood_tag: parsed.mood_tag ?? "evocative",
    });
  } catch (err) {
    console.error("[ai/mood-palette] Error:", err);
    return res.status(500).json({ error: "Failed to generate palette. Please try again." });
  }
});

module.exports = router;
