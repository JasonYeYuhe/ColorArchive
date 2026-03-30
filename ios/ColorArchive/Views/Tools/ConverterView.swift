import SwiftUI

struct ConverterView: View {
    @State private var hexInput = "#4A90D9"

    var rgb: (r: Int, g: Int, b: Int)? {
        ColorConvert.hexToRgb(hexInput)
    }

    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                // HEX input
                VStack(alignment: .leading, spacing: 8) {
                    Text("Enter HEX Color")
                        .font(.subheadline)
                        .fontWeight(.semibold)
                    TextField("#RRGGBB", text: $hexInput)
                        .font(.system(.title3, design: .monospaced))
                        .textFieldStyle(.roundedBorder)
                        .autocorrectionDisabled()
                        #if os(iOS)
                        .textInputAutocapitalization(.never)
                        #endif
                }
                .padding(.horizontal)

                if let rgb {
                    // Color preview
                    RoundedRectangle(cornerRadius: 16)
                        .fill(Color(red: Double(rgb.r)/255, green: Double(rgb.g)/255, blue: Double(rgb.b)/255))
                        .frame(height: 120)
                        .shadow(color: Color(red: Double(rgb.r)/255, green: Double(rgb.g)/255, blue: Double(rgb.b)/255).opacity(0.4), radius: 8, y: 4)
                        .padding(.horizontal)

                    let hsl = ColorConvert.rgbToHsl(r: rgb.r, g: rgb.g, b: rgb.b)
                    let hsb = ColorConvert.rgbToHsb(r: rgb.r, g: rgb.g, b: rgb.b)
                    let cmyk = ColorConvert.rgbToCmyk(r: rgb.r, g: rgb.g, b: rgb.b)

                    // Value rows
                    VStack(spacing: 0) {
                        valueRow("HEX", value: hexInput.uppercased())
                        Divider()
                        valueRow("RGB", value: "rgb(\(rgb.r), \(rgb.g), \(rgb.b))")
                        Divider()
                        valueRow("HSL", value: "hsl(\(hsl.h), \(hsl.s)%, \(hsl.l)%)")
                        Divider()
                        valueRow("HSB", value: "hsb(\(hsb.h), \(hsb.s)%, \(hsb.b)%)")
                        Divider()
                        valueRow("CMYK", value: "cmyk(\(cmyk.c)%, \(cmyk.m)%, \(cmyk.y)%, \(cmyk.k)%)")
                    }
                    .background(.background, in: RoundedRectangle(cornerRadius: 12))
                    .shadow(color: .black.opacity(0.05), radius: 8, y: 2)
                    .padding(.horizontal)
                } else {
                    Text("Enter a valid HEX color (e.g. #4A90D9)")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                        .padding(.top, 20)
                }
            }
            .padding(.vertical)
        }
        .navigationTitle("Color Converter")
    }

    private func valueRow(_ label: String, value: String) -> some View {
        Button {
            #if os(iOS)
            UIPasteboard.general.string = value
            #elseif os(macOS)
            NSPasteboard.general.clearContents()
            NSPasteboard.general.setString(value, forType: .string)
            #endif
            HapticManager.success()
        } label: {
            HStack {
                Text(label)
                    .font(.caption)
                    .foregroundStyle(.secondary)
                    .frame(width: 44, alignment: .leading)
                Text(value)
                    .font(.system(.subheadline, design: .monospaced))
                    .foregroundStyle(.primary)
                Spacer()
                Image(systemName: "doc.on.doc")
                    .font(.caption2)
                    .foregroundStyle(.tertiary)
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 12)
        }
        .buttonStyle(.plain)
    }
}
