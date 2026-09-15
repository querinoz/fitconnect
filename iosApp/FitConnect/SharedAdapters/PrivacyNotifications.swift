import Foundation

enum APNsTopic: String, CaseIterable {
    case workoutReminder = "workout_reminder"
    case bookingReminder = "booking_reminder"
    case coachMessage = "coach_message"
    case recovery = "recovery"
    case deviceSync = "device_sync"
    case sessionComplete = "session_complete"
}

struct NotificationDraft: Hashable {
    var topic: APNsTopic
    var title: String
    var body: String
    var containsHealth: Bool
}

enum NotificationPrivacy {
    static func allowed(_ draft: NotificationDraft, healthSharingEnabled: Bool) -> Bool {
        if draft.containsHealth && !healthSharingEnabled { return false }
        return true
    }

    static func bodyContainsBlockedHealth(_ text: String) -> Bool {
        let blocked = ["hrv", "heart rate", "sleep", "force n", "concussion", "impact_force"]
        let lower = text.lowercased()
        return blocked.contains { lower.contains($0) }
    }
}

enum ZenithIOSContext {
    static func briefing(disciplineId: String, presentMetrics: [String]) -> String {
        let name = disciplineId.replacingOccurrences(of: "_", with: " ")
        let telemetry = presentMetrics.isEmpty ? "No valid combat telemetry in this turn." : "Valid telemetry: \(presentMetrics.joined(separator: ", "))."
        return "\(name). No official scores from a generic wearable. No concussion diagnosis. \(telemetry)"
    }
}
