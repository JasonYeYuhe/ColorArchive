import Foundation

enum ColorConvert {
    static func hslToRgb(hue: Int, saturation: Int, lightness: Int) -> (r: Int, g: Int, b: Int) {
        let h = Double(hue) / 360
        let s = Double(saturation) / 100
        let l = Double(lightness) / 100

        if s == 0 {
            let value = Int(round(l * 255))
            return (value, value, value)
        }

        func hueToRgb(_ p: Double, _ q: Double, _ t: Double) -> Double {
            var t = t
            if t < 0 { t += 1 }
            if t > 1 { t -= 1 }
            if t < 1.0 / 6.0 { return p + (q - p) * 6 * t }
            if t < 1.0 / 2.0 { return q }
            if t < 2.0 / 3.0 { return p + (q - p) * (2.0 / 3.0 - t) * 6 }
            return p
        }

        let q = l < 0.5 ? l * (1 + s) : l + s - l * s
        let p = 2 * l - q

        return (
            r: Int(round(hueToRgb(p, q, h + 1.0 / 3.0) * 255)),
            g: Int(round(hueToRgb(p, q, h) * 255)),
            b: Int(round(hueToRgb(p, q, h - 1.0 / 3.0) * 255))
        )
    }

    static func rgbToHex(r: Int, g: Int, b: Int) -> String {
        String(format: "#%02X%02X%02X", r, g, b)
    }
}
