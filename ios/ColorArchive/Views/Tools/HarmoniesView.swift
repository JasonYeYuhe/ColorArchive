import SwiftUI

struct HarmoniesView: View {
    @Environment(ColorStore.self) var colorStore
    @State private var selectedColor: ColorRecord?
    @State private var searchText = ""

    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                if let base = selectedColor {
                    // Selected color header
                    HStack(spacing: 16) {
                        RoundedRectangle(cornerRadius: 12)
                            .fill(base.swiftUIColor)
                            .frame(width: 80, height: 80)
                        VStack(alignment: .leading, spacing: 4) {
                            Text(base.name)
                                .font(.headline)
                            Text(base.hex)
                                .font(.subheadline)
                                .monospaced()
                                .foregroundStyle(.secondary)
                            Text(base.family.rawValue)
                                .font(.caption)
                                .foregroundStyle(.secondary)
                        }
                        Spacer()
                    }
                    .padding(.horizontal)

                    // Harmonies
                    harmonySection("Complementary", colors: [ColorRelationships.complementary(colorStore.colors, base: base)].compactMap { $0 })
                    harmonySection("Analogous", colors: ColorRelationships.analogous(colorStore.colors, base: base))
                    harmonySection("Triadic", colors: ColorRelationships.triadic(colorStore.colors, base: base))
                    harmonySection("Split-Complementary", colors: ColorRelationships.splitComplementary(colorStore.colors, base: base))
                    harmonySection("Tonal Strip", colors: Array(ColorRelationships.tonalStrip(colorStore.colors, base: base).prefix(8)))

                } else {
                    // Color picker
                    VStack(spacing: 12) {
                        Image(systemName: "circle.hexagongrid.fill")
                            .font(.system(size: 48))
                            .foregroundStyle(.purple.opacity(0.3))
                        Text("Select a base color")
                            .font(.headline)
                            .foregroundStyle(.secondary)
                        Text("Tap any color to see its harmonies")
                            .font(.subheadline)
                            .foregroundStyle(.tertiary)
                    }
                    .padding(.top, 40)
                }

                // Quick color grid
                let displayColors = searchText.isEmpty
                    ? Array(colorStore.colors.filter { $0.saturation >= 34 && $0.lightness >= 30 && $0.lightness <= 70 }.prefix(48))
                    : Array(colorStore.search(searchText).prefix(48))

                LazyVGrid(columns: [GridItem(.adaptive(minimum: 50))], spacing: 8) {
                    ForEach(displayColors) { color in
                        Button {
                            selectedColor = color
                            HapticManager.selection()
                        } label: {
                            RoundedRectangle(cornerRadius: 8)
                                .fill(color.swiftUIColor)
                                .frame(height: 50)
                                .overlay {
                                    if selectedColor?.id == color.id {
                                        RoundedRectangle(cornerRadius: 8)
                                            .stroke(.primary, lineWidth: 3)
                                    }
                                }
                        }
                        .buttonStyle(.plain)
                    }
                }
                .padding(.horizontal)
            }
            .padding(.vertical)
        }
        .navigationTitle("Color Harmonies")
        .searchable(text: $searchText, prompt: "Search colors...")
    }

    @ViewBuilder
    private func harmonySection(_ title: String, colors: [ColorRecord]) -> some View {
        if !colors.isEmpty {
            VStack(alignment: .leading, spacing: 10) {
                Text(title)
                    .font(.subheadline)
                    .fontWeight(.semibold)
                    .padding(.horizontal)

                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 12) {
                        ForEach(colors) { color in
                            VStack(spacing: 6) {
                                RoundedRectangle(cornerRadius: 10)
                                    .fill(color.swiftUIColor)
                                    .frame(width: 70, height: 70)
                                    .shadow(color: color.swiftUIColor.opacity(0.3), radius: 4, y: 2)
                                Text(color.hex)
                                    .font(.caption2)
                                    .monospaced()
                                    .foregroundStyle(.secondary)
                            }
                        }
                    }
                    .padding(.horizontal)
                }
            }
        }
    }
}
