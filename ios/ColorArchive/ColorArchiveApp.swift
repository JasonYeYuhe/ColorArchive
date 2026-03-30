import SwiftUI

@main
struct ColorArchiveApp: App {
    @StateObject private var colorStore = ColorStore()
    @StateObject private var favoritesStore = FavoritesStore()

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(colorStore)
                .environmentObject(favoritesStore)
        }
    }
}
