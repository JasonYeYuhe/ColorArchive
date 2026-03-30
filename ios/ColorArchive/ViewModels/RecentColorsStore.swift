import Foundation
import Observation

@Observable
@MainActor
final class RecentColorsStore {
    private(set) var recentIds: [String] = []
    private let storageKey = "colorarchive-recent"
    private let maxRecent = 50

    init() {
        load()
    }

    func add(_ colorId: String) {
        recentIds.removeAll { $0 == colorId }
        recentIds.insert(colorId, at: 0)
        if recentIds.count > maxRecent {
            recentIds = Array(recentIds.prefix(maxRecent))
        }
        save()
    }

    func recentColors(from allColors: [ColorRecord]) -> [ColorRecord] {
        recentIds.compactMap { id in allColors.first { $0.id == id } }
    }

    func clear() {
        recentIds.removeAll()
        save()
    }

    private func load() {
        guard let data = UserDefaults.standard.data(forKey: storageKey),
              let ids = try? JSONDecoder().decode([String].self, from: data) else { return }
        recentIds = ids
    }

    private func save() {
        guard let data = try? JSONEncoder().encode(recentIds) else { return }
        UserDefaults.standard.set(data, forKey: storageKey)
    }
}
