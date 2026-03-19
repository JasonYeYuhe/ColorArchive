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
    id: "2026-03-19-commerce-live",
    date: "2026-03-19",
    phase: "v0.4 — Commerce live",
    status: "shipped",
    title: "Commerce layer went fully live",
    summary:
      "All six Lemon Squeezy products are now live in JPY, with checkout URLs wired into the pack catalog and detail pages.",
    bullets: [
      "Activated all 6 Lemon Squeezy checkout URLs across the pack catalog.",
      "Added static success and cancel return routes for off-site checkout flows.",
      "Kept the site GitHub Pages compatible while moving payment off-site.",
    ],
  },
  {
    id: "2026-03-19-email-ops",
    date: "2026-03-19",
    phase: "v0.4 — Commerce live",
    status: "shipped",
    title: "Email delivery and API flows were stabilized",
    summary:
      "The API server, Resend domain verification, and purchase/download email flows are live for both free capture and paid checkout.",
    bullets: [
      "Verified the `colorarchive.me` sending domain in Resend.",
      "Deployed the API server for free-pack capture, checkout webhooks, and analytics.",
      "Separated free-pack delivery from waitlist/update confirmation email flows.",
    ],
  },
  {
    id: "2026-03-19-spectrum-canvas",
    date: "2026-03-19",
    phase: "v0.3 — Product surface",
    status: "shipped",
    title: "All Colors gained an interactive spectrum canvas",
    summary:
      "The dense archive view now includes a full HSL canvas explorer with hover and click interactions for faster broad scanning.",
    bullets: [
      "Added a full-canvas HSL spectrum to `/all-colors`.",
      "Added hover and click hex-copy interactions.",
      "Added saturation controls to inspect the archive in a more visual way.",
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
    id: "roadmap-mobile-polish",
    date: "Q2 2026",
    phase: "v0.5 — UX polish",
    status: "planned",
    title: "Mobile interaction cleanup",
    summary:
      "Tighten small-screen interaction so navigation, floating controls, and dense archive views never obstruct core browsing or buying paths.",
    bullets: [
      "Reduce mobile header weight and horizontal nav pressure.",
      "Audit floating palette-builder and sticky controls for overlap issues.",
      "Tune spacing and safe-area behavior on dense browsing pages.",
    ],
  },
  {
    id: "2026-05-14-performance-conversion",
    date: "2026-05-14",
    phase: "v0.5 — SEO & Conversion",
    status: "shipped",
    title: "Grid pagination, checkout buttons, and conversion CTAs",
    summary:
      "The three main archive grids now paginate instead of mounting all 2016 colors at once. Pack detail pages gained direct checkout buttons, and every major browsing surface has a commerce CTA.",
    bullets: [
      "Paginated home archive, /all-colors, and /search to 120–240 colors per load.",
      "Added Buy buttons (hero + bottom CTA) to all pack detail pages — previously had no purchase links.",
      "Added dark conversion panels to collection detail, search explorer, and spectrum pages.",
      "Removed 13 duplicate binary files from the downloads folder.",
    ],
  },
  {
    id: "2026-05-01-seo-structured-data",
    date: "2026-05-01",
    phase: "v0.5 — Trust & SEO",
    status: "shipped",
    title: "Structured data, semantic HTML, and sitemap coverage",
    summary:
      "Comprehensive SEO pass across all detail pages: JSON-LD structured data, H1/H2 semantic tags, keyword-targeted absolute titles, and complete sitemap coverage including tag routes.",
    bullets: [
      "Added BreadcrumbList JSON-LD to color, collection, family, pack, and notes detail pages.",
      "Added Article JSON-LD to notes detail and Product JSON-LD to pack pages.",
      "Fixed missing H1 on all 2016 color detail pages (was a div).",
      "Added noindex to user-state pages (/favorites, /recent, /palette).",
      "Added all /notes/tags/[tag] and /contrast routes to sitemap.",
      "Fixed trailing slashes on all internal links and sitemap URLs to match trailingSlash config.",
      "Added Newsletter Issues 004 and 005 — editorial color and brand color systems.",
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
