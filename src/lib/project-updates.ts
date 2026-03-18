export interface ProjectUpdateEntry {
  date: string;
  id: string;
  summary: string;
  title: string;
  bullets: string[];
  phase: string;
  status: "shipped" | "planned";
}

export const projectUpdates: ProjectUpdateEntry[] = [
  {
    id: "2026-03-18-trust-layer",
    date: "2026-03-18",
    phase: "v0.3 — Product surface",
    status: "shipped",
    title: "Added trust and product-proof layers",
    summary:
      "Collection detail pages, free sample pack, and clearer upgrade paths are now part of the static product surface.",
    bullets: [
      "Added editorial collection detail pages.",
      "Added a free sample pack landing page based on real preview assets.",
      "Strengthened support and monetization routes with clearer free-to-paid framing.",
    ],
  },
  {
    id: "2026-03-18-local-archive",
    date: "2026-03-18",
    phase: "v0.2 — Workflow layer",
    status: "shipped",
    title: "Strengthened local archive workflows",
    summary:
      "Recent browsing, favorites export, and empty-state recovery now make the archive easier to resume and reuse without accounts.",
    bullets: [
      "Added Recent trail and Favorites hub on the homepage.",
      "Added JSON export for Recent and Favorites.",
      "Added stronger recovery actions for empty search and filter states.",
    ],
  },
  {
    id: "2026-03-18-search-spectrum",
    date: "2026-03-18",
    phase: "v0.1 — Archive foundation",
    status: "shipped",
    title: "Expanded exploration routes",
    summary:
      "The archive now supports dedicated search, full-spectrum browsing, random discovery, and word-to-color generation.",
    bullets: [
      "Added dedicated search with shareable URL state.",
      "Added All Colors, Spectrum, and Surprise routes.",
      "Added Word → Color as a local-only generator.",
    ],
  },
  {
    id: "roadmap-checkout",
    date: "Q2 2026",
    phase: "v0.4 — Commerce",
    status: "planned",
    title: "Live checkout integration",
    summary:
      "Wire Lemon Squeezy or Stripe checkout URLs to the existing pack detail pages. No backend required — off-site checkout keeps the static hosting model intact.",
    bullets: [
      "Activate checkout URLs in checkout-config.ts for all three packs.",
      "Add post-purchase redirect confirmation page.",
      "Wire download delivery via checkout provider fulfillment rules.",
    ],
  },
  {
    id: "roadmap-token-export",
    date: "Q2 2026",
    phase: "v0.4 — Commerce",
    status: "planned",
    title: "Generated file bundles",
    summary:
      "Auto-generate the actual deliverable files (CSS, JSON, Tailwind tokens) at build time so the purchase bundle is always in sync with the live archive.",
    bullets: [
      "Build-time CSS token export from all five collections.",
      "JSON export with HSL, RGB, and hex for every palette.",
      "Tailwind 4 CSS variable config snippets.",
    ],
  },
  {
    id: "roadmap-drop-v2",
    date: "Q3 2026",
    phase: "v0.5 — Expansion",
    status: "planned",
    title: "Palette Pack Vol. 2 + seasonal drop",
    summary:
      "A second pack drop built from expanded archive collections, with a seasonal editorial angle and higher-resolution visual assets.",
    bullets: [
      "Add 5–8 new curated collections to the archive.",
      "Package into a second paid drop with updated pricing.",
      "Add high-res PNG export boards as a deliverable tier.",
    ],
  },
];
