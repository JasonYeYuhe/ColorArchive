import Foundation
import Observation

@Observable
@MainActor
final class ColorStore {
    var colors: [ColorRecord] = []
    var isLoading = true
    var selectedFamily: ColorFamily?
    var sortOption: SortOption = .hue

    /// Hue-bucketed index for fast harmony lookups
    private var hueIndex: [Int: [ColorRecord]] = [:]

    enum SortOption: String, CaseIterable {
        case hue = "Hue"
        case lightness = "Lightness"
        case name = "Name"
    }

    var filteredColors: [ColorRecord] {
        var result = colors
        if let family = selectedFamily {
            result = result.filter { $0.family == family }
        }
        return sorted(result)
    }

    init() {
        Task {
            let generated = await Task.detached(priority: .userInitiated) {
                ColorGenerator.generateAll()
            }.value
            self.colors = generated
            self.buildHueIndex()
            self.isLoading = false
        }
    }

    // MARK: - Lookup

    func color(byId id: String) -> ColorRecord? {
        colors.first { $0.id == id }
    }

    func colorsInFamily(_ family: ColorFamily) -> [ColorRecord] {
        colors.filter { $0.family == family }
    }

    /// Get colors in a hue range (±tolerance) for faster harmony searches
    func colorsNearHue(_ targetHue: Int, tolerance: Int = 30) -> [ColorRecord] {
        var result: [ColorRecord] = []
        for offset in -tolerance...tolerance {
            let hue = ((targetHue + offset) % 360 + 360) % 360
            if let bucket = hueIndex[hue] {
                result.append(contentsOf: bucket)
            }
        }
        return result
    }

    // MARK: - Search

    func search(_ query: String) -> [ColorRecord] {
        SemanticSearch.search(colors, query: query)
    }

    // MARK: - Color of Day

    func colorOfDay(date: Date = Date()) -> ColorRecord? {
        ColorOfDay.pick(from: colors, date: date)
    }

    // MARK: - Private

    private func buildHueIndex() {
        hueIndex = Dictionary(grouping: colors) { $0.hue }
    }

    private func sorted(_ colors: [ColorRecord]) -> [ColorRecord] {
        switch sortOption {
        case .hue:
            return colors.sorted { a, b in
                if a.hue != b.hue { return a.hue < b.hue }
                if a.saturation != b.saturation { return a.saturation < b.saturation }
                return a.lightness < b.lightness
            }
        case .lightness:
            return colors.sorted { $0.lightness < $1.lightness }
        case .name:
            return colors.sorted { $0.name < $1.name }
        }
    }
}
