import SwiftUI

struct CollectionsView: View {
    @Environment(ColorStore.self) var colorStore
    @State private var selectedTag = "All"
    @State private var selectedCollection: ColorCollection?

    var filteredCollections: [ColorCollection] {
        CollectionsData.filtered(by: selectedTag)
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 16) {
                    // Tag filter
                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: 8) {
                            ForEach(CollectionsData.allTags, id: \.self) { tag in
                                Button {
                                    selectedTag = tag
                                } label: {
                                    Text(tag)
                                        .font(.caption)
                                        .padding(.horizontal, 12)
                                        .padding(.vertical, 6)
                                        .background(selectedTag == tag ? Color.primary.opacity(0.1) : Color.gray.opacity(0.08), in: Capsule())
                                        .foregroundStyle(selectedTag == tag ? .primary : .secondary)
                                }
                                .buttonStyle(.plain)
                            }
                        }
                        .padding(.horizontal)
                    }

                    // Collection cards
                    LazyVStack(spacing: 16) {
                        ForEach(filteredCollections) { collection in
                            NavigationLink(value: collection.id) {
                                collectionCard(collection)
                            }
                            .buttonStyle(.plain)
                        }
                    }
                    .padding(.horizontal)
                }
                .padding(.vertical)
            }
            .navigationTitle("Collections")
            .navigationDestination(for: String.self) { collectionId in
                if let collection = CollectionsData.collection(byId: collectionId) {
                    CollectionDetailView(collection: collection)
                }
            }
        }
    }

    @ViewBuilder
    private func collectionCard(_ collection: ColorCollection) -> some View {
        VStack(alignment: .leading, spacing: 10) {
            // Color strip
            let colors = collection.colorIds.compactMap { colorStore.color(byId: $0) }
            if !colors.isEmpty {
                HStack(spacing: 0) {
                    ForEach(colors) { color in
                        color.swiftUIColor
                            .frame(height: 60)
                    }
                }
                .clipShape(RoundedRectangle(cornerRadius: 12))
            }

            Text(collection.title)
                .font(.subheadline)
                .fontWeight(.semibold)
                .foregroundStyle(.primary)

            Text(collection.summary)
                .font(.caption)
                .foregroundStyle(.secondary)
                .lineLimit(2)

            HStack(spacing: 6) {
                ForEach(collection.tags, id: \.self) { tag in
                    Text(tag)
                        .font(.system(size: 10))
                        .padding(.horizontal, 8)
                        .padding(.vertical, 3)
                        .background(Color.gray.opacity(0.1), in: Capsule())
                        .foregroundStyle(.tertiary)
                }
            }
        }
        .padding(14)
        .background(.background, in: RoundedRectangle(cornerRadius: 16))
        .shadow(color: .black.opacity(0.05), radius: 8, y: 2)
    }
}

// MARK: - Collection Detail

struct CollectionDetailView: View {
    let collection: ColorCollection
    @Environment(ColorStore.self) var colorStore
    @Environment(FavoritesStore.self) var favoritesStore
    @State private var selectedColor: ColorRecord?

    var colors: [ColorRecord] {
        collection.colorIds.compactMap { colorStore.color(byId: $0) }
    }

    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                // Color strip
                HStack(spacing: 0) {
                    ForEach(colors) { color in
                        color.swiftUIColor.frame(height: 100)
                    }
                }
                .clipShape(RoundedRectangle(cornerRadius: 16))
                .shadow(radius: 8, y: 4)
                .padding(.horizontal)

                // Info
                VStack(alignment: .leading, spacing: 8) {
                    Text(collection.summary)
                        .font(.subheadline)
                        .foregroundStyle(.secondary)

                    HStack(spacing: 6) {
                        ForEach(collection.tags, id: \.self) { tag in
                            Text(tag)
                                .font(.caption2)
                                .padding(.horizontal, 8)
                                .padding(.vertical, 3)
                                .background(Color.gray.opacity(0.1), in: Capsule())
                        }
                    }
                }
                .padding(.horizontal)

                // Colors
                ForEach(colors) { color in
                    Button { selectedColor = color } label: {
                        HStack(spacing: 14) {
                            RoundedRectangle(cornerRadius: 10)
                                .fill(color.swiftUIColor)
                                .frame(width: 56, height: 56)
                                .shadow(color: color.swiftUIColor.opacity(0.3), radius: 4, y: 2)
                            VStack(alignment: .leading, spacing: 4) {
                                Text(color.name)
                                    .font(.subheadline)
                                    .fontWeight(.medium)
                                    .foregroundStyle(.primary)
                                Text("\(color.hex) · \(color.family.rawValue)")
                                    .font(.caption)
                                    .monospaced()
                                    .foregroundStyle(.secondary)
                            }
                            Spacer()
                            Button { favoritesStore.toggle(color.id) } label: {
                                Image(systemName: favoritesStore.isFavorite(color.id) ? "heart.fill" : "heart")
                                    .foregroundStyle(favoritesStore.isFavorite(color.id) ? .red : .secondary)
                            }
                        }
                    }
                    .buttonStyle(.plain)
                    .padding(.horizontal)
                }

                // Use cases
                if !collection.useCases.isEmpty {
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Use Cases")
                            .font(.headline)
                        ForEach(collection.useCases, id: \.self) { useCase in
                            Label(useCase, systemImage: "checkmark.circle")
                                .font(.subheadline)
                                .foregroundStyle(.secondary)
                        }
                    }
                    .padding(.horizontal)
                }
            }
            .padding(.vertical)
        }
        .navigationTitle(collection.title)
        #if os(iOS)
        .navigationBarTitleDisplayMode(.inline)
        #endif
        .navigationDestination(item: $selectedColor) { color in
            ColorDetailView(color: color)
        }
    }
}
