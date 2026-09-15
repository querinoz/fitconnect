import Foundation

struct GlanceSnapshot: Codable, Equatable {
    var sessionId: String
    var kind: String
    var phase: String
    var title: String
    var remainingSec: Int
    var roundLabel: String
    var nextAction: String
    var heartRateLabel: String
    var sport: String
    var durationMin: Int
    var syncStatus: String
    var deviceStatus: String
    var coachNext: String
    var xp: Int
    var streak: Int
    var recoveryHRV: String
    var recoverySleep: String
    var updatedAt: TimeInterval
    var deepLink: String

    static let idle = GlanceSnapshot(
        sessionId: "",
        kind: "idle",
        phase: "IDLE",
        title: "No session",
        remainingSec: 0,
        roundLabel: "",
        nextAction: "Open TRAIN",
        heartRateLabel: "DATA UNAVAILABLE",
        sport: "Strength",
        durationMin: 45,
        syncStatus: "IDLE",
        deviceStatus: "NOT CONNECTED",
        coachNext: "No bookings",
        xp: 0,
        streak: 0,
        recoveryHRV: "DATA UNAVAILABLE",
        recoverySleep: "DATA UNAVAILABLE",
        updatedAt: 0,
        deepLink: FitDeepLink.train
    )

    var isLive: Bool {
        ["ACTIVE", "WARMUP", "WARNING", "REST", "PAUSED", "PREP", "ROUND", "WORK", "COUNTDOWN"].contains(phase.uppercased())
    }

    var clock: String {
        String(format: "%d:%02d", remainingSec / 60, remainingSec % 60)
    }
}

enum FitDeepLink {
    static let schemeHost = "fitconnect://app"
    static let train = "fitconnect://app/train"
    static let recovery = "fitconnect://app/recovery"
    static let martialArts = "fitconnect://app/martial-arts"
    static let coach = "fitconnect://app/coach"
    static let connections = "fitconnect://app/connections"
    static let ascend = "fitconnect://app/ascend"
    static let feed = "fitconnect://app/feed"
    static let booking = "fitconnect://app/booking"

    static func destination(_ url: URL) -> String {
        let path = url.path.lowercased()
        if path.contains("martial") { return "martial-arts" }
        if path.contains("recover") { return "recovery" }
        if path.contains("coach") { return "coach" }
        if path.contains("connect") { return "connections" }
        if path.contains("ascend") { return "ascend" }
        if path.contains("feed") { return "feed" }
        if path.contains("book") { return "booking" }
        return "train"
    }
}

enum GlanceSurface: String {
    case widget
    case liveActivity
    case notification
    case complication
}

enum GlancePrivacy {
    static let suiteHint = "group.com.fitconnect.ios"

    static func showRecoveryOnWidget(_ defaults: UserDefaults) -> Bool {
        defaults.bool(forKey: "glance.showRecovery")
    }

    static func showHeartRateOnLiveActivity(_ defaults: UserDefaults) -> Bool {
        defaults.bool(forKey: "glance.showHeartRate")
    }

    static func showWorkoutDetailsOnLockScreen(_ defaults: UserDefaults) -> Bool {
        defaults.object(forKey: "glance.showLockDetails") as? Bool ?? true
    }

    static func redact(_ snap: GlanceSnapshot, surface: GlanceSurface, defaults: UserDefaults) -> GlanceSnapshot {
        var next = snap
        if surface == .widget && !showRecoveryOnWidget(defaults) {
            next.recoveryHRV = "HIDDEN"
            next.recoverySleep = "HIDDEN"
        }
        if (surface == .liveActivity || surface == .notification) && !showHeartRateOnLiveActivity(defaults) {
            next.heartRateLabel = "HIDDEN"
        }
        if surface == .liveActivity && !showWorkoutDetailsOnLockScreen(defaults) {
            next.title = "TRAINING"
            next.nextAction = ""
            next.roundLabel = ""
        }
        return next
    }
}

enum GlanceCommand: String {
    case none
    case pause
    case resume
    case skipRest
}

enum GlanceSharedStore {
    static let snapshotKey = "fitconnect.glance.snapshot"
    static let commandKey = "fitconnect.glance.command"
    static let groupId = "group.com.fitconnect.ios"

    static func defaults() -> UserDefaults {
        UserDefaults(suiteName: groupId) ?? .standard
    }

    static func load() -> GlanceSnapshot {
        guard let data = defaults().data(forKey: snapshotKey),
              let snap = try? JSONDecoder().decode(GlanceSnapshot.self, from: data)
        else { return .idle }
        return snap
    }

    static func save(_ snap: GlanceSnapshot) {
        var next = snap
        next.updatedAt = Date().timeIntervalSince1970
        if let data = try? JSONEncoder().encode(next) {
            defaults().set(data, forKey: snapshotKey)
        }
    }

    static func enqueue(_ command: GlanceCommand) {
        defaults().set(command.rawValue, forKey: commandKey)
    }

    static func takeCommand() -> GlanceCommand {
        let raw = defaults().string(forKey: commandKey) ?? GlanceCommand.none.rawValue
        defaults().set(GlanceCommand.none.rawValue, forKey: commandKey)
        return GlanceCommand(rawValue: raw) ?? .none
    }
}

enum WidgetTimelinePolicy {
    static let liveMinutes = 15
    static let dailyMinutes = 60

    static func reloadMinutes(isLive: Bool) -> Int {
        isLive ? liveMinutes : dailyMinutes
    }
}
