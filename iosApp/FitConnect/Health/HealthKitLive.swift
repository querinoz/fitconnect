import Foundation

#if canImport(HealthKit)
import HealthKit
#endif

protocol HealthKitStoreContract: HealthKitContract {
    func requestAuthorization() async -> HealthKitAuthStatus
    func latestHeartRate() async -> HealthSample?
    func latestHRV() async -> HealthSample?
    func latestSleepHours() async -> HealthSample?
    func latestRestingHeartRate() async -> HealthSample?
    func startWorkout(activity: String) async -> Result<String, HealthKitRuntimeError>
    func endWorkout() async
}

struct HealthSample: Hashable {
    let metric: String
    let value: Double?
    let unit: String
    let source: String
    let provider: String
    let measuredAt: Date?
    let confidence: String
}

enum HealthKitObserverPlan {
    static let incrementalTypes = [
        "HKQuantityTypeIdentifierHeartRate",
        "HKQuantityTypeIdentifierHeartRateVariabilitySDNN",
        "HKQuantityTypeIdentifierRestingHeartRate",
        "HKCategoryTypeIdentifierSleepAnalysis",
        "HKWorkoutTypeIdentifier"
    ]

    static func enableBackgroundDelivery(status: HealthKitAuthStatus) -> Bool {
        status == .sharingAuthorized
    }

    static func shouldRunObserverQuery(status: HealthKitAuthStatus) -> Bool {
        status == .sharingAuthorized
    }
}
    case unavailable
    case denied
    case limitedHistory
    case notDetermined
}

struct HealthKitLiveAdapter: HealthKitStoreContract {
    func capability() -> HealthKitCapability {
        #if canImport(HealthKit)
        if HKHealthStore.isHealthDataAvailable() {
            return HealthKitCapability(
                title: "HealthKit",
                status: "Available",
                detail: "Fine-grained read is requested at the moment of need. Missing stays missing.",
                buildNote: "Workout sessions can continue in background via HKWorkoutSession on watchOS."
            )
        }
        return HealthKitCapability(
            title: "HealthKit",
            status: "Unavailable",
            detail: "This device does not support HealthKit.",
            buildNote: "Do not fabricate HR, HRV, or sleep."
        )
        #else
        return BlockedExternalHealthKitAdapter().capability()
        #endif
    }

    func authorizationModel() -> HealthKitAuthorizationModel {
        HealthKitAuthorizationModel(
            available: capability().status == "Available",
            status: capability().status == "Available" ? .notDetermined : .unavailable,
            scopes: [
                HealthKitQuantityScope(
                    identifier: "HKQuantityTypeIdentifierHeartRate",
                    read: true,
                    write: false,
                    historicalAccess: "user_controlled",
                    detail: "Heart rate is DIRECT only when HealthKit returns a sample."
                ),
                HealthKitQuantityScope(
                    identifier: "HKQuantityTypeIdentifierHeartRateVariabilitySDNN",
                    read: true,
                    write: false,
                    historicalAccess: "user_controlled",
                    detail: "HRV is not derived from readiness."
                ),
                HealthKitQuantityScope(
                    identifier: "HKQuantityTypeIdentifierRestingHeartRate",
                    read: true,
                    write: false,
                    historicalAccess: "user_controlled",
                    detail: "Resting HR stays missing until authorized."
                ),
                HealthKitQuantityScope(
                    identifier: "HKCategoryTypeIdentifierSleepAnalysis",
                    read: true,
                    write: false,
                    historicalAccess: "user_controlled",
                    detail: "Sleep is a separate authorization."
                ),
                HealthKitQuantityScope(
                    identifier: "HKQuantityTypeIdentifierActiveEnergyBurned",
                    read: true,
                    write: false,
                    historicalAccess: "user_controlled",
                    detail: "Active energy is never estimated from a round timer."
                ),
                HealthKitQuantityScope(
                    identifier: "HKQuantityTypeIdentifierStepCount",
                    read: true,
                    write: false,
                    historicalAccess: "user_controlled",
                    detail: "Steps are not combat force."
                )
            ],
            backgroundDelivery: "Observer queries + HKWorkoutSession. Enable only after authorization.",
            limitedHistoryNote: "If the user limits historical access, FitConnect must not invent the missing window."
        )
    }

    func requestAuthorization() async -> HealthKitAuthStatus {
        #if canImport(HealthKit)
        guard HKHealthStore.isHealthDataAvailable() else { return .unavailable }
        let store = HKHealthStore()
        var read: Set<HKObjectType> = []
        if let hr = HKQuantityType.quantityType(forIdentifier: .heartRate) { read.insert(hr) }
        if let hrv = HKQuantityType.quantityType(forIdentifier: .heartRateVariabilitySDNN) { read.insert(hrv) }
        if let rhr = HKQuantityType.quantityType(forIdentifier: .restingHeartRate) { read.insert(rhr) }
        if let energy = HKQuantityType.quantityType(forIdentifier: .activeEnergyBurned) { read.insert(energy) }
        if let steps = HKQuantityType.quantityType(forIdentifier: .stepCount) { read.insert(steps) }
        if let sleep = HKObjectType.categoryType(forIdentifier: .sleepAnalysis) { read.insert(sleep) }
        do {
            try await store.requestAuthorization(toShare: [], read: read)
            return .sharingAuthorized
        } catch {
            return .sharingDenied
        }
        #else
        return .blockedExternal
        #endif
    }

    func latestHeartRate() async -> HealthSample? { missing("heart_rate", "bpm") }
    func latestHRV() async -> HealthSample? { missing("hrv", "ms") }
    func latestRestingHeartRate() async -> HealthSample? { missing("resting_hr", "bpm") }

    func latestSleepHours() async -> HealthSample? {
        HealthSample(
            metric: "sleep_hours",
            value: nil,
            unit: "h",
            source: "HealthKit",
            provider: "apple_health",
            measuredAt: nil,
            confidence: "MISSING"
        )
    }

    func startWorkout(activity: String) async -> Result<String, HealthKitRuntimeError> {
        #if canImport(HealthKit)
        guard HKHealthStore.isHealthDataAvailable() else { return .failure(.unavailable) }
        return .success("healthkit-workout:\(activity)")
        #else
        return .failure(.unavailable)
        #endif
    }

    func endWorkout() async {}

    private func missing(_ metric: String, _ unit: String) -> HealthSample {
        HealthSample(
            metric: metric,
            value: nil,
            unit: unit,
            source: "HealthKit",
            provider: "apple_health",
            measuredAt: nil,
            confidence: "MISSING"
        )
    }
}

extension BlockedExternalHealthKitAdapter: HealthKitStoreContract {
    func requestAuthorization() async -> HealthKitAuthStatus { .blockedExternal }
    func latestHeartRate() async -> HealthSample? { missing("heart_rate", "bpm") }
    func latestHRV() async -> HealthSample? { missing("hrv", "ms") }
    func latestSleepHours() async -> HealthSample? { missing("sleep_hours", "h") }
    func latestRestingHeartRate() async -> HealthSample? { missing("resting_hr", "bpm") }
    func startWorkout(activity: String) async -> Result<String, HealthKitRuntimeError> { .failure(.unavailable) }
    func endWorkout() async {}

    private func missing(_ metric: String, _ unit: String) -> HealthSample {
        HealthSample(
            metric: metric,
            value: nil,
            unit: unit,
            source: "unavailable",
            provider: "none",
            measuredAt: nil,
            confidence: "MISSING"
        )
    }
}
