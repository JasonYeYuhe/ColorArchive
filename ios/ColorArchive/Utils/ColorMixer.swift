import SwiftUI

enum MixMode: String, CaseIterable {
    case rgb = "RGB"
    case hsl = "HSL"
}

enum ColorMixer {
    /// Mix two colors with N intermediate steps
    static func mix(
        color1: ColorRecord,
        color2: ColorRecord,
        steps: Int = 5,
        mode: MixMode = .rgb
    ) -> [(r: Int, g: Int, b: Int, hex: String)] {
        let total = steps + 2 // include endpoints
        var results: [(r: Int, g: Int, b: Int, hex: String)] = []

        let rgb1 = color1.rgb
        let rgb2 = color2.rgb

        for i in 0..<total {
            let t = Double(i) / Double(total - 1)

            let (r, g, b): (Int, Int, Int)

            switch mode {
            case .rgb:
                r = Int(round(Double(rgb1.r) + t * Double(rgb2.r - rgb1.r)))
                g = Int(round(Double(rgb1.g) + t * Double(rgb2.g - rgb1.g)))
                b = Int(round(Double(rgb1.b) + t * Double(rgb2.b - rgb1.b)))

            case .hsl:
                // Interpolate in HSL space for smoother hue transitions
                let h1 = Double(color1.hue), h2 = Double(color2.hue)
                let s1 = Double(color1.saturation), s2 = Double(color2.saturation)
                let l1 = Double(color1.lightness), l2 = Double(color2.lightness)

                // Shortest path around hue wheel
                var dh = h2 - h1
                if dh > 180 { dh -= 360 }
                if dh < -180 { dh += 360 }

                let h = ((h1 + t * dh).truncatingRemainder(dividingBy: 360) + 360)
                    .truncatingRemainder(dividingBy: 360)
                let s = s1 + t * (s2 - s1)
                let l = l1 + t * (l2 - l1)

                let mixed = ColorConvert.hslToRgb(hue: Int(round(h)), saturation: Int(round(s)), lightness: Int(round(l)))
                (r, g, b) = (mixed.r, mixed.g, mixed.b)
            }

            let hex = ColorConvert.rgbToHex(r: r, g: g, b: b)
            results.append((r, g, b, hex))
        }

        return results
    }

    static func mixToColors(
        color1: ColorRecord,
        color2: ColorRecord,
        steps: Int = 5,
        mode: MixMode = .rgb
    ) -> [Color] {
        mix(color1: color1, color2: color2, steps: steps, mode: mode).map {
            Color(red: Double($0.r) / 255, green: Double($0.g) / 255, blue: Double($0.b) / 255)
        }
    }
}
