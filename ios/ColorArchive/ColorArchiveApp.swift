import SwiftUI
import SwiftData

@main
struct ColorArchiveApp: App {
    @State private var colorStore = ColorStore()
    @State private var favoritesStore = FavoritesStore()
    @State private var recentColorsStore = RecentColorsStore()

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environment(colorStore)
                .environment(favoritesStore)
                .environment(recentColorsStore)
                .modelContainer(for: Palette.self)
        }
    }
}
