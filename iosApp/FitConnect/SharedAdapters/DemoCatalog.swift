import Foundation

enum DemoCatalog {
    struct Metric: Identifiable, Hashable {
        let id: String
        let label: String
        let value: String
        let delta: String
    }

    struct Program: Identifiable, Hashable {
        let id: String
        let title: String
        let coach: String
        let focus: String
        let duration: String
        let compliance: String
    }

    struct Booking: Identifiable, Hashable {
        let id: String
        let title: String
        let counterpart: String
        let time: String
        let location: String
        let notes: String
    }

    struct Message: Identifiable, Hashable {
        let id: String
        let sender: String
        let preview: String
        let timestamp: String
        let isLocalUser: Bool
    }

    struct NotificationItem: Identifiable, Hashable {
        let id: String
        let title: String
        let body: String
        let status: String
    }

    struct AthleteDigest: Identifiable, Hashable {
        let id: String
        let name: String
        let focus: String
        let readiness: String
        let alert: String
    }

    struct CalendarEntry: Identifiable, Hashable {
        let id: String
        let title: String
        let slot: String
        let lane: String
    }

    struct RevenueSlice: Identifiable, Hashable {
        let id: String
        let label: String
        let value: String
    }

    struct SettingToggle: Identifiable, Hashable {
        let id: String
        let title: String
        let subtitle: String
        let isOn: Bool
    }

    static let athleteUser = DemoUser(
        id: "athlete-demo",
        name: "Ines Duarte",
        role: .athlete,
        headline: "Hybrid athlete · road, gym, recovery",
        location: "Porto · LOCAL_DEMO"
    )

    static let coachUser = DemoUser(
        id: "coach-demo",
        name: "Tomas Ribeiro",
        role: .coach,
        headline: "Performance coach · remote squad ops",
        location: "Lisbon · LOCAL_DEMO"
    )

    static let athleteTopMetrics = [
        Metric(id: "readiness", label: "Readiness", value: "87%", delta: "+6 today"),
        Metric(id: "hrv", label: "HRV", value: "71", delta: "green band"),
        Metric(id: "load", label: "Load", value: "412", delta: "balanced")
    ]

    static let analysisTrend: [Double] = [52, 57, 60, 58, 64, 68, 72, 71, 76, 80, 84, 87]
    static let telemetryTrend: [Double] = [44, 48, 52, 50, 58, 62, 68]

    static let athletePrograms = [
        Program(id: "prog-1", title: "Build Week 4", coach: "Tomas", focus: "Strength + tempo run", duration: "7 days", compliance: "92%"),
        Program(id: "prog-2", title: "Recovery Microcycle", coach: "Tomas", focus: "Mobility + easy aerobic", duration: "3 days", compliance: "100%")
    ]

    static let athleteBookings = [
        Booking(id: "book-1", title: "Biomechanics Review", counterpart: "Coach Tomas", time: "Thu · 18:30", location: "Remote video", notes: "LOCAL_DEMO confirmed"),
        Booking(id: "book-2", title: "Strength Lab", counterpart: "Coach Tomas", time: "Sat · 10:00", location: "FitConnect Lab", notes: "Bring lifting shoes")
    ]

    static let athleteMessages = [
        Message(id: "msg-1", sender: "Coach Tomas", preview: "Keep the first two intervals below threshold so the last block stays sharp.", timestamp: "09:12", isLocalUser: false),
        Message(id: "msg-2", sender: "You", preview: "Confirmed. I will swap the easy spin for a mobility block after the lift.", timestamp: "09:18", isLocalUser: true),
        Message(id: "msg-3", sender: "Coach Tomas", preview: "Perfect. Upload your RPE after the session and I will adjust tomorrow.", timestamp: "09:21", isLocalUser: false)
    ]

    static let athleteNotifications = [
        NotificationItem(id: "note-1", title: "Workout ready", body: "Train menu loaded your threshold ride and strength finisher.", status: "ACTION"),
        NotificationItem(id: "note-2", title: "Recovery pulse stable", body: "Morning readiness stayed in the green band after 8h 04m sleep.", status: "GOOD"),
        NotificationItem(id: "note-3", title: "Booking reminder", body: "Biomechanics review starts in 26 hours.", status: "UPCOMING")
    ]

    static let coachNotifications = [
        NotificationItem(id: "coach-note-1", title: "Roster drift detected", body: "Two athletes crossed the fatigue threshold overnight.", status: "WATCH"),
        NotificationItem(id: "coach-note-2", title: "Invoice batch ready", body: "September consult invoices are ready to review.", status: "FINANCE"),
        NotificationItem(id: "coach-note-3", title: "Inbox spike", body: "Eight new athlete replies since the evening check-in.", status: "LIVE")
    ]

