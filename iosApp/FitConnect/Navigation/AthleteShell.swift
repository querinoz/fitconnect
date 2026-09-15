import SwiftUI

enum AthleteTab: String, Hashable {
    case feed
    case ascend
    case train
    case dashboard
    case profile
}

enum AthleteRoute: Hashable {
    case discover
    case workout
    case telemetry
    case programs
    case notifications
    case messages
    case map
    case settings
    case bookings
    case martialArts
    case fightMode(String)
    case recovery
    case connections
    case zenith
}

struct AthleteShell: View {
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @Bindable var session: AppSessionStore
    let services: AppServices

    @State private var selection: AthleteTab = .train
    @State private var path: [AthleteRoute] = []

    var body: some View {
        NavigationStack(path: $path) {
            ZStack {
                HoneycombBackground(accent: .voltline)

                TabView(selection: $selection) {
                    AthleteFeedView { route in path.append(route) }
                        .tag(AthleteTab.feed)
                        .tabItem { Label("Feed", systemImage: "rectangle.stack") }

                    AthleteAscendView { route in path.append(route) }
                        .tag(AthleteTab.ascend)
                        .tabItem { Label("Ascend", systemImage: "chart.line.uptrend.xyaxis") }

                    AthleteTrainHomeView { route in path.append(route) }
                        .tag(AthleteTab.train)
                        .tabItem { Label("TRAIN", systemImage: "figure.run") }

                    AthleteDashboardView(
                        snapshot: services.api.athleteDashboard(),
                        realtime: services.realtime,
                        offlineQueue: services.offlineQueue,
                        healthKit: services.healthKit
                    ) { route in path.append(route) }
                        .tag(AthleteTab.dashboard)
                        .tabItem { Label("Dashboard", systemImage: "square.grid.2x2") }

                    AthleteProfileView(session: session, notifications: services.api.athleteNotifications()) { route in
                        path.append(route)
                    }
                    .tag(AthleteTab.profile)
                    .tabItem { Label("Profile", systemImage: "person.crop.circle") }
                }
                .toolbarBackground(.visible, for: .tabBar)
                .toolbarBackground(EosColors.floor.opacity(0.96), for: .tabBar)
            }
            .navigationDestination(for: AthleteRoute.self) { route in
                switch route {
                case .discover:
                    AthleteDiscoverView(cards: services.api.athleteDiscoverCards())
                case .workout:
                    AthleteTrainHomeView { next in path.append(next) }
                case .telemetry:
                    AthleteTelemetryView(realtime: services.realtime, zones: services.zoneEngine.athleteZones(), healthKit: services.healthKit)
                case .programs:
                    AthleteProgramsView(programs: services.api.athletePrograms())
                case .notifications:
                    AthleteNotificationsView(items: services.api.athleteNotifications())
                case .messages:
                    AthleteMessagesView(threads: services.api.athleteThreads(), messages: services.api.athleteMessages())
                case .map:
                    AthleteMapActivityView(snapshot: services.map.athleteRoute())
                case .settings:
                    AthleteSettingsView(sections: services.api.athleteSettings())
                case .bookings:
                    NativeBookingView()
                case .martialArts:
                    MartialArtsCatalogView { discipline in
                        path.append(.fightMode(discipline))
                    }
                case .fightMode(let discipline):
                    FightModeView(disciplineId: discipline)
                case .recovery:
                    RecoveryView(healthKit: services.healthKit)
                case .connections:
                    ConnectionsView()
                case .zenith:
                    ZenithNativeView()
                }
            }
        }
        .animation(MotionTokens.quick(reduceMotion: reduceMotion), value: selection)
        .onChange(of: session.pendingDeepLink) { _, value in
            guard let value else { return }
            applyDeepLink(value)
            session.pendingDeepLink = nil
        }
        .onAppear {
            if let pending = session.pendingDeepLink {
                applyDeepLink(pending)
                session.pendingDeepLink = nil
            }
        }
    }

    private func applyDeepLink(_ value: String) {
        switch value {
        case "recovery":
            selection = .dashboard
            path.append(.recovery)
        case "martial-arts":
            selection = .train
            path.append(.martialArts)
        case "connections":
            selection = .profile
            path.append(.connections)
        case "ascend":
            selection = .ascend
        case "feed":
            selection = .feed
        case "booking":
            selection = .dashboard
            path.append(.bookings)
        case "coach":
            session.switchMode(to: .coach)
        default:
            selection = .train
        }
    }
}
