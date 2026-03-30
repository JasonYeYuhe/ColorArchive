import Foundation

enum ExportFormat: String, CaseIterable, Identifiable {
    case cssVariables = "CSS Variables"
    case tailwind = "Tailwind Config"
    case json = "JSON"
    case figmaTokens = "Figma Tokens"
    case swiftUI = "SwiftUI Extension"
    case hex = "HEX List"

    var id: String { rawValue }
}

enum ExportFormats {
    static func export(_ colors: [ColorRecord], format: ExportFormat, name: String = "palette") -> String {
        switch format {
        case .cssVariables:
            return cssVariables(colors, name: name)
        case .tailwind:
            return tailwindConfig(colors, name: name)
        case .json:
            return jsonExport(colors)
        case .figmaTokens:
            return figmaTokens(colors, name: name)
        case .swiftUI:
            return swiftUIExtension(colors)
        case .hex:
            return colors.map(\.hex).joined(separator: "\n")
        }
    }

    private static func cssVariables(_ colors: [ColorRecord], name: String) -> String {
        var lines = [":root {"]
        for (i, color) in colors.enumerated() {
            let varName = color.id.replacingOccurrences(of: "-", with: "_")
            lines.append("  --\(name)-\(i + 1): \(color.hex);  /* \(color.name) */")
        }
        lines.append("}")
        return lines.joined(separator: "\n")
    }

    private static func tailwindConfig(_ colors: [ColorRecord], name: String) -> String {
        var lines = ["module.exports = {", "  theme: {", "    extend: {", "      colors: {", "        '\(name)': {"]
        for (i, color) in colors.enumerated() {
            lines.append("          '\(i + 1)': '\(color.hex)',  // \(color.name)")
        }
        lines.append(contentsOf: ["        },", "      },", "    },", "  },", "};"])
        return lines.joined(separator: "\n")
    }

    private static func jsonExport(_ colors: [ColorRecord]) -> String {
        let entries = colors.map { color in
            let rgb = color.rgb
            let cmyk = ColorConvert.rgbToCmyk(r: rgb.r, g: rgb.g, b: rgb.b)
            return """
              {
                "name": "\(color.name)",
                "hex": "\(color.hex)",
                "rgb": { "r": \(rgb.r), "g": \(rgb.g), "b": \(rgb.b) },
                "hsl": { "h": \(color.hue), "s": \(color.saturation), "l": \(color.lightness) },
                "cmyk": { "c": \(cmyk.c), "m": \(cmyk.m), "y": \(cmyk.y), "k": \(cmyk.k) }
              }
            """
        }
        return "[\n\(entries.joined(separator: ",\n"))\n]"
    }

    private static func figmaTokens(_ colors: [ColorRecord], name: String) -> String {
        var lines = ["{", "  \"\(name)\": {"]
        for color in colors {
            let rgb = color.rgb
            let key = color.id
            lines.append("    \"\(key)\": {")
            lines.append("      \"value\": \"\(color.hex)\",")
            lines.append("      \"type\": \"color\",")
            lines.append("      \"description\": \"\(color.name) — rgb(\(rgb.r), \(rgb.g), \(rgb.b))\"")
            lines.append("    },")
        }
        lines.append(contentsOf: ["  }", "}"])
        return lines.joined(separator: "\n")
    }

    private static func swiftUIExtension(_ colors: [ColorRecord]) -> String {
        var lines = ["import SwiftUI", "", "extension Color {"]
        for color in colors {
            let rgb = color.rgb
            let swiftName = "ca" + color.id.split(separator: "-").map { $0.prefix(1).uppercased() + $0.dropFirst() }.joined()
            lines.append("    static var \(swiftName): Color { Color(red: \(String(format: "%.4f", Double(rgb.r)/255)), green: \(String(format: "%.4f", Double(rgb.g)/255)), blue: \(String(format: "%.4f", Double(rgb.b)/255))) }  // \(color.hex)")
        }
        lines.append("}")
        return lines.joined(separator: "\n")
    }
}
