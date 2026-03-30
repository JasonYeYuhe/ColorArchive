import SwiftUI

struct ToolItem: Identifiable {
    let id = UUID()
    let title: String
    let subtitle: String
    let icon: String
    let color: Color
}

struct ToolsHomeView: View {
    @Environment(ColorStore.self) var colorStore

    private let tools: [ToolItem] = [
        ToolItem(title: "Harmonies", subtitle: "Find complementary, analogous & triadic colors", icon: "circle.hexagongrid.fill", color: .purple),
        ToolItem(title: "Contrast", subtitle: "WCAG accessibility checker", icon: "eye.fill", color: .blue),
        ToolItem(title: "Colorblind", subtitle: "Simulate color vision deficiency", icon: "eyeglasses", color: .teal),
        ToolItem(title: "Tints & Shades", subtitle: "Generate lightness variations", icon: "slider.horizontal.3", color: .orange),
        ToolItem(title: "Converter", subtitle: "HEX ↔ RGB ↔ HSL ↔ CMYK", icon: "arrow.triangle.2.circlepath", color: .green),
        ToolItem(title: "Mixer", subtitle: "Blend two colors together", icon: "drop.fill", color: .pink),
        ToolItem(title: "Gradient", subtitle: "Build CSS gradients", icon: "rectangle.fill", color: .indigo),
    ]

    @State private var selectedTool: String?

    var body: some View {
        NavigationStack {
            ScrollView {
                // Color of the Day banner
                if let cotd = colorStore.colorOfDay() {
                    NavigationLink(value: cotd) {
                        HStack(spacing: 16) {
                            RoundedRectangle(cornerRadius: 12)
                                .fill(cotd.swiftUIColor)
                                .frame(width: 60, height: 60)
                                .shadow(color: cotd.swiftUIColor.opacity(0.4), radius: 6, y: 3)

                            VStack(alignment: .leading, spacing: 4) {
                                Text("Color of the Day")
                                    .font(.caption)
                                    .foregroundStyle(.secondary)
                                Text(cotd.name)
                                    .font(.headline)
                                Text(cotd.hex)
                                    .font(.caption)
                                    .monospaced()
                                    .foregroundStyle(.secondary)
                            }
                            Spacer()
                            Image(systemName: "chevron.right")
                                .foregroundStyle(.tertiary)
                        }
                        .padding()
                        .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 16))
                    }
                    .buttonStyle(.plain)
                    .padding(.horizontal)
                }

                // Tool grid
                LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 14) {
                    ForEach(tools) { tool in
                        NavigationLink(value: tool.title) {
                            VStack(alignment: .leading, spacing: 10) {
                                Image(systemName: tool.icon)
                                    .font(.title2)
                                    .foregroundStyle(tool.color)

                                Text(tool.title)
                                    .font(.subheadline)
                                    .fontWeight(.semibold)
                                    .foregroundStyle(.primary)

                                Text(tool.subtitle)
                                    .font(.caption2)
                                    .foregroundStyle(.secondary)
                                    .lineLimit(2)
                            }
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .padding(14)
                            .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 14))
                        }
                        .buttonStyle(.plain)
                    }
                }
                .padding(.horizontal)
                .padding(.top, 8)
            }
            .navigationTitle("Tools")
            .navigationDestination(for: String.self) { toolName in
                switch toolName {
                case "Harmonies":
                    HarmoniesView()
                case "Contrast":
                    ContrastCheckerView()
                case "Colorblind":
                    ColorBlindSimView()
                case "Tints & Shades":
                    TintsShadesView()
                case "Converter":
                    ConverterView()
                case "Mixer":
                    MixerView()
                case "Gradient":
                    GradientBuilderView()
                default:
                    Text("Coming Soon")
                }
            }
            .navigationDestination(for: ColorRecord.self) { color in
                ColorDetailView(color: color)
            }
        }
    }
}
