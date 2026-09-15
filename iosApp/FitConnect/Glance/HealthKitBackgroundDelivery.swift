import Foundation

#if canImport(HealthKit)
import HealthKit
#endif

/// Event-driven HealthKit sync. Never polls. Background delivery is hourly
/// after the user authorizes — live HR during TRAIN uses HKWorkoutSession.
enum HealthKitBackgroundDelivery {
    static func enableAfterAuthorization() {
        #if canImport(HealthKit)
        guard HKHealthStore.isHealthDataAvailable() else { return }
        guard HealthKitObserverPlan.enableBackgroundDelivery(status: .sharingAuthorized) else { return }
        let store = HKHealthStore()
        let types: [HKObjectType?] = [
            HKQuantityType.quantityType(forIdentifier: .heartRate),
            HKQuantityType.quantityType(forIdentifier: .heartRateVariabilitySDNN),
            HKQuantityType.quantityType(forIdentifier: .restingHeartRate),
            HKObjectType.categoryType(forIdentifier: .sleepAnalysis),
            HKObjectType.workoutType()
        ]
        for type in types.compactMap({ $0 }) {
            store.enableBackgroundDelivery(for: type, frequency: .hourly) { _, _ in }
        }
        #endif
    }
}
