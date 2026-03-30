import SwiftUI

struct ColorBrowseView: View {
    @Environment(ColorStore.self) var colorStore
    @Environment(FavoritesStore.self) var favoritesStore
    @State private var selectedColor: ColorRecord?

    private let columns = [
        GridItem(.adaptive(minimum: 100, maximum: 140), spacing: 12)
    ]

    var body: some View {
        @Bindable var colorStore = colorStore
        NavigationStack {
            ScrollView {
                VStack(spacing: 16) {
                    // Family filter chips
                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: 8) {
                            FilterChip(
                                title: "All",
                                isSelected: colorStore.selectedFamily == nil,
                                color: .primary
                            ) {
                                colorStore.selectedFamily = nil
                            }

                            ForEach(ColorFamily.allCases) { family in
                                FilterChip(
                                    title: family.rawValue,
                                    isSelected: colorStore.selectedFamily == family,
                                    color: family.displayColor
                                ) {
                                    colorStore.selectedFamily = family
                                }
                            }
                        }
                        .padding(.horizontal)
                    }

                    // Sort picker
                    HStack {
                        Text("\(colorStore.filteredColors.count) colors")
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                        Spacer()
                        Picker("Sort", selection: $colorStore.sortOption) {
                            ForEach(ColorStore.SortOption.allCases, id: \.self) { option in
                                Text(option.rawValue).tag(option)
                            }
                        }
                        .pickerStyle(.menu)
                    }
                    .padding(.horizontal)

                    if colorStore.isLoading {
                        ProgressView("Generating 5,446 colors...")
                            .padding(.top, 60)
                    } else {
                        LazyVGrid(columns: columns, spacing: 14) {
                            ForEach(colorStore.filteredColors) { color in
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
                .padding(.vertical)
            }
            .navigationTitle("ColorArchive")
            .navigationDestination(item: $selectedColor) { color in
                ColorDetailView(color: color)
            }
        }
    }
}

struct FilterChip: View {
    let title: String
    let isSelected: Bool
    let color: Color
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            Text(title)
                .font(.subheadline)
                .fontWeight(isSelected ? .semibold : .regular)
                .padding(.horizontal, 14)
                .padding(.vertical, 7)
                .background(
                    Capsule()
                        .fill(isSelected ? color.opacity(0.15) : Color.gray.opacity(0.12))
                )
                .foregroundStyle(isSelected ? color : .primary)
        }
        .buttonStyle(.plain)
    }
}
