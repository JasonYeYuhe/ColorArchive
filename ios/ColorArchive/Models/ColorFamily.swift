import SwiftUI

enum ColorFamily: String, CaseIterable, Identifiable, Codable {
    case red = "Red"
    case orange = "Orange"
    case yellow = "Yellow"
    case lime = "Lime"
    case green = "Green"
    case teal = "Teal"
    case blue = "Blue"
    case purple = "Purple"
    case pink = "Pink"

    var id: String { rawValue }

    var displayColor: Color {
        switch self {
        case .red:     return Color(hue: 0/360, saturation: 0.7, brightness: 0.85)
        case .orange:  return Color(hue: 30/360, saturation: 0.7, brightness: 0.85)
        case .yellow:  return Color(hue: 55/360, saturation: 0.7, brightness: 0.85)
        case .lime:    return Color(hue: 85/360, saturation: 0.7, brightness: 0.85)
        case .green:   return Color(hue: 130/360, saturation: 0.7, brightness: 0.85)
        case .teal:    return Color(hue: 170/360, saturation: 0.7, brightness: 0.85)
        case .blue:    return Color(hue: 220/360, saturation: 0.7, brightness: 0.85)
        case .purple:  return Color(hue: 270/360, saturation: 0.7, brightness: 0.85)
        case .pink:    return Color(hue: 320/360, saturation: 0.7, brightness: 0.85)
        }
    }

    static func from(hue: Int) -> ColorFamily {
        if hue < 15 || hue >= 345 { return .red }
        if hue < 45 { return .orange }
        if hue < 70 { return .yellow }
        if hue < 95 { return .lime }
        if hue < 150 { return .green }
        if hue < 185 { return .teal }
        if hue < 250 { return .blue }
        if hue < 290 { return .purple }
        return .pink
    }
}
