import SwiftUI

@Observable
final class AuthStore {
    var user: APIService.AuthUser?
    var tier: String = "anonymous"
    var isLoading = false

    /// Set by the app to enable sync after login.
    var onLoginSync: (() async -> Void)?

    var isLoggedIn: Bool { user != nil }

    func checkSession() {
        guard !isLoading else { return }
        isLoading = true
        Task {
            do {
                let session = try await APIService.fetchSession()
                let wasLoggedIn = await MainActor.run { self.isLoggedIn }
                await MainActor.run {
                    self.user = session.user
                    self.tier = session.auth?.tier ?? "anonymous"
                    self.isLoading = false
                }
                // Trigger cloud sync when user is logged in
                if session.user != nil {
                    await onLoginSync?()
                }
            } catch {
                await MainActor.run {
                    self.user = nil
                    self.tier = "anonymous"
                    self.isLoading = false
                }
            }
        }
    }

    func logout() {
        Task {
            try? await APIService.logout()
            await MainActor.run {
                self.user = nil
                self.tier = "anonymous"
            }
        }
    }
}
