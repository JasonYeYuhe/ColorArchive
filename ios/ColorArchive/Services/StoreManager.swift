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
        let result = try await product.purchase()
        switch result {
        case .success(let verification):
            let transaction = try checkVerified(verification)
            await updatePurchasedProducts()
            await transaction.finish()
            await syncPurchaseWithBackend(transaction)
            return .success
        case .userCancelled:
            return .cancelled
        case .pending:
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
                    await self?.syncPurchaseWithBackend(transaction)
                    await transaction.finish()
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
    private func syncPurchaseWithBackend(_ transaction: Transaction) async {
        guard let url = URL(string: "\(APIService.baseURL)/auth/apple-purchase") else { return }
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        let body: [String: Any] = [
            "productId": transaction.productID,
            "originalTransactionId": String(transaction.originalID),
            "transactionDate": transaction.purchaseDate.ISO8601Format(),
            "environment": transaction.environment.rawValue,
        ]
        request.httpBody = try? JSONSerialization.data(withJSONObject: body)

        do {
            let (data, response) = try await Self.syncSession.data(for: request)
            if let http = response as? HTTPURLResponse, http.statusCode != 200 {
                let msg = String(data: data, encoding: .utf8) ?? "HTTP \(http.statusCode)"
                syncError = "Sync failed: \(msg)"
            } else {
                syncError = nil
            }
        } catch {
            syncError = "Sync failed: \(error.localizedDescription)"
        }
    }

    /// Syncs all current entitlements to backend (used after restore).
    private func syncAllEntitlementsToBackend() async {
        for await result in Transaction.currentEntitlements {
            if let transaction = try? checkVerified(result) {
                await syncPurchaseWithBackend(transaction)
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
