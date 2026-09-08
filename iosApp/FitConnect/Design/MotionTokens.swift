import SwiftUI

enum MotionTokens {
    static let quick = Animation.easeOut(duration: 0.18)
    static let smooth = Animation.spring(response: 0.42, dampingFraction: 0.86)
    static let emphasis = Animation.spring(response: 0.58, dampingFraction: 0.8)
    static let reduced = Animation.linear(duration: 0.01)
}
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
