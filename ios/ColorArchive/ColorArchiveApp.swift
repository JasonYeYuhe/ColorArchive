import SwiftUI
import SwiftData
import CoreSpotlight

@main
struct ColorArchiveApp: App {
    @State private var colorStore = ColorStore()
    @State private var favoritesStore = FavoritesStore()
    @State private var recentColorsStore = RecentColorsStore()
    @State private var authStore: AuthStore
    @State private var storeManager: StoreManager
    @State private var proAccess: ProAccessManager
    @State private var spotlightColor: ColorRecord?

    init() {
        SentryBootstrap.start()
        let auth = AuthStore()
        let store = StoreManager()
        _authStore = State(initialValue: auth)
        _storeManager = State(initialValue: store)
        _proAccess = State(initialValue: ProAccessManager(storeManager: store, authStore: auth))
    }

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environment(colorStore)
                .environment(favoritesStore)
                .environment(recentColorsStore)
                .environment(authStore)
                .environment(storeManager)
                .environment(proAccess)
                .modelContainer(for: Palette.self)
                .onAppear {
                    setupSyncHandler()
                    authStore.checkSession()
                }
                .onOpenURL { url in
                    handleDeepLink(url)
                }
                .onReceive(NotificationCenter.default.publisher(for: UIApplication.willEnterForegroundNotification)) { _ in
                    authStore.checkSession()
                    Task { await storeManager.updatePurchasedProducts() }
                }
                .onContinueUserActivity(CSSearchableItemActionType) { activity in
                    if let colorId = SpotlightIndexer.colorId(from: activity),
                       let color = colorStore.color(byId: colorId) {
                        spotlightColor = color
                    }
                }
                .sheet(item: $spotlightColor) { color in
                    NavigationStack {
                        ColorDetailView(color: color)
                    }
                }
        }
    }

    private func setupSyncHandler() {
        authStore.onLoginSync = { [favoritesStore] in
            await favoritesStore.syncFromCloud()
        }
    }

    private func handleDeepLink(_ url: URL) {
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
                    authStore.checkSession()
                }
            } catch {
                print("Deep link login failed:", error)
            }
        }
    }
}
