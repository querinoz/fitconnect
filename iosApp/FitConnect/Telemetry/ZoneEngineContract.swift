import Foundation

struct ZoneBand: Identifiable, Hashable {
    let id: String
    let label: String
    let minutes: Int
    let colorName: String
}

// NOTE: Final production implementation should bridge the EliteCore package
// once the iOS Path A workspace gains the native package dependency.
protocol ZoneEngineContract {
    func workoutZones() async -> [ZoneBand]
}
import Foundation

protocol ZoneEngineContract {
    func athleteZones() -> [ZoneSlice]
}

struct LocalDemoZoneEngine: ZoneEngineContract {
    func athleteZones() -> [ZoneSlice] {
        DemoCatalog.athleteZones
    }
}
