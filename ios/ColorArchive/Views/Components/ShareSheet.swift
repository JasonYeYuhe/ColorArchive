import SwiftUI

enum ShareHelper {
    /// Generate a shareable color card image
    @MainActor
    static func colorCardImage(for color: ColorRecord, size: CGSize = CGSize(width: 600, height: 400)) -> Image? {
        let view = ShareColorCard(color: color)
            .frame(width: size.width, height: size.height)

        let renderer = ImageRenderer(content: view)
        renderer.scale = 2.0

        #if os(iOS)
        guard let uiImage = renderer.uiImage else { return nil }
        return Image(uiImage: uiImage)
        #elseif os(macOS)
        guard let nsImage = renderer.nsImage else { return nil }
        return Image(nsImage: nsImage)
        #endif
    }

    /// Generate palette card image
    @MainActor
    static func paletteCardImage(colors: [ColorRecord], title: String = "ColorArchive") -> Image? {
        let view = SharePaletteCard(colors: colors, title: title)
            .frame(width: 600, height: 300)

        let renderer = ImageRenderer(content: view)
        renderer.scale = 2.0

        #if os(iOS)
        guard let uiImage = renderer.uiImage else { return nil }
        return Image(uiImage: uiImage)
        #elseif os(macOS)
        guard let nsImage = renderer.nsImage else { return nil }
        return Image(nsImage: nsImage)
        #endif
    }
}

// MARK: - Share Card Views

struct ShareColorCard: View {
    let color: ColorRecord

    var body: some View {
        VStack(spacing: 0) {
            color.swiftUIColor
                .frame(height: 260)

            VStack(spacing: 8) {
                Text(color.name)
                    .font(.title3)
                    .fontWeight(.bold)
                HStack(spacing: 16) {
                    Text(color.hex)
                        .font(.system(.body, design: .monospaced))
                    Text(color.rgbString)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
                Text("colorarchive.me")
                    .font(.caption2)
                    .foregroundStyle(.tertiary)
            }
            .padding()
            .frame(maxWidth: .infinity)
            .background(.background)
        }
    }
}

struct SharePaletteCard: View {
    let colors: [ColorRecord]
    let title: String

    var body: some View {
        VStack(spacing: 0) {
            HStack(spacing: 0) {
                ForEach(colors) { color in
                    color.swiftUIColor
                }
            }
            .frame(height: 200)

            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text(title)
                        .font(.headline)
                    Text(colors.map(\.hex).joined(separator: " · "))
                        .font(.system(.caption2, design: .monospaced))
                        .foregroundStyle(.secondary)
                }
                Spacer()
                Text("colorarchive.me")
                    .font(.caption2)
                    .foregroundStyle(.tertiary)
            }
            .padding()
            .background(.background)
        }
    }
}
