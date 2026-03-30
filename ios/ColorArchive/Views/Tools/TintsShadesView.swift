import SwiftUI

struct TintsShadesView: View {
    @Environment(ColorStore.self) var colorStore
    @State private var selectedColor: ColorRecord?
    @State private var searchText = ""

    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                if let color = selectedColor {
                    let strip = ColorRelationships.tonalStrip(colorStore.colors, base: color)

                    // Tonal strip visualization
                    VStack(alignment: .leading, spacing: 12) {
                        Text("Tonal Strip — \(color.name)")
                            .font(.headline)
                            .padding(.horizontal)

                        ForEach(strip) { tone in
                            HStack(spacing: 12) {
                                RoundedRectangle(cornerRadius: 8)
                                    .fill(tone.swiftUIColor)
                                    .frame(width: 60, height: 40)
                                VStack(alignment: .leading, spacing: 2) {
                                    Text(tone.name)
                                        .font(.caption)
                                        .fontWeight(tone.id == color.id ? .bold : .regular)
                                    Text("\(tone.hex) · L\(tone.lightness)%")
                                        .font(.caption2)
                                        .monospaced()
                                        .foregroundStyle(.secondary)
                                }
                                Spacer()
                                if tone.id == color.id {
                                    Image(systemName: "arrow.left")
                                        .font(.caption)
                                        .foregroundStyle(.orange)
                                }
                            }
                            .padding(.horizontal)
                        }
                    }

                    // Generated tints & shades (not just archive)
                    VStack(alignment: .leading, spacing: 12) {
                        Text("Generated Tints & Shades")
                            .font(.headline)
                            .padding(.horizontal)

                        HStack(spacing: 0) {
                            ForEach(0..<11, id: \.self) { i in
                                let l = 5 + i * 9 // 5% to 95%
                                let rgb = ColorConvert.hslToRgb(hue: color.hue, saturation: color.saturation, lightness: l)
                                Color(red: Double(rgb.r)/255, green: Double(rgb.g)/255, blue: Double(rgb.b)/255)
                                    .frame(height: 50)
                            }
                        }
                        .clipShape(RoundedRectangle(cornerRadius: 12))
                        .padding(.horizontal)
                    }
                } else {
                    VStack(spacing: 12) {
                        Image(systemName: "slider.horizontal.3")
                            .font(.system(size: 48))
                            .foregroundStyle(.orange.opacity(0.3))
                        Text("Select a color to see tints & shades")
                            .font(.headline)
                            .foregroundStyle(.secondary)
                    }
                    .padding(.top, 40)
                }

                // Color grid
                let displayColors = searchText.isEmpty
                    ? Array(colorStore.colors.filter { $0.saturation >= 34 && $0.lightness >= 40 && $0.lightness <= 60 }.prefix(48))
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
                                        RoundedRectangle(cornerRadius: 8).stroke(.primary, lineWidth: 3)
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
        .navigationTitle("Tints & Shades")
        .searchable(text: $searchText, prompt: "Search colors...")
    }
}
