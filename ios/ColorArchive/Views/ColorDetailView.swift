import SwiftUI
#if os(macOS)
import AppKit
#endif

struct ColorDetailView: View {
    let color: ColorRecord
    @Environment(FavoritesStore.self) var favoritesStore
    @Environment(ColorStore.self) var colorStore
    @Environment(RecentColorsStore.self) var recentColorsStore
    @State private var copiedField: String?
    @State private var showColorblind = false

    var body: some View {
        ScrollView {
            VStack(spacing: 0) {
                // Large color swatch
                color.swiftUIColor
                    .frame(height: 220)
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
                        HStack(spacing: 12) {
                            // Share button
                            #if os(iOS)
                            if let img = ShareHelper.colorCardImage(for: color) {
                                ShareLink(item: img, preview: SharePreview(color.name, image: img)) {
                                    Image(systemName: "square.and.arrow.up")
                                        .font(.body)
                                        .foregroundStyle(color.textColor)
                                }
                            }
                            #endif
                            // Favorite button
                            Button {
                                favoritesStore.toggle(color.id)
                            } label: {
                                Image(systemName: favoritesStore.isFavorite(color.id) ? "heart.fill" : "heart")
                                    .font(.title3)
                                    .foregroundStyle(favoritesStore.isFavorite(color.id) ? .red : color.textColor)
                            }
                        }
                        .padding(20)
                    }

                VStack(spacing: 20) {
                    // Color values
                    let rgb = color.rgb
                    let cmyk = ColorConvert.rgbToCmyk(r: rgb.r, g: rgb.g, b: rgb.b)
                    let hsb = ColorConvert.rgbToHsb(r: rgb.r, g: rgb.g, b: rgb.b)

                    VStack(spacing: 0) {
                        colorValueRow("HEX", value: color.hex)
                        Divider()
                        colorValueRow("RGB", value: color.rgbString)
                        Divider()
                        colorValueRow("HSL", value: color.hslString)
                        Divider()
                        colorValueRow("HSB", value: "hsb(\(hsb.h), \(hsb.s)%, \(hsb.b)%)")
                        Divider()
                        colorValueRow("CMYK", value: "cmyk(\(cmyk.c)%, \(cmyk.m)%, \(cmyk.y)%, \(cmyk.k)%)")
                    }
                    .background(.background, in: RoundedRectangle(cornerRadius: 12))
                    .shadow(color: .black.opacity(0.05), radius: 8, y: 2)

                    // WCAG Contrast
                    wcagSection

                    // Colorblind preview toggle
                    colorblindSection

                    // Harmonies
                    harmoniesSection

                    // Tonal strip
                    tonalSection

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
        .onAppear { recentColorsStore.add(color.id) }
    }

    // MARK: - WCAG Section

    @ViewBuilder
    private var wcagSection: some View {
        let wcag = ColorContrast.wcagContrast(hue: color.hue, saturation: color.saturation, lightness: color.lightness)

        VStack(alignment: .leading, spacing: 12) {
            Text("Accessibility")
                .font(.headline)

            HStack(spacing: 20) {
                VStack(spacing: 4) {
                    Text("vs White")
                        .font(.caption2)
                        .foregroundStyle(.secondary)
                    Text(String(format: "%.1f:1", wcag.vsWhite))
                        .font(.system(.title3, design: .rounded))
                        .fontWeight(.bold)
                    Text(wcag.whiteGrade.rawValue)
                        .font(.caption)
                        .fontWeight(.semibold)
                        .foregroundStyle(wcag.whiteGrade.passed ? .green : .red)
                }
                .frame(maxWidth: .infinity)

                Divider().frame(height: 50)

                VStack(spacing: 4) {
                    Text("vs Black")
                        .font(.caption2)
                        .foregroundStyle(.secondary)
                    Text(String(format: "%.1f:1", wcag.vsBlack))
                        .font(.system(.title3, design: .rounded))
                        .fontWeight(.bold)
                    Text(wcag.blackGrade.rawValue)
                        .font(.caption)
                        .fontWeight(.semibold)
                        .foregroundStyle(wcag.blackGrade.passed ? .green : .red)
                }
                .frame(maxWidth: .infinity)
            }
            .padding()
            .background(.background, in: RoundedRectangle(cornerRadius: 12))
            .shadow(color: .black.opacity(0.05), radius: 8, y: 2)
        }
    }

    // MARK: - Colorblind Section

    @ViewBuilder
    private var colorblindSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Button { showColorblind.toggle() } label: {
                HStack {
                    Text("Colorblind Preview")
                        .font(.headline)
                        .foregroundStyle(.primary)
                    Spacer()
                    Image(systemName: showColorblind ? "chevron.up" : "chevron.down")
                        .foregroundStyle(.secondary)
                }
            }
            .buttonStyle(.plain)

            if showColorblind {
                HStack(spacing: 8) {
                    ForEach(ColorBlindType.allCases) { type in
                        VStack(spacing: 6) {
                            RoundedRectangle(cornerRadius: 8)
                                .fill(ColorBlindSim.simulateColor(color, type: type))
                                .frame(height: 50)
                            Text(type.shortLabel)
                                .font(.system(size: 9))
                                .foregroundStyle(.secondary)
                        }
                    }
                }
            }
        }
    }

