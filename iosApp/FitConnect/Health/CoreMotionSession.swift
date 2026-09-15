import Foundation

#if canImport(CoreMotion)
import CoreMotion
#endif
import Combine

/// CMDeviceMotion is attitude, gravity, rotation rate and user acceleration.
/// userAcceleration is never labeled DIRECT force.
struct DeviceMotionSample: Equatable {
    var timestamp: TimeInterval
    var userAccelerationX: Double
    var userAccelerationY: Double
    var userAccelerationZ: Double
    var rotationX: Double
    var rotationY: Double
    var rotationZ: Double
    var measurementType: CombatMeasurementKind
    var metric: String

    static func fromDeviceMotion(
        timestamp: TimeInterval,
        userAx: Double,
        userAy: Double,
        userAz: Double,
        rotX: Double,
        rotY: Double,
        rotZ: Double
    ) -> DeviceMotionSample {
        DeviceMotionSample(
            timestamp: timestamp,
            userAccelerationX: userAx,
            userAccelerationY: userAy,
            userAccelerationZ: userAz,
            rotationX: rotX,
            rotationY: rotY,
            rotationZ: rotZ,
            measurementType: .estimated,
            metric: "user_acceleration"
        )
    }

    var claimsDirectForce: Bool { false }
}

final class CoreMotionSession: ObservableObject {
    @Published private(set) var lastSample: DeviceMotionSample?
    @Published private(set) var status: String = "idle"

    #if canImport(CoreMotion)
    private let manager = CMMotionManager()
    #endif

    var isAvailable: Bool {
        #if canImport(CoreMotion)
        return true
        #else
        return false
        #endif
    }

    func start() {
        #if canImport(CoreMotion)
        guard manager.isDeviceMotionAvailable else {
            status = "unavailable"
            lastSample = nil
            return
        }
        manager.deviceMotionUpdateInterval = 1.0 / 25.0
        manager.startDeviceMotionUpdates(using: .xArbitraryZVertical, to: .main) { [weak self] motion, error in
            guard let self else { return }
            if error != nil {
                self.status = "error"
                return
            }
            guard let motion else { return }
            self.lastSample = DeviceMotionSample.fromDeviceMotion(
                timestamp: motion.timestamp,
                userAx: motion.userAcceleration.x,
                userAy: motion.userAcceleration.y,
                userAz: motion.userAcceleration.z,
                rotX: motion.rotationRate.x,
                rotY: motion.rotationRate.y,
                rotZ: motion.rotationRate.z
            )
            self.status = "streaming"
        }
        status = "starting"
        #else
        status = "unavailable"
        #endif
    }

    func stop() {
        #if canImport(CoreMotion)
        manager.stopDeviceMotionUpdates()
        #endif
        status = "idle"
    }
}
