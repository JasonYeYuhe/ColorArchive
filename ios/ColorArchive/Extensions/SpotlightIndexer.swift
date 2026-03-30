import Foundation
#if canImport(CoreSpotlight)
import CoreSpotlight
#endif
#if canImport(UniformTypeIdentifiers)
import UniformTypeIdentifiers
#endif

enum SpotlightIndexer {

    static let domainId = "me.colorarchive.colors"

    /// Index all colors for Spotlight search
    static func indexColors(_ colors: [ColorRecord]) {
        #if canImport(CoreSpotlight)
        Task.detached(priority: .background) {
            let items = colors.map { color -> CSSearchableItem in
                let attrs = CSSearchableItemAttributeSet(contentType: UTType.data)
                attrs.title = color.name
                attrs.contentDescription = "\(color.hex) · \(color.family.rawValue) · \(color.hslString)"
                attrs.keywords = [
                    color.name,
                    color.hex,
                    color.family.rawValue,
                    color.id
                ]
                attrs.displayName = color.name

                return CSSearchableItem(
                    uniqueIdentifier: "color-\(color.id)",
                    domainIdentifier: domainId,
                    attributeSet: attrs
                )
            }

            // Index in batches of 500 to avoid memory pressure
            let batchSize = 500
            for start in stride(from: 0, to: items.count, by: batchSize) {
                let end = min(start + batchSize, items.count)
                let batch = Array(items[start..<end])
                try? await CSSearchableIndex.default().indexSearchableItems(batch)
            }
        }
        #endif
    }

    /// Remove all indexed items
    static func removeAll() {
        #if canImport(CoreSpotlight)
        CSSearchableIndex.default().deleteSearchableItems(withDomainIdentifiers: [domainId]) { _ in }
        #endif
    }

    /// Parse a Spotlight activity to get the color ID
    static func colorId(from userActivity: NSUserActivity) -> String? {
        #if canImport(CoreSpotlight)
        guard userActivity.activityType == CSSearchableItemActionType,
              let identifier = userActivity.userInfo?[CSSearchableItemActivityIdentifier] as? String else {
            return nil
        }
        return identifier.replacingOccurrences(of: "color-", with: "")
        #else
        return nil
        #endif
    }
}
