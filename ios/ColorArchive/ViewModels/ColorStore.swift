import Foundation
import Combine

@MainActor
class ColorStore: ObservableObject {
    @Published var colors: [ColorRecord] = []
    @Published var isLoading = true
    @Published var selectedFamily: ColorFamily?
    @Published var sortOption: SortOption = .hue

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
            self.isLoading = false
        }
    }

    func color(byId id: String) -> ColorRecord? {
        colors.first { $0.id == id }
    }

    func colorsInFamily(_ family: ColorFamily) -> [ColorRecord] {
        colors.filter { $0.family == family }
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
