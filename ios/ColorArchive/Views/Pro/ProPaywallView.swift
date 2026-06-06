import SwiftUI
import StoreKit

struct ProPaywallView: View {
    @Environment(StoreManager.self) var store
    @Environment(AuthStore.self) var authStore
    @Environment(\.dismiss) var dismiss

    @State private var selectedProductID: String = StoreProductID.proYearly
    @State private var isPurchasing = false
    @State private var isRestoring = false
    @State private var showError = false
    @State private var errorText = ""
    @State private var showPendingAlert = false
    @State private var showRestoreResult = false
    @State private var restoreFoundPro = false

    private let features: [(icon: String, title: String, desc: String)] = [
        ("heart.fill", "Unlimited Favorites", "Save as many colors as you want"),
        ("paintpalette.fill", "Unlimited Palettes", "Create and export without limits"),
        ("wrench.and.screwdriver.fill", "All Pro Tools", "Harmonies, mixer, gradients & more"),
        ("square.and.arrow.up", "Export Tokens", "CSS, Tailwind, SwiftUI, Android XML"),
        ("icloud.fill", "Cross-Device Sync", "Access Pro on web and iOS"),
        ("sparkles", "AI Palette", "Generate palettes from mood & photos"),
    ]

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 24) {
                    // Header
                    VStack(spacing: 12) {
                        Image(systemName: "crown.fill")
                            .font(.system(size: 48))
                            .foregroundStyle(.linearGradient(
                                colors: [.orange, .yellow],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            ))

                        Text("ColorArchive Pro")
                            .font(.title)
                            .fontWeight(.bold)

                        Text("Unlock the full power of color")
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                    }
                    .padding(.top, 20)

                    // Feature list
                    VStack(spacing: 16) {
                        ForEach(features, id: \.title) { feature in
                            HStack(spacing: 14) {
                                Image(systemName: feature.icon)
                                    .font(.title3)
                                    .foregroundStyle(.orange)
                                    .frame(width: 32)

                                VStack(alignment: .leading, spacing: 2) {
                                    Text(feature.title)
                                        .font(.subheadline)
                                        .fontWeight(.medium)
                                    Text(feature.desc)
                                        .font(.caption)
                                        .foregroundStyle(.secondary)
                                }
                                Spacer()
                            }
                        }
                    }
                    .padding(.horizontal)

                    // Product options
                    if store.isLoading {
                        ProgressView("Loading plans...")
                            .padding()
                    } else if store.products.isEmpty {
                        // Fix #7: Show error + retry button
                        VStack(spacing: 12) {
                            Text(store.errorMessage ?? "Unable to load subscription options.")
                                .font(.caption)
                                .foregroundStyle(.secondary)
                                .multilineTextAlignment(.center)
                            Button("Try Again") {
                                Task { await store.loadProducts() }
                            }
                            .font(.caption)
                            .buttonStyle(.bordered)
                        }
                        .padding()
                    } else {
                        VStack(spacing: 12) {
                            ForEach(store.products) { product in
                                ProductOptionCard(
                                    product: product,
                                    isSelected: selectedProductID == product.id,
                                    onSelect: { selectedProductID = product.id }
                                )
                            }
                        }
                        .padding(.horizontal)
                    }

                    // Purchase button
                    Button {
                        Task { await handlePurchase() }
                    } label: {
                        Group {
                            if isPurchasing {
                                ProgressView()
                                    .tint(.white)
                            } else {
                                Text("Continue")
                                    .fontWeight(.semibold)
                            }
                        }
                        .frame(maxWidth: .infinity)
                        .frame(height: 50)
                    }
                    .buttonStyle(.borderedProminent)
                    .tint(.orange)
                    .disabled(isPurchasing || isRestoring || store.products.isEmpty)
                    .padding(.horizontal)

                    // Restore + terms
                    VStack(spacing: 8) {
                        Button {
                            Task { await handleRestore() }
                        } label: {
                            if isRestoring {
                                ProgressView()
                                    .controlSize(.small)
                            } else {
                                Text("Restore Purchases")
                            }
                        }
                        .font(.caption)
                        .disabled(isRestoring || isPurchasing)

                        HStack(spacing: 16) {
                            Link("Terms of Use", destination: URL(string: "https://colorarchive.org/terms/")!)
                            Link("Privacy Policy", destination: URL(string: "https://colorarchive.org/privacy/")!)
                        }
                        .font(.caption2)
                        .foregroundStyle(.secondary)
                    }
                    .padding(.bottom, 20)
                }
            }
            .navigationBarTitleDisplayMode(.inline)
            .onAppear { AnalyticsBootstrap.screen("pro_paywall") }
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Close") { dismiss() }
                }
            }
            .alert("Purchase Error", isPresented: $showError) {
                Button("OK") {}
            } message: {
                Text(errorText)
            }
            .alert("Purchase Pending", isPresented: $showPendingAlert) {
                Button("OK") {}
            } message: {
                Text("Your purchase is pending approval. You'll get Pro access once it's approved.")
            }
            .alert(restoreFoundPro ? "Restored!" : "No Purchases Found", isPresented: $showRestoreResult) {
                Button("OK") {
                    if restoreFoundPro { dismiss() }
                }
            } message: {
                Text(restoreFoundPro
                     ? "Your Pro access has been restored."
                     : "No previous purchases were found for this Apple ID.")
            }
            .onChange(of: store.isPro) { _, isPro in
                if isPro { dismiss() }
            }
        }
    }

    private func handlePurchase() async {
        guard let product = store.products.first(where: { $0.id == selectedProductID }) else { return }
        isPurchasing = true
        do {
            let result = try await store.purchase(product)
            switch result {
            case .success:
                authStore.checkSession()
                dismiss()
            case .pending:
                showPendingAlert = true
            case .cancelled:
                break
            }
        } catch {
            errorText = error.localizedDescription
            showError = true
        }
        isPurchasing = false
    }

    private func handleRestore() async {
        isRestoring = true
        do {
            restoreFoundPro = try await store.restorePurchases()
            if restoreFoundPro {
                authStore.checkSession()
            }
            showRestoreResult = true
        } catch {
            errorText = error.localizedDescription
            showError = true
        }
        isRestoring = false
    }
}

