import SwiftUI

@main
struct FitConnectApp: App {
    @State private var router = RootRouter()

    var body: some Scene {
        WindowGroup {
            RootRouterView(router: router)
                .preferredColorScheme(.dark)
        }
    }
}
import SwiftUI

@main
struct FitConnectApp: App {
    @State private var session = DemoSessionStore()
    private let services = AppServices.pathA

    var body: some Scene {
        WindowGroup {
            RootRouter(session: session, services: services)
                .preferredColorScheme(.dark)
        }
    }
}