    // MARK: - Harmonies Section

    @ViewBuilder
    private var harmoniesSection: some View {
        let colors = colorStore.colors
        let comp = ColorRelationships.complementary(colors, base: color)
        let analog = ColorRelationships.analogous(colors, base: color)
        let triad = ColorRelationships.triadic(colors, base: color)

        VStack(alignment: .leading, spacing: 12) {
            Text("Color Harmonies")
                .font(.headline)

            if let comp {
                harmonyRow("Complementary", colors: [comp])
            }
            if !analog.isEmpty {
                harmonyRow("Analogous", colors: analog)
            }
            if !triad.isEmpty {
                harmonyRow("Triadic", colors: triad)
            }
        }
    }

    @ViewBuilder
    private func harmonyRow(_ title: String, colors: [ColorRecord]) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(title)
                .font(.caption)
                .foregroundStyle(.secondary)
            HStack(spacing: 8) {
                ForEach(colors) { c in
                    NavigationLink(value: c) {
                        VStack(spacing: 4) {
                            RoundedRectangle(cornerRadius: 8)
                                .fill(c.swiftUIColor)
                                .frame(width: 55, height: 45)
                            Text(c.hex)
                                .font(.system(size: 8))
                                .monospaced()
                                .foregroundStyle(.secondary)
                        }
                    }
                    .buttonStyle(.plain)
                }
            }
        }
    }

    // MARK: - Tonal Section

    @ViewBuilder
    private var tonalSection: some View {
        let strip = ColorRelationships.tonalStrip(colorStore.colors, base: color)
        if strip.count > 1 {
            VStack(alignment: .leading, spacing: 10) {
                Text("Tonal Strip")
                    .font(.headline)

                HStack(spacing: 0) {
                    ForEach(strip) { tone in
                        tone.swiftUIColor
                            .frame(height: 40)
                            .overlay {
                                if tone.id == color.id {
                                    RoundedRectangle(cornerRadius: 2)
                                        .stroke(.primary, lineWidth: 2)
                                }
                            }
                    }
                }
                .clipShape(RoundedRectangle(cornerRadius: 10))
            }
        }
    }

    // MARK: - Related Colors

    @ViewBuilder
    private var relatedColorsSection: some View {
        let related = ColorRelationships.nearestColors(colorStore.colors, to: color, limit: 12)

        if !related.isEmpty {
            VStack(alignment: .leading, spacing: 12) {
                Text("Related Colors")
                    .font(.headline)

                LazyVGrid(columns: [GridItem(.adaptive(minimum: 70))], spacing: 10) {
                    ForEach(related) { relatedColor in
                        NavigationLink(value: relatedColor) {
                            VStack(spacing: 4) {
                                RoundedRectangle(cornerRadius: 8)
                                    .fill(relatedColor.swiftUIColor)
                                    .frame(height: 50)
                                Text(relatedColor.hex)
                                    .font(.system(size: 8))
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

    // MARK: - Copy Row

    private func colorValueRow(_ label: String, value: String) -> some View {
        Button {
            #if os(iOS)
            UIPasteboard.general.string = value
            #elseif os(macOS)
            NSPasteboard.general.clearContents()
            NSPasteboard.general.setString(value, forType: .string)
            #endif
            HapticManager.success()
            copiedField = label
            DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) {
                if copiedField == label { copiedField = nil }
            }
        } label: {
            HStack {
                Text(label)
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                    .frame(width: 44, alignment: .leading)
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
}
