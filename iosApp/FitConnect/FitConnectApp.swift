import SwiftUI
#if canImport(UIKit)
import UIKit
#endif

@main
struct FitConnectApp: App {
    #if canImport(UIKit)
    @UIApplicationDelegateAdaptor(FitAppDelegate.self) private var appDelegate
    #endif
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
                    if session.isAuthenticated {
                        DeviceNotifications.requestIfNeeded()
                    }
                    FitBackgroundRefresh.schedule()
                    if !GlanceSharedStore.load().isLive {
                        GlanceSharedStore.save(GlanceBridge.dailyCatalog())
                    }
                    AppleCredentialGate.verifyIfNeeded()
                }
                .onOpenURL { url in
                    session.pendingDeepLink = FitDeepLink.destination(url)
                }
        }
    }
}
