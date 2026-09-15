import Foundation

enum BackgroundClass: String, Codable {
    case continuousSession = "CONTINUOUS_SESSION"
    case eventDriven = "EVENT_DRIVEN"
    case periodicSync = "PERIODIC_SYNC"
    case pushDriven = "PUSH_DRIVEN"
    case userInitiated = "USER_INITIATED"
    case notNeeded = "NOT_NEEDED"
}

struct BackgroundWorkload: Equatable {
    var feature: String
    var classification: BackgroundClass
    var iosMechanism: String
    var watchMechanism: String
    var androidMechanism: String
    var webMechanism: String
    var batteryCost: String
}

enum BackgroundPolicy {
    static let keepEntireAppAlive = false

    static let catalog: [BackgroundWorkload] = [
        BackgroundWorkload(feature: "TRAIN / Fight Mode", classification: .continuousSession, iosMechanism: "HKWorkoutSession + ActivityKit Live Activity", watchMechanism: "HKWorkoutSession + HKLiveWorkoutBuilder", androidMechanism: "Foreground service (workout) + ongoing notification", webMechanism: "Foreground tab + Page Visibility", batteryCost: "high-during-session"),
        BackgroundWorkload(feature: "HealthKit / Health Connect sync", classification: .eventDriven, iosMechanism: "HK observer + background delivery", watchMechanism: "session samples only", androidMechanism: "Health Connect + WorkManager", webMechanism: "server webhook", batteryCost: "low"),
        BackgroundWorkload(feature: "WHOOP / Oura / Garmin / Strava", classification: .pushDriven, iosMechanism: "APNs after server webhook", watchMechanism: "none", androidMechanism: "FCM after server webhook", webMechanism: "server webhook", batteryCost: "low"),
        BackgroundWorkload(feature: "Feed / Ascend / Zenith / MCP", classification: .notNeeded, iosMechanism: "none", watchMechanism: "none", androidMechanism: "none", webMechanism: "none", batteryCost: "none"),
        BackgroundWorkload(feature: "Booking / Coach messages", classification: .pushDriven, iosMechanism: "APNs", watchMechanism: "notification", androidMechanism: "FCM", webMechanism: "push if permitted", batteryCost: "low"),
        BackgroundWorkload(feature: "Widget timelines", classification: .periodicSync, iosMechanism: "WidgetKit budgeted timeline", watchMechanism: "complication/widget timeline", androidMechanism: "AppWidget updatePeriodMillis", webMechanism: "none", batteryCost: "low"),
        BackgroundWorkload(feature: "Deferred telemetry sync", classification: .periodicSync, iosMechanism: "BGAppRefreshTask", watchMechanism: "none", androidMechanism: "WorkManager", webMechanism: "online fetch", batteryCost: "low"),
        BackgroundWorkload(feature: "BLE accessories", classification: .userInitiated, iosMechanism: "CoreBluetooth only while session needs it", watchMechanism: "none", androidMechanism: "GATT while session needs it", webMechanism: "none", batteryCost: "medium-during-session"),
        BackgroundWorkload(feature: "GPS route", classification: .continuousSession, iosMechanism: "workout + location only for outdoor TRAIN", watchMechanism: "workout location if outdoor", androidMechanism: "CaptureLocationService FGS location", webMechanism: "none", batteryCost: "high-during-session"),
        BackgroundWorkload(feature: "Audio cues", classification: .continuousSession, iosMechanism: "session-scoped cues, no permanent audio mode", watchMechanism: "haptics", androidMechanism: "session notification", webMechanism: "none", batteryCost: "low")
    ]

    static func mechanism(for feature: String, platform: String) -> String? {
        guard let row = catalog.first(where: { $0.feature == feature }) else { return nil }
        switch platform {
        case "ios": return row.iosMechanism
        case "watchOS": return row.watchMechanism
        case "android": return row.androidMechanism
        case "web": return row.webMechanism
        default: return nil
        }
    }

    static func allowsPermanentProcess() -> Bool { keepEntireAppAlive }
}
