import XCTest
@testable import FitConnect

final class OneLoginTests: XCTestCase {
    @MainActor
    func testModeSwitchDoesNotSignOut() {
        let store = AppSessionStore()
        store.completeSignIn(
            identity: IdentityProfile(
                firebaseUid: "uid-1",
                displayName: "Test",
                email: "test@fitconnect.app",
                modes: [.athlete, .coach],
                provider: .firebaseEmail
            ),
            active: .athlete
        )
        XCTAssertTrue(store.isAuthenticated)
        XCTAssertEqual(store.role, .athlete)
        store.switchMode(to: .coach)
        XCTAssertTrue(store.isAuthenticated)
        XCTAssertEqual(store.role, .coach)
        XCTAssertEqual(store.identity?.firebaseUid, "uid-1")
    }

    @MainActor
    func testLocalDemoBlockedWhenFlagOff() {
        UserDefaults.standard.set(false, forKey: "fitconnect.localDemo")
        let store = AppSessionStore()
        store.signInLocalDemo()
        if AppSessionStore.localDemoAllowed {
            XCTAssertTrue(store.isAuthenticated)
        } else {
            XCTAssertFalse(store.isAuthenticated)
            XCTAssertEqual(store.lastAuthError, "LOCAL_DEMO is off. Firebase Auth is required.")
        }
    }
}

final class TrainMachineTests: XCTestCase {
    func testCatalogSelectStartPauseResumeFinish() {
        var state = TrainSessionSnapshot.idle
        let plan = TrainReducer.catalog.first { $0.id == "plan_upper_push_v2" }!
        state = TrainReducer.reduce(state, .select(plan))
        XCTAssertEqual(state.phase, .prep)
        state = TrainReducer.reduce(state, .start)
        XCTAssertEqual(state.phase, .active)
        state = TrainReducer.reduce(state, .pause)
        XCTAssertEqual(state.phase, .paused)
        state = TrainReducer.reduce(state, .resume)
        XCTAssertEqual(state.phase, .active)
        state = TrainReducer.reduce(state, .finish)
        XCTAssertEqual(state.phase, .completing)
        XCTAssertEqual(state.saveStatus, .savePending)
        state = TrainReducer.reduce(state, .markSave(.localOnly))
        XCTAssertEqual(state.phase, .complete)
        XCTAssertEqual(TrainReducer.productState(state), "LOCAL_ONLY")
    }

    func testCombatRoundsEnterRestThenComplete() {
        var state = TrainSessionSnapshot.idle
        let plan = TrainReducer.catalog.first { $0.combat != nil }!
        state = TrainReducer.reduce(state, .select(plan))
        state = TrainReducer.reduce(state, .start)
        XCTAssertEqual(state.phase, .active)
        let work = plan.combat!.roundDurationSec
        for _ in 0..<work {
            state = TrainReducer.reduce(state, .tick)
        }
        XCTAssertEqual(state.phase, .rest)
        state = TrainReducer.reduce(state, .skipRest)
        XCTAssertEqual(state.phase, .active)
    }
}

final class CombatHonestyTests: XCTestCase {
    func testThirtyThreeDisciplines() {
        XCTAssertEqual(CombatRoundReducer.requiredDisciplineIds.count, 33)
        XCTAssertTrue(CombatRoundReducer.requiredDisciplineIds.contains("capoeira"))
        XCTAssertTrue(CombatRoundReducer.requiredDisciplineIds.contains("luta_livre"))
    }

