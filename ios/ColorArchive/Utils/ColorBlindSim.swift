import Foundation
import SwiftUI

enum ColorBlindType: String, CaseIterable, Identifiable {
    case deuteranopia
    case protanopia
    case tritanopia
    case achromatopsia

    var id: String { rawValue }

    var label: String {
        switch self {
        case .deuteranopia:  return "Deuteranopia"
        case .protanopia:    return "Protanopia"
        case .tritanopia:    return "Tritanopia"
        case .achromatopsia: return "Achromatopsia"
        }
    }

    var shortLabel: String {
        switch self {
        case .deuteranopia:  return "Deutan"
        case .protanopia:    return "Protan"
        case .tritanopia:    return "Tritan"
        case .achromatopsia: return "Achroma"
        }
    }

    var description: String {
        switch self {
        case .deuteranopia:
            return "Missing green-sensitive cones. Reds and greens are hard to distinguish."
        case .protanopia:
            return "Missing red-sensitive cones. Reds appear darker and confused with greens."
        case .tritanopia:
            return "Missing blue-sensitive cones. Blues and yellows are hard to distinguish."
        case .achromatopsia:
            return "No cone function. Only brightness is perceived — no color."
        }
    }

    var prevalence: String {
        switch self {
        case .deuteranopia:  return "~6% of males"
        case .protanopia:    return "~2% of males"
        case .tritanopia:    return "~0.01%"
        case .achromatopsia: return "~0.003%"
        }
    }
}

enum ColorBlindSim {
    // Viénot et al. (1999) simulation matrices in linearized sRGB
    private static let matrices: [ColorBlindType: [Double]] = [
        .protanopia: [
            0.56667, 0.43333, 0.0,
            0.55833, 0.44167, 0.0,
            0.0,     0.24167, 0.75833
        ],
        .deuteranopia: [
            0.625, 0.375, 0.0,
            0.7,   0.3,   0.0,
            0.0,   0.3,   0.7
        ],
        .tritanopia: [
            0.95,  0.05,    0.0,
            0.0,   0.43333, 0.56667,
            0.0,   0.47500, 0.52500
        ]
    ]

    private static func toLinear(_ c: Double) -> Double {
        let s = c / 255
        return s <= 0.04045 ? s / 12.92 : pow((s + 0.055) / 1.055, 2.4)
    }

    private static func toSRGB(_ c: Double) -> Int {
        let clamped = max(0, min(1, c))
        let s = clamped <= 0.0031308
            ? clamped * 12.92
            : 1.055 * pow(clamped, 1.0 / 2.4) - 0.055
        return Int(round(s * 255))
    }

    static func simulate(r: Int, g: Int, b: Int, type: ColorBlindType) -> (r: Int, g: Int, b: Int) {
        let rL = toLinear(Double(r))
        let gL = toLinear(Double(g))
        let bL = toLinear(Double(b))

        if type == .achromatopsia {
            let y = 0.2126 * rL + 0.7152 * gL + 0.0722 * bL
            let v = toSRGB(y)
            return (v, v, v)
        }

        guard let m = matrices[type] else { return (r, g, b) }
        return (
            r: toSRGB(m[0] * rL + m[1] * gL + m[2] * bL),
            g: toSRGB(m[3] * rL + m[4] * gL + m[5] * bL),
            b: toSRGB(m[6] * rL + m[7] * gL + m[8] * bL)
        )
    }

    static func simulateColor(_ color: ColorRecord, type: ColorBlindType) -> Color {
        let rgb = color.rgb
        let sim = simulate(r: rgb.r, g: rgb.g, b: rgb.b, type: type)
        return Color(red: Double(sim.r) / 255, green: Double(sim.g) / 255, blue: Double(sim.b) / 255)
    }

    static func simulateHex(_ color: ColorRecord, type: ColorBlindType) -> String {
        let rgb = color.rgb
        let sim = simulate(r: rgb.r, g: rgb.g, b: rgb.b, type: type)
        return ColorConvert.rgbToHex(r: sim.r, g: sim.g, b: sim.b)
    }
}
