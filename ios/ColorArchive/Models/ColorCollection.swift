import Foundation

struct ColorCollection: Identifiable {
    let id: String
    let title: String
    let summary: String
    let tags: [String]
    let colorIds: [String]
    let useCases: [String]
}
