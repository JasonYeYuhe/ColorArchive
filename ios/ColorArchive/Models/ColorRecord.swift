import SwiftUI

struct ColorRecord: Identifiable, Hashable, Codable {
    let id: String
    let name: String
    let hex: String
    let hue: Int
    let saturation: Int
    let lightness: Int
    let family: ColorFamily

    var rgb: (r: Int, g: Int, b: Int) {
        ColorConvert.hslToRgb(hue: hue, saturation: saturation, lightness: lightness)
    }

    var rgbString: String {
        let c = rgb
        return "rgb(\(c.r), \(c.g), \(c.b))"
    }

    var hslString: String {
        "hsl(\(hue), \(saturation)%, \(lightness)%)"
    }

    var swiftUIColor: Color {
        let c = rgb
        return Color(
            red: Double(c.r) / 255,
            green: Double(c.g) / 255,
            blue: Double(c.b) / 255
        )
    }

    var textColor: Color {
        lightness > 55 ? .black : .white
    }
}
