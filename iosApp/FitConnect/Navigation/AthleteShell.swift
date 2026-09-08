import SwiftUI

enum AthleteViews {}

enum AthleteTab: Hashable {
    case home
    case analysis
    case vault
    case profile
}

enum AthleteRoute: Hashable {
    case discover
    case workout
    case telemetry
    case programs
    case notifications
    case messages
    case mapActivity
    case settings
    case bookings
}

struct AthleteShell: View {
    let router: RootRouter

    @State private var selectedTab: AthleteTab = .home
    @State private var path: [AthleteRoute] = []

    var body: some View {
        NavigationStack(path: $path) {
            TabView(selection: $selectedTab) {
                AthleteViews.HomeView(open: open)
                    .tag(AthleteTab.home)
                    .tabItem { Label("Home", systemImage: "house.fill") }

                AthleteViews.AnalysisView(open: open)
                    .tag(AthleteTab.analysis)
                    .tabItem { Label("Analysis", systemImage: "waveform.path.ecg") }

                AthleteViews.VaultView(open: open)
                    .tag(AthleteTab.vault)
                    .tabItem { Label("Vault", systemImage: "shippingbox.fill") }

                AthleteViews.ProfileView(open: open)
                    .tag(AthleteTab.profile)
                    .tabItem { Label("Profile", systemImage: "person.crop.circle.fill") }
            }
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Menu("Train") {
                        Button("Open workout", systemImage: "figure.run") { open(.workout) }
                        Button("Open telemetry", systemImage: "waveform.path.ecg") { open(.telemetry) }
                        Button("Open programs", systemImage: "list.bullet.rectangle") { open(.programs) }
                    }
                    .tint(EosColors.voltline)
                }

                ToolbarItem(placement: .topBarTrailing) {
                    Button {
                        open(.notifications)
                    } label: {
                        Image(systemName: "bell.badge.fill")
                            .foregroundStyle(EosColors.telemetry)
                    }
                }

                ToolbarItem(placement: .topBarTrailing) {
                    Button("Exit") {
                        router.signOut()
                    }
                    .foregroundStyle(EosColors.textSecondary)
                }
            }
            .navigationDestination(for: AthleteRoute.self) { route in
                switch route {
                case .discover:
                    AthleteViews.DiscoverView(open: open)
                case .workout:
                    AthleteViews.WorkoutView(open: open)
                case .telemetry:
                    AthleteViews.TelemetryView(open: open)
                case .programs:
                    AthleteViews.ProgramsView(open: open)
                case .notifications:
                    AthleteViews.NotificationsView(open: open)
                case .messages:
                    AthleteViews.MessagesView()
                case .mapActivity:
                    AthleteViews.MapActivityView()
                case .settings:
                    AthleteViews.SettingsView()
                case .bookings:
                    AthleteViews.BookingsView()
                }
            }
        }
        .tint(EosColors.voltline)
    }

    private func open(_ route: AthleteRoute) {
        path.append(route)
    }
}
import SwiftUI

enum AthleteTab: String, Hashable {
    case home
    case analysis
    case vault
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
}

struct AthleteShell: View {
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @Bindable var session: DemoSessionStore
    let services: AppServices

    @State private var selection: AthleteTab = .home
    @State private var path: [AthleteRoute] = []
    @State private var showingTrainActions = false

    var body: some View {
        NavigationStack(path: $path) {
            ZStack(alignment: .bottom) {
                HoneycombBackground(accent: .voltline)

                TabView(selection: $selection) {
                    AthleteHomeView(snapshot: services.api.athleteDashboard(), realtime: services.realtime, offlineQueue: services.offlineQueue) { route in
                        path.append(route)
                    }
                    .tag(AthleteTab.home)
                    .tabItem { Label("Today", systemImage: "house") }

                    AthleteAnalysisView(cards: services.api.athleteDiscoverCards(), zones: services.zoneEngine.athleteZones()) { route in
                        path.append(route)
                    }
                    .tag(AthleteTab.analysis)
                    .tabItem { Label("Analysis", systemImage: "waveform.path.ecg") }

                    AthleteVaultView(programs: services.api.athletePrograms(), bookings: services.api.athleteBookings()) { route in
                        path.append(route)
                    }
                    .tag(AthleteTab.vault)
                    .tabItem { Label("Vault", systemImage: "shippingbox") }

                    AthleteProfileView(session: session, notifications: services.api.athleteNotifications()) { route in
                        path.append(route)
                    }
                    .tag(AthleteTab.profile)
                    .tabItem { Label("Profile", systemImage: "person.crop.circle") }
                }
                .toolbarBackground(.visible, for: .tabBar)
                .toolbarBackground(EosColors.floor.opacity(0.96), for: .tabBar)

                Button {
                    withAnimation(MotionTokens.quick(reduceMotion: reduceMotion)) {
                        showingTrainActions = true
                    }
                } label: {
                    Label("Train", systemImage: "figure.run")
                        .font(.headline)
                        .foregroundStyle(EosColors.floor)
                        .padding(.horizontal, 22)
                        .padding(.vertical, 14)
                        .background(Capsule().fill(EosColors.trainGradient))
                }
                .padding(.bottom, 72)
            }
            .navigationDestination(for: AthleteRoute.self) { route in
                switch route {
                case .discover:
                    AthleteDiscoverView(cards: services.api.athleteDiscoverCards())
                case .workout:
                    AthleteWorkoutView(programs: services.api.athletePrograms())
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
                    AthleteBookingsView(bookings: services.api.athleteBookings())
                }
            }
            .sheet(isPresented: $showingTrainActions) {
                TrainActionSheet { route in
                    showingTrainActions = false
                    path.append(route)
                }
                .presentationDetents([.height(320)])
                .presentationBackground(.thinMaterial)
            }
        }
    }
}

private struct TrainActionSheet: View {
    var onSelect: (AthleteRoute) -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Train")
                .font(.title2.bold())
            Text("Primary athlete action for Path A. Pick a destination to continue the local demo flow.")
                .foregroundStyle(EosColors.textSecondary)

            actionButton("Start workout", systemImage: "figure.strengthtraining.traditional", route: .workout)
            actionButton("Open telemetry", systemImage: "waveform.path.ecg", route: .telemetry)
            actionButton("Review route", systemImage: "map", route: .map)
            actionButton("Open programs", systemImage: "list.bullet.rectangle", route: .programs)

            Spacer(minLength: 0)
        }
        .padding(22)
    }

    private func actionButton(_ title: String, systemImage: String, route: AthleteRoute) -> some View {
        Button {
            onSelect(route)
        } label: {
            Label(title, systemImage: systemImage)
                .font(.headline)
                .foregroundStyle(EosColors.textPrimary)
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding(14)
                .background(RoundedRectangle(cornerRadius: 18, style: .continuous).fill(EosColors.surfaceRaised))
        }
        .buttonStyle(.plain)
    }
}
