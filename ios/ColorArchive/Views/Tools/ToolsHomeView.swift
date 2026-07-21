import SwiftUI

struct ToolItem: Identifiable {
    let id = UUID()
    let title: String
    let subtitle: String
    let icon: String
    let color: Color
    var requiresPro: Bool = false
}

private let proToolNames: Set<String> = [
    "AI Mood", "Image Palette", "Harmonies",
    "Colorblind", "Tints & Shades", "Mixer", "Gradient"
]

struct ToolsHomeView: View {
    @Environment(ColorStore.self) var colorStore
    @Environment(ProAccessManager.self) var proAccess

    private let tools: [ToolItem] = [
        ToolItem(title: "Palettes", subtitle: "Create, save & export custom palettes", icon: "paintpalette.fill", color: .orange),
        ToolItem(title: "Hue Challenge", subtitle: "Arrange the hues — score 0 is perfect", icon: "gamecontroller.fill", color: .mint),
        ToolItem(title: "AI Mood", subtitle: "Generate palette from mood or scene", icon: "sparkles", color: .purple, requiresPro: true),
        ToolItem(title: "Image Palette", subtitle: "Extract colors from photos", icon: "photo.on.rectangle.angled", color: .blue, requiresPro: true),
        ToolItem(title: "Harmonies", subtitle: "Complementary, analogous & triadic", icon: "circle.hexagongrid.fill", color: .pink, requiresPro: true),
        ToolItem(title: "Contrast", subtitle: "WCAG accessibility checker", icon: "eye.fill", color: .cyan),
        ToolItem(title: "Colorblind", subtitle: "Simulate color vision deficiency", icon: "eyeglasses", color: .teal, requiresPro: true),
        ToolItem(title: "Tints & Shades", subtitle: "Generate lightness variations", icon: "slider.horizontal.3", color: .yellow, requiresPro: true),
        ToolItem(title: "Converter", subtitle: "HEX ↔ RGB ↔ HSL ↔ CMYK", icon: "arrow.triangle.2.circlepath", color: .green),
        ToolItem(title: "Mixer", subtitle: "Blend two colors together", icon: "drop.fill", color: .red, requiresPro: true),
        ToolItem(title: "Gradient", subtitle: "Build CSS gradients", icon: "rectangle.fill", color: .indigo, requiresPro: true),
    ]

    @State private var selectedTool: String?
    var embedded = false

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
                        let locked = tool.requiresPro && !proAccess.isPro
                        NavigationLink(value: tool.title) {
                            VStack(alignment: .leading, spacing: 10) {
                                HStack {
                                    Image(systemName: tool.icon)
                                        .font(.title2)
                                        .foregroundStyle(locked ? .secondary : tool.color)
                                    Spacer()
                                    if locked {
                                        Image(systemName: "lock.fill")
                                            .font(.caption)
                                            .foregroundStyle(.orange)
                                    }
                                }

                                Text(tool.title)
                                    .font(.subheadline)
                                    .fontWeight(.semibold)
                                    .foregroundStyle(locked ? .secondary : .primary)

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
                let needsPro = proToolNames.contains(toolName)
                Group {
                    if needsPro {
                        ProGateView(featureName: toolName) {
                            toolView(for: toolName)
                        }
                    } else {
                        toolView(for: toolName)
                    }
                }
                // Single chokepoint for all tools — fires `tool_used` with the tool name
                // when any tool is opened (aligned by event name with the web tool_used).
                .onAppear { AnalyticsBootstrap.capture("tool_used", ["tool": toolName]) }
            }
        .navigationDestination(for: ColorRecord.self) { color in
            ColorDetailView(color: color)
        }
    }

    @ViewBuilder
    private func toolView(for name: String) -> some View {
        switch name {
        case "Palettes":
            PaletteBuilderView(embedded: true)
        case "Hue Challenge":
            HueArrangementView()
        case "AI Mood":
            AIMoodPaletteView()
        case "Image Palette":
            ImagePaletteView()
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
}
