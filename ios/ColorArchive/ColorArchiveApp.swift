import SwiftUI
import SwiftData

@main
struct ColorArchiveApp: App {
    @State private var colorStore = ColorStore()
    @State private var favoritesStore = FavoritesStore()
    @State private var recentColorsStore = RecentColorsStore()
    @State private var authStore = AuthStore()

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environment(colorStore)
                .environment(favoritesStore)
                .environment(recentColorsStore)
                .environment(authStore)
                .modelContainer(for: Palette.self)
                .onOpenURL { url in
                    handleDeepLink(url)
                }
        }
    }

    private func handleDeepLink(_ url: URL) {
        // Handle colorarchive://login?token=X
        guard url.scheme == "colorarchive",
              url.host == "login",
              let components = URLComponents(url: url, resolvingAgainstBaseURL: false),
              let token = components.queryItems?.first(where: { $0.name == "token" })?.value
        else { return }

        Task {
            do {
                let user = try await APIService.verifyMagicLink(token: token)
                await MainActor.run {
                    authStore.user = user
                }
            } catch {
                print("Deep link login failed:", error)
            }
        }
    }
}
