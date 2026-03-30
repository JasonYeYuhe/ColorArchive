import SwiftUI

@main
struct ColorArchiveApp: App {
    @State private var colorStore = ColorStore()
    @State private var favoritesStore = FavoritesStore()

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environment(colorStore)
                .environment(favoritesStore)
        }
    }
}
