import Foundation
import Combine

#if canImport(HealthKit)
import HealthKit
#endif

/// Live Apple workout: `HKWorkoutSession` + `HKLiveWorkoutBuilder`.
/// An active session can continue in the background and keep receiving sensor samples.
/// Heart rate is MISSING until HealthKit delivers a quantity. IMU is never force.
final class LiveWorkoutController: NSObject, ObservableObject {
    enum Activity: String {
        case traditional
        case martialArts

        #if canImport(HealthKit)
        var hkType: HKWorkoutActivityType {
            switch self {
            case .traditional: return .traditionalStrengthTraining
            case .martialArts: return .martialArts
            }
        }
        #endif
    }

    @Published private(set) var sessionState: String = "idle"
    @Published private(set) var lastHeartRateBpm: Double?
    private(set) var lastError: String?

    #if canImport(HealthKit)
    private let store = HKHealthStore()
    private var session: HKWorkoutSession?
    private var builder: HKLiveWorkoutBuilder?
    #endif

    func start(activity: Activity = .traditional) {
        lastError = nil
        lastHeartRateBpm = nil
        #if canImport(HealthKit)
        guard HKHealthStore.isHealthDataAvailable() else {
            sessionState = "unavailable"
            lastError = "DATA UNAVAILABLE"
            return
        }
        let config = HKWorkoutConfiguration()
        config.activityType = activity.hkType
        config.locationType = .indoor
        do {
            let session = try HKWorkoutSession(healthStore: store, configuration: config)
            let builder = session.associatedWorkoutBuilder()
            builder.dataSource = HKLiveWorkoutDataSource(healthStore: store, workoutConfiguration: config)
            session.delegate = self
            builder.delegate = self
            self.session = session
            self.builder = builder
            session.startActivity(with: Date())
            builder.beginCollection(withStart: Date()) { [weak self] _, error in
                if let error {
                    self?.lastError = error.localizedDescription
                    self?.sessionState = "denied"
                }
            }
            sessionState = "running"
        } catch {
            sessionState = "denied"
            lastError = error.localizedDescription
        }
        #else
        sessionState = "unavailable"
        lastError = "DATA UNAVAILABLE"
        #endif
    }

    func pause() {
        #if canImport(HealthKit)
        session?.pause()
        #endif
        if sessionState == "running" { sessionState = "paused" }
    }

    func resume() {
        #if canImport(HealthKit)
        session?.resume()
        #endif
        if sessionState == "paused" { sessionState = "running" }
    }

    func end() {
        #if canImport(HealthKit)
        session?.end()
        builder?.endCollection(withEnd: Date()) { [weak self] _, _ in
            self?.builder?.finishWorkout { _, _ in }
        }
        session = nil
        builder = nil
        #endif
        sessionState = "ended"
    }

    var heartRateLabel: String {
        guard let lastHeartRateBpm else { return "DATA UNAVAILABLE" }
        return String(format: "%.0f", lastHeartRateBpm)
    }
}

#if canImport(HealthKit)
extension LiveWorkoutController: HKWorkoutSessionDelegate, HKLiveWorkoutBuilderDelegate {
    func workoutSession(_ workoutSession: HKWorkoutSession, didChangeTo toState: HKWorkoutSessionState, from fromState: HKWorkoutSessionState, date: Date) {
        switch toState {
        case .running: sessionState = "running"
        case .paused: sessionState = "paused"
        case .ended, .stopped: sessionState = "ended"
        default: break
        }
    }

    func workoutSession(_ workoutSession: HKWorkoutSession, didFailWithError error: Error) {
        lastError = error.localizedDescription
        sessionState = "denied"
    }

    func workoutBuilderDidCollectEvent(_ workoutBuilder: HKLiveWorkoutBuilder) {}

    func workoutBuilder(_ workoutBuilder: HKLiveWorkoutBuilder, didCollectDataOf collectedTypes: Set<HKSampleType>) {
        guard let hrType = HKQuantityType.quantityType(forIdentifier: .heartRate),
              collectedTypes.contains(hrType),
              let quantity = workoutBuilder.statistics(for: hrType)?.mostRecentQuantity()
        else { return }
        lastHeartRateBpm = quantity.doubleValue(for: HKUnit.count().unitDivided(by: .minute()))
    }
}
#endif
