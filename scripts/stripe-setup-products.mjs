/**
 * One-time script to create all ColorArchive products and prices in Stripe.
 * Run: node scripts/stripe-setup-products.mjs
 *
 * Requires STRIPE_SECRET_KEY in .env.local
 */

import Stripe from "stripe";
import { readFileSync } from "fs";

// Load env from .env.local
const envContent = readFileSync(".env.local", "utf-8");
const envVars = Object.fromEntries(
  envContent
    .split("\n")
    .filter((l) => l && !l.startsWith("#"))
    .map((l) => l.split("=").map((s) => s.trim()))
    .filter(([k, v]) => k && v)
);

const stripe = new Stripe(envVars.STRIPE_SECRET_KEY);

const ONE_TIME_PRODUCTS = [
  {
    name: "Palette Pack Vol. 1",
    metadata_id: "palette-pack-vol-1",
    price: 599,
    description:
      "4 curated five-color palette boards with CSS, Tailwind, SwiftUI, Android XML, Flutter, CSS-in-JS tokens + gradient wallpapers.",
  },
  {
    name: "Brand Color Starter Kit",
    metadata_id: "brand-starter-kit",
    price: 1499,
    description:
      "Primary, secondary, accent palette groups with light/dark pairings, brand guides, and color psychology notes.",
  },
  {
    name: "Creator Bundle",
    metadata_id: "content-creator-bundle",
    price: 999,
    description:
      "SVG palette boards, gradient wallpapers, AI prompt templates, color psychology notes, and brand usage guides.",
  },
  {
    name: "Complete Archive Token Set",
    metadata_id: "complete-archive",
    price: 2499,
    description:
      "All 3,000+ colors in CSS, Tailwind, Figma, Style Dictionary, SCSS, SwiftUI, Android XML, Flutter, CSS-in-JS + WCAG contrast reports.",
  },
  {
    name: "Dark Mode UI Kit",
    metadata_id: "dark-mode-ui-kit",
    price: 999,
    description:
      "Paired light/dark CSS variables, Tailwind dark mode tokens, JSON paired data, WCAG contrast matrix.",
  },
  {
    name: "Seasonal: Spring 2026",
    metadata_id: "seasonal-spring-2026",
    price: 299,
    description:
      "Spring-curated palette sets with CSS variables, Tailwind tokens, JSON data, and mood board notes.",
  },
  {
    name: "All Access Bundle",
    metadata_id: "all-access-bundle",
    price: 3999,
    description:
      "Everything from all 6 individual packs — all 3,000+ colors in all formats. Save ~40%.",
  },
];

const SUBSCRIPTION_PRODUCTS = [
  {
    name: "ColorArchive Pro",
    metadata_id: "pro-subscription",
    description:
      "Pro subscription — unlimited projects, API access, priority support.",
    prices: [
      { amount: 499, interval: "month", metadata_id: "pro-monthly" },
      { amount: 3999, interval: "year", metadata_id: "pro-yearly" },
    ],
  },
];

async function main() {
  console.log("Creating Stripe products and prices...\n");

  const results = {};

  // One-time products
  for (const product of ONE_TIME_PRODUCTS) {
    const stripeProduct = await stripe.products.create({
      name: product.name,
      description: product.description,
      metadata: { colorarchive_id: product.metadata_id },
    });

    const stripePrice = await stripe.prices.create({
      product: stripeProduct.id,
      unit_amount: product.price,
      currency: "jpy",
      metadata: { colorarchive_id: product.metadata_id },
    });

    results[product.metadata_id] = {
      productId: stripeProduct.id,
      priceId: stripePrice.id,
    };

    console.log(
      `✓ ${product.name}: product=${stripeProduct.id} price=${stripePrice.id}`
    );
  }

  // Subscription products
  for (const product of SUBSCRIPTION_PRODUCTS) {
    const stripeProduct = await stripe.products.create({
      name: product.name,
      description: product.description,
      metadata: { colorarchive_id: product.metadata_id },
    });

    for (const price of product.prices) {
      const stripePrice = await stripe.prices.create({
        product: stripeProduct.id,
        unit_amount: price.amount,
        currency: "jpy",
        recurring: { interval: price.interval },
        metadata: { colorarchive_id: price.metadata_id },
      });

      results[price.metadata_id] = {
        productId: stripeProduct.id,
        priceId: stripePrice.id,
      };

      console.log(
        `✓ ${product.name} (${price.interval}): product=${stripeProduct.id} price=${stripePrice.id}`
      );
    }
  }

  console.log("\n--- Copy these price IDs into checkout-config.ts ---\n");
  console.log(JSON.stringify(results, null, 2));
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
