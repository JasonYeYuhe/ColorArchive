import SwiftUI

/// Wraps content behind a Pro paywall check.
/// If the user is Pro, shows the content. Otherwise shows an upgrade prompt.
struct ProGateView<Content: View>: View {
    @Environment(ProAccessManager.self) var proAccess
    @State private var showingPaywall = false

    let featureName: String
    @ViewBuilder let content: () -> Content

    var body: some View {
        if proAccess.isPro {
            content()
        } else {
            VStack(spacing: 16) {
                Image(systemName: "lock.fill")
                    .font(.system(size: 36))
                    .foregroundStyle(.secondary)

                Text("\(featureName) is a Pro feature")
                    .font(.headline)

                Text("Upgrade to unlock unlimited access to all color tools.")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal)

                Button {
                    showingPaywall = true
                } label: {
                    Label("Upgrade to Pro", systemImage: "crown.fill")
                        .fontWeight(.semibold)
                        .frame(maxWidth: 240)
                        .frame(height: 44)
                }
                .buttonStyle(.borderedProminent)
                .tint(.orange)
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .sheet(isPresented: $showingPaywall) {
                ProPaywallView()
            }
        }
    }
}
