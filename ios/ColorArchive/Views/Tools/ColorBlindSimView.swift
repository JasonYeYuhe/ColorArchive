import SwiftUI

struct ColorBlindSimView: View {
    @Environment(ColorStore.self) var colorStore
    @State private var selectedColor: ColorRecord?
    @State private var searchText = ""

    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                if let color = selectedColor {
                    // Original color
                    VStack(spacing: 8) {
                        RoundedRectangle(cornerRadius: 14)
                            .fill(color.swiftUIColor)
                            .frame(height: 100)
                        Text("\(color.name) — \(color.hex)")
                            .font(.subheadline)
                            .fontWeight(.medium)
                    }
                    .padding(.horizontal)

                    // Simulations
                    ForEach(ColorBlindType.allCases) { type in
                        HStack(spacing: 16) {
                            RoundedRectangle(cornerRadius: 10)
                                .fill(ColorBlindSim.simulateColor(color, type: type))
                                .frame(width: 70, height: 70)

                            VStack(alignment: .leading, spacing: 4) {
                                Text(type.label)
                                    .font(.subheadline)
                                    .fontWeight(.semibold)
                                Text(type.description)
                                    .font(.caption2)
                                    .foregroundStyle(.secondary)
                                    .lineLimit(2)
                                HStack(spacing: 4) {
                                    Text(ColorBlindSim.simulateHex(color, type: type))
                                        .font(.caption2)
                                        .monospaced()
                                        .foregroundStyle(.secondary)
                                    Text("·")
                                    Text(type.prevalence)
                                        .font(.caption2)
                                        .foregroundStyle(.tertiary)
                                }
                            }
                            Spacer()
                        }
                        .padding(.horizontal)
                    }
                } else {
                    VStack(spacing: 12) {
                        Image(systemName: "eyeglasses")
                            .font(.system(size: 48))
                            .foregroundStyle(.teal.opacity(0.3))
                        Text("Select a color to simulate")
                            .font(.headline)
                            .foregroundStyle(.secondary)
                    }
                    .padding(.top, 40)
                }

                // Quick color grid
                let displayColors = searchText.isEmpty
                    ? Array(colorStore.colors.filter { $0.saturation >= 34 }.prefix(48))
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
        .navigationTitle("Colorblind Simulator")
        .searchable(text: $searchText, prompt: "Search colors...")
    }
}
