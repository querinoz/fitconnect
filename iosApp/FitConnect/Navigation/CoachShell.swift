import SwiftUI

enum CoachViews {}

enum CoachTab: Hashable {
    case overview
    case athletes
    case calendar
    case inbox
    case more
}

enum CoachRoute: Hashable {
    case bookings
    case programs
    case revenue
    case notifications
    case profile
    case settings
}

struct CoachShell: View {
    let router: RootRouter

    @State private var selectedTab: CoachTab = .overview
    @State private var path: [CoachRoute] = []

    var body: some View {
        NavigationStack(path: $path) {
            TabView(selection: $selectedTab) {
                CoachViews.OverviewView(open: open)
                    .tag(CoachTab.overview)
                    .tabItem { Label("Overview", systemImage: "rectangle.3.group.fill") }

                CoachViews.AthletesView()
                    .tag(CoachTab.athletes)
                    .tabItem { Label("Athletes", systemImage: "person.3.fill") }

                CoachViews.CalendarView()
                    .tag(CoachTab.calendar)
                    .tabItem { Label("Calendar", systemImage: "calendar") }

                CoachViews.InboxView()
                    .tag(CoachTab.inbox)
                    .tabItem { Label("Inbox", systemImage: "bubble.left.and.bubble.right.fill") }

                CoachViews.ProfileView(open: open)
                    .tag(CoachTab.more)
                    .tabItem { Label("More", systemImage: "ellipsis.circle.fill") }
            }
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Text("Coach OS")
                        .font(.system(size: 12, weight: .semibold, design: .monospaced))
                        .foregroundStyle(EosColors.telemetry)
                }

                ToolbarItem(placement: .topBarTrailing) {
                    Button {
                        open(.notifications)
                    } label: {
                        Image(systemName: "bell.badge")
                            .foregroundStyle(EosColors.iris)
                    }
                }

                ToolbarItem(placement: .topBarTrailing) {
                    Button("Exit") {
                        router.signOut()
                    }
                }
            }
            .navigationDestination(for: CoachRoute.self) { route in
                switch route {
                case .bookings:
                    CoachViews.BookingsView()
                case .programs:
                    CoachViews.ProgramsView()
                case .revenue:
                    CoachViews.RevenueView()
                case .notifications:
                    CoachViews.NotificationsView()
                case .profile:
                    CoachViews.ProfileView(open: open)
                case .settings:
                    CoachViews.SettingsView()
                }
            }
        }
        .tint(EosColors.telemetry)
    }

    private func open(_ route: CoachRoute) {
        path.append(route)
    }
}
import SwiftUI

enum CoachTab: String, Hashable {
    case overview
    case athletes
    case calendar
    case inbox
    case more
}

enum CoachRoute: Hashable {
    case programs
    case bookings
    case revenue
    case notifications
    case settings
}

struct CoachShell: View {
    @Bindable var session: DemoSessionStore
    let services: AppServices

    @State private var selection: CoachTab = .overview
    @State private var path: [CoachRoute] = []

    var body: some View {
        NavigationStack(path: $path) {
            ZStack {
                HoneycombBackground(accent: .iris)

                TabView(selection: $selection) {
                    CoachOverviewView(snapshot: services.api.coachOverview(), offlineQueue: services.offlineQueue) { route in
                        path.append(route)
                    }
                    .tag(CoachTab.overview)
                    .tabItem { Label("Overview", systemImage: "house") }

                    CoachAthletesView(athletes: services.api.coachAthletes())
                        .tag(CoachTab.athletes)
                        .tabItem { Label("Athletes", systemImage: "person.3") }

                    CoachCalendarView(bookings: services.api.coachBookings()) { route in
                        path.append(route)
                    }
                    .tag(CoachTab.calendar)
                    .tabItem { Label("Calendar", systemImage: "calendar") }

                    CoachInboxView(threads: services.api.coachThreads(), messages: services.api.coachMessages()) { route in
                        path.append(route)
                    }
                    .tag(CoachTab.inbox)
                    .tabItem { Label("Inbox", systemImage: "tray") }

                    CoachProfileView(session: session, notifications: services.api.coachNotifications()) { route in
                        path.append(route)
                    }
                    .tag(CoachTab.more)
                    .tabItem { Label("More", systemImage: "ellipsis.circle") }
                }
                .toolbarBackground(.visible, for: .tabBar)
                .toolbarBackground(EosColors.floor.opacity(0.96), for: .tabBar)
            }
            .navigationDestination(for: CoachRoute.self) { route in
                switch route {
                case .programs:
                    CoachProgramsView(programs: services.api.coachPrograms())
                case .bookings:
                    CoachBookingsView(bookings: services.api.coachBookings())
                case .revenue:
                    CoachRevenueView(metrics: services.api.coachOverview().metrics)
                case .notifications:
                    CoachNotificationsView(items: services.api.coachNotifications())
                case .settings:
                    CoachSettingsView(sections: services.api.coachSettings())
                }
            }
        }
    }
}
