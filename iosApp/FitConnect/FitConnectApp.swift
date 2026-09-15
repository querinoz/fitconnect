import SwiftUI

@main
struct FitConnectApp: App {
    @State private var session = AppSessionStore()
    private let services = AppServices.production

    init() {
        _ = FirebaseBootstrap.configureIfPresent()
    }

    var body: some Scene {
        WindowGroup {
            RootRouter(session: session, services: services)
                .preferredColorScheme(.dark)
                .task {
                    session.restore()
                    if let restored = await FirebaseAuthBridge().restore(), !session.isAuthenticated {
                        session.completeSignIn(identity: restored)
                    }
                }
        }
    }
}
