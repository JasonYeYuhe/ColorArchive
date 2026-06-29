import Foundation
import StoreKit
import Observation

/// Product identifiers matching App Store Connect configuration.
enum StoreProductID {
    static let proMonthly  = "me.colorarchive.pro.monthly"
    static let proYearly   = "me.colorarchive.pro.yearly"
    static let proLifetime = "me.colorarchive.pro.lifetime"

    static let subscriptionIDs: Set<String> = [proMonthly, proYearly]
    static let allIDs: Set<String> = [proMonthly, proYearly, proLifetime]
}

/// Result of a purchase attempt.
enum PurchaseResult {
    case success
    case cancelled
    case pending  // Ask-to-Buy or deferred
}

/// Manages StoreKit 2 products, purchases, and entitlement state.
@Observable
@MainActor
final class StoreManager {

    // MARK: - Published state

    var products: [Product] = []
    var purchasedProductIDs: Set<String> = []
    var isLoading = false
    var errorMessage: String?
    var syncError: String?

    /// Whether the user has an active Pro entitlement (subscription OR lifetime).
    var isPro: Bool {
        !purchasedProductIDs.isEmpty
    }

    // MARK: - Private

    private nonisolated(unsafe) var updateListenerTask: Task<Void, Never>?

    // MARK: - Lifecycle

    init() {
        updateListenerTask = listenForTransactions()
        Task { await loadProducts() }
        Task { await updatePurchasedProducts() }
    }

    deinit {
        updateListenerTask?.cancel()
    }

    // MARK: - Load products

    func loadProducts() async {
        isLoading = true
        errorMessage = nil
        do {
            let storeProducts = try await Product.products(for: StoreProductID.allIDs)
            products = storeProducts.sorted { a, b in
                let order: [String: Int] = [
                    StoreProductID.proMonthly: 0,
                    StoreProductID.proYearly: 1,
                    StoreProductID.proLifetime: 2,
                ]
                return (order[a.id] ?? 99) < (order[b.id] ?? 99)
            }
        } catch {
            errorMessage = error.localizedDescription
        }
        isLoading = false
    }

    // MARK: - Purchase

    func purchase(_ product: Product) async throws -> PurchaseResult {
        // Aligned with the web `checkout_clicked` (StoreKit IAP is the iOS checkout).
        AnalyticsBootstrap.capture("checkout_clicked", ["product": product.id, "provider": "apple_iap"])
        let result = try await product.purchase()
        switch result {
        case .success(let verification):
            let transaction = try checkVerified(verification)
            await updatePurchasedProducts()
            // Sync to the backend BEFORE finishing. If it fails, leave the
            // transaction unfinished so Transaction.updates retries it next launch
            // (local entitlement is already granted above, so the user isn't blocked).
            let synced = await syncPurchaseWithBackend(transaction, jws: verification.jwsRepresentation)
            if synced { await transaction.finish() }
            AnalyticsBootstrap.capture("purchase", ["product": product.id, "result": "success"])
            return .success
        case .userCancelled:
            AnalyticsBootstrap.capture("purchase", ["product": product.id, "result": "cancelled"])
            return .cancelled
        case .pending:
            AnalyticsBootstrap.capture("purchase", ["product": product.id, "result": "pending"])
            return .pending
        @unknown default:
            return .cancelled
        }
    }

    // MARK: - Restore

    /// Returns true if restore found entitlements, false otherwise.
    func restorePurchases() async throws -> Bool {
        try await AppStore.sync()
        await updatePurchasedProducts()
        // Sync any restored entitlements to backend
        await syncAllEntitlementsToBackend()
        return isPro
    }

    // MARK: - Entitlement check

    func updatePurchasedProducts() async {
        var purchased: Set<String> = []

        for await result in Transaction.currentEntitlements {
            if let transaction = try? checkVerified(result) {
                purchased.insert(transaction.productID)
            }
        }

        purchasedProductIDs = purchased
    }

    // MARK: - Transaction listener

    private func listenForTransactions() -> Task<Void, Never> {
        // Use Task (not .detached) to inherit MainActor context
        Task { [weak self] in
            for await result in Transaction.updates {
                if case .verified(let transaction) = result {
                    await self?.updatePurchasedProducts()
                    let synced = await self?.syncPurchaseWithBackend(transaction, jws: result.jwsRepresentation) ?? false
                    if synced { await transaction.finish() }
                }
            }
        }
    }

    // MARK: - Verification helper

    private nonisolated func checkVerified<T>(_ result: VerificationResult<T>) throws -> T {
        switch result {
        case .unverified(_, let error):
            throw error
        case .verified(let value):
            return value
        }
    }

    // MARK: - Backend sync

    private static let syncSession: URLSession = {
        let config = URLSessionConfiguration.default
        config.httpCookieAcceptPolicy = .always
        config.httpCookieStorage = .shared
        return URLSession(configuration: config)
    }()

    /// Syncs a single transaction to the backend.
    ///
    /// Pass `jws` from the originating `VerificationResult.jwsRepresentation` — this is the
    /// Apple-signed JWS string that the backend cryptographically verifies.
    /// `Transaction.jsonRepresentation` is plain JSON (not signed) and will fail verification.
    /// Records the purchase on the backend. Returns true on success — callers only
    /// finish the transaction when this is true, so a failed sync leaves it for
    /// Transaction.updates to retry on a later launch (no lost backend record).
    @discardableResult
    private func syncPurchaseWithBackend(_ transaction: Transaction, jws: String) async -> Bool {
        guard let url = URL(string: "\(APIService.baseURL)/auth/apple-purchase") else { return false }
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        let body: [String: Any] = [
            "productId": transaction.productID,
            "originalTransactionId": String(transaction.originalID),
            "transactionDate": transaction.purchaseDate.ISO8601Format(),
            "environment": transaction.environment.rawValue,
            "signedTransaction": jws,
        ]
        request.httpBody = try? JSONSerialization.data(withJSONObject: body)

        do {
            let (data, response) = try await Self.syncSession.data(for: request)
            if let http = response as? HTTPURLResponse, http.statusCode != 200 {
                let msg = String(data: data, encoding: .utf8) ?? "HTTP \(http.statusCode)"
                syncError = "Sync failed: \(msg)"
                return false
            }
            syncError = nil
            return true
        } catch {
            syncError = "Sync failed: \(error.localizedDescription)"
            return false
        }
    }

    /// Syncs all current entitlements to backend (used after restore).
    private func syncAllEntitlementsToBackend() async {
        for await result in Transaction.currentEntitlements {
            if case .verified(let transaction) = result {
                await syncPurchaseWithBackend(transaction, jws: result.jwsRepresentation)
            }
        }
    }

    // MARK: - Helpers

    var monthlyProduct: Product? {
        products.first { $0.id == StoreProductID.proMonthly }
    }

    var yearlyProduct: Product? {
        products.first { $0.id == StoreProductID.proYearly }
    }

    var lifetimeProduct: Product? {
        products.first { $0.id == StoreProductID.proLifetime }
    }
}
