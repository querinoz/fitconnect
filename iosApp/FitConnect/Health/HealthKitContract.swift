import Foundation

enum HealthKitAuthStatus: String {
    case unavailable = "unavailable"
    case notDetermined = "not_determined"
    case sharingDenied = "sharing_denied"
    case sharingAuthorized = "sharing_authorized"
    case blockedExternal = "blocked_external"
}

struct HealthKitQuantityScope: Hashable {
    let identifier: String
    let read: Bool
    let write: Bool
    let historicalAccess: String
    let detail: String
}

struct HealthKitAuthorizationModel: Hashable {
    let available: Bool
    let status: HealthKitAuthStatus
    let scopes: [HealthKitQuantityScope]
    let backgroundDelivery: String
    let limitedHistoryNote: String
}

protocol HealthKitContract {
    func capability() -> HealthKitCapability
    func authorizationModel() -> HealthKitAuthorizationModel
}

struct HealthKitCapability: Hashable {
    let title: String
    let status: String
    let detail: String
    let buildNote: String
}

struct BlockedExternalHealthKitAdapter: HealthKitContract {
    func capability() -> HealthKitCapability {
        HealthKitCapability(
            title: "HealthKit",
            status: "DATA UNAVAILABLE",
            detail: "HealthKit is not available in this process. Simulator or device plus user authorization are required. Missing stays missing.",
            buildNote: "Apple execution required for live samples. This is not a fabricated fallback."
        )
    }

    func authorizationModel() -> HealthKitAuthorizationModel {
        HealthKitAuthorizationModel(
            available: false,
            status: .blockedExternal,
            scopes: [
                HealthKitQuantityScope(
                    identifier: "HKQuantityTypeIdentifierHeartRate",
                    read: false,
                    write: false,
                    historicalAccess: "undetermined",
                    detail: "Granular read is requested per type. Never infer HRV from an empty authorization."
                ),
                HealthKitQuantityScope(
                    identifier: "HKCategoryTypeIdentifierSleepAnalysis",
                    read: false,
                    write: false,
                    historicalAccess: "undetermined",
                    detail: "Sleep is a separate authorization. Missing stays missing."
                ),
                HealthKitQuantityScope(
                    identifier: "HKQuantityTypeIdentifierHeartRateVariabilitySDNN",
                    read: false,
                    write: false,
                    historicalAccess: "undetermined",
                    detail: "HRV is not derived from readiness scores."
                )
            ],
            backgroundDelivery: "Architected. Runtime enablement requires macOS/Xcode and user authorization.",
            limitedHistoryNote: "HealthKit may limit historical samples until the user expands access. FitConnect must not fabricate the missing window."
        )
    }
}
