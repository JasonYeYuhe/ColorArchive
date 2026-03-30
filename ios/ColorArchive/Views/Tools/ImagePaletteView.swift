import SwiftUI
import PhotosUI

struct ImagePaletteView: View {
    @Environment(ColorStore.self) var colorStore
    @State private var selectedItem: PhotosPickerItem?
    @State private var image: CGImage?
    @State private var extractedColors: [(hex: String, percent: Double, matched: ColorRecord?)] = []
    @State private var isProcessing = false

    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                // Image picker
                PhotosPicker(selection: $selectedItem, matching: .images) {
                    if let image {
                        #if os(iOS)
                        Image(uiImage: UIImage(cgImage: image))
                            .resizable()
                            .scaledToFit()
                            .frame(maxHeight: 250)
                            .clipShape(RoundedRectangle(cornerRadius: 16))
                        #elseif os(macOS)
                        Image(nsImage: NSImage(cgImage: image, size: NSSize(width: image.width, height: image.height)))
                            .resizable()
                            .scaledToFit()
                            .frame(maxHeight: 250)
                            .clipShape(RoundedRectangle(cornerRadius: 16))
                        #endif
                    } else {
                        VStack(spacing: 12) {
                            Image(systemName: "photo.on.rectangle.angled")
                                .font(.system(size: 48))
                                .foregroundStyle(.blue.opacity(0.3))
                            Text("Tap to select a photo")
                                .font(.headline)
                                .foregroundStyle(.secondary)
                            Text("We'll extract the dominant colors")
                                .font(.caption)
                                .foregroundStyle(.tertiary)
                        }
                        .frame(maxWidth: .infinity)
                        .frame(height: 200)
                        .background(Color.gray.opacity(0.08), in: RoundedRectangle(cornerRadius: 16))
                    }
                }
                .buttonStyle(.plain)
                .padding(.horizontal)

                if isProcessing {
                    ProgressView("Extracting colors...")
                }

                // Extracted colors
                if !extractedColors.isEmpty {
                    // Color strip
                    HStack(spacing: 0) {
                        ForEach(extractedColors.indices, id: \.self) { i in
                            let ec = extractedColors[i]
                            if let rgb = ColorConvert.hexToRgb(ec.hex) {
                                Color(red: Double(rgb.r)/255, green: Double(rgb.g)/255, blue: Double(rgb.b)/255)
                                    .frame(height: 60)
                            }
                        }
                    }
                    .clipShape(RoundedRectangle(cornerRadius: 12))
                    .padding(.horizontal)

                    // Color list
                    ForEach(extractedColors.indices, id: \.self) { i in
                        let ec = extractedColors[i]
                        HStack(spacing: 12) {
                            if let rgb = ColorConvert.hexToRgb(ec.hex) {
                                RoundedRectangle(cornerRadius: 8)
                                    .fill(Color(red: Double(rgb.r)/255, green: Double(rgb.g)/255, blue: Double(rgb.b)/255))
                                    .frame(width: 50, height: 50)
                            }
                            VStack(alignment: .leading, spacing: 4) {
                                if let matched = ec.matched {
                                    Text(matched.name)
                                        .font(.subheadline)
                                        .fontWeight(.medium)
                                }
                                Text(ec.hex)
                                    .font(.caption)
                                    .monospaced()
                                    .foregroundStyle(.secondary)
                            }
                            Spacer()
                            Text(String(format: "%.0f%%", ec.percent * 100))
                                .font(.caption)
                                .foregroundStyle(.tertiary)
                        }
                        .padding(.horizontal)
                    }
                }
            }
            .padding(.vertical)
        }
        .navigationTitle("Image Palette")
        .onChange(of: selectedItem) { _, newItem in
            Task { await loadImage(from: newItem) }
        }
    }

    private func loadImage(from item: PhotosPickerItem?) async {
        guard let item, let data = try? await item.loadTransferable(type: Data.self) else { return }

        #if os(iOS)
        guard let uiImage = UIImage(data: data), let cgImage = uiImage.cgImage else { return }
        #elseif os(macOS)
        guard let nsImage = NSImage(data: data),
              let cgImage = nsImage.cgImage(forProposedRect: nil, context: nil, hints: nil) else { return }
        #endif

        self.image = cgImage
        isProcessing = true
        extractedColors = await extractDominantColors(from: cgImage)
        isProcessing = false
    }

    private func extractDominantColors(from image: CGImage) async -> [(hex: String, percent: Double, matched: ColorRecord?)] {
        await Task.detached {
            // Downscale to 50x50 for speed
            let size = 50
            let colorSpace = CGColorSpaceCreateDeviceRGB()
            var pixels = [UInt8](repeating: 0, count: size * size * 4)
            guard let context = CGContext(
                data: &pixels, width: size, height: size,
                bitsPerComponent: 8, bytesPerRow: size * 4,
                space: colorSpace,
                bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue
            ) else { return [] }
            context.draw(image, in: CGRect(x: 0, y: 0, width: size, height: size))

            // Simple color quantization: bucket by 32-step RGB
            var buckets: [Int: (r: Int, g: Int, b: Int, count: Int)] = [:]
            let step = 32
            for y in 0..<size {
                for x in 0..<size {
                    let offset = (y * size + x) * 4
                    let r = Int(pixels[offset])
                    let g = Int(pixels[offset + 1])
                    let b = Int(pixels[offset + 2])
                    let key = (r / step) * 10000 + (g / step) * 100 + (b / step)
                    if var bucket = buckets[key] {
                        bucket.r += r; bucket.g += g; bucket.b += b; bucket.count += 1
                        buckets[key] = bucket
                    } else {
                        buckets[key] = (r, g, b, 1)
                    }
                }
            }

            let total = Double(size * size)
            let sorted = buckets.values.sorted { $0.count > $1.count }.prefix(6)

            return sorted.map { bucket in
                let r = bucket.r / bucket.count
                let g = bucket.g / bucket.count
                let b = bucket.b / bucket.count
                let hex = ColorConvert.rgbToHex(r: r, g: g, b: b)
                let hsl = ColorConvert.rgbToHsl(r: r, g: g, b: b)
                // Find closest archive color
                let matched = colorStore.colors.min { a, bColor in
                    let da = ColorRelationships.hueDistance(a.hue, hsl.h)
                    let db = ColorRelationships.hueDistance(bColor.hue, hsl.h)
                    let sa = Double(da) * 1.8 + Double(abs(a.saturation - hsl.s)) * 0.7 + Double(abs(a.lightness - hsl.l)) * 1.15
                    let sb = Double(db) * 1.8 + Double(abs(bColor.saturation - hsl.s)) * 0.7 + Double(abs(bColor.lightness - hsl.l)) * 1.15
                    return sa < sb
                }
                return (hex: hex, percent: Double(bucket.count) / total, matched: matched)
            }
        }.value
    }
}