// MARK: - Product Option Card

private struct ProductOptionCard: View {
    let product: Product
    let isSelected: Bool
    let onSelect: () -> Void

    private var badge: String? {
        switch product.id {
        case StoreProductID.proYearly:
            return "Best Value"
        case StoreProductID.proLifetime:
            return "One-Time"
        default:
            return nil
        }
    }

    private var periodLabel: String {
        switch product.id {
        case StoreProductID.proMonthly:
            return "/ month"
        case StoreProductID.proYearly:
            return "/ year"
        case StoreProductID.proLifetime:
            return "forever"
        default:
            return ""
        }
    }

    var body: some View {
        Button(action: onSelect) {
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    HStack(spacing: 6) {
                        Text(product.displayName)
                            .font(.subheadline)
                            .fontWeight(.medium)
                        if let badge {
                            Text(badge)
                                .font(.system(size: 9, weight: .bold))
                                .textCase(.uppercase)
                                .padding(.horizontal, 6)
                                .padding(.vertical, 2)
                                .background(.orange.opacity(0.15))
                                .foregroundStyle(.orange)
                                .clipShape(Capsule())
                        }
                    }
                    Text(product.description)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                        .lineLimit(1)
                }

                Spacer()

                VStack(alignment: .trailing, spacing: 2) {
                    Text(product.displayPrice)
                        .font(.title3)
                        .fontWeight(.bold)
                    Text(periodLabel)
                        .font(.caption2)
                        .foregroundStyle(.secondary)
                }
            }
            .padding(16)
            .background(
                RoundedRectangle(cornerRadius: 14)
                    .strokeBorder(isSelected ? Color.orange : Color.secondary.opacity(0.2), lineWidth: isSelected ? 2 : 1)
                    .background(
                        RoundedRectangle(cornerRadius: 14)
                            .fill(isSelected ? Color.orange.opacity(0.05) : Color.clear)
                    )
            )
        }
        .buttonStyle(.plain)
    }
}
