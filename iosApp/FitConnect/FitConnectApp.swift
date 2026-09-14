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
