import SwiftUI
import SwiftData

@main
struct ColorArchiveApp: App {
    @State private var colorStore = ColorStore()
    @State private var favoritesStore = FavoritesStore()
    @State private var recentColorsStore = RecentColorsStore()
    @State private var spotlightColorId: String?

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environment(colorStore)
                .environment(favoritesStore)
                .environment(recentColorsStore)
                .modelContainer(for: Palette.self)
                .onContinueUserActivity("com.apple.corespotlightitem") { activity in
                    if let id = SpotlightIndexer.colorId(from: activity) {
                        spotlightColorId = id
                    }
                }
                .sheet(item: Binding(
                    get: { spotlightColorId.flatMap { colorStore.color(byId: $0) } },
                    set: { _ in spotlightColorId = nil }
                )) { color in
                    NavigationStack {
                        ColorDetailView(color: color)
                    }
                    .environment(colorStore)
                    .environment(favoritesStore)
                    .environment(recentColorsStore)
                }
                .task {
                    while colorStore.isLoading {
                        try? await Task.sleep(for: .milliseconds(100))
                    }
                    SpotlightIndexer.indexColors(colorStore.colors)
                }
        }
    }
}
