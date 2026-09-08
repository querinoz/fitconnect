import Observation
import SwiftUI

@MainActor
@Observable
final class RootRouter {
    var activeRole: AppRole?

    func signIn(as role: AppRole) {
        activeRole = role
    }

    func signOut() {
        activeRole = nil
    }
}

struct RootRouterView: View {
    let router: RootRouter

    var body: some View {
        Group {
            switch router.activeRole {
            case .athlete:
                AthleteShell(router: router)
            case .coach:
                CoachShell(router: router)
            case nil:
                AuthView(router: router)
            }
        }
        .animation(MotionTokens.smooth, value: router.activeRole)
    }
}
import SwiftUI

struct RootRouter: View {
    @Bindable var session: DemoSessionStore
    let services: AppServices

    var body: some View {
        Group {
            if session.isAuthenticated {
                switch session.role {
                case .athlete:
                    AthleteShell(session: session, services: services)
                case .coach:
                    CoachShell(session: session, services: services)
                case nil:
                    AuthView(session: session, services: services)
                }
            } else {
                AuthView(session: session, services: services)
            }
        }
    }
}
