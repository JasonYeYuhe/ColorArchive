import Foundation
import SwiftData

@Model
final class Palette {
    var id: UUID
    var name: String
    var colorIds: [String]
    var createdAt: Date
    var updatedAt: Date

    init(name: String = "Untitled Palette", colorIds: [String] = []) {
        self.id = UUID()
        self.name = name
        self.colorIds = colorIds
        self.createdAt = Date()
        self.updatedAt = Date()
    }

    var colorCount: Int { colorIds.count }
    var isFull: Bool { colorIds.count >= 8 }

    func addColor(_ colorId: String) {
        guard !colorIds.contains(colorId), !isFull else { return }
        colorIds.append(colorId)
        updatedAt = Date()
    }

    func removeColor(_ colorId: String) {
        colorIds.removeAll { $0 == colorId }
        updatedAt = Date()
    }

    func reorder(from: IndexSet, to: Int) {
        colorIds.move(fromOffsets: from, toOffset: to)
        updatedAt = Date()
    }
}