    func testHealthKitObserverStaysOffUntilAuthorized() {
        XCTAssertFalse(HealthKitObserverPlan.shouldRunObserverQuery(status: .notDetermined))
        XCTAssertFalse(HealthKitObserverPlan.enableBackgroundDelivery(status: .sharingDenied))
        XCTAssertTrue(HealthKitObserverPlan.shouldRunObserverQuery(status: .sharingAuthorized))
        XCTAssertEqual(HealthKitObserverPlan.incrementalTypes.count, 5)
    }
        XCTAssertTrue(CombatRoundReducer.forceFromWatchImuIsInvalid())
        XCTAssertFalse(SensorHonesty.watchImuCanMeasureForce())
        XCTAssertFalse(SensorHonesty.coreMotionIsForce(.acceleration))
        let rewritten = SensorHonesty.rewriteForce(metric: "impact_force", type: .direct, sensor: "WATCH_IMU")
        XCTAssertEqual(rewritten.0, "impact_estimate")
        XCTAssertEqual(rewritten.1, .estimated)
        let glove = SensorHonesty.rewriteForce(metric: "impact_force", type: .direct, sensor: "INSTRUMENTED_GLOVE_FORCE")
        XCTAssertEqual(glove.1, .direct)
    }

    func testRoundEnginePauseSkip() {
        var snap = CombatRoundSnapshot.idle
        snap = CombatRoundReducer.reduce(snap, .start)
        XCTAssertEqual(snap.phase, .countdown)
        snap = CombatRoundReducer.reduce(snap, .pause)
        XCTAssertEqual(snap.phase, .paused)
        snap = CombatRoundReducer.reduce(snap, .resume)
        XCTAssertEqual(snap.phase, .countdown)
    }

    func testTechniqueModelIsUnvalidated() {
        XCTAssertFalse(TechniqueModelStatus.validated)
        XCTAssertEqual(TechniqueModelStatus.classify(label: "jab", sourceKind: .real), "DETECTED")
        XCTAssertFalse(CombatMLPipeline.productionValidated)
        let scores = CombatMLPipeline.evaluate(predictions: [true, true, false], labels: [true, false, false])
        XCTAssertNotNil(scores)
    }
}

final class BookingAndPrivacyTests: XCTestCase {
    func testBookingDoesNotFakeSuccess() {
        var draft = BookingDraft(coachId: "c1", serviceId: "s1", slotIso: "2026-09-15T10:00:00Z", phase: .confirm, lastError: nil)
        draft = BookingReducer.confirm(draft, stripeConfigured: false, dbConfigured: false)
        XCTAssertEqual(draft.phase, .failed)
        XCTAssertNotNil(draft.lastError)
    }

    func testHealthNotificationsStayPrivateByDefault() {
        let draft = NotificationDraft(topic: .recovery, title: "HRV", body: "Your HRV dropped", containsHealth: true)
        XCTAssertFalse(NotificationPrivacy.allowed(draft, healthSharingEnabled: false))
        XCTAssertTrue(NotificationPrivacy.bodyContainsBlockedHealth("heart rate 164"))
    }

    func testMcpRejectsUnknownTools() {
        XCTAssertFalse(McpClientBoundary.arbitraryExternalToolsAllowed)
        XCTAssertFalse(McpClientBoundary.toolAllowed("shell", catalog: ["zenith.brief"]))
        XCTAssertTrue(McpClientBoundary.toolAllowed("zenith.brief", catalog: ["zenith.brief"]))
    }

    func testStripePublishableKeyGuard() {
        XCTAssertFalse(StripeClientConfig.isPublishableKeyPresent(nil))
        XCTAssertFalse(StripeClientConfig.isPublishableKeyPresent("PASTE_KEY"))
        XCTAssertTrue(StripeClientConfig.isPublishableKeyPresent("pk_test_123"))
    }

    func testBleScanDoesNotInventHardware() {
        XCTAssertTrue(CoreBluetoothCombatAdapter().scan().isEmpty)
        XCTAssertEqual(CoreBluetoothCombatAdapter().connect(id: "none"), .unavailableNoHardware)
    }

    func testAppleNonceIsHashedAndNotTheRawValue() {
        let raw = AppleNonce.random()
        let hashed = AppleNonce.sha256(raw)
        XCTAssertFalse(raw.isEmpty)
        XCTAssertEqual(hashed.count, 64)
        XCTAssertNotEqual(raw, hashed)
    }

    func testDeviceMotionNeverClaimsDirectForce() {
        let sample = DeviceMotionSample.fromDeviceMotion(
            timestamp: 1,
            userAx: 2,
            userAy: 0,
            userAz: 0,
            rotX: 0.1,
            rotY: 0,
            rotZ: 0
        )
        XCTAssertFalse(sample.claimsDirectForce)
        XCTAssertEqual(sample.measurementType, .estimated)
        XCTAssertEqual(sample.metric, "user_acceleration")
    }

    func testApiClientWithoutBaseURLIsUnavailable() async {
        let client = FitAPIClient(baseURL: nil, tokenProvider: { nil })
        let result = await client.get("/api/v1/identity/me")
        guard case .failure(let error) = result else {
            return XCTFail("expected failure")
        }
        XCTAssertEqual(error, .notConfigured)
    }

    func testWatchPresentationAndLiveHeartRateHonesty() {
        XCTAssertEqual(WatchFightPresentation.nextAction(.warning), "REST")
        XCTAssertEqual(WatchFightPresentation.clock(65), "1:05")
        XCTAssertEqual(LiveWorkoutController().heartRateLabel, "DATA UNAVAILABLE")
        XCTAssertFalse(DeviceMotionSample.fromDeviceMotion(timestamp: 0, userAx: 1, userAy: 0, userAz: 0, rotX: 0, rotY: 0, rotZ: 0).claimsDirectForce)
    }

