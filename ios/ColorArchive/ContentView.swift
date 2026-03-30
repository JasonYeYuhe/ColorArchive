import SwiftUI

struct ContentView: View {
    @State private var selectedTab: Tab = .browse

    enum Tab: String, CaseIterable {
        case browse = "Browse"
        case search = "Search"
        case tools = "Tools"
        case collections = "Collections"
        case profile = "Profile"
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

            CollectionsView()
                .tabItem {
                    Label("Collections", systemImage: "rectangle.stack.fill")
                }
                .tag(Tab.collections)

            ProfileView()
                .tabItem {
                    Label("Profile", systemImage: "person.crop.circle")
                }
                .tag(Tab.profile)
        }
        .tint(Color(red: 0.1, green: 0.1, blue: 0.18))
    }
}

#Preview {
    ContentView()
        .environment(ColorStore())
        .environment(FavoritesStore())
        .environment(RecentColorsStore())
}
