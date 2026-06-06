import Foundation
import Observation
import SwiftUI

@Observable
@MainActor
final class FavoritesStore {
    private(set) var favoriteIds: Set<String> = []
    private(set) var isSyncing = false
    private(set) var syncError: String?

    private let storageKey = "colorarchive-favorites"

    var count: Int { favoriteIds.count }

    init() {
        load()
    }

    func isFavorite(_ id: String) -> Bool {
        favoriteIds.contains(id)
    }

    func toggle(_ id: String) {
        let nowFavorite: Bool
        if favoriteIds.contains(id) {
            favoriteIds.remove(id)
            nowFavorite = false
        } else {
            favoriteIds.insert(id)
            nowFavorite = true
        }
        AnalyticsBootstrap.capture("favorite_toggled", ["action": nowFavorite ? "add" : "remove", "color_id": id])
        HapticManager.light()
        save()
    }

    func favoriteColors(from allColors: [ColorRecord]) -> [ColorRecord] {
        allColors.filter { favoriteIds.contains($0.id) }
    }

    // MARK: - Cloud Sync

    /// Merge cloud favorites with local (union). Called after login or foreground return.
    /// Uses isSyncing guard to prevent concurrent sync operations.
    func syncFromCloud() async {
        guard !isSyncing else { return }
        isSyncing = true
        syncError = nil
        defer { isSyncing = false }

        do {
            let prefs = try await APIService.fetchPreferences()
            let cloudIds = Set(prefs.favorites)
            let merged = favoriteIds.union(cloudIds)
            if merged != favoriteIds {
                favoriteIds = merged
                save()
            }
            // Push merged set back to cloud if local had extras
            if merged != cloudIds {
                _ = try await APIService.savePreferences(
                    favorites: Array(merged),
                    palette: prefs.palette
                )
            }
        } catch {
            syncError = error.localizedDescription
            print("[FavoritesStore] Cloud sync failed:", error)
        }
    }

    // MARK: - Local Persistence

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
