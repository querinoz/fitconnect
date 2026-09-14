import SwiftUI

enum MotionTokens {
    static func quick(reduceMotion: Bool) -> Animation? {
        reduceMotion ? nil : .easeOut(duration: 0.18)
    }

    static func card(reduceMotion: Bool) -> Animation? {
        reduceMotion ? nil : .spring(response: 0.34, dampingFraction: 0.82)
    }

    static func hero(reduceMotion: Bool) -> Animation? {
        reduceMotion ? nil : .spring(response: 0.46, dampingFraction: 0.88)
    }
}
