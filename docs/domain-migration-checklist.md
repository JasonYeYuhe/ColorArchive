# Domain Migration Checklist: colorarchive.me → colorarchive.org

> Last updated: 2026-04-10
> Status: Phase 1 (code prep) complete. Phase 2–4 pending.

---

## Phase 0 — Pre-Migration (Before Migration Day)

### DNS & Domain
- [ ] Confirm colorarchive.org domain ownership and DNS control
- [ ] Plan DNS records: A record for frontend, A/CNAME for api.colorarchive.org → DO Droplet (143.198.85.72)
- [ ] Decide TTL strategy: lower TTL to 300s a few days before cutover

### Email Domain (Resend)
- [ ] Add colorarchive.org domain in Resend dashboard
- [ ] Add required DNS records (SPF, DKIM, DMARC) for colorarchive.org
- [ ] Wait for domain verification (can take 24-48h)
- [ ] Test sending from `hello@colorarchive.org` in Resend sandbox

### Google OAuth
- [ ] In Google Cloud Console → APIs & Services → Credentials:
  - Add `https://colorarchive.org` to Authorized JavaScript Origins
  - Add `https://api.colorarchive.org/auth/google/callback` to Authorized Redirect URIs
  - Keep old .me URIs temporarily (both can coexist)

### Instagram API (Meta Developer Console)
- [ ] Update Valid OAuth Redirect URI to `https://api.colorarchive.org/instagram/auth/callback`
- [ ] Keep old URI temporarily for transition

### DNS for API Subdomain (MUST be done before SSL)
- [ ] At domain registrar, create A record: `api.colorarchive.org` → `143.198.85.72`
- [ ] Wait for DNS propagation: `dig api.colorarchive.org` should return the Droplet IP
- [ ] Only proceed to SSL after DNS is confirmed

### SSL Certificate (requires DNS above)
- [ ] SSH into DO Droplet: `ssh root@143.198.85.72`
- [ ] Update Nginx config: `server_name api.colorarchive.org api.colorarchive.me;`
- [ ] Run: `sudo certbot --nginx -d api.colorarchive.org`
- [ ] Verify: `curl https://api.colorarchive.org/health`

### Backup & Rollback Prep
- [ ] On DO Droplet, snapshot current state:
  ```bash
  cp /root/colorarchive-server/.env /root/colorarchive-server/.env.backup-me
  cp /etc/nginx/sites-available/colorarchive /etc/nginx/sites-available/colorarchive.backup-me
  cp /root/colorarchive-server/colorarchive.db /root/colorarchive-server/colorarchive.db.backup-me
  ```
- [ ] Document rollback steps: restore `.env.backup-me`, reload Nginx from `.backup-me`, restart PM2

---

## Phase 1 — Code Preparation (DONE ✅)

Commit `7f32d3e` replaced all hardcoded display text with env-var-driven values:
- CORS regex dynamically built from `FRONTEND_ORIGIN`
- Email templates use `SITE_DOMAIN` variable
- IG image watermarks use `SITE_DOMAIN`
- Frontend structured data uses `CONTACT_EMAIL` / `SUPPORT_EMAIL`
- OG images, footer, export watermarks all use `SITE_DOMAIN`

---

## Phase 2 — Migration Day Execution

### Step 1: Backend (DigitalOcean Droplet)

SSH into `root@143.198.85.72` and update server `.env`:

```bash
# Update these values in /root/colorarchive-server/.env
FRONTEND_ORIGIN=https://colorarchive.org
FROM_EMAIL=hello@colorarchive.org
ADMIN_EMAILS=hello@colorarchive.org
GOOGLE_REDIRECT_URI=https://api.colorarchive.org/auth/google/callback
INSTAGRAM_REDIRECT_URI=https://api.colorarchive.org/instagram/auth/callback
API_ORIGIN=https://api.colorarchive.org
```

```bash
# Update Nginx
sudo sed -i 's/server_name api.colorarchive.me;/server_name api.colorarchive.org api.colorarchive.me;/' /etc/nginx/sites-available/colorarchive
sudo nginx -t && sudo systemctl reload nginx

# Restart Express
pm2 restart all

# Verify
curl https://api.colorarchive.org/health
```

### Step 2: Frontend (Vercel)

