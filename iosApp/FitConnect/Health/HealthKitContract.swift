import Foundation

enum HealthKitIntegrationStatus: String {
    case blockedExternal = "BLOCKED_EXTERNAL"
    case planned = "PLANNED"
}

struct HealthMetricPermission: Identifiable, Hashable {
    let id: String
    let name: String
    let status: HealthKitIntegrationStatus
    let note: String
}

protocol HealthKitContract {
    func requestedPermissions() async -> [HealthMetricPermission]
}
import Foundation

struct HealthKitCapability: Hashable {
    let title: String
    let status: String
    let detail: String
    let buildNote: String
}

protocol HealthKitContract {
    func capability() -> HealthKitCapability
}

struct BlockedExternalHealthKitAdapter: HealthKitContract {
    func capability() -> HealthKitCapability {
        HealthKitCapability(
            title: "HealthKit contract",
            status: "Blocked external",
            detail: "This Windows workspace can ship the SwiftUI source tree, but it cannot verify entitlements, simulator behavior, or physical-device HealthKit flows.",
            buildNote: "IOS_PHYSICAL_BUILD_BLOCKED_EXTERNAL"
        )
    }
}

// Honest integration note:
// HealthKit wiring is intentionally represented as a contract boundary only.
// No local PASS claim is made because Xcode signing, entitlements, and device permissions
// require macOS tooling that is outside this workspace.
