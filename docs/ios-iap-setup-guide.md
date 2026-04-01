# iOS In-App Purchase Setup Guide

## Overview

StoreKit 2 integration is complete in code. This document covers the manual steps needed to go live.

## Pricing

| Plan | USD | Apple Tier | Notes |
|------|-----|-----------|-------|
| Pro Monthly | $4.99 | Tier 5 | Auto-renewable subscription |
| Pro Yearly | $34.99 | Tier 35 | Auto-renewable, ~30% savings |
| Pro Lifetime | $99.99 | Tier 89 | Non-consumable one-time purchase |

## Product IDs

- `me.colorarchive.pro.monthly`
- `me.colorarchive.pro.yearly`
- `me.colorarchive.pro.lifetime`

Subscription Group: `ColorArchive Pro`

---

## Step 1: Apple Small Business Program

**Why:** Reduces Apple's commission from 30% to 15% (for revenue under $1M/year).

1. Go to https://developer.apple.com/programs/small-business/
2. Log in with your Apple Developer account
3. Submit enrollment form
4. Wait for approval (usually 1-2 business days)

---

## Step 2: App Store Connect — Create IAP Products

1. Go to https://appstoreconnect.apple.com
2. Select **ColorArchive** app
3. Navigate to **Monetization > Subscriptions**

### Create Subscription Group
- Name: `ColorArchive Pro`

### Create Monthly Subscription
- Reference Name: `Pro Monthly`
- Product ID: `me.colorarchive.pro.monthly`
- Price: Tier 5 ($4.99 USD) — Apple auto-calculates 175 country prices
- Duration: 1 Month
- Localizations:
  - EN: Display Name "Pro Monthly", Description "Full access to all Pro tools"

### Create Yearly Subscription
- Reference Name: `Pro Yearly`
- Product ID: `me.colorarchive.pro.yearly`
- Price: Tier 35 ($34.99 USD)
- Duration: 1 Year
- Localizations:
  - EN: Display Name "Pro Yearly", Description "Full access to all Pro tools — best value"

### Create Lifetime (Non-Consumable)
1. Navigate to **Monetization > In-App Purchases**
2. Click **+** to add new
- Reference Name: `Pro Lifetime`
- Product ID: `me.colorarchive.pro.lifetime`
- Type: Non-Consumable
- Price: Tier 89 ($99.99 USD)
- Localizations:
  - EN: Display Name "Pro Lifetime", Description "Unlock all Pro features forever"

### Review Screenshot
Each IAP product needs a screenshot for review. Take a screenshot of the ProPaywallView on an iPhone simulator.

---

## Step 3: Configure StoreKit in Xcode

The `Products.storekit` file is already created for local testing. For production:

1. Open `ColorArchive.xcodeproj` in Xcode
2. Select the project → Signing & Capabilities
3. Add capability: **In-App Purchase**
4. In your scheme settings (Product → Scheme → Edit Scheme → Run → Options):
   - Set "StoreKit Configuration" to `Products.storekit` for **testing only**
   - Remove it for production builds

---

## Step 4: Deploy Backend Changes

The server already has the new `/auth/apple-purchase` endpoint and `apple_purchases` table.

SSH into the DO Droplet and deploy:

```bash
ssh root@143.198.85.72
cd /root/colorarchive-server
git pull origin main
pm2 restart colorarchive-api
```

The `apple_purchases` table will be auto-created on first server start (via `db.js` migrations).

---

## Step 5: Submit for Review

1. Bump version to 1.1.0 in Xcode (General → Version)
2. Archive and upload to App Store Connect
3. In the submission form:
   - Add the 3 IAP products to the build
   - Add review notes: "New in-app purchases for Pro subscription. Test account credentials: [provide sandbox test account]"
4. Create a Sandbox Test Account in App Store Connect → Users & Access → Sandbox Testers
5. Submit for review

---

## Step 6: Post-Launch

### App Store Server Notifications (Optional but Recommended)

Set up App Store Server Notifications V2 so Apple pushes subscription events (renewals, cancellations, refunds) to your server:

1. In App Store Connect → App → General → App Store Server Notifications
2. Set Production URL: `https://api.colorarchive.me/webhook/apple`
3. Set Sandbox URL: `https://api.colorarchive.me/webhook/apple`
4. Implement the webhook endpoint (not yet implemented — handle `DID_RENEW`, `DID_CHANGE_RENEWAL_STATUS`, `REFUND`, etc.)

### Regional Pricing Adjustments

After launch, monitor downloads by country. Consider lowering prices in:
- India (Tier 2 / $1.99 monthly)
- Brazil (Tier 3 / $2.99 monthly)
- Southeast Asia markets

---

## Architecture Summary

```
iOS App                          Backend (DO Droplet)
┌─────────────────┐              ┌────────────────────┐
│ StoreManager    │──purchase──→ │ /auth/apple-purchase│
│ (StoreKit 2)    │   sync       │                    │
│                 │              │ Updates users.tier  │
│ ProAccessManager│←─session───→ │ /auth/session      │
│ (checks both)   │   check      │ Returns tier       │
└─────────────────┘              └────────────────────┘

Pro access = StoreKit entitlement OR backend tier == "pro"
Web subscribers → login on iOS → session returns tier "pro" → unlocked
iOS subscribers → purchase → StoreKit grants → syncs to backend → web also unlocked
```

## Free vs Pro Feature Matrix

| Feature | Free | Pro |
|---------|------|-----|
| Browse 5,446 colors | yes | yes |
| Search | yes | yes |
| Converter tool | yes | yes |
| Contrast checker | yes | yes |
| Favorites | 20 max | unlimited |
| Palettes | 3 max | unlimited |
| AI Mood Palette | - | yes |
| Image Palette | - | yes |
| Harmonies | - | yes |
| Colorblind Sim | - | yes |
| Tints & Shades | - | yes |
| Mixer | - | yes |
| Gradient Builder | - | yes |
| Export tokens | - | yes |
| Cross-device sync | - | yes |
