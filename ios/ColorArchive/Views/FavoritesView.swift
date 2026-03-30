import SwiftUI

struct FavoritesView: View {
    @EnvironmentObject var colorStore: ColorStore
    @EnvironmentObject var favoritesStore: FavoritesStore
    @State private var selectedColor: ColorRecord?

    private let columns = [
        GridItem(.adaptive(minimum: 100, maximum: 140), spacing: 12)
    ]

    var favoriteColors: [ColorRecord] {
        colorStore.colors.filter { favoritesStore.isFavorite($0.id) }
    }

    var body: some View {
        NavigationStack {
            Group {
                if favoriteColors.isEmpty {
                    VStack(spacing: 16) {
                        Image(systemName: "heart")
                            .font(.system(size: 48))
                            .foregroundStyle(.tertiary)
                        Text("No favorites yet")
                            .font(.headline)
                            .foregroundStyle(.secondary)
                        Text("Tap the heart icon on any color to save it")
                            .font(.subheadline)
                            .foregroundStyle(.tertiary)
                    }
                    .frame(maxHeight: .infinity)
                } else {
                    ScrollView {
                        Text("\(favoriteColors.count) saved")
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .padding(.horizontal)

                        LazyVGrid(columns: columns, spacing: 14) {
                            ForEach(favoriteColors) { color in
                                ColorCardView(
                                    color: color,
                                    isFavorite: true,
                                    onTap: { selectedColor = color },
                                    onFavorite: { favoritesStore.toggle(color.id) }
                                )
                            }
                        }
                        .padding(.horizontal)
                    }
                }
            }
            .navigationTitle("Favorites")
            .navigationDestination(item: $selectedColor) { color in
                ColorDetailView(color: color)
            }
        }
    }
}
