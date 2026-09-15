import SwiftUI

@main
struct FitConnectApp: App {
    @State private var session = AppSessionStore()
    private let services = AppServices.production

    init() {
        _ = FirebaseBootstrap.configureIfPresent()
        FitBackgroundRefresh.register()
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
                    FitBackgroundRefresh.schedule()
                    if !GlanceSharedStore.load().isLive {
                        GlanceSharedStore.save(GlanceBridge.dailyCatalog())
                    }
                }
                .onOpenURL { url in
                    session.pendingDeepLink = FitDeepLink.destination(url)
                }
        }
    }
}
