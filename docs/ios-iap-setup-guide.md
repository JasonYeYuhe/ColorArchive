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

## Step 5: Build, Upload, and Submit for Review

### 5a. Bump Version in Xcode Project

Edit `project.pbxproj` or use Xcode GUI:
- `MARKETING_VERSION` → `1.1` (or next version)
- `CURRENT_PROJECT_VERSION` → `2` (or next build number)

### 5b. Create Entitlements File

Create `ColorArchive/ColorArchive.entitlements`:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict/>
</plist>
```

**Important:** StoreKit 2 IAP does NOT need entitlement keys in the file. The capability is managed via the provisioning profile. Adding `com.apple.developer.in-app-payments` will cause a "Provisioning profile doesn't include the Apple Pay capability" error — that key is for Apple Pay, not StoreKit.

Add to both Debug and Release build configs in pbxproj:
```
CODE_SIGN_ENTITLEMENTS = ColorArchive/ColorArchive.entitlements;
```

### 5c. Archive the App

```bash
xcodebuild -project ColorArchive.xcodeproj \
  -scheme ColorArchive \
  -configuration Release \
  -archivePath /tmp/ColorArchive.xcarchive \
  -destination "generic/platform=iOS" \
  archive \
  CODE_SIGN_STYLE=Automatic \
  DEVELOPMENT_TEAM=KHMK6Q3L3K
```

### 5d. Upload via Xcode Organizer (Recommended)

**Why not CLI?** `xcodebuild -exportArchive` requires an iOS Distribution certificate already installed. Xcode Organizer's "Distribute App" flow can **automatically create** the distribution certificate and provisioning profile.

1. Open the archive: `open /tmp/ColorArchive.xcarchive` (opens in Xcode Organizer)
2. In Organizer (Window → Organizer → Archives), select the archive
3. Click **"Distribute App"**
4. Select **"App Store Connect"** → Click **"Distribute"**
5. Xcode will automatically:
   - Create an iOS Distribution certificate (if none exists)
   - Generate an App Store provisioning profile
   - Upload the build to App Store Connect
6. Wait for "Uploading" → "Waiting for App Store Connect analysis response..." → Complete

**Alternative CLI method** (if you already have distribution certificate):
```bash
cat > /tmp/ExportOptions.plist << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>method</key>
    <string>app-store-connect</string>
    <key>signingStyle</key>
    <string>automatic</string>
    <key>teamID</key>
    <string>KHMK6Q3L3K</string>
    <key>uploadSymbols</key>
    <true/>
    <key>destination</key>
    <string>upload</string>
</dict>
</plist>
EOF

xcodebuild -exportArchive \
  -archivePath /tmp/ColorArchive.xcarchive \
  -exportOptionsPlist /tmp/ExportOptions.plist \
  -exportPath /tmp/ColorArchiveExport \
  -allowProvisioningUpdates
```

### 5e. Process the Build in App Store Connect

After upload, the build takes ~5-15 minutes to process:

1. Go to **TestFlight → iOS Builds** to monitor processing status
2. Once "Processing" → "Complete", handle **Export Compliance**:
   - Click "Manage" next to "Missing Compliance"
   - Select **"None of the algorithms mentioned above"** (if no custom encryption, only standard HTTPS)
   - Click Save
3. Build status changes to **"Ready to Submit"**

### 5f. Select Build and Submit

1. Go to **Distribution → iOS App → Version X.X**
2. Scroll to **Build** section → Click **"Add Build"**
3. Select the uploaded build → Click **"Done"**
4. Verify all sections are complete:
   - Screenshots uploaded
   - What's New text filled
   - IAP products associated (In-App Purchases and Subscriptions section)
   - App Review Information (contact info)
5. Click **"Save"** then **"Add for Review"**

### 5g. Create Sandbox Test Account (before or during review)

1. App Store Connect → Users and Access → Sandbox → Testers
2. Create a test account with a unique email
3. Use this account on a test device (Settings → App Store → Sandbox Account) to test purchases

### Troubleshooting

| Error | Cause | Fix |
|-------|-------|-----|
| "Provisioning profile doesn't include Apple Pay" | Wrong entitlements key | Use empty `<dict/>` in entitlements, not `com.apple.developer.in-app-payments` |
| "No signing certificate 'iOS Distribution' found" | Missing distribution cert | Use Xcode Organizer instead of CLI — it auto-creates certs |
| "Failed to Use Accounts" | CLI auth issue | Use Xcode Organizer GUI which has proper auth |
| Build not appearing in Version page | Still processing | Wait 5-15 min, check TestFlight → Build Uploads |
| "Missing Compliance" warning | Export compliance not set | Click Manage → select encryption type → Save |

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
