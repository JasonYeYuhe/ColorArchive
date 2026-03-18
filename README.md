# ColorArchive

ColorArchive is a polished static color project built with Next.js, TypeScript, Tailwind CSS, and the App Router. It includes a primary archive page, a dedicated dense `All Colors` page, curated `Collections`, a local `Favorites` shelf, a `Spectrum Explorer`, a `Surprise` discovery page, a dedicated search page with multi-dimensional filters, individual color detail pages with relationship recommendations, a `Support` route for monetization direction, a `Packs` route for sellable palette products, a `Product Examples` route for public product proof, and a lightweight `Word → Color` generator route, and it is configured for static export and GitHub Pages deployment.

## Stack

- Next.js with App Router
- TypeScript
- Tailwind CSS
- Static local dataset
- GitHub Pages via GitHub Actions

## Architecture

- `app/` contains the exported routes, metadata, and global styles.
- `src/data/colors.ts` generates a local dataset of 2016 colors with name, hex, rgb, hsl, hue, saturation, lightness, and family.
- `src/components/` contains reusable UI building blocks for the hero, filters, grid, and cards.
- `app/all-colors/page.tsx` renders the full 2016-color archive in a denser single-page layout.
- `app/collections/page.tsx` renders reusable curated palette sets for shareable editorial content.
- `app/collections/[slug]/page.tsx` renders editorial collection detail pages with collection-specific framing and export context.
- `app/about/page.tsx` explains the project’s purpose, static constraints, and route structure.
- `app/updates/page.tsx` exposes a static changelog for major archive and product-layer changes.
- `app/favorites/page.tsx` renders a local-only saved color shelf backed by browser storage.
- `app/recent/page.tsx` renders a local-only recently viewed trail backed by browser storage.
- `app/packs/page.tsx` renders productized palette pack offers that can later point to off-site checkout.
- `app/packs/[slug]/page.tsx` renders individual pack detail pages with source collections, FAQ, and sample files.
- `app/product-examples/page.tsx` renders public-facing pack examples that can be shared with payment providers or early customers.
- `app/free-pack/page.tsx` renders a static free sample pack landing page built from existing preview assets.
- `app/spectrum/page.tsx` renders a hue-by-lightness spectrum matrix view of the archive.
- `app/surprise/page.tsx` adds a random discovery route for exploratory browsing.
- `app/search/page.tsx` adds a dedicated static search route for fast color lookup.
- `app/support/page.tsx` captures the project’s practical monetization paths without adding backend complexity.
- `app/waitlist/page.tsx` adds a static pre-launch interest route for upcoming packs.
- `app/thanks/page.tsx` adds a static post-checkout return page for Lemon Squeezy or Stripe redirects.
- `app/cancel/page.tsx` adds a static checkout-cancelled return page for off-site commerce flows.
- `app/colors/[slug]/page.tsx` statically exports individual color detail pages.
- `app/word-to-color/page.tsx` adds a second static route that deterministically maps any word or phrase to a color.
- `src/lib/color-utils.ts` contains pure utility functions for color conversion, sorting, filtering, and recommendation matching.
- `src/lib/word-color.ts` contains the local deterministic word-to-color generator.
- `src/lib/checkout-config.ts` centralizes off-site checkout provider, status, note, and URL placeholders.
- `src/lib/checkout-config.ts` also centralizes waitlist settings plus success/cancel return paths.
- `.github/workflows/deploy-pages.yml` builds and deploys the static `out/` directory to GitHub Pages.
- `public/CNAME` ensures GitHub Pages serves the site on `colorarchive.me`.

## File Structure

```text
.
├── .github/workflows/deploy-pages.yml
├── app/
│   ├── globals.css
│   ├── icon.svg
│   ├── layout.tsx
│   ├── page.tsx
│   ├── robots.ts
│   └── sitemap.ts
├── public/
│   ├── .nojekyll
│   └── CNAME
├── src/
│   ├── components/
│   │   ├── color-archive-page.tsx
│   │   ├── color-card.tsx
│   │   ├── color-grid.tsx
│   │   ├── filter-toolbar.tsx
│   │   └── hero-section.tsx
│   ├── data/colors.ts
│   ├── lib/color-utils.ts
│   └── types/color.ts
├── next.config.ts
├── package.json
├── postcss.config.mjs
└── tsconfig.json
```

