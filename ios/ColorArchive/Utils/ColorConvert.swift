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

    static func hexToRgb(_ hex: String) -> (r: Int, g: Int, b: Int)? {
        let cleaned = hex.replacingOccurrences(of: "#", with: "")
        let expanded: String
        if cleaned.count == 3 {
            expanded = cleaned.map { "\($0)\($0)" }.joined()
        } else {
            expanded = cleaned
        }
        guard expanded.count == 6, let num = UInt32(expanded, radix: 16) else { return nil }
        return (r: Int((num >> 16) & 0xFF), g: Int((num >> 8) & 0xFF), b: Int(num & 0xFF))
    }

    static func rgbToHsl(r: Int, g: Int, b: Int) -> (h: Int, s: Int, l: Int) {
        let rn = Double(r) / 255, gn = Double(g) / 255, bn = Double(b) / 255
        let maxC = max(rn, gn, bn), minC = min(rn, gn, bn)
        let delta = maxC - minC
        let l = (maxC + minC) / 2
        var h = 0.0, s = 0.0
        if delta > 0 {
            s = delta / (1 - abs(2 * l - 1))
            if maxC == rn { h = ((gn - bn) / delta).truncatingRemainder(dividingBy: 6) }
            else if maxC == gn { h = (bn - rn) / delta + 2 }
            else { h = (rn - gn) / delta + 4 }
            h *= 60
            if h < 0 { h += 360 }
        }
        return (h: Int(round(h)), s: Int(round(s * 100)), l: Int(round(l * 100)))
    }

    static func rgbToHsb(r: Int, g: Int, b: Int) -> (h: Int, s: Int, b: Int) {
        let rn = Double(r) / 255, gn = Double(g) / 255, bn = Double(b) / 255
        let maxC = max(rn, gn, bn), minC = min(rn, gn, bn)
        let delta = maxC - minC
        var h = 0.0
        if delta > 0 {
            if maxC == rn { h = ((gn - bn) / delta).truncatingRemainder(dividingBy: 6) }
            else if maxC == gn { h = (bn - rn) / delta + 2 }
            else { h = (rn - gn) / delta + 4 }
            h *= 60
            if h < 0 { h += 360 }
        }
        return (h: Int(round(h)), s: maxC == 0 ? 0 : Int(round((delta / maxC) * 100)), b: Int(round(maxC * 100)))
    }

    static func rgbToCmyk(r: Int, g: Int, b: Int) -> (c: Int, m: Int, y: Int, k: Int) {
        let rn = Double(r) / 255, gn = Double(g) / 255, bn = Double(b) / 255
        let k = 1 - max(rn, gn, bn)
        if k == 1 { return (0, 0, 0, 100) }
        return (
            c: Int(round(((1 - rn - k) / (1 - k)) * 100)),
            m: Int(round(((1 - gn - k) / (1 - k)) * 100)),
            y: Int(round(((1 - bn - k) / (1 - k)) * 100)),
            k: Int(round(k * 100))
        )
    }

    /// sRGB linearization for WCAG luminance
    static func srgbLinearize(_ c: Double) -> Double {
        let s = c / 255
        return s <= 0.04045 ? s / 12.92 : pow((s + 0.055) / 1.055, 2.4)
    }

    /// Relative luminance per WCAG 2.1
    static func relativeLuminance(r: Int, g: Int, b: Int) -> Double {
        0.2126 * srgbLinearize(Double(r)) + 0.7152 * srgbLinearize(Double(g)) + 0.0722 * srgbLinearize(Double(b))
    }
}