Update environment variables in Vercel Dashboard → Settings → Environment Variables:

| Variable | New Value |
|----------|-----------|
| `NEXT_PUBLIC_SITE_URL` | `https://colorarchive.org` |
| `NEXT_PUBLIC_API_URL` | `https://api.colorarchive.org` |
| `FRONTEND_URL` | `https://colorarchive.org` |
| `BACKEND_API_URL` | `https://api.colorarchive.org` |
| `NEXT_PUBLIC_CONTACT_EMAIL` | `hello@colorarchive.org` |
| `NEXT_PUBLIC_SUPPORT_EMAIL` | `support@colorarchive.org` |

Then add `colorarchive.org` as custom domain in Vercel → Domains.

### Step 3: DNS Cutover

At domain registrar, set (use Vercel-provided records — check Vercel Domains page for exact values):

| Record | Type | Value | Note |
|--------|------|-------|------|
| `colorarchive.org` | A | Vercel IP (check dashboard) | Apex domain — some registrars need A record, not CNAME |
| `www.colorarchive.org` | CNAME | `cname.vercel-dns.com` | |
| `api.colorarchive.org` | A | `143.198.85.72` | Already done in Phase 0 |

> Note: Apex CNAME is not universally supported. If your registrar doesn't support CNAME flattening, use an A record pointing to Vercel's IP instead.

Set `colorarchive.org` (apex, no www) as the **canonical** domain in Vercel. Vercel will auto-redirect `www` → apex.

### Step 4: Old Domain 301 Redirects (do this in the SAME cutover window)

**Critical for SEO** — must be path-preserving (e.g. `/colors/amber-core-vivid/` → same path on .org):

In Vercel Dashboard → Domains: add `colorarchive.me` and configure it to redirect to `colorarchive.org` (Vercel handles path-preserving 301s automatically).

### API Domain Overlap Policy

**`api.colorarchive.me` MUST remain live** until all shipped clients are updated:
- iOS app: ~1-2 weeks for App Store review
- Figma plugin: ~1 week for Figma review
- VSCode extension: ~1-2 days for marketplace review

Keep both `api.colorarchive.me` and `api.colorarchive.org` pointing to the same Droplet (Nginx `server_name` handles both). Remove old domain only after confirming all clients are updated.

### Step 5: Trigger Vercel Rebuild

Push any change (e.g. an env comment) to trigger a full rebuild with new env vars:

```bash
git commit --allow-empty -m "Trigger rebuild for domain migration"
git push origin main
```

> Note: `public/CNAME` is a GitHub Pages artifact. If still deployed to Vercel only, this file can be removed. If using GitHub Pages as fallback, update to `colorarchive.org`.

---

## Phase 3 — Post-Cutover Updates (Same Day — commit + redeploy after ALL edits)

### Frontend Display Text (find-and-replace)

These files still have hardcoded `.me` email addresses in content strings. Run find-and-replace:

**Legal pages — email addresses:**

| File | Find | Replace With |
|------|------|-------------|
| `src/components/terms-page.tsx` | `support@colorarchive.me` (2x) | `support@colorarchive.org` |
| `src/components/privacy-page.tsx` | `privacy@colorarchive.me` (3x) | `privacy@colorarchive.org` |
| `src/components/refund-policy-page.tsx` | `support@colorarchive.me` (2x) | `support@colorarchive.org` |
| `src/components/cookie-policy-page.tsx` | `support@colorarchive.me` (1x) | `support@colorarchive.org` |
| `src/components/commerce-disclosure-page.tsx` | `support@colorarchive.me` (4x) | `support@colorarchive.org` |
| `src/components/support-page.tsx` | `support@colorarchive.me` (3x) | `support@colorarchive.org` |
| `src/components/login-page.tsx` | `hello@colorarchive.me` (1x) | `hello@colorarchive.org` |
| `src/lib/i18n.ts` | `hello@colorarchive.me` (4x, EN+ZH) | `hello@colorarchive.org` |

**Legal pages — footer display domain:**

| File | Find | Replace With |
|------|------|-------------|
| `src/components/terms-page.tsx:145` | `colorarchive.me` | `colorarchive.org` |
| `src/components/privacy-page.tsx:167` | `colorarchive.me` | `colorarchive.org` |
| `src/components/refund-policy-page.tsx:100` | `colorarchive.me` | `colorarchive.org` |
| `src/components/cookie-policy-page.tsx:97` | `colorarchive.me` | `colorarchive.org` |