    static let squad = [
        AthleteDigest(id: "a-1", name: "Marina Costa", focus: "Iron prep", readiness: "84%", alert: "Stable"),
        AthleteDigest(id: "a-2", name: "Joao Mota", focus: "Strength rebuild", readiness: "71%", alert: "Watch sleep"),
        AthleteDigest(id: "a-3", name: "Rita Vale", focus: "Return to run", readiness: "90%", alert: "Green")
    ]

    static let coachCalendar = [
        CalendarEntry(id: "cal-1", title: "Warmup review", slot: "08:00", lane: "Remote"),
        CalendarEntry(id: "cal-2", title: "Squad stand-up", slot: "10:30", lane: "Studio"),
        CalendarEntry(id: "cal-3", title: "Consult block", slot: "16:00", lane: "Zoom")
    ]

    static let coachRevenue = [
        RevenueSlice(id: "rev-1", label: "This month", value: "EUR 14.8k"),
        RevenueSlice(id: "rev-2", label: "Pending payouts", value: "EUR 3.2k"),
        RevenueSlice(id: "rev-3", label: "Booked hours", value: "48h")
    ]

    static let athleteSettings = [
        SettingToggle(id: "athlete-1", title: "High priority alerts", subtitle: "Push workout, readiness, and coach messages first.", isOn: true),
        SettingToggle(id: "athlete-2", title: "Telemetry summaries", subtitle: "Daily recovery snapshots at 07:00.", isOn: true),
        SettingToggle(id: "athlete-3", title: "Map privacy blur", subtitle: "Hide precise start and end points in shared previews.", isOn: true)
    ]

    static let coachSettings = [
        SettingToggle(id: "coach-1", title: "Roster risk digest", subtitle: "Morning digest for low readiness or missed compliance.", isOn: true),
        SettingToggle(id: "coach-2", title: "Auto-hold new bookings", subtitle: "Require manual review before high-load consult blocks.", isOn: false),
        SettingToggle(id: "coach-3", title: "Revenue checkpoint", subtitle: "Send weekly finance summary every Friday.", isOn: true)
    ]

    static let routePoints = [
        RoutePoint(id: "p1", x: 0.08, y: 0.72),
        RoutePoint(id: "p2", x: 0.18, y: 0.58),
        RoutePoint(id: "p3", x: 0.31, y: 0.52),
        RoutePoint(id: "p4", x: 0.46, y: 0.36),
        RoutePoint(id: "p5", x: 0.64, y: 0.44),
        RoutePoint(id: "p6", x: 0.78, y: 0.27),
        RoutePoint(id: "p7", x: 0.91, y: 0.16)
    ]

    static let queueItems = [
        OfflineQueueItem(id: "queue-1", title: "Telemetry sync", payloadSummary: "14 HRV samples pending upload", retryWindow: "Retry in 02m"),
        OfflineQueueItem(id: "queue-2", title: "Booking ack", payloadSummary: "Biomechanics review confirmation", retryWindow: "Retry on network restore")
    ]

    static let channels = [
        RealtimeSnapshot(id: "rt-1", channel: "athlete.timeline", freshness: "LIVE", listeners: 1),
        RealtimeSnapshot(id: "rt-2", channel: "coach.inbox", freshness: "WARM", listeners: 2)
    ]

    static let endpoints = [
        ContractEndpoint(id: "api-1", name: "Athlete overview", method: "GET", path: "/api/v1/athlete/overview", status: "LOCAL_DEMO"),
        ContractEndpoint(id: "api-2", name: "Coach inbox", method: "GET", path: "/api/v1/coach/inbox", status: "LOCAL_DEMO"),
        ContractEndpoint(id: "api-3", name: "Programs sync", method: "POST", path: "/api/v1/programs/sync", status: "PLANNED")
    ]

    static let healthPermissions = [
        HealthMetricPermission(id: "hk-1", name: "Heart Rate", status: .blockedExternal, note: "BLOCKED_EXTERNAL until HealthKit entitlements and Apple signing exist."),
        HealthMetricPermission(id: "hk-2", name: "Workouts", status: .planned, note: "Path A adapter will request workout read access after capabilities are provisioned.")
    ]

