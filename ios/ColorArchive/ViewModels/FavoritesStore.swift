import Foundation
import Observation

@Observable
@MainActor
final class FavoritesStore {
    private(set) var favoriteIds: Set<String> = []

    private let storageKey = "colorarchive-favorites"

    var count: Int { favoriteIds.count }

    init() {
        load()
    }

    func isFavorite(_ id: String) -> Bool {
        favoriteIds.contains(id)
    }

    func toggle(_ id: String) {
        if favoriteIds.contains(id) {
            favoriteIds.remove(id)
        } else {
            favoriteIds.insert(id)
        }
        HapticManager.light()
        save()
    }

    func favoriteColors(from allColors: [ColorRecord]) -> [ColorRecord] {
        allColors.filter { favoriteIds.contains($0.id) }
    }

    private func load() {
        guard let data = UserDefaults.standard.data(forKey: storageKey),
              let ids = try? JSONDecoder().decode(Set<String>.self, from: data) else {
            return
        }
        favoriteIds = ids
    }

    private func save() {
        guard let data = try? JSONEncoder().encode(favoriteIds) else { return }
        UserDefaults.standard.set(data, forKey: storageKey)
    }
}
