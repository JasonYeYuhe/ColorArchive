import Foundation

@MainActor
class FavoritesStore: ObservableObject {
    @Published private(set) var favoriteIds: Set<String> = []

    private let storageKey = "colorarchive-favorites"

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
        save()
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
