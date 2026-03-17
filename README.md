# ColorArchive

ColorArchive is a polished static color project built with Next.js, TypeScript, Tailwind CSS, and the App Router. It includes a primary archive page, a dedicated dense `All Colors` page, a `Spectrum Explorer`, a dedicated search page, individual color detail pages, and a lightweight `Word → Color` generator route, and it is configured for static export and GitHub Pages deployment.

## Stack

- Next.js with App Router
- TypeScript
- Tailwind CSS
- Static local dataset
- GitHub Pages via GitHub Actions

## Architecture

- `app/` contains the single exported route, metadata, and global styles.
- `src/data/colors.ts` generates a local dataset of 2016 colors with name, hex, rgb, hsl, hue, saturation, lightness, and family.
- `src/components/` contains reusable UI building blocks for the hero, filters, grid, and cards.
- `app/all-colors/page.tsx` renders the full 2016-color archive in a denser single-page layout.
- `app/spectrum/page.tsx` renders a hue-by-lightness spectrum matrix view of the archive.
- `app/search/page.tsx` adds a dedicated static search route for fast color lookup.
- `app/colors/[slug]/page.tsx` statically exports individual color detail pages.
- `app/word-to-color/page.tsx` adds a second static route that deterministically maps any word or phrase to a color.
- `src/lib/color-utils.ts` contains pure utility functions for color conversion, sorting, and filtering.
- `src/lib/word-color.ts` contains the local deterministic word-to-color generator.
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
- If you temporarily deploy without the custom domain and need a repository subpath, add a `basePath` and `assetPrefix` that match the repository name before building.
