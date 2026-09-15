import SwiftUI

struct HexMetricModel: Identifiable, Hashable {
    let id: String
    let value: String
    let label: String
    let accent: EosAccent
}

struct DashboardMetric: Identifiable, Hashable {
    let id: String
    let title: String
    let value: String
    let change: String
    let detail: String
    let accent: EosAccent
}

struct FeatureHighlight: Identifiable, Hashable {
    let id: String
    let title: String
    let detail: String
    let systemImage: String
    let accent: EosAccent
}

struct ProgramSummary: Identifiable, Hashable {
    let id: String
    let title: String
    let coach: String
    let duration: String
    let focus: String
    let progress: Double
    let accent: EosAccent
}

struct BookingSummary: Identifiable, Hashable {
    let id: String
    let title: String
    let time: String
    let location: String
    let status: String
    let accent: EosAccent
}

struct AppNotificationItem: Identifiable, Hashable {
    let id: String
    let title: String
    let body: String
    let timestamp: String
    let accent: EosAccent
}

struct MessageThread: Identifiable, Hashable {
    let id: String
    let participant: String
    let preview: String
    let unreadCount: Int
    let accent: EosAccent
}

struct DemoMessage: Identifiable, Hashable {
    let id: String
    let sender: String
    let body: String
    let timestamp: String
    let isCurrentUser: Bool
}

struct AthleteRosterCard: Identifiable, Hashable {
    let id: String
    let name: String
    let status: String
    let focus: String
    let nextSession: String
    let accent: EosAccent
}

enum SettingsValueStyle: Hashable {
    case toggle(Bool)
    case detail(String)
}

struct SettingsRowModel: Identifiable, Hashable {
    let id: String
    let title: String
    let subtitle: String
    let systemImage: String
    let accent: EosAccent
    let value: SettingsValueStyle
}

struct SettingsSectionModel: Identifiable, Hashable {
    let id: String
    let title: String
    let rows: [SettingsRowModel]
}

struct ZoneSlice: Identifiable, Hashable {
    let id: String
    let name: String
    let duration: String
    let share: Double
    let accent: EosAccent
}

struct RoutePoint: Identifiable, Hashable {
    let id: String
    let x: Double
    let y: Double
}

struct ActivityMapSnapshot: Hashable {
    let title: String
    let distance: String
    let duration: String
    let elevation: String
    let points: [RoutePoint]
    let callouts: [FeatureHighlight]
}

struct AthleteDashboardSnapshot: Hashable {
    let athleteName: String
    let greeting: String
    let readiness: String
    let recovery: String
    let focus: String
    let metrics: [HexMetricModel]
    let bento: [DashboardMetric]
    let highlights: [FeatureHighlight]
}

struct CoachOverviewSnapshot: Hashable {
    let coachName: String
    let rosterCount: String
    let utilization: String
    let focus: String
    let metrics: [DashboardMetric]
    let priorities: [FeatureHighlight]
}

enum DemoCatalog {
    static let athleteDashboard = AthleteDashboardSnapshot(
        athleteName: "Athlete",
        greeting: "Feed is social. Recovery numbers stay missing until HealthKit or a wearable confirms them.",
        readiness: "MISSING",
        recovery: "HRV, sleep and resting HR are not estimated from this screen.",
        focus: "Open TRAIN to start a session. No invented load.",
        metrics: [
            HexMetricModel(id: "readiness", value: "—", label: "Readiness", accent: .voltline),
            HexMetricModel(id: "sleep", value: "—", label: "Sleep", accent: .iris),
            HexMetricModel(id: "load", value: "—", label: "Load", accent: .telemetry),
            HexMetricModel(id: "hrv", value: "—", label: "HRV", accent: .success)
        ],
        bento: [
            DashboardMetric(
                id: "healthkit",
                title: "HealthKit",
                value: "Not authorized",
                change: "Granular request at need",
                detail: "Heart rate, HRV and sleep stay blank until the user allows each type.",
                accent: .telemetry
            ),
            DashboardMetric(
                id: "sync",
                title: "Cloud sync",
                value: "Pending",
                change: "Local first",
                detail: "Completed sessions remain on-device until the API confirms save.",
                accent: .warning
            )
        ],
        highlights: [
            FeatureHighlight(id: "train", title: "TRAIN", detail: "Catalog, briefing, rounds, pause, save.", systemImage: "figure.run", accent: .voltline),
            FeatureHighlight(id: "fight", title: "Fight Mode", detail: "33 disciplines. Watch IMU is never punch force.", systemImage: "figure.martial.arts", accent: .alert),
            FeatureHighlight(id: "connections", title: "Connections", detail: "Health, Watch, WHOOP, Oura, Garmin, Strava.", systemImage: "link", accent: .iris)
        ]
    )