    func testBackgroundPolicyDoesNotKeepAppAlive() {
        XCTAssertFalse(BackgroundPolicy.allowsPermanentProcess())
        XCTAssertEqual(BackgroundPolicy.catalog.first?.classification, .continuousSession)
        XCTAssertTrue(CoreBluetoothCombatAdapter.backgroundModeRequested == false)
    }

    func testGlanceStoreRoundTripAndPrivacy() {
        GlanceSharedStore.defaults().set(false, forKey: "glance.showRecovery")
        GlanceSharedStore.defaults().set(false, forKey: "glance.showHeartRate")
        var snap = GlanceSnapshot.idle
        snap.phase = "REST"
        snap.remainingSec = 24
        snap.recoveryHRV = "DATA UNAVAILABLE"
        GlanceSharedStore.save(snap)
        let loaded = GlanceSharedStore.load()
        XCTAssertEqual(loaded.clock, "0:24")
        XCTAssertTrue(loaded.isLive)
        let redacted = GlancePrivacy.redact(loaded, surface: .widget, defaults: GlanceSharedStore.defaults())
        XCTAssertEqual(redacted.recoveryHRV, "HIDDEN")
        GlanceSharedStore.enqueue(.skipRest)
        XCTAssertEqual(GlanceSharedStore.takeCommand(), .skipRest)
        XCTAssertEqual(GlanceSharedStore.takeCommand(), .none)
    }

    func testLiveIslandAndDeepLinks() {
        let compact = TrainLivePresentation.islandCompact(phase: "REST", clock: "0:24")
        XCTAssertEqual(compact.leading, "REST")
        XCTAssertEqual(TrainLivePresentation.islandCompact(phase: "WARNING", clock: "0:09").leading, "WARN")
        XCTAssertEqual(TrainLivePresentation.islandCompact(phase: "PAUSED", clock: "2:01").leading, "PAUSE")
        XCTAssertEqual(FitDeepLink.destination(URL(string: "fitconnect://app/martial-arts")!), "martial-arts")
        XCTAssertEqual(FitDeepLink.destination(URL(string: "fitconnect://app/train")!), "train")
        XCTAssertEqual(HealthKitObserverPlan.enableBackgroundDelivery(status: .sharingDenied), false)
        XCTAssertEqual(WidgetTimelinePolicy.reloadMinutes(isLive: false), 60)
    }

    func testGlanceBridgeMapsFightWithoutInventingForce() {
        var round = CombatRoundSnapshot.idle
        round.disciplineId = "muay_thai"
        round.phase = .rest
        round.remainingSec = 24
        round.currentRound = 3
        let snap = GlanceBridge.fromFight(round, heartRate: "DATA UNAVAILABLE", sessionId: "s1")
        XCTAssertEqual(snap.phase, "REST")
        XCTAssertEqual(snap.kind, "fight")
        XCTAssertFalse(snap.heartRateLabel.contains("164"))
    }
}

final class DeviceRuntimeTests: XCTestCase {
    func testReleaseNeverAllowsLocalDemo() {
        XCTAssertFalse(FitRuntime.localDemoAllowed(isDebug: false, env: ["FITCONNECT_LOCAL_DEMO": "true"], defaults: .standard))
    }

    func testDeviceRejectsLocalhostAPI() {
        let local = URL(string: "http://localhost:3001")!
        XCTAssertFalse(FitRuntime.isAllowedOnDevice(local, isSimulator: false))
        XCTAssertTrue(FitRuntime.isAllowedOnDevice(local, isSimulator: true))
        XCTAssertTrue(FitRuntime.isAllowedOnDevice(FitRuntime.productionAPI, isSimulator: false))
        XCTAssertEqual(FitRuntime.apiBaseURL(bundle: Bundle(for: DeviceRuntimeTests.self), isSimulator: false).host, "fitconnect-phi.vercel.app")
    }

    func testTrainRecoveryRoundTrip() {
        var snap = TrainSessionSnapshot.idle
        snap.phase = .active
        snap.workRemainingSec = 90
        snap.plan = TrainReducer.catalog.first
        TrainRecoveryStore.save(snap)
        XCTAssertEqual(TrainRecoveryStore.load()?.phase, .active)
        TrainRecoveryStore.clear()
        XCTAssertNil(TrainRecoveryStore.load())
    }
}
