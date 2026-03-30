import Foundation

enum ColorOfDay {
    /// Deterministic hash of date string to pick a hero color
    static func pick(from colors: [ColorRecord], date: Date = Date()) -> ColorRecord? {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"
        let dateString = formatter.string(from: date)

        // Simple string hash (matches web behavior)
        var hash: UInt32 = 0
        for char in dateString.unicodeScalars {
            hash = (hash &<< 5) &- hash &+ char.value
        }

        // Filter to visually interesting colors (hero range)
        let heroColors = colors.filter {
            $0.lightness >= 30 && $0.lightness <= 75 && $0.saturation >= 34
        }

        guard !heroColors.isEmpty else { return colors.first }
        let index = Int(hash % UInt32(heroColors.count))
        return heroColors[index]
    }
}
