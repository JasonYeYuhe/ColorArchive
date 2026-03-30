import SwiftUI

struct ColorSearchView: View {
    @EnvironmentObject var colorStore: ColorStore
    @EnvironmentObject var favoritesStore: FavoritesStore
    @State private var searchText = ""
    @State private var selectedColor: ColorRecord?

    private let columns = [
        GridItem(.adaptive(minimum: 100, maximum: 140), spacing: 12)
    ]

    var searchResults: [ColorRecord] {
        guard !searchText.isEmpty else { return [] }
        let query = searchText.lowercased()

        // Search by hex
        if query.hasPrefix("#") {
            return colorStore.colors.filter {
                $0.hex.lowercased().contains(query)
            }
        }

        // Search by name or family
        return colorStore.colors.filter {
            $0.name.lowercased().contains(query) ||
            $0.family.rawValue.lowercased().contains(query) ||
            $0.hex.lowercased().contains(query)
        }
    }

    var body: some View {
        NavigationStack {
            Group {
                if searchText.isEmpty {
                    VStack(spacing: 16) {
                        Image(systemName: "magnifyingglass")
                            .font(.system(size: 48))
                            .foregroundStyle(.tertiary)
                        Text("Search 5,446 colors")
                            .font(.headline)
                            .foregroundStyle(.secondary)
                        Text("By name, HEX code, or color family")
                            .font(.subheadline)
                            .foregroundStyle(.tertiary)
                    }
                    .frame(maxHeight: .infinity)
                } else if searchResults.isEmpty {
                    ContentUnavailableView.search(text: searchText)
                } else {
                    ScrollView {
                        Text("\(searchResults.count) results")
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .padding(.horizontal)

                        LazyVGrid(columns: columns, spacing: 14) {
                            ForEach(searchResults.prefix(200)) { color in
                                ColorCardView(
                                    color: color,
                                    isFavorite: favoritesStore.isFavorite(color.id),
                                    onTap: { selectedColor = color },
                                    onFavorite: { favoritesStore.toggle(color.id) }
                                )
                            }
                        }
                        .padding(.horizontal)
                    }
                }
            }
            .navigationTitle("Search")
            .searchable(text: $searchText, prompt: "Name, HEX, or family...")
            .navigationDestination(item: $selectedColor) { color in
                ColorDetailView(color: color)
            }
        }
    }
}
