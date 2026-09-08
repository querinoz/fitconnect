import SwiftUI

enum EosColors {
    static let floor = Color(red: 7 / 255, green: 11 / 255, blue: 20 / 255)
    static let voltline = Color(red: 200 / 255, green: 1, blue: 0)
    static let iris = Color(red: 108 / 255, green: 99 / 255, blue: 1)
    static let telemetry = Color(red: 60 / 255, green: 215 / 255, blue: 1)
    static let success = Color(red: 0, green: 224 / 255, blue: 144 / 255)
    static let warning = Color(red: 1, green: 176 / 255, blue: 32 / 255)
    static let alert = Color(red: 1, green: 58 / 255, blue: 92 / 255)

    static let surface = Color.white.opacity(0.08)
    static let surfaceRaised = Color.white.opacity(0.12)
    static let stroke = Color.white.opacity(0.14)
    static let textPrimary = Color.white.opacity(0.96)
    static let textSecondary = Color.white.opacity(0.72)
    static let muted = Color.white.opacity(0.52)

    static let heroGradient = LinearGradient(
        colors: [floor, floor, iris.opacity(0.35), telemetry.opacity(0.18)],
        startPoint: .topLeading,
        endPoint: .bottomTrailing
    )

    static let trainGradient = LinearGradient(
        colors: [voltline, telemetry],
        startPoint: .topLeading,
        endPoint: .bottomTrailing
    )

    static func tint(for accent: EosAccent) -> Color {
        switch accent {
        case .voltline:
            return voltline
        case .iris:
            return iris
        case .telemetry:
            return telemetry
        case .success:
            return success
        case .warning:
            return warning
        case .alert:
            return alert
        }
    }
}

enum EosAccent: String, Hashable, CaseIterable {
    case voltline
    case iris
    case telemetry
    case success
    case warning
    case alert

    var color: Color {
        EosColors.tint(for: self)
    }
}
