import SwiftUI

@main
struct ColorArchiveApp: App {
    @State private var colorStore = ColorStore()
    @State private var favoritesStore = FavoritesStore()
    @State private var spotlightColorId: String?

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environment(colorStore)
                .environment(favoritesStore)
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
                }
                .task {
                    // Index colors for Spotlight when they're ready
                    while colorStore.isLoading {
                        try? await Task.sleep(for: .milliseconds(100))
                    }
                    SpotlightIndexer.indexColors(colorStore.colors)
                }
        }
    }
}