**Other components:**

| File | Find | Replace With |
|------|------|-------------|
| `src/components/color-detail-page.tsx:196` | `"https://api.colorarchive.me"` | use `API_URL` from api-config |
| `src/lib/project-updates.ts:49` | `colorarchive.me` | `colorarchive.org` |

### Regenerate Download Files

The `public/downloads/` folder has ~170 pre-generated files with old domain. Regenerate:

```bash
# Update scripts/generate-downloads.mjs if needed, then:
node scripts/generate-downloads.mjs
```

### Update Promo Content

| File | Action |
|------|--------|
| `public/promo-xiaohongshu.html:105` | Update `colorarchive.me` → `colorarchive.org` |

### External Services (Manual)

| Service | Console URL | Action |
|---------|------------|--------|
| **Lemon Squeezy** | lemonsqueezy.com → Settings → Webhooks | Update endpoint to `https://colorarchive.org/api/webhook` (exact path) |
| **Apple IAP** | App Store Connect → App → Server Notifications | Update Production + Sandbox URL to `https://api.colorarchive.org/apple-notifications/v2` |
| **Pinterest** | developers.pinterest.com → App → Settings | Update redirect URI |
| **Google Search Console** | search.google.com/search-console | Add `colorarchive.org` property, submit sitemap, set up domain change |
| **Umami** | analytics dashboard | Add new domain tracking |
| **Product Hunt** | producthunt.com | Update website URL |
| **Indie Hackers** | indiehackers.com | Update product URL |
| **AlternativeTo** | alternativeto.net | Update listing URL |

### Redeploy After All Phase 3 Edits

```bash
git add -A
git commit -m "Migration day: update all remaining .me references to .org"
git push origin main
# This triggers a Vercel rebuild with all content fixes live
```

### Google Search Console Domain Change (do AFTER redeploy)

Do this only after the site is fully clean of `.me` references:
1. Verify ownership of `colorarchive.org` in Search Console
2. Submit sitemap: `https://colorarchive.org/sitemap.xml`
3. Use "Change of Address" tool: Settings → Change of address → select `colorarchive.org`
4. This tells Google to transfer ranking signals from .me to .org
5. Verify that canonical tags on live `.org` pages point to `.org` URLs
6. Verify structured data (schema.org) URLs are `.org`

---

## Phase 4 — iOS App + Extensions (Within 1 Week)

### iOS App

Update these Swift files:

| File | Line | Change |
|------|------|--------|
| `ios/ColorArchive/Services/APIService.swift` | 4 | `baseURL = "https://api.colorarchive.org"` |
| `ios/ColorArchive/Views/Tools/AIMoodPaletteView.swift` | 175 | `baseURL = "https://api.colorarchive.org"` |
| `ios/ColorArchive/Views/Pro/ProPaywallView.swift` | 142-143 | Update terms/privacy URLs to `.org` |
| `ios/ColorArchive/Views/Profile/ProfileView.swift` | 186,190,194 | Update all `colorarchive.me` links to `.org` |
| `ios/ColorArchive/Views/Components/ShareSheet.swift` | 62,95 | Update display domain text |

Then:
- [ ] Bump build number in Xcode
- [ ] Archive and submit to App Store Connect
- [ ] Update App Store listing text (Marketing URL, Support URL, Privacy URL)

### Figma Plugin

| File | Change |
|------|--------|
| `figma-plugin/manifest.json:12` | Add `https://colorarchive.org` and `https://api.colorarchive.org` to allowed domains |
| `figma-plugin/ui.html:186` | Update account link |
| `figma-plugin/ui.html:199` | Update site link |

Then republish via Figma Community.

### VSCode Extension

| File | Change |
|------|--------|
| `vscode-extension/src/extension.ts` | Update API fetch URL to `api.colorarchive.org` |

Then republish to VS Code Marketplace.

### GitHub Actions

| File | Change |
|------|--------|
| `.github/workflows/deploy-pages.yml.disabled:43` | Update `NEXT_PUBLIC_API_URL` if re-enabled |

---

## Phase 5 — Documentation (Within 1 Week)

