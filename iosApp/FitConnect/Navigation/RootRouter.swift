import SwiftUI

struct RootRouter: View {
    @Bindable var session: AppSessionStore
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
