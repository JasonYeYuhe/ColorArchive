import Foundation
import SwiftUI

// MARK: - Haptic Feedback (defined here to guarantee compilation)

enum HapticManager {
    #if os(iOS)
    static func light() { UIImpactFeedbackGenerator(style: .light).impactOccurred() }
    static func medium() { UIImpactFeedbackGenerator(style: .medium).impactOccurred() }
    static func success() { UINotificationFeedbackGenerator().notificationOccurred(.success) }
    static func selection() { UISelectionFeedbackGenerator().selectionChanged() }
    #else
    static func light() {}
    static func medium() {}
    static func success() {}
    static func selection() {}
    #endif
}

// MARK: - Color Conversion

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

// MARK: - OKLCH (port of web src/lib/color-mix.ts — keep the constants in exact sync)

enum OklchMath {
    private static func delinearize(_ v: Double) -> Double {
        v <= 0.0031308 ? 12.92 * v : 1.055 * pow(v, 1 / 2.4) - 0.055
    }

    /// OKLCH → sRGB 0–255 ints, clamped. Mirrors `oklchToRgb` on the web so the
    /// hue game shows byte-identical chips across platforms.
    static func oklchToRgb(l: Double, c: Double, h: Double) -> (r: Int, g: Int, b: Int) {
        let hRad = h * .pi / 180
        let a = c * cos(hRad)
        let bk = c * sin(hRad)

        let l_ = l + 0.3963377774 * a + 0.2158037573 * bk
        let m_ = l - 0.1055613458 * a - 0.0638541728 * bk
        let s_ = l - 0.0894841775 * a - 1.291485548 * bk

        let lc = l_ * l_ * l_
        let mc = m_ * m_ * m_
        let sc = s_ * s_ * s_

        let rl = 4.0767416621 * lc - 3.3077115913 * mc + 0.2309699292 * sc
        let gl = -1.2684380046 * lc + 2.6097574011 * mc - 0.3413193965 * sc
        let bl = -0.0041960863 * lc - 0.7034186147 * mc + 1.7076147010 * sc

        func to255(_ v: Double) -> Int {
            Int((delinearize(min(1, max(0, v))) * 255).rounded())
        }
        return (to255(rl), to255(gl), to255(bl))
    }
}

// MARK: - Hue Arrangement game math (port of web src/lib/screen-test.ts)

struct HueGameChip: Equatable {
    let hexValue: String
    let trueIndex: Int
    let red: Double
    let green: Double
    let blue: Double
}

enum HueGameMath {
    /// Same parameters as the web game: L=0.72, C=0.10, hue 250→340, 12 chips.
    static func generateChips(count: Int = 12, startHue: Double = 250, endHue: Double = 340) -> [HueGameChip] {
        (0..<count).map { i in
            let h = startHue + (endHue - startHue) * Double(i) / Double(count - 1)
            let rgb = OklchMath.oklchToRgb(l: 0.72, c: 0.10, h: h)
            let hex = String(format: "#%02x%02x%02x", rgb.r, rgb.g, rgb.b)
            return HueGameChip(
                hexValue: hex,
                trueIndex: i,
                red: Double(rgb.r) / 255,
                green: Double(rgb.g) / 255,
                blue: Double(rgb.b) / 255
            )
        }
    }

    /// Web HUE_SHUFFLE — the game scrambles ONLY the middle 10 (ends stay anchored),
    /// via the derived permutation of values 1…10 in this order (web `scrambleMiddle`).
    static let hueShuffle = [7, 2, 9, 4, 0, 11, 5, 1, 8, 3, 10, 6]

    static func scrambleMiddle(_ chips: [HueGameChip]) -> [HueGameChip] {
        let perm = hueShuffle.filter { $0 >= 1 && $0 <= 10 }
        let middle = Array(chips[1..<(chips.count - 1)])
        return perm.map { middle[$0 - 1] }
    }

    /// FM-100-style error score: Σ|adjacent trueIndex deltas| − (n−1); 0 = perfect.
    static func score(_ arrangement: [HueGameChip]) -> Int {
        guard arrangement.count >= 2 else { return 0 }
        var sum = 0
        for i in 1..<arrangement.count {
            sum += abs(arrangement[i].trueIndex - arrangement[i - 1].trueIndex)
        }
        return sum - (arrangement.count - 1)
    }
}
