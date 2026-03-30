import Foundation

enum ColorGenerator {
    struct HueEntry {
        let hue: Int
        let root: String
    }

    struct LightBand {
        let label: String
        let lightness: Int
    }

    struct ChromaBand {
        let label: String
        let saturation: Int
    }

    struct NeutralEntry {
        let root: String
        let hue: Int
        let saturation: Int
    }

    static let hueCatalog: [HueEntry] = [
        HueEntry(hue: 0, root: "Crimson"),
        HueEntry(hue: 5, root: "Scarlet"),
        HueEntry(hue: 10, root: "Ruby"),
        HueEntry(hue: 15, root: "Vermillion"),
        HueEntry(hue: 20, root: "Ember"),
        HueEntry(hue: 25, root: "Tangerine"),
        HueEntry(hue: 30, root: "Coral"),
        HueEntry(hue: 40, root: "Apricot"),
        HueEntry(hue: 45, root: "Saffron"),
        HueEntry(hue: 50, root: "Amber"),
        HueEntry(hue: 55, root: "Canary"),
        HueEntry(hue: 60, root: "Citrine"),
        HueEntry(hue: 70, root: "Honey"),
        HueEntry(hue: 75, root: "Chartreuse"),
        HueEntry(hue: 80, root: "Olive"),
        HueEntry(hue: 90, root: "Lime"),
        HueEntry(hue: 100, root: "Moss"),
        HueEntry(hue: 110, root: "Leaf"),
        HueEntry(hue: 115, root: "Clover"),
        HueEntry(hue: 120, root: "Emerald"),
        HueEntry(hue: 130, root: "Mint"),
        HueEntry(hue: 140, root: "Seafoam"),
        HueEntry(hue: 145, root: "Celadon"),
        HueEntry(hue: 150, root: "Jade"),
        HueEntry(hue: 160, root: "Teal"),
        HueEntry(hue: 170, root: "Lagoon"),
        HueEntry(hue: 175, root: "Cyan"),
        HueEntry(hue: 180, root: "Aqua"),
        HueEntry(hue: 190, root: "Cerulean"),
        HueEntry(hue: 200, root: "Azure"),
        HueEntry(hue: 205, root: "Steel"),
        HueEntry(hue: 210, root: "Sapphire"),
        HueEntry(hue: 220, root: "Cobalt"),
        HueEntry(hue: 230, root: "Indigo"),
        HueEntry(hue: 240, root: "Iris"),
        HueEntry(hue: 245, root: "Amethyst"),
        HueEntry(hue: 250, root: "Violet"),
        HueEntry(hue: 260, root: "Orchid"),
        HueEntry(hue: 270, root: "Plum"),
        HueEntry(hue: 280, root: "Mulberry"),
        HueEntry(hue: 290, root: "Magenta"),
        HueEntry(hue: 300, root: "Fuchsia"),
        HueEntry(hue: 305, root: "Mauve"),
        HueEntry(hue: 310, root: "Peony"),
        HueEntry(hue: 320, root: "Rose"),
        HueEntry(hue: 330, root: "Blush"),
        HueEntry(hue: 340, root: "Garnet"),
        HueEntry(hue: 350, root: "Merlot"),
    ]

    static let lightBands: [LightBand] = [
        LightBand(label: "Veil", lightness: 98),
        LightBand(label: "Whisper", lightness: 94),
        LightBand(label: "Mist", lightness: 90),
        LightBand(label: "Pearl", lightness: 84),
        LightBand(label: "Bloom", lightness: 76),
        LightBand(label: "Silk", lightness: 68),
        LightBand(label: "Tone", lightness: 60),
        LightBand(label: "Radiant", lightness: 54),
        LightBand(label: "Core", lightness: 48),
        LightBand(label: "Velvet", lightness: 42),
        LightBand(label: "Dusk", lightness: 34),
        LightBand(label: "Shadow", lightness: 28),
        LightBand(label: "Nocturne", lightness: 20),
        LightBand(label: "Ink", lightness: 14),
    ]

    static let chromaBands: [ChromaBand] = [
        ChromaBand(label: "Faint", saturation: 10),
        ChromaBand(label: "Muted", saturation: 18),
        ChromaBand(label: "Dust", saturation: 26),
        ChromaBand(label: "Soft", saturation: 34),
        ChromaBand(label: "Clear", saturation: 54),
        ChromaBand(label: "Vivid", saturation: 74),
        ChromaBand(label: "Bright", saturation: 84),
        ChromaBand(label: "Pure", saturation: 92),
    ]

    static let neutralCatalog: [NeutralEntry] = [
        NeutralEntry(root: "Warm Gray", hue: 30, saturation: 6),
        NeutralEntry(root: "Taupe Gray", hue: 40, saturation: 5),
        NeutralEntry(root: "True Gray", hue: 0, saturation: 0),
        NeutralEntry(root: "Sage Gray", hue: 150, saturation: 5),
        NeutralEntry(root: "Cool Gray", hue: 210, saturation: 6),
    ]

    static func createColorId(_ name: String) -> String {
        name.lowercased()
            .replacingOccurrences(of: "[^a-z0-9]+", with: "-", options: .regularExpression)
            .trimmingCharacters(in: CharacterSet(charactersIn: "-"))
    }

    static func generateAll() -> [ColorRecord] {
        var colors: [ColorRecord] = []
        colors.reserveCapacity(5446)

        // Chromatic colors: 48 × 14 × 8 = 5,376
        for entry in hueCatalog {
            for light in lightBands {
                for chroma in chromaBands {
                    let name = "\(entry.root) \(light.label) \(chroma.label)"
                    let rgb = ColorConvert.hslToRgb(hue: entry.hue, saturation: chroma.saturation, lightness: light.lightness)
                    colors.append(ColorRecord(
                        id: createColorId(name),
                        name: name,
                        hex: ColorConvert.rgbToHex(r: rgb.r, g: rgb.g, b: rgb.b),
                        hue: entry.hue,
                        saturation: chroma.saturation,
                        lightness: light.lightness,
                        family: ColorFamily.from(hue: entry.hue)
                    ))
                }
            }
        }

        // Neutral grays: 5 × 14 = 70
        for neutral in neutralCatalog {
            for light in lightBands {
                let name = "\(neutral.root) \(light.label)"
                let rgb = ColorConvert.hslToRgb(hue: neutral.hue, saturation: neutral.saturation, lightness: light.lightness)
                colors.append(ColorRecord(
                    id: createColorId(name),
                    name: name,
                    hex: ColorConvert.rgbToHex(r: rgb.r, g: rgb.g, b: rgb.b),
                    hue: neutral.hue,
                    saturation: neutral.saturation,
                    lightness: light.lightness,
                    family: ColorFamily.from(hue: neutral.hue)
                ))
            }
        }

        return colors
    }
}
