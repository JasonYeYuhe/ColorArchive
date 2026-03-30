import Foundation

enum WcagGrade: String, CaseIterable {
    case aaa = "AAA"
    case aa = "AA"
    case aaLarge = "AA Large"
    case fail = "Fail"

    var passed: Bool { self != .fail }

    static func from(ratio: Double) -> WcagGrade {
        if ratio >= 7.0 { return .aaa }
        if ratio >= 4.5 { return .aa }
        if ratio >= 3.0 { return .aaLarge }
        return .fail
    }
}

struct WcagContrastData {
    let vsWhite: Double
    let vsBlack: Double
    let whiteGrade: WcagGrade
    let blackGrade: WcagGrade
}

struct WcagPairing {
    let color: ColorRecord
    let ratio: Double
    let grade: WcagGrade
}

enum ColorContrast {

    static func contrastRatio(_ color1: ColorRecord, _ color2: ColorRecord) -> Double {
        let rgb1 = ColorConvert.hslToRgb(hue: color1.hue, saturation: color1.saturation, lightness: color1.lightness)
        let rgb2 = ColorConvert.hslToRgb(hue: color2.hue, saturation: color2.saturation, lightness: color2.lightness)
        let lum1 = ColorConvert.relativeLuminance(r: rgb1.r, g: rgb1.g, b: rgb1.b)
        let lum2 = ColorConvert.relativeLuminance(r: rgb2.r, g: rgb2.g, b: rgb2.b)
        let lighter = max(lum1, lum2)
        let darker = min(lum1, lum2)
        return ((lighter + 0.05) / (darker + 0.05) * 10).rounded() / 10
    }

    static func wcagContrast(hue: Int, saturation: Int, lightness: Int) -> WcagContrastData {
        let rgb = ColorConvert.hslToRgb(hue: hue, saturation: saturation, lightness: lightness)
        let lum = ColorConvert.relativeLuminance(r: rgb.r, g: rgb.g, b: rgb.b)
        let vsWhite = ((1 + 0.05) / (lum + 0.05) * 10).rounded() / 10
        let vsBlack = ((lum + 0.05) / (0 + 0.05) * 10).rounded() / 10
        return WcagContrastData(
            vsWhite: vsWhite,
            vsBlack: vsBlack,
            whiteGrade: WcagGrade.from(ratio: vsWhite),
            blackGrade: WcagGrade.from(ratio: vsBlack)
        )
    }

    static func wcagPairings(
        _ colors: [ColorRecord],
        base: ColorRecord,
        limit: Int = 8
    ) -> [WcagPairing] {
        var pairings: [WcagPairing] = []
        for candidate in colors where candidate.id != base.id {
            let ratio = contrastRatio(base, candidate)
            guard ratio >= 3 else { continue }
            let grade: WcagGrade = ratio >= 7 ? .aaa : ratio >= 4.5 ? .aa : .aaLarge
            pairings.append(WcagPairing(color: candidate, ratio: ratio, grade: grade))
        }
        pairings.sort { a, b in
            if a.grade != b.grade {
                let order: [WcagGrade: Int] = [.aaa: 0, .aa: 1, .aaLarge: 2, .fail: 3]
                return (order[a.grade] ?? 3) < (order[b.grade] ?? 3)
            }
            let aDist = ColorRelationships.hueDistance(a.color.hue, base.hue)
            let bDist = ColorRelationships.hueDistance(b.color.hue, base.hue)
            return aDist > bDist
        }
        return Array(pairings.prefix(limit))
    }
}
