import SwiftUI

struct ContrastCheckerView: View {
    @Environment(ColorStore.self) var colorStore
    @State private var foreground: ColorRecord?
    @State private var background: ColorRecord?
    @State private var showingPicker = false
    @State private var pickingFor: PickTarget = .foreground

    enum PickTarget { case foreground, background }

    var contrastRatio: Double? {
        guard let fg = foreground, let bg = background else { return nil }
        return ColorContrast.contrastRatio(fg, bg)
    }

    var wcagGrade: WcagGrade? {
        guard let ratio = contrastRatio else { return nil }
        return WcagGrade.from(ratio: ratio)
    }

    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                // Color pair selection
                HStack(spacing: 16) {
                    colorSelector("Foreground", color: foreground) {
                        pickingFor = .foreground
                        showingPicker = true
                    }
                    Image(systemName: "arrow.left.arrow.right")
                        .foregroundStyle(.secondary)
                    colorSelector("Background", color: background) {
                        pickingFor = .background
                        showingPicker = true
                    }
                }
                .padding(.horizontal)

                // Preview
                if let fg = foreground, let bg = background {
                    VStack(spacing: 16) {
                        // Text preview
                        VStack(spacing: 8) {
                            Text("Large Text (18pt+)")
                                .font(.title3)
                                .fontWeight(.bold)
                                .foregroundColor(fg.swiftUIColor)
                            Text("Normal body text at standard size")
                                .font(.body)
                                .foregroundColor(fg.swiftUIColor)
                            Text("Small caption text")
                                .font(.caption)
                                .foregroundColor(fg.swiftUIColor)
                        }
                        .frame(maxWidth: .infinity)
                        .padding(24)
                        .background(bg.swiftUIColor, in: RoundedRectangle(cornerRadius: 16))

                        // Ratio display
                        if let ratio = contrastRatio, let grade = wcagGrade {
                            HStack(spacing: 16) {
                                VStack(spacing: 4) {
                                    Text(String(format: "%.1f:1", ratio))
                                        .font(.system(.title, design: .rounded))
                                        .fontWeight(.bold)
                                    Text("Contrast Ratio")
                                        .font(.caption)
                                        .foregroundStyle(.secondary)
                                }

                                Divider().frame(height: 50)

                                VStack(spacing: 8) {
                                    gradeRow("AAA (7:1)", passed: ratio >= 7.0)
                                    gradeRow("AA (4.5:1)", passed: ratio >= 4.5)
                                    gradeRow("AA Large (3:1)", passed: ratio >= 3.0)
                                }
                            }
                            .padding()
                            .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 14))
                        }
                    }
                    .padding(.horizontal)

                    // WCAG pairings
                    let pairings = ColorContrast.wcagPairings(colorStore.colors, base: fg, limit: 12)
                    if !pairings.isEmpty {
                        VStack(alignment: .leading, spacing: 10) {
                            Text("Best Accessible Pairings")
                                .font(.headline)
                                .padding(.horizontal)

                            ForEach(pairings, id: \.color.id) { pairing in
                                HStack(spacing: 12) {
                                    RoundedRectangle(cornerRadius: 8)
                                        .fill(pairing.color.swiftUIColor)
                                        .frame(width: 44, height: 44)
                                    VStack(alignment: .leading) {
                                        Text(pairing.color.name)
                                            .font(.subheadline)
                                        Text(pairing.color.hex)
                                            .font(.caption)
                                            .monospaced()
                                            .foregroundStyle(.secondary)
                                    }
                                    Spacer()
                                    Text(String(format: "%.1f:1", pairing.ratio))
                                        .font(.caption)
                                        .monospaced()
                                    Text(pairing.grade.rawValue)
                                        .font(.caption2)
                                        .fontWeight(.semibold)
                                        .padding(.horizontal, 8)
                                        .padding(.vertical, 3)
                                        .background(pairing.grade == .aaa ? Color.green.opacity(0.15) : pairing.grade == .aa ? Color.blue.opacity(0.15) : Color.orange.opacity(0.15))
                                        .clipShape(Capsule())
                                }
                                .padding(.horizontal)
                            }
                        }
                    }
                } else {
                    VStack(spacing: 12) {
                        Image(systemName: "eye.fill")
                            .font(.system(size: 48))
                            .foregroundStyle(.blue.opacity(0.3))
                        Text("Select two colors to check contrast")
                            .font(.headline)
                            .foregroundStyle(.secondary)
                    }
                    .padding(.top, 40)
                }
            }
            .padding(.vertical)
        }
        .navigationTitle("Contrast Checker")
        .sheet(isPresented: $showingPicker) {
            ColorPickerSheet { color in
                switch pickingFor {
                case .foreground: foreground = color
                case .background: background = color
                }
                showingPicker = false
            }
        }
    }

    @ViewBuilder
    private func colorSelector(_ label: String, color: ColorRecord?, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            VStack(spacing: 8) {
                if let color {
                    RoundedRectangle(cornerRadius: 12)
                        .fill(color.swiftUIColor)
                        .frame(height: 80)
                } else {
                    RoundedRectangle(cornerRadius: 12)
                        .fill(Color.gray.opacity(0.15))
                        .frame(height: 80)
                        .overlay {
                            Image(systemName: "plus")
                                .font(.title2)
                                .foregroundStyle(.secondary)
                        }
                }
                Text(label)
                    .font(.caption)
                    .foregroundStyle(.secondary)
                Text(color?.hex ?? "Tap to select")
                    .font(.caption2)
                    .monospaced()
                    .foregroundStyle(.tertiary)
            }
            .frame(maxWidth: .infinity)
        }
        .buttonStyle(.plain)
    }

    private func gradeRow(_ label: String, passed: Bool) -> some View {
        HStack(spacing: 6) {
            Image(systemName: passed ? "checkmark.circle.fill" : "xmark.circle.fill")
                .foregroundStyle(passed ? .green : .red)
                .font(.caption)
            Text(label)
                .font(.caption)
        }
    }
}

// MARK: - Color Picker Sheet

struct ColorPickerSheet: View {
    @Environment(ColorStore.self) var colorStore
    @State private var searchText = ""
    let onSelect: (ColorRecord) -> Void

    var displayColors: [ColorRecord] {
        if searchText.isEmpty {
            return Array(colorStore.colors.filter { $0.saturation >= 20 }.prefix(100))
        }
        return Array(colorStore.search(searchText).prefix(100))
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                LazyVGrid(columns: [GridItem(.adaptive(minimum: 60))], spacing: 8) {
                    ForEach(displayColors) { color in
                        Button {
                            onSelect(color)
                        } label: {
                            VStack(spacing: 4) {
                                RoundedRectangle(cornerRadius: 8)
                                    .fill(color.swiftUIColor)
                                    .frame(height: 50)
                                Text(color.hex)
                                    .font(.system(size: 8))
                                    .monospaced()
                                    .foregroundStyle(.secondary)
                            }
                        }
                        .buttonStyle(.plain)
                    }
                }
                .padding()
            }
            .navigationTitle("Pick a Color")
            .navigationBarTitleDisplayMode(.inline)
            .searchable(text: $searchText, prompt: "Name, HEX, or mood...")
        }
    }
}
