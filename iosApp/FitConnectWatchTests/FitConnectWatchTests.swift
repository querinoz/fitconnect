import XCTest
@testable import FitConnectWatch

final class FitConnectWatchTests: XCTestCase {
    func testFightClockAndNextAction() {
        XCTAssertEqual(WatchFightPresentation.clock(65), "1:05")
        XCTAssertEqual(WatchFightPresentation.nextAction(.warning), "REST")
        XCTAssertEqual(WatchFightPresentation.nextAction(.rest), "NEXT ROUND")
    }

    func testImuIsNeverForce() {
        XCTAssertTrue(CombatRoundReducer.forceFromWatchImuIsInvalid())
        XCTAssertFalse(SensorHonesty.watchImuCanMeasureForce())
    }
}
