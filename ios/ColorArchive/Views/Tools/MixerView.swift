import SwiftUI

struct MixerView: View {
    @Environment(ColorStore.self) var colorStore
    @State private var color1: ColorRecord?
    @State private var color2: ColorRecord?
    @State private var steps = 5
    @State private var mode: MixMode = .hsl
    @State private var showingPicker = false
    @State private var pickingFor = 1

    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                // Color selectors
                HStack(spacing: 16) {
                    colorButton("Color 1", color: color1) { pickingFor = 1; showingPicker = true }
                    Image(systemName: "plus").foregroundStyle(.secondary)
                    colorButton("Color 2", color: color2) { pickingFor = 2; showingPicker = true }
                }
                .padding(.horizontal)

                // Controls
                HStack {
                    Text("Steps: \(steps)")
                        .font(.subheadline)
                    Slider(value: Binding(get: { Double(steps) }, set: { steps = Int($0) }), in: 1...10, step: 1)
                    Picker("Mode", selection: $mode) {
                        ForEach(MixMode.allCases, id: \.self) { Text($0.rawValue) }
                    }
                    .pickerStyle(.segmented)
                    .frame(width: 120)
                }
                .padding(.horizontal)

                // Mix result
                if let c1 = color1, let c2 = color2 {
                    let mixColors = ColorMixer.mix(color1: c1, color2: c2, steps: steps, mode: mode)

                    HStack(spacing: 0) {
                        ForEach(mixColors.indices, id: \.self) { i in
                            let mc = mixColors[i]
                            Color(red: Double(mc.r)/255, green: Double(mc.g)/255, blue: Double(mc.b)/255)
                                .frame(height: 60)
                        }
                    }
                    .clipShape(RoundedRectangle(cornerRadius: 12))
                    .padding(.horizontal)

                    // HEX values
                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: 8) {
                            ForEach(mixColors.indices, id: \.self) { i in
                                VStack(spacing: 4) {
                                    RoundedRectangle(cornerRadius: 6)
                                        .fill(Color(red: Double(mixColors[i].r)/255, green: Double(mixColors[i].g)/255, blue: Double(mixColors[i].b)/255))
                                        .frame(width: 40, height: 40)
                                    Text(mixColors[i].hex)
                                        .font(.system(size: 8))
                                        .monospaced()
                                        .foregroundStyle(.secondary)
                                }
                            }
                        }
                        .padding(.horizontal)
                    }
                } else {
                    VStack(spacing: 12) {
                        Image(systemName: "drop.fill")
                            .font(.system(size: 48))
                            .foregroundStyle(.pink.opacity(0.3))
                        Text("Select two colors to mix")
                            .font(.headline)
                            .foregroundStyle(.secondary)
                    }
                    .padding(.top, 30)
                }
            }
            .padding(.vertical)
        }
        .navigationTitle("Color Mixer")
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
                Text(color?.hex ?? label)
                    .font(.caption)
                    .monospaced()
                    .foregroundStyle(.secondary)
            }
            .frame(maxWidth: .infinity)
        }
        .buttonStyle(.plain)
    }
}
