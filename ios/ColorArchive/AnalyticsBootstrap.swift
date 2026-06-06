import Foundation
#if canImport(PostHog)
import PostHog
#endif

/// Product analytics (DAU / retention / conversion funnels) via PostHog — the mobile
/// half of the web `posthog-js` integration, using the SAME event names (see
/// `src/lib/track.ts` + `src/lib/posthog.ts`). This is a DIFFERENT layer from
/// `SentryBootstrap` (crashes): PostHog answers "who uses the app and do they come back",
/// which crash reporting does not.
///
/// No-ops while the `PostHogAPIKey` Info.plist key is empty, so this is safe to ship
/// before the key is provisioned — exactly like `SentryBootstrap` with an empty
/// `SentryDSN`. In targets that don't link the PostHog SPM package, `canImport(PostHog)`
/// is false and every method below compiles to an empty no-op, so the event call sites
/// scattered through the app always compile whether or not the package has been resolved
/// in Xcode yet.
///
/// Privacy note: no session replay, no UI autocapture, and we never pass PII. Users are
/// keyed by their opaque numeric backend id (never the email); `tier` is the only person
/// property. Enabling this (setting a real key) means the app collects "Product
/// Interaction" usage data sent to a third party — declare it in PrivacyInfo.xcprivacy +
/// the App Store privacy nutrition label (not linked to identity, not used for tracking)
/// before shipping with a key.
enum AnalyticsBootstrap {
    static func start() {
        #if canImport(PostHog)
        guard
            let apiKey = Bundle.main.object(forInfoDictionaryKey: "PostHogAPIKey") as? String,
            !apiKey.isEmpty
        else { return }

        var host = "https://us.i.posthog.com"
        if let configured = Bundle.main.object(forInfoDictionaryKey: "PostHogHost") as? String,
           !configured.isEmpty {
            host = configured
        }

        let config = PostHogConfig(apiKey: apiKey, host: host)
        config.captureApplicationLifecycleEvents = true  // app installed/opened → DAU + retention
        config.captureScreenViews = false                // we send $screen manually for stable names
        PostHogSDK.shared.setup(config)
        #endif
    }

    /// Capture a product event. Event names mirror the web taxonomy so funnels span platforms.
    static func capture(_ event: String, _ properties: [String: Any] = [:]) {
        #if canImport(PostHog)
        PostHogSDK.shared.capture(event, properties: properties)
        #endif
    }

    /// Screen view — the mobile counterpart of the web `$pageview`.
    static func screen(_ name: String) {
        #if canImport(PostHog)
        PostHogSDK.shared.screen(name)
        #endif
    }

    /// Associate events with a stable, non-PII user id (the numeric backend id). `tier`
    /// rides along as a (non-PII) person property for segmentation.
    static func identify(_ distinctId: String, tier: String) {
        #if canImport(PostHog)
        PostHogSDK.shared.identify(distinctId, userProperties: ["tier": tier])
        #endif
    }

    /// Clear identity on logout so the next session starts anonymous.
    static func reset() {
        #if canImport(PostHog)
        PostHogSDK.shared.reset()
        #endif
    }

    /// Fire `login` on every successful auth, plus `sign_up` when the account was just
    /// created (created_at within the last 2 minutes). Mirrors `trackAuthSuccess` in the
    /// web src/lib/track.ts so the funnel step is shared by name across platforms.
    static func trackAuthSuccess(method: String, createdAt: String?) {
        capture("login", ["method": method])

        guard let createdAt,
              let created = ISO8601DateFormatter().date(from: createdAt)
        else { return }
        if Date().timeIntervalSince(created) < 120 {
            capture("sign_up", ["method": method])
        }
    }
}
