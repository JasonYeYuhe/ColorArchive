import SwiftUI

struct GradientBuilderView: View {
    @Environment(ColorStore.self) var colorStore
    @State private var color1: ColorRecord?
    @State private var color2: ColorRecord?
    @State private var angle: Double = 135
    @State private var showingPicker = false
    @State private var pickingFor = 1

    var gradient: LinearGradient? {
        guard let c1 = color1, let c2 = color2 else { return nil }
        return LinearGradient(
            colors: [c1.swiftUIColor, c2.swiftUIColor],
            startPoint: gradientStart,
            endPoint: gradientEnd
        )
    }

    var gradientStart: UnitPoint {
        let rad = angle * .pi / 180
        return UnitPoint(x: 0.5 - cos(rad) * 0.5, y: 0.5 - sin(rad) * 0.5)
    }

    var gradientEnd: UnitPoint {
        let rad = angle * .pi / 180
        return UnitPoint(x: 0.5 + cos(rad) * 0.5, y: 0.5 + sin(rad) * 0.5)
    }

    var cssCode: String {
        guard let c1 = color1, let c2 = color2 else { return "" }
        return "background: linear-gradient(\(Int(angle))deg, \(c1.hex), \(c2.hex));"
    }

    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                // Preview
                if let gradient {
                    RoundedRectangle(cornerRadius: 20)
                        .fill(gradient)
                        .frame(height: 200)
                        .shadow(radius: 10, y: 5)
                        .padding(.horizontal)
                } else {
                    RoundedRectangle(cornerRadius: 20)
                        .fill(Color.gray.opacity(0.1))
                        .frame(height: 200)
                        .overlay {
                            VStack(spacing: 8) {
                                Image(systemName: "rectangle.fill")
                                    .font(.system(size: 40))
                                    .foregroundStyle(.indigo.opacity(0.3))
                                Text("Select two colors")
                                    .font(.subheadline)
                                    .foregroundStyle(.secondary)
                            }
                        }
                        .padding(.horizontal)
                }

                // Color selectors
                HStack(spacing: 16) {
                    colorButton("Start", color: color1) { pickingFor = 1; showingPicker = true }
                    colorButton("End", color: color2) { pickingFor = 2; showingPicker = true }
                }
                .padding(.horizontal)

                // Angle control
                VStack(spacing: 8) {
                    Text("Angle: \(Int(angle))°")
                        .font(.subheadline)
                    Slider(value: $angle, in: 0...360, step: 15)
                }
                .padding(.horizontal)

                // CSS export
                if !cssCode.isEmpty {
                    Button {
                        #if os(iOS)
                        UIPasteboard.general.string = cssCode
                        #elseif os(macOS)
                        NSPasteboard.general.clearContents()
                        NSPasteboard.general.setString(cssCode, forType: .string)
                        #endif
                        HapticManager.success()
                    } label: {
                        HStack {
                            Text(cssCode)
                                .font(.system(.caption, design: .monospaced))
                                .foregroundStyle(.primary)
                                .lineLimit(2)
                            Spacer()
                            Image(systemName: "doc.on.doc")
                                .foregroundStyle(.secondary)
                        }
                        .padding()
                        .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 12))
                    }
                    .buttonStyle(.plain)
                    .padding(.horizontal)
                }
            }
            .padding(.vertical)
        }
        .navigationTitle("Gradient Builder")
        .sheet(isPresented: $showingPicker) {
            ColorPickerSheet { color in
                if pickingFor == 1 { color1 = color } else { color2 = color }
                showingPicker = false
            }
        }
    }

    @ViewBuilder
    private func colorButton(_ label: String, color: ColorRecord?, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            VStack(spacing: 6) {
                if let color {
                    RoundedRectangle(cornerRadius: 10)
                        .fill(color.swiftUIColor)
                        .frame(height: 60)
                } else {
                    RoundedRectangle(cornerRadius: 10)
                        .fill(Color.gray.opacity(0.15))
                        .frame(height: 60)
                        .overlay { Image(systemName: "plus").foregroundStyle(.secondary) }
                }
                Text(color?.hex ?? label).font(.caption).monospaced().foregroundStyle(.secondary)
            }
            .frame(maxWidth: .infinity)
        }
        .buttonStyle(.plain)
    }
}
