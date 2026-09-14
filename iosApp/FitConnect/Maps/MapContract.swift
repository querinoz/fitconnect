import Foundation

protocol MapContract {
    func athleteRoute() -> ActivityMapSnapshot
}

struct LocalDemoMapAdapter: MapContract {
    func athleteRoute() -> ActivityMapSnapshot {
        DemoCatalog.athleteMap
    }
}
