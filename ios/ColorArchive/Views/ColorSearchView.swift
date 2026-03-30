import SwiftUI

struct ColorSearchView: View {
    @Environment(ColorStore.self) var colorStore
    @Environment(FavoritesStore.self) var favoritesStore
    @State private var searchText = ""
    @State private var selectedColor: ColorRecord?

    private let columns = [
        GridItem(.adaptive(minimum: 100, maximum: 140), spacing: 12)
    ]

    var searchResults: [ColorRecord] {
        guard !searchText.isEmpty else { return [] }
        return colorStore.search(searchText)
    }

    /// Suggested search tags
    private let suggestions = ["sunset", "ocean", "pastel", "minimal", "tropical", "vintage", "tech", "zen", "autumn", "wedding"]

    var body: some View {
        NavigationStack {
            Group {
                if searchText.isEmpty {
                    VStack(spacing: 20) {
                        Image(systemName: "magnifyingglass")
                            .font(.system(size: 48))
                            .foregroundStyle(.tertiary)
                        Text("Search 5,446 colors")
                            .font(.headline)
                            .foregroundStyle(.secondary)
                        Text("By name, HEX, family, or mood")
                            .font(.subheadline)
                            .foregroundStyle(.tertiary)

                        // Suggestion tags
                        VStack(spacing: 10) {
                            Text("Try a mood")
                                .font(.caption)
                                .foregroundStyle(.tertiary)
                            FlowLayout(spacing: 8) {
                                ForEach(suggestions, id: \.self) { tag in
                                    Button {
                                        searchText = tag
                                    } label: {
                                        Text(tag)
                                            .font(.caption)
                                            .padding(.horizontal, 12)
                                            .padding(.vertical, 6)
                                            .background(Color.gray.opacity(0.1), in: Capsule())
                                            .foregroundStyle(.secondary)
                                    }
                                    .buttonStyle(.plain)
                                }
                            }
                            .padding(.horizontal, 40)
                        }
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

                        // Show semantic expansion hint
                        if let expanded = SemanticSearch.expandQuery(searchText.lowercased()) {
                            Text("Searching: \(expanded.prefix(4).joined(separator: ", "))...")
                                .font(.caption2)
                                .foregroundStyle(.orange)
                                .frame(maxWidth: .infinity, alignment: .leading)
                                .padding(.horizontal)
                        }

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
            .searchable(text: $searchText, prompt: "Name, HEX, or mood...")
            .navigationDestination(item: $selectedColor) { color in
                ColorDetailView(color: color)
            }
        }
    }
}

/// Simple flow layout for tag chips
struct FlowLayout: Layout {
    var spacing: CGFloat = 8

    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        let result = arrange(proposal: proposal, subviews: subviews)
        return result.size
    }

    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        let result = arrange(proposal: proposal, subviews: subviews)
        for (index, position) in result.positions.enumerated() {
            subviews[index].place(at: CGPoint(x: bounds.minX + position.x, y: bounds.minY + position.y), proposal: .unspecified)
        }
    }

    private func arrange(proposal: ProposedViewSize, subviews: Subviews) -> (positions: [CGPoint], size: CGSize) {
        let maxWidth = proposal.width ?? .infinity
        var positions: [CGPoint] = []
        var x: CGFloat = 0
        var y: CGFloat = 0
        var rowHeight: CGFloat = 0

        for subview in subviews {
            let size = subview.sizeThatFits(.unspecified)
            if x + size.width > maxWidth && x > 0 {
                x = 0
                y += rowHeight + spacing
                rowHeight = 0
            }
            positions.append(CGPoint(x: x, y: y))
            rowHeight = max(rowHeight, size.height)
            x += size.width + spacing
        }

        return (positions, CGSize(width: maxWidth, height: y + rowHeight))
    }
}
