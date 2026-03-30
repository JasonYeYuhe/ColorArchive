import Foundation

enum ColorRelationships {

    static func hueDistance(_ from: Int, _ to: Int) -> Int {
        let diff = abs(from - to) % 360
        return min(diff, 360 - diff)
    }

    static func colorDistance(_ a: ColorRecord, _ b: ColorRecord) -> Double {
        Double(hueDistance(a.hue, b.hue)) * 1.8 +
        Double(abs(a.saturation - b.saturation)) * 0.7 +
        Double(abs(a.lightness - b.lightness)) * 1.15
    }

    static func nearestColors(_ colors: [ColorRecord], to base: ColorRecord, limit: Int = 6) -> [ColorRecord] {
        colors.filter { $0.id != base.id }
            .sorted { colorDistance(base, $0) < colorDistance(base, $1) }
            .prefix(limit)
            .map { $0 }
    }

    // MARK: - Harmony Functions

    /// Find best match for a target hue among archive colors
    private static func findBestMatch(
        _ colors: [ColorRecord],
        base: ColorRecord,
        targetHue: Int
    ) -> ColorRecord? {
        colors.filter { $0.id != base.id }
            .min { a, b in
                let aScore = Double(hueDistance(a.hue, targetHue)) * 2 +
                    Double(abs(a.lightness - base.lightness)) * 1.1 +
                    Double(abs(a.saturation - base.saturation)) * 0.8
                let bScore = Double(hueDistance(b.hue, targetHue)) * 2 +
                    Double(abs(b.lightness - base.lightness)) * 1.1 +
                    Double(abs(b.saturation - base.saturation)) * 0.8
                return aScore < bScore
            }
    }

    /// Complementary: base + 180°
    static func complementary(_ colors: [ColorRecord], base: ColorRecord) -> ColorRecord? {
        findBestMatch(colors, base: base, targetHue: (base.hue + 180) % 360)
    }

    /// Analogous: base ± 24°
    static func analogous(_ colors: [ColorRecord], base: ColorRecord) -> [ColorRecord] {
        [(base.hue + 24) % 360, (base.hue + 336) % 360].compactMap {
            findBestMatch(colors, base: base, targetHue: $0)
        }
    }

    /// Triadic: base + 120°, + 240°
    static func triadic(_ colors: [ColorRecord], base: ColorRecord) -> [ColorRecord] {
        [(base.hue + 120) % 360, (base.hue + 240) % 360].compactMap {
            findBestMatch(colors, base: base, targetHue: $0)
        }
    }

    /// Split-Complementary: base + 150°, + 210°
    static func splitComplementary(_ colors: [ColorRecord], base: ColorRecord) -> [ColorRecord] {
        [(base.hue + 150) % 360, (base.hue + 210) % 360].compactMap {
            findBestMatch(colors, base: base, targetHue: $0)
        }
    }

    /// Tonal strip: same hue + saturation, varying lightness
    static func tonalStrip(_ colors: [ColorRecord], base: ColorRecord) -> [ColorRecord] {
        colors.filter { $0.hue == base.hue && $0.saturation == base.saturation }
            .sorted { $0.lightness < $1.lightness }
    }

    /// Tone companion: next lighter or darker in same hue family
    static func toneCompanion(
        _ colors: [ColorRecord],
        base: ColorRecord,
        direction: ToneDirection
    ) -> ColorRecord? {
        colors.filter { c in
            c.id != base.id &&
            (direction == .lighter ? c.lightness > base.lightness : c.lightness < base.lightness)
        }
        .min { a, b in
            let aScore = Double(hueDistance(a.hue, base.hue)) * 1.8 +
                Double(abs(a.saturation - base.saturation)) * 0.8 +
                Double(abs(a.lightness - base.lightness)) * 0.45
            let bScore = Double(hueDistance(b.hue, base.hue)) * 1.8 +
                Double(abs(b.saturation - base.saturation)) * 0.8 +
                Double(abs(b.lightness - base.lightness)) * 0.45
            return aScore < bScore
        }
    }

    enum ToneDirection {
        case lighter, darker
    }
}
