import Foundation

enum SensorSourceKind: String {
    case real = "REAL"
    case devMock = "DEV_MOCK"
}

enum CombatMeasurementKind: String {
    case direct = "DIRECT"
    case estimated = "ESTIMATED"
    case proxy = "PROXY"
}

enum CoreMotionSignal: String {
    case acceleration
    case rotationRate
    case attitude
}

enum SensorHonesty {
    static func watchImuCanMeasureForce() -> Bool { false }

    static func rewriteForce(metric: String, type: CombatMeasurementKind, sensor: String) -> (String, CombatMeasurementKind) {
        if metric != "impact_force" { return (metric, type) }
        let directSensors: Set<String> = [
            "INSTRUMENTED_GLOVE_FORCE",
            "INSTRUMENTED_BAG",
            "INSTRUMENTED_PAD",
            "FORCE_PLATE"
        ]
        if type == .direct && directSensors.contains(sensor) {
            return (metric, .direct)
        }
        return ("impact_estimate", .estimated)
    }

    static func coreMotionIsForce(_ signal: CoreMotionSignal) -> Bool {
        switch signal {
        case .acceleration, .rotationRate, .attitude:
            return false
        }
    }

    static func createDevMockPacketAllowed(environment: [String: String] = ProcessInfo.processInfo.environment) -> Bool {
        environment["COMBAT_ALLOW_DEV_MOCK"] == "true" || environment["FITCONNECT_LOCAL_DEMO"] == "true"
    }
}

enum BleDeviceKind: String, CaseIterable {
    case instrumentedGlove = "instrumented_glove"
    case instrumentedBag = "instrumented_bag"
    case instrumentedPad = "instrumented_pad"
    case insole
    case forcePlate = "force_plate"
    case hrStrap = "hr_strap"
    case watchImu = "watch_imu"
}

enum BleConnectionState: String {
    case disconnected
    case connecting
    case connected
    case unavailableNoHardware = "unavailable_no_hardware"
}

struct BleDeviceRecord: Hashable {
    var kind: BleDeviceKind
    var name: String
    var identifier: String
    var batteryPercent: Int?
    var state: BleConnectionState
    var capabilities: [String]
}

protocol CombatBleContract {
    func scan() -> [BleDeviceRecord]
    func connect(id: String) -> BleConnectionState
    func disconnect(id: String)
}

struct CoreBluetoothCombatAdapter: CombatBleContract {
    func scan() -> [BleDeviceRecord] {
        []
    }

    func connect(id: String) -> BleConnectionState {
        .unavailableNoHardware
    }

    func disconnect(id: String) {}
}

enum TechniqueModelStatus {
    static let id = "fitconnect.combat.technique.unvalidated"
    static let validated = false
    static let medicalClaims = false

    static func classify(label: String, sourceKind: SensorSourceKind) -> String {
        sourceKind == .devMock ? "CLASSIFIED" : "DETECTED"
    }
}