## Local Development

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Create the production static export:

```bash
npm run build
```

The static site is emitted to:

```bash
out/
```

## GitHub Pages Deployment

This repo is already configured for GitHub Pages:

- `next.config.ts` uses `output: "export"`
- `.github/workflows/deploy-pages.yml` builds and deploys on every push to `main`
- `public/.nojekyll` prevents Jekyll from ignoring Next.js asset paths
- `public/CNAME` sets the custom domain to `colorarchive.me`

### Push to GitHub

```bash
git add .
git commit -m "Initial ColorArchive site"
git branch -M main
git remote add origin git@github.com:YOUR_USERNAME/ColorArchive.git
git push -u origin main
```

### GitHub Pages Settings

In your GitHub repository:

1. Open **Settings** → **Pages**
2. Under **Build and deployment**, set **Source** to **GitHub Actions**
3. Under **Custom domain**, set `colorarchive.me`
4. Enable **Enforce HTTPS** after the domain resolves

### DNS for `colorarchive.me`

At your DNS provider, point the domain to GitHub Pages:

- For the apex domain, add GitHub Pages A/AAAA records
- Or point `www.colorarchive.me` to `YOUR_USERNAME.github.io` with a CNAME and redirect the apex domain to `www`

GitHub documents the current records here:

- [Managing a custom domain for GitHub Pages](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site)

## Notes

- The site uses only local data and no backend services.
- The page is fully static-export compatible and deployable on GitHub Pages.
- The `All Colors` route supports shareable search, family, sort, and density state for dense archive browsing.
- The `Collections` route packages the archive into reusable thematic sets with copyable palette exports.
- Collection detail routes turn each set into a standalone editorial reference rather than a single aggregate list item.
- The `About` route gives the project a clearer trust layer by explaining why it is static and how the route groups fit together.
- The `Updates` route gives the site a visible shipping history rather than hiding all changes inside git alone.
- The `Favorites` route stores saved colors in `localStorage` and now exports a saved palette or CSS variables without backend state.
- The home archive now surfaces a local Recent / Favorites hub so users can continue browsing without digging through navigation.
- The `Recent` route stores recently viewed colors in `localStorage`, making it easier to resume browsing without an account.
- Both `Favorites` and `Recent` now support JSON export in addition to text-based palette export.
- The `Packs` route turns the archive into product-ready offers and exposes placeholder checkout slots for future Lemon Squeezy or Stripe links.
- The `Free Sample Pack` route gives the site a concrete free-to-paid bridge while Lemon approval is still pending.
- The free sample route now includes claim guidance plus a free-versus-paid comparison block so the upgrade path is explicit.
- `src/lib/checkout-config.ts` is now the only file you need to edit when real checkout URLs become available.
- Individual pack detail routes deepen the product layer without introducing a backend or checkout dependency.
- The `Waitlist` route gives the project a static pre-launch conversion page before email tooling is wired.
- The `Thanks` route is ready to use as a post-purchase return URL from off-site checkout.
- The `Cancel` route gives Lemon Squeezy or Stripe a branded cancellation return page instead of a dead end.
- The `Product Examples` route provides concrete pack deliverables, collection previews, and export examples that can be shared during payment-provider onboarding.
- `public/downloads/` now contains sample CSS, JSON, and TXT assets so each pack has something concrete to preview before checkout is wired.
- The search route supports shareable query parameters for keyword, family, hue band, tone, saturation range, lightness range, and exact hex.
- Individual color pages expose nearby, tonal, analogous, and complementary recommendations, and can copy a full palette or CSS variable set.
- The `Word → Color` route now exports palette text and CSS variables in addition to the generated swatches.
- `app/sitemap.ts` now includes top-level routes and all statically exported color detail pages.
- If you temporarily deploy without the custom domain and need a repository subpath, add a `basePath` and `assetPrefix` that match the repository name before building.
