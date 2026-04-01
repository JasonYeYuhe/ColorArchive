import Foundation
import Observation

/// Centralizes Pro access checks across StoreKit purchases AND web subscriptions.
/// A user is Pro if they have an active StoreKit entitlement OR their backend tier is "pro".
@Observable
@MainActor
final class ProAccessManager {

    private let storeManager: StoreManager
    private let authStore: AuthStore

    init(storeManager: StoreManager, authStore: AuthStore) {
        self.storeManager = storeManager
        self.authStore = authStore
    }

    /// User has Pro access from any source (StoreKit IAP or web subscription).
    var isPro: Bool {
        storeManager.isPro || authStore.tier == "pro"
    }

    /// Human-readable source of the Pro entitlement.
    var proSource: String? {
        if storeManager.isPro {
            return "App Store"
        } else if authStore.tier == "pro" {
            return "Web Subscription"
        }
        return nil
    }

    /// Limits for free-tier users.
    static let freeFavoritesLimit = 20
    static let freePalettesLimit = 3

    func canAddFavorite(currentCount: Int) -> Bool {
        isPro || currentCount < Self.freeFavoritesLimit
    }

    func canCreatePalette(currentCount: Int) -> Bool {
        isPro || currentCount < Self.freePalettesLimit
    }
}
