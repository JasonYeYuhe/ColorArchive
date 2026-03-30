import SwiftUI

enum HapticManager {
    #if os(iOS)
    static func light() {
        UIImpactFeedbackGenerator(style: .light).impactOccurred()
    }

    static func medium() {
        UIImpactFeedbackGenerator(style: .medium).impactOccurred()
    }

    static func success() {
        UINotificationFeedbackGenerator().notificationOccurred(.success)
    }

    static func selection() {
        UISelectionFeedbackGenerator().selectionChanged()
    }
    #else
    static func light() {}
    static func medium() {}
    static func success() {}
    static func selection() {}
    #endif
}
