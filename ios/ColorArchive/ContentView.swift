import SwiftUI

struct ContentView: View {
    @State private var selectedTab: Tab = .browse

    enum Tab: String, CaseIterable {
        case browse = "Browse"
        case search = "Search"
        case tools = "Tools"
        case favorites = "Favorites"
    }

    var body: some View {
        TabView(selection: $selectedTab) {
            ColorBrowseView()
                .tabItem {
                    Label("Browse", systemImage: "square.grid.3x3.fill")
                }
                .tag(Tab.browse)

            ColorSearchView()
                .tabItem {
                    Label("Search", systemImage: "magnifyingglass")
                }
                .tag(Tab.search)

            ToolsHomeView()
                .tabItem {
                    Label("Tools", systemImage: "wrench.and.screwdriver.fill")
                }
                .tag(Tab.tools)

            FavoritesView()
                .tabItem {
                    Label("Favorites", systemImage: "heart.fill")
                }
                .tag(Tab.favorites)
        }
        .tint(Color(red: 0.1, green: 0.1, blue: 0.18))
    }
}

#Preview {
    ContentView()
        .environment(ColorStore())
        .environment(FavoritesStore())
}
