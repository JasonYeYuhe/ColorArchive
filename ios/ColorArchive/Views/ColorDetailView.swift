import SwiftUI
#if os(macOS)
import AppKit
#endif

struct ColorDetailView: View {
    let color: ColorRecord
    @Environment(FavoritesStore.self) var favoritesStore
    @Environment(ColorStore.self) var colorStore
    @State private var copiedField: String?

    var body: some View {
        ScrollView {
            VStack(spacing: 0) {
                // Large color swatch
                color.swiftUIColor
                    .frame(height: 240)
                    .overlay(alignment: .bottomLeading) {
                        VStack(alignment: .leading, spacing: 4) {
                            Text(color.name)
                                .font(.title2)
                                .fontWeight(.bold)
                            Text(color.family.rawValue)
                                .font(.subheadline)
                                .opacity(0.8)
                        }
                        .foregroundStyle(color.textColor)
                        .padding(20)
                    }
                    .overlay(alignment: .topTrailing) {
                        Button {
                            favoritesStore.toggle(color.id)
                        } label: {
                            Image(systemName: favoritesStore.isFavorite(color.id) ? "heart.fill" : "heart")
                                .font(.title3)
                                .foregroundStyle(favoritesStore.isFavorite(color.id) ? .red : color.textColor)
                                .padding(20)
                        }
                    }

                VStack(spacing: 20) {
                    // Color values
                    VStack(spacing: 0) {
                        colorValueRow("HEX", value: color.hex)
                        Divider()
                        colorValueRow("RGB", value: color.rgbString)
                        Divider()
                        colorValueRow("HSL", value: color.hslString)
                    }
                    .background(.background)
                    .clipShape(RoundedRectangle(cornerRadius: 12))
                    .shadow(color: .black.opacity(0.05), radius: 8, y: 2)

                    // Color properties
                    VStack(spacing: 0) {
                        propertyRow("Hue", value: "\(color.hue)°")
                        Divider()
                        propertyRow("Saturation", value: "\(color.saturation)%")
                        Divider()
                        propertyRow("Lightness", value: "\(color.lightness)%")
                        Divider()
                        propertyRow("Family", value: color.family.rawValue)
                    }
                    .background(.background)
                    .clipShape(RoundedRectangle(cornerRadius: 12))
                    .shadow(color: .black.opacity(0.05), radius: 8, y: 2)

                    // Related colors
                    relatedColorsSection
                }
                .padding(16)
            }
        }
        #if os(iOS)
        .navigationBarTitleDisplayMode(.inline)
        #endif
        .background(Color.gray.opacity(0.1))
    }

    private func colorValueRow(_ label: String, value: String) -> some View {
        Button {
            #if os(iOS)
            UIPasteboard.general.string = value
            #elseif os(macOS)
            NSPasteboard.general.clearContents()
            NSPasteboard.general.setString(value, forType: .string)
            #endif
            copiedField = label
            DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) {
                if copiedField == label { copiedField = nil }
            }
        } label: {
            HStack {
                Text(label)
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                    .frame(width: 40, alignment: .leading)
                Text(value)
                    .font(.system(.body, design: .monospaced))
                    .foregroundStyle(.primary)
                Spacer()
                if copiedField == label {
                    Text("Copied!")
                        .font(.caption)
                        .foregroundStyle(.green)
                } else {
                    Image(systemName: "doc.on.doc")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 12)
        }
        .buttonStyle(.plain)
    }

    private func propertyRow(_ label: String, value: String) -> some View {
        HStack {
            Text(label)
                .font(.subheadline)
                .foregroundStyle(.secondary)
            Spacer()
            Text(value)
                .font(.subheadline)
                .fontWeight(.medium)
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 12)
    }

    @ViewBuilder
    private var relatedColorsSection: some View {
        let related = colorStore.colors.filter {
            $0.family == color.family && $0.id != color.id
        }.prefix(12)

        if !related.isEmpty {
            VStack(alignment: .leading, spacing: 12) {
                Text("Related Colors")
                    .font(.headline)
                    .padding(.horizontal, 4)

                LazyVGrid(columns: [GridItem(.adaptive(minimum: 90))], spacing: 10) {
                    ForEach(Array(related)) { relatedColor in
                        NavigationLink(value: relatedColor) {
                            VStack(spacing: 4) {
                                RoundedRectangle(cornerRadius: 8)
                                    .fill(relatedColor.swiftUIColor)
                                    .frame(height: 50)
                                Text(relatedColor.hex)
                                    .font(.caption2)
                                    .monospaced()
                                    .foregroundStyle(.secondary)
                            }
                        }
                        .buttonStyle(.plain)
                    }
                }
            }
        }
    }
}
