import SwiftUI

struct ColorCardView: View {
    let color: ColorRecord
    let isFavorite: Bool
    var onTap: () -> Void = {}
    var onFavorite: () -> Void = {}

    var body: some View {
        Button(action: onTap) {
            VStack(alignment: .leading, spacing: 6) {
                RoundedRectangle(cornerRadius: 10)
                    .fill(color.swiftUIColor)
                    .frame(height: 90)
                    .overlay(alignment: .topTrailing) {
                        Button(action: onFavorite) {
                            Image(systemName: isFavorite ? "heart.fill" : "heart")
                                .font(.system(size: 14))
                                .foregroundStyle(isFavorite ? .red : color.textColor.opacity(0.6))
                                .padding(8)
                        }
                    }
                    .shadow(color: color.swiftUIColor.opacity(0.3), radius: 4, y: 2)

                Text(color.name)
                    .font(.caption)
                    .fontWeight(.medium)
                    .lineLimit(1)
                    .foregroundStyle(.primary)

                Text(color.hex)
                    .font(.caption2)
                    .foregroundStyle(.secondary)
                    .monospaced()
            }
        }
        .buttonStyle(.plain)
        .contextMenu {
            Button {
                copyToClipboard(color.hex)
                HapticManager.success()
            } label: {
                Label("Copy HEX", systemImage: "number")
            }

            Button {
                copyToClipboard(color.rgbString)
                HapticManager.success()
            } label: {
                Label("Copy RGB", systemImage: "paintpalette")
            }

            Button {
                copyToClipboard(color.hslString)
                HapticManager.success()
            } label: {
                Label("Copy HSL", systemImage: "circle.lefthalf.filled")
            }

            Divider()

            Button {
                onFavorite()
            } label: {
                Label(
                    isFavorite ? "Remove Favorite" : "Add Favorite",
                    systemImage: isFavorite ? "heart.slash" : "heart"
                )
            }

            #if os(iOS)
            if let image = ShareHelper.colorCardImage(for: color) {
                ShareLink(item: image, preview: SharePreview(color.name, image: image)) {
                    Label("Share", systemImage: "square.and.arrow.up")
                }
            }
            #endif
        }
    }

    private func copyToClipboard(_ value: String) {
        #if os(iOS)
        UIPasteboard.general.string = value
        #elseif os(macOS)
        NSPasteboard.general.clearContents()
        NSPasteboard.general.setString(value, forType: .string)
        #endif
    }
}