    static let athleteDiscover: [FeatureHighlight] = [
        FeatureHighlight(
            id: "ascend",
            title: "Ascend",
            detail: "XP appears only from sessions this identity actually completed.",
            systemImage: "chart.line.uptrend.xyaxis",
            accent: .voltline
        )
    ]

    static let athletePrograms: [ProgramSummary] = []
    static let athleteBookings: [BookingSummary] = []
    static let athleteNotifications: [AppNotificationItem] = []
    static let athleteThreads: [MessageThread] = []
    static let athleteMessages: [DemoMessage] = []
    static let athleteZones: [ZoneSlice] = []

    static let athleteSettings = [
        SettingsSectionModel(
            id: "training",
            title: "Training",
            rows: [
                SettingsRowModel(id: "smart-prompts", title: "Smart prompts", subtitle: "Coaching cues during key blocks.", systemImage: "sparkles", accent: .voltline, value: .toggle(true)),
                SettingsRowModel(id: "reduced-motion", title: "Reduced motion", subtitle: "Calmer transitions.", systemImage: "figure.walk.motion", accent: .iris, value: .toggle(false))
            ]
        ),
        SettingsSectionModel(
            id: "privacy",
            title: "Privacy",
            rows: [
                SettingsRowModel(id: "health-share", title: "Share health socially", subtitle: "HR, HRV, sleep and impact stay private unless you enable this.", systemImage: "lock.heart", accent: .alert, value: .toggle(false)),
                SettingsRowModel(id: "glance-recovery", title: "Show Recovery on Widget", subtitle: "Off by default. Widgets never invent HRV or sleep.", systemImage: "heart.text.square", accent: .telemetry, value: .toggle(false)),
                SettingsRowModel(id: "glance-hr", title: "Show Heart Rate on Live Activity", subtitle: "Lock Screen and Dynamic Island stay conservative.", systemImage: "heart", accent: .alert, value: .toggle(false)),
                SettingsRowModel(id: "glance-lock", title: "Show Workout Details on Lock Screen", subtitle: "Phase and next action. Heart rate still follows the HR toggle.", systemImage: "lock.iphone", accent: .iris, value: .toggle(true)),
                SettingsRowModel(id: "glance-coach", title: "Show Coach Notifications", subtitle: "Booking and message alerts only.", systemImage: "bell", accent: .connect, value: .toggle(true)),
                SettingsRowModel(id: "glance-device", title: "Show Device Status", subtitle: "Sync issues can appear as notifications.", systemImage: "applewatch", accent: .warning, value: .toggle(true)),
                SettingsRowModel(id: "healthkit", title: "HealthKit", subtitle: "Authorize per metric. Missing stays missing.", systemImage: "heart.text.square", accent: .telemetry, value: .detail("Review"))
            ]
        )
    ]

    static let athleteMap = ActivityMapSnapshot(
        title: "No route loaded",
        distance: "MISSING",
        duration: "MISSING",
        elevation: "MISSING",
        points: [],
        callouts: [
            FeatureHighlight(
                id: "gps",
                title: "GPS",
                detail: "A route appears after a HealthKit or device workout with location samples.",
                systemImage: "map",
                accent: .telemetry
            )
        ]
    )

    static let coachOverview = CoachOverviewSnapshot(
        coachName: "Coach",
        rosterCount: "0",
        utilization: "MISSING",
        focus: "Roster, bookings and payouts stay empty until the API returns them.",
        metrics: [
            DashboardMetric(
                id: "revenue",
                title: "Payouts",
                value: "NOT CONNECTED",
                change: "Stripe Connect",
                detail: "No live secret. No fake EUR balance.",
                accent: .warning
            ),
            DashboardMetric(
                id: "bookings",
                title: "Bookings",
                value: "0",
                change: "This week",
                detail: "Empty calendar is empty. Stripe-down never confirms a slot.",
                accent: .telemetry
            )
        ],
        priorities: [
            FeatureHighlight(id: "stripe", title: "Stripe", detail: "Checkout exists in the repository. Live keys are a human action.", systemImage: "creditcard", accent: .voltline)
        ]
    )

    static let coachAthletes: [AthleteRosterCard] = []
    static let coachPrograms: [ProgramSummary] = []
    static let coachBookings: [BookingSummary] = []
    static let coachNotifications: [AppNotificationItem] = []
    static let coachThreads: [MessageThread] = []
    static let coachMessages: [DemoMessage] = []

    static let coachSettings = [
        SettingsSectionModel(
            id: "platform",
            title: "Platform",
            rows: [
                SettingsRowModel(id: "one-login", title: "ONE LOGIN", subtitle: "Switch to Athlete without signing out.", systemImage: "person.2", accent: .iris, value: .detail("Mode")),
                SettingsRowModel(id: "stripe", title: "Stripe Connect", subtitle: "Repository architecture is complete. Keys are not in the app.", systemImage: "creditcard", accent: .warning, value: .detail("Not configured"))
            ]
        )
    ]
}