    static let zoneBands = [
        ZoneBand(id: "z1", label: "Zone 1", minutes: 14, colorName: "recovery"),
        ZoneBand(id: "z2", label: "Zone 2", minutes: 31, colorName: "connect"),
        ZoneBand(id: "z3", label: "Zone 3", minutes: 18, colorName: "telemetry"),
        ZoneBand(id: "z4", label: "Zone 4", minutes: 9, colorName: "iris"),
        ZoneBand(id: "z5", label: "Zone 5", minutes: 3, colorName: "alert")
    ]
}
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
        athleteName: "Maya Costa",
        greeting: "Today is set up for threshold confidence.",
        readiness: "82%",
        recovery: "HRV up 6 ms, sleep bank stable.",
        focus: "Bias intensity after 18:00.",
        metrics: [
            HexMetricModel(id: "readiness", value: "82", label: "Readiness", accent: .voltline),
            HexMetricModel(id: "sleep", value: "7.9h", label: "Sleep", accent: .iris),
            HexMetricModel(id: "load", value: "643", label: "Load", accent: .telemetry),
            HexMetricModel(id: "hrv", value: "+6", label: "HRV", accent: .success)
        ],
        bento: [
            DashboardMetric(id: "vo2", title: "VO2 delta", value: "+4.2", change: "vs 14d baseline", detail: "Short efforts are holding form late in the week.", accent: .telemetry),
            DashboardMetric(id: "consistency", title: "Consistency", value: "5/6", change: "Completed sessions", detail: "One mobility block remains to close the week.", accent: .voltline),
            DashboardMetric(id: "strain", title: "Strain guard", value: "Green", change: "Recovery protected", detail: "No overload flag detected from the local queue.", accent: .success)
        ],
        highlights: [
            FeatureHighlight(id: "route", title: "Map route", detail: "Open your climb route and route notes.", systemImage: "map", accent: .telemetry),
            FeatureHighlight(id: "telemetry", title: "Telemetry", detail: "Live zones, cadence and heart-rate blocks.", systemImage: "waveform.path.ecg", accent: .telemetry),
            FeatureHighlight(id: "programs", title: "Programs", detail: "Continue Build Phase 02 with 68% completion.", systemImage: "figure.strengthtraining.traditional", accent: .iris)
        ]
    )

    static let athleteDiscover = [
        FeatureHighlight(id: "analysis", title: "Load vs freshness", detail: "Your high-output days are best 36h after recovery rides.", systemImage: "chart.xyaxis.line", accent: .telemetry),
        FeatureHighlight(id: "fuel", title: "Fuel timing", detail: "Carb timing improved interval repeatability by 7%.", systemImage: "fork.knife", accent: .warning),
        FeatureHighlight(id: "heat", title: "Heat prep", detail: "Add one heat-adaptation block before race week.", systemImage: "sun.max", accent: .alert)
    ]

    static let athletePrograms = [
        ProgramSummary(id: "build-02", title: "Build Phase 02", coach: "Coach Sofia", duration: "4 weeks", focus: "Threshold + long ride durability", progress: 0.68, accent: .voltline),
        ProgramSummary(id: "strength-a", title: "Strength A", coach: "Coach Sofia", duration: "35 min", focus: "Posterior chain and ankle stiffness", progress: 0.41, accent: .iris),
        ProgramSummary(id: "recovery-flow", title: "Recovery Flow", coach: "Coach Sofia", duration: "18 min", focus: "Breath-led recovery mobility", progress: 0.92, accent: .success)
    ]

    static let athleteBookings = [
        BookingSummary(id: "bike-fit", title: "Bike fit refresh", time: "Thu 18:30", location: "Studio Porto", status: "Confirmed", accent: .voltline),
        BookingSummary(id: "race-brief", title: "Race week brief", time: "Sat 09:00", location: "Video call", status: "Queued offline", accent: .warning)
    ]

    static let athleteNotifications = [
        AppNotificationItem(id: "coach-note", title: "Coach note", body: "Threshold set nudged up by 8 watts after yesterday's check-in.", timestamp: "2m ago", accent: .telemetry),
        AppNotificationItem(id: "recovery", title: "Recovery cue", body: "Mobility micro-session unlocked for tonight's cooldown.", timestamp: "25m ago", accent: .success),
        AppNotificationItem(id: "queue", title: "Offline queue", body: "1 annotation will sync when the device is back on a Mac-verified build.", timestamp: "1h ago", accent: .warning)
    ]

    static let athleteThreads = [
        MessageThread(id: "coach-sofia", participant: "Coach Sofia", preview: "Keep the first block smooth, then lift the cadence.", unreadCount: 2, accent: .voltline),
        MessageThread(id: "performance-lab", participant: "Performance Lab", preview: "Your HRV trend pack is ready to review.", unreadCount: 0, accent: .telemetry)
    ]

    static let athleteMessages = [
        DemoMessage(id: "m1", sender: "Coach Sofia", body: "How did the final threshold block feel?", timestamp: "09:14", isCurrentUser: false),
        DemoMessage(id: "m2", sender: "You", body: "Controlled. Last six minutes sat right below the breathing limit.", timestamp: "09:15", isCurrentUser: true),
        DemoMessage(id: "m3", sender: "Coach Sofia", body: "Perfect. Open Telemetry after the cooldown and log the RPE before lunch.", timestamp: "09:16", isCurrentUser: false)
    ]

    static let athleteZones = [
        ZoneSlice(id: "z1", name: "Z1 Recover", duration: "12m", share: 0.20, accent: .success),
        ZoneSlice(id: "z2", name: "Z2 Aerobic", duration: "19m", share: 0.31, accent: .voltline),
        ZoneSlice(id: "z3", name: "Z3 Tempo", duration: "10m", share: 0.16, accent: .iris),
        ZoneSlice(id: "z4", name: "Z4 Threshold", duration: "14m", share: 0.23, accent: .telemetry),
        ZoneSlice(id: "z5", name: "Z5 Surge", duration: "6m", share: 0.10, accent: .alert)
    ]

    static let athleteSettings = [
        SettingsSectionModel(
            id: "training",
            title: "Training",
            rows: [
                SettingsRowModel(id: "smart-prompts", title: "Smart prompts", subtitle: "Surface coaching cues during key blocks.", systemImage: "sparkles", accent: .voltline, value: .toggle(true)),
                SettingsRowModel(id: "reduced-motion", title: "Reduced motion", subtitle: "Calmer transitions for data-heavy surfaces.", systemImage: "figure.walk.motion", accent: .iris, value: .toggle(false))
            ]
        ),
        SettingsSectionModel(
            id: "system",
            title: "System",
            rows: [
                SettingsRowModel(id: "build-status", title: "Build status", subtitle: "Physical build requires macOS and Xcode generation.", systemImage: "desktopcomputer", accent: .warning, value: .detail("Blocked external")),
                SettingsRowModel(id: "healthkit", title: "HealthKit link", subtitle: "Use the contract screen for honest integration state.", systemImage: "heart.text.square", accent: .telemetry, value: .detail("Review contract"))
            ]
        )
    ]

    static let athleteMap = ActivityMapSnapshot(
        title: "Serra warm-up loop",
        distance: "48.6 km",
        duration: "1h 39m",
        elevation: "+612 m",
        points: [
            RoutePoint(id: "p1", x: 0.08, y: 0.70),
            RoutePoint(id: "p2", x: 0.18, y: 0.62),
            RoutePoint(id: "p3", x: 0.34, y: 0.55),
            RoutePoint(id: "p4", x: 0.46, y: 0.39),
            RoutePoint(id: "p5", x: 0.58, y: 0.30),
            RoutePoint(id: "p6", x: 0.72, y: 0.36),
            RoutePoint(id: "p7", x: 0.86, y: 0.24)
        ],
        callouts: [
            FeatureHighlight(id: "climb", title: "Climb trigger", detail: "Start threshold block after point three.", systemImage: "triangle", accent: .voltline),
            FeatureHighlight(id: "descent", title: "Descent note", detail: "Use the last sector for cadence reset and breathing work.", systemImage: "arrow.down.forward", accent: .telemetry)
        ]
    )

    static let coachOverview = CoachOverviewSnapshot(
        coachName: "Sofia Mendes",
        rosterCount: "18 athletes",
        utilization: "76%",
        focus: "Two red-flag check-ins need review before noon.",
        metrics: [
            DashboardMetric(id: "revenue", title: "Revenue", value: "EUR 8.2k", change: "+12% month over month", detail: "Retainers renewed cleanly after the new vault recap.", accent: .voltline),
            DashboardMetric(id: "bookings", title: "Bookings", value: "14", change: "This week", detail: "Four performance reviews, ten program blocks queued.", accent: .telemetry),
            DashboardMetric(id: "compliance", title: "Compliance", value: "Local demo", change: "No external sync claims", detail: "Path A remains source-complete without fake physical-build verification.", accent: .warning)
        ],
        priorities: [
            FeatureHighlight(id: "alerts", title: "Recovery alerts", detail: "Open athlete check-ins before session publishing.", systemImage: "bell.badge", accent: .alert),
            FeatureHighlight(id: "calendar", title: "Calendar load", detail: "Friday is nearing coach-capacity limits.", systemImage: "calendar", accent: .iris),
            FeatureHighlight(id: "inbox", title: "Unread athlete notes", detail: "Three athletes sent post-session feedback.", systemImage: "envelope.badge", accent: .telemetry)
        ]
    )

    static let coachAthletes = [
        AthleteRosterCard(id: "a1", name: "Maya Costa", status: "Ready", focus: "Threshold block tonight", nextSession: "18:30 ride", accent: .voltline),
        AthleteRosterCard(id: "a2", name: "Tiago Vale", status: "Caution", focus: "Sleep debt accumulating", nextSession: "Recovery call", accent: .warning),
        AthleteRosterCard(id: "a3", name: "Ines Rocha", status: "Peak", focus: "Race-week sharpening", nextSession: "12:15 openers", accent: .telemetry)
    ]

    static let coachPrograms = [
        ProgramSummary(id: "roster-build", title: "Autumn Build Cohort", coach: "Sofia Mendes", duration: "6 weeks", focus: "Shared threshold structure with athlete-level adaptations", progress: 0.57, accent: .voltline),
        ProgramSummary(id: "tri-sprint", title: "Sprint Tri Pack", coach: "Sofia Mendes", duration: "3 weeks", focus: "Brick sessions and transition sharpness", progress: 0.74, accent: .telemetry)
    ]

    static let coachBookings = [
        BookingSummary(id: "review-1", title: "Performance review", time: "Wed 08:30", location: "Studio B", status: "Confirmed", accent: .success),
        BookingSummary(id: "consult-1", title: "New athlete consult", time: "Thu 17:00", location: "Video call", status: "Pending", accent: .warning),
        BookingSummary(id: "lab-1", title: "Lab re-test", time: "Fri 11:15", location: "Performance Lab", status: "Confirmed", accent: .voltline)
    ]

    static let coachNotifications = [
        AppNotificationItem(id: "athlete-red", title: "Recovery risk", body: "Tiago Vale posted three consecutive low-readiness mornings.", timestamp: "Just now", accent: .alert),
        AppNotificationItem(id: "queue-coach", title: "Offline queue", body: "2 program notes are staged until the next verified Mac build sync.", timestamp: "14m ago", accent: .warning),
        AppNotificationItem(id: "revenue-up", title: "Revenue pulse", body: "Two retainers renewed after the monthly recap bundle.", timestamp: "1h ago", accent: .voltline)
    ]

    static let coachThreads = [
        MessageThread(id: "maya-thread", participant: "Maya Costa", preview: "Uploaded a note about late-session cadence drift.", unreadCount: 1, accent: .telemetry),
        MessageThread(id: "ines-thread", participant: "Ines Rocha", preview: "Confirmed race week travel and warm-up window.", unreadCount: 0, accent: .iris)
    ]

    static let coachMessages = [
        DemoMessage(id: "c1", sender: "Maya Costa", body: "Cadence drifted once the climb tipped over 6 percent.", timestamp: "10:22", isCurrentUser: false),
        DemoMessage(id: "c2", sender: "Coach", body: "I am shifting the next threshold set to flatter terrain.", timestamp: "10:24", isCurrentUser: true),
        DemoMessage(id: "c3", sender: "Maya Costa", body: "Perfect. I will keep the same fueling plan for comparison.", timestamp: "10:25", isCurrentUser: false)
    ]

    static let coachSettings = [
        SettingsSectionModel(
            id: "workflow",
            title: "Workflow",
            rows: [
                SettingsRowModel(id: "alerts", title: "Priority alerts", subtitle: "Bubble red-flag recovery cards to the overview shell.", systemImage: "bell.badge.fill", accent: .alert, value: .toggle(true)),
                SettingsRowModel(id: "queue-coach", title: "Offline queue", subtitle: "Keep notes editable while disconnected.", systemImage: "arrow.triangle.2.circlepath", accent: .telemetry, value: .toggle(true))
            ]
        ),
        SettingsSectionModel(
            id: "platform",
            title: "Platform",
            rows: [
                SettingsRowModel(id: "path-a", title: "Path A status", subtitle: "Generated locally on Windows, buildable on macOS.", systemImage: "hammer", accent: .warning, value: .detail("External Mac required")),
                SettingsRowModel(id: "notifications", title: "Coach notifications", subtitle: "Route athlete alerts into the inbox and more hub.", systemImage: "tray.full", accent: .voltline, value: .detail("Enabled"))
            ]
        )
    ]
}
