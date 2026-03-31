import SwiftUI

struct FavoritesView: View {
    @Environment(ColorStore.self) var colorStore
    @Environment(FavoritesStore.self) var favoritesStore
    @State private var selectedColor: ColorRecord?
    var embedded = false

    private let columns = [
        GridItem(.adaptive(minimum: 100, maximum: 140), spacing: 12)
    ]

    var favoriteColors: [ColorRecord] {
        favoritesStore.favoriteColors(from: colorStore.colors)
    }

    var body: some View {
        if embedded {
            content
        } else {
            NavigationStack {
                content
            }
        }
    }

    @ViewBuilder
    private var content: some View {
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
                                .contextMenu {
                                    Button {
                                        #if os(iOS)
                                        UIPasteboard.general.string = color.hex
                                        #elseif os(macOS)
                                        NSPasteboard.general.clearContents()
                                        NSPasteboard.general.setString(color.hex, forType: .string)
                                        #endif
                                        HapticManager.success()
                                    } label: {
                                        Label("Copy HEX", systemImage: "doc.on.doc")
                                    }
                                    Button(role: .destructive) {
                                        favoritesStore.toggle(color.id)
                                    } label: {
                                        Label("Remove", systemImage: "heart.slash")
                                    }
                                }
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
