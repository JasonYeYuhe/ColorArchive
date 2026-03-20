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
    id: "2026-03-20-content-ops-alignment",
    date: "2026-03-20",
    phase: "v0.5 — Content & trust",
    status: "shipped",
    title: "Public content and account surfaces were aligned",
    summary:
      "The public-facing content and account layer now reflect the current March launch window, the pending commerce state, and the new login flow more clearly.",
    bullets: [
      "Aligned public note chronology with the current March 2026 release window.",
      "Replaced stale \"already live\" language across waitlist, free-pack, support, and updates surfaces with the current activation-ready commerce state.",
      "Added clearer Google sign-in return feedback plus stronger account and admin return links.",
    ],
  },
  {
    id: "2026-03-19-commerce-prep",
    date: "2026-03-19",
    phase: "v0.4 — Commerce prep",
    status: "shipped",
    title: "Commerce layer was prepared for activation",
    summary:
      "All seven Lemon Squeezy products were configured in JPY, with hosted checkout URLs wired into the pack catalog and detail pages ahead of final store activation.",
    bullets: [
      "Prepared all 7 Lemon Squeezy checkout URLs across the pack catalog.",
      "Added static post-purchase and recovery routes for off-site checkout flows.",
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
    id: "2026-03-19-performance-conversion",
    date: "2026-03-19",
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
    id: "2026-03-19-seo-structured-data",
    date: "2026-03-19",
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
    id: "2026-03-19-guides-and-notes-expansion",
    date: "2026-03-19",
    phase: "v0.5 — Content & trust",
    status: "shipped",
    title: "Guide coverage and note discovery paths expanded",
    summary:
      "ColorArchive added a larger guide library, stronger related-guide matching, fresh notes, and tag routes that connect search-intent traffic to packs and collections.",
    bullets: [
      "Expanded the guides hub to 12 static search-intent landing pages.",
      "Added notes covering brand tokens, SaaS website palettes, and related tag indexes.",
      "Linked guides from the homepage, packs, free-pack, collections, and note detail surfaces.",
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
