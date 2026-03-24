/**
 * generate-color-stories.mjs
 * Run once: node scripts/generate-color-stories.mjs
 * Requires GOOGLE_AI_API_KEY in environment (or .env.local)
 * Outputs: src/data/color-stories.json
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import { writeFileSync, readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env.local if available
const envPath = join(__dirname, "../.env.local");
if (existsSync(envPath)) {
  const env = readFileSync(envPath, "utf8");
  for (const line of env.split("\n")) {
    const [k, ...v] = line.split("=");
    if (k && v.length) process.env[k.trim()] = v.join("=").trim();
  }
}

const API_KEY = process.env.GOOGLE_AI_API_KEY;
if (!API_KEY) {
  console.error("Missing GOOGLE_AI_API_KEY");
  process.exit(1);
}

const FAMILIES = [
  { slug: "red", name: "Red", hex: "#e63946", hue: "warm reds and crimsons" },
  { slug: "orange", name: "Orange", hex: "#f4a261", hue: "vibrant oranges and ambers" },
  { slug: "yellow", name: "Yellow", hex: "#e9c46a", hue: "golden yellows and saffrons" },
  { slug: "lime", name: "Lime", hex: "#90be6d", hue: "fresh lime greens and chartreuses" },
  { slug: "green", name: "Green", hex: "#2a9d8f", hue: "deep greens and forest tones" },
  { slug: "teal", name: "Teal", hex: "#264653", hue: "teal blues and cyan tones" },
  { slug: "blue", name: "Blue", hex: "#4361ee", hue: "rich blues and cobalts" },
  { slug: "purple", name: "Purple", hex: "#7209b7", hue: "purples and violets" },
  { slug: "pink", name: "Pink", hex: "#f72585", hue: "pinks and magentas" },
];

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

async function generateStory(family) {
  const prompt = `You are a color historian and design writer. Write a rich, engaging article about the color family "${family.name}" (${family.hue}).

The article should have these sections:
1. "origin" — The historical and cultural origins of this color family (2-3 sentences)
2. "psychology" — The psychological effects and emotional associations (2-3 sentences)
3. "design" — How designers and artists use this color family effectively (2-3 sentences)
4. "brands" — 3-4 well-known brands or artworks that famously use this color, and why (2-3 sentences)
5. "palette_tip" — One practical tip for using this color in a palette (1-2 sentences)

Also provide:
- "headline": A compelling 5-8 word headline for this article
- "summary": A 1-sentence description for SEO meta description (max 20 words)

Respond ONLY with valid JSON:
{
  "headline": "...",
  "summary": "...",
  "origin": "...",
  "psychology": "...",
  "design": "...",
  "brands": "...",
  "palette_tip": "..."
}

No markdown, pure JSON.`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    let parsed;
    try {
      parsed = JSON.parse(text.trim());
    } catch {
      const match = text.match(/\{[\s\S]*\}/);
      if (match) parsed = JSON.parse(match[0]);
      else throw new Error("Could not parse");
    }
    console.log(`✓ ${family.name}`);
    return { ...family, ...parsed };
  } catch (err) {
    console.error(`✗ ${family.name}:`, err.message);
    return {
      ...family,
      headline: `The World of ${family.name}`,
      summary: `Explore the history, psychology, and design applications of ${family.name.toLowerCase()} tones.`,
      origin: "",
      psychology: "",
      design: "",
      brands: "",
      palette_tip: "",
    };
  }
}

const outPath = join(__dirname, "../src/data/color-stories.json");

// Load existing to allow resuming
let existing = {};
if (existsSync(outPath)) {
  existing = JSON.parse(readFileSync(outPath, "utf8"));
  console.log(`Resuming — ${Object.keys(existing).length} already generated`);
}

const stories = { ...existing };

for (const family of FAMILIES) {
  if (stories[family.slug]) {
    console.log(`⏭ ${family.name} (already exists)`);
    continue;
  }
  const story = await generateStory(family);
  stories[family.slug] = story;
  // Save after each to allow resuming
  writeFileSync(outPath, JSON.stringify(stories, null, 2));
  // Rate limit
  await new Promise((r) => setTimeout(r, 1500));
}

console.log(`\nDone! Saved to src/data/color-stories.json`);
