import Foundation

struct ContractEndpoint: Identifiable, Hashable {
    let id: String
    let name: String
    let method: String
    let path: String
    let status: String
}

protocol ApiContract {
    func endpoints() async -> [ContractEndpoint]
}
import Foundation

protocol ApiContract {
    func athleteDashboard() -> AthleteDashboardSnapshot
    func athleteDiscoverCards() -> [FeatureHighlight]
    func athletePrograms() -> [ProgramSummary]
    func athleteBookings() -> [BookingSummary]
    func athleteNotifications() -> [AppNotificationItem]
    func athleteThreads() -> [MessageThread]
    func athleteMessages() -> [DemoMessage]
    func athleteSettings() -> [SettingsSectionModel]

    func coachOverview() -> CoachOverviewSnapshot
    func coachAthletes() -> [AthleteRosterCard]
    func coachPrograms() -> [ProgramSummary]
    func coachBookings() -> [BookingSummary]
    func coachNotifications() -> [AppNotificationItem]
    func coachThreads() -> [MessageThread]
    func coachMessages() -> [DemoMessage]
    func coachSettings() -> [SettingsSectionModel]
}

struct LocalDemoApi: ApiContract {
    func athleteDashboard() -> AthleteDashboardSnapshot { DemoCatalog.athleteDashboard }
    func athleteDiscoverCards() -> [FeatureHighlight] { DemoCatalog.athleteDiscover }
    func athletePrograms() -> [ProgramSummary] { DemoCatalog.athletePrograms }
    func athleteBookings() -> [BookingSummary] { DemoCatalog.athleteBookings }
    func athleteNotifications() -> [AppNotificationItem] { DemoCatalog.athleteNotifications }
    func athleteThreads() -> [MessageThread] { DemoCatalog.athleteThreads }
    func athleteMessages() -> [DemoMessage] { DemoCatalog.athleteMessages }
    func athleteSettings() -> [SettingsSectionModel] { DemoCatalog.athleteSettings }

    func coachOverview() -> CoachOverviewSnapshot { DemoCatalog.coachOverview }
    func coachAthletes() -> [AthleteRosterCard] { DemoCatalog.coachAthletes }
    func coachPrograms() -> [ProgramSummary] { DemoCatalog.coachPrograms }
    func coachBookings() -> [BookingSummary] { DemoCatalog.coachBookings }
    func coachNotifications() -> [AppNotificationItem] { DemoCatalog.coachNotifications }
    func coachThreads() -> [MessageThread] { DemoCatalog.coachThreads }
    func coachMessages() -> [DemoMessage] { DemoCatalog.coachMessages }
    func coachSettings() -> [SettingsSectionModel] { DemoCatalog.coachSettings }
}

struct AppServices {
    let api: any ApiContract
    let auth: any AuthContract
    let offlineQueue: any OfflineQueueContract
    let realtime: any RealtimeContract
    let zoneEngine: any ZoneEngineContract
    let healthKit: any HealthKitContract
    let map: any MapContract

    static let pathA = AppServices(
        api: LocalDemoApi(),
        auth: LocalDemoAuthAdapter(),
        offlineQueue: LocalDemoOfflineQueue(),
        realtime: LocalDemoRealtime(),
        zoneEngine: LocalDemoZoneEngine(),
        healthKit: BlockedExternalHealthKitAdapter(),
        map: LocalDemoMapAdapter()
    )
}