Global find-and-replace `colorarchive.me` → `colorarchive.org` in:

- [ ] `README.md`
- [ ] `CLAUDE.md`
- [ ] `PRODUCT_MEMO.md`
- [ ] `HANDOFF.md`
- [ ] `IMPROVEMENTS.md`
- [ ] `support-knowledge.md`
- [ ] `server/DEPLOY.md`
- [ ] `docs/google-auth-checklist.md`
- [ ] `docs/commerce-ops-checklist.md`
- [ ] `docs/app-store-listing.md`
- [ ] `docs/ios-iap-setup-guide.md`
- [ ] `docs/devto-article.md`
- [ ] `docs/product-hunt-launch.md`
- [ ] `docs/lemonsqueezy-reapplication-draft.md`

Also update:
- [ ] `server/.env.example` — update example values
- [ ] `.env.local.example` — update comments
- [ ] Test files: `src/__tests__/lib/palette-import.test.ts` — update test URLs (4 places)

---

## Phase 6 — Verification (Migration Day + 1)

- [ ] Visit `https://colorarchive.org` — homepage loads correctly
- [ ] Visit `https://api.colorarchive.org/health` — returns `{"ok":true}`
- [ ] Visit `https://colorarchive.me` — 301 redirects to `.org`
- [ ] Visit `https://colorarchive.me/colors/amber-core-vivid/` — path-preserving 301 to `.org/colors/amber-core-vivid/`
- [ ] Visit `https://api.colorarchive.me/health` — still works (overlap period for old clients)
- [ ] Test magic link login → email arrives from `@colorarchive.org`, link points to `.org`
- [ ] Test Google OAuth login → redirects work
- [ ] Test a color page OG image → watermark shows `.org`
- [ ] Test palette export → footer shows `.org`
- [ ] Test email capture form → confirmation email correct
- [ ] Check sitemap at `https://colorarchive.org/sitemap.xml` — all URLs are `.org`
- [ ] Verify Google Search Console accepted the domain change
- [ ] Monitor 404 errors in Vercel Analytics for 48 hours
- [ ] Check Resend delivery logs — emails not bouncing

---

## Rollback Plan

If migration fails or causes critical issues:

1. **Backend**: Restore `.env.backup-me`, reload Nginx from `.backup-me`, `pm2 restart all`
2. **Vercel**: Revert env vars to `.me` values, trigger redeploy
3. **DNS**: Point `colorarchive.org` records to a "coming soon" page or remove them
4. **OAuth**: Old `.me` redirect URIs were kept (coexist), so Google/Instagram login still works on `.me`
5. **Webhooks**: Lemon Squeezy and Apple webhook URLs only need reverting if already changed

Estimated rollback time: ~15 minutes (backend) + ~5 minutes (Vercel redeploy) + DNS propagation.

---

## Downtime Estimate

- **Backend hard downtime**: ~5 seconds (Nginx reload + PM2 restart)
- **Frontend**: Near-zero on Vercel (new domain is added, old continues to work)
- **DNS convergence**: 5-30 minutes with 300s TTL, some resolvers may lag up to 1 hour
- **Biggest risk**: Partial failure — login, emails, or webhooks break while homepage works. Test each service individually.

---

## Summary

| Phase | Items | Who | When |
|-------|-------|-----|------|
| 0. Pre-migration | DNS, SSL, Resend, OAuth prep | Jason (manual) | 1-3 days before |
| 1. Code prep | ~~Env-var abstraction~~ | ~~Claude~~ | ~~Done ✅~~ |
| 2. Migration day | Env vars + DNS + 301 | Jason + Claude | Migration day |
| 3. Post-cutover | Legal pages, downloads, external services | Claude + Jason | Same day |
| 4. Apps & extensions | iOS, Figma, VSCode | Jason (submit) | Within 1 week |
| 5. Documentation | Global find-replace in .md files | Claude | Within 1 week |
| 6. Verification | End-to-end testing | Jason | Day +1 |

**Total references to update: ~284**
- 15 env var fallbacks (auto-switch when env changes)
- 7 config files
- 32 user-facing display text
- 2 iOS API base URLs + 7 Swift UI links
- 170 generated download files (regenerate via script)
- 42+ documentation files
- 6 external service consoles
- 4 extension/plugin files
