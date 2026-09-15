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
    @Bindable var session: AppSessionStore
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
        .onChange(of: session.pendingDeepLink) { _, value in
            guard let value else { return }
            if value == "booking" || value == "coach" {
                path.append(.bookings)
            }
            session.pendingDeepLink = nil
        }
    }
}
