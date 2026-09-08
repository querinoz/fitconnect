import Foundation

struct RoutePoint: Identifiable, Hashable {
    let id: String
    let x: Double
    let y: Double
}

protocol MapContract {
    func recentRoute() async -> [RoutePoint]
}
import Foundation

protocol MapContract {
    func athleteRoute() -> ActivityMapSnapshot
}

struct LocalDemoMapAdapter: MapContract {
    func athleteRoute() -> ActivityMapSnapshot {
        DemoCatalog.athleteMap
    }
}
