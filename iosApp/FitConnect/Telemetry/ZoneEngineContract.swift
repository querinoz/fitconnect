import Foundation

protocol ZoneEngineContract {
    func athleteZones() -> [ZoneSlice]
}

struct LocalDemoZoneEngine: ZoneEngineContract {
    func athleteZones() -> [ZoneSlice] {
        DemoCatalog.athleteZones
    }
}
