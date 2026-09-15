import SwiftUI
#if canImport(WatchKit)
import WatchKit
#endif

@main
struct FitConnectWatchApp: App {
    var body: some Scene {
        WindowGroup {
            WatchFightView()
        }
    }
}

struct WatchFightView: View {
    @State private var round = CombatRoundSnapshot.idle
    @State private var ticker = Timer.publish(every: 1, on: .main, in: .common).autoconnect()
    @StateObject private var workout = LiveWorkoutController()
    @StateObject private var motion = CoreMotionSession()

    var body: some View {
        VStack(spacing: 6) {
            Text(round.phase.rawValue.uppercased())
                .font(.system(size: 11, weight: .semibold, design: .monospaced))
            Text(WatchFightPresentation.clock(round.remainingSec))
                .font(.system(size: 40, weight: .bold, design: .monospaced))
                .minimumScaleFactor(0.5)
                .accessibilityLabel("\(round.remainingSec) seconds remaining")
            Text("R\(max(round.currentRound, 1))/\(round.prescription.roundCount)")
                .font(.caption)
            Text("HR \(workout.heartRateLabel)")
                .font(.caption2)
            Text(WatchFightPresentation.nextAction(round.phase))
                .font(.caption2)
                .multilineTextAlignment(.center)
            HStack {
                Button(round.phase == .idle || round.phase == .complete ? "Start" : "Pause") {
                    if round.phase == .idle || round.phase == .complete {
                        round = CombatRoundReducer.reduce(round, .start)
                        workout.start(activity: .martialArts)
                        motion.start()
                    } else if round.phase == .paused {
                        round = CombatRoundReducer.reduce(round, .resume)
                        workout.resume()
                    } else {
                        round = CombatRoundReducer.reduce(round, .pause)
                        workout.pause()
                    }
                }
                Button("End") {
                    round = CombatRoundReducer.reduce(round, .finish)
                    workout.end()
                    motion.stop()
                }
            }
            Text("IMU ≠ force · \(motion.status)")
                .font(.system(size: 10, design: .monospaced))
        }
        .padding(8)
        .onReceive(ticker) { _ in
            let live: Set<CombatRoundPhase> = [.countdown, .work, .warning, .rest]
            if live.contains(round.phase) {
                let previous = round.phase
                round = CombatRoundReducer.reduce(round, .tick)
                if round.phase == .warning && previous != .warning {
                    #if canImport(WatchKit)
                    WKInterfaceDevice.current().play(.notification)
                    #endif
                }
            }
            publishWatchGlance()
        }
    }

    private func publishWatchGlance() {
        var snap = GlanceSnapshot.idle
        snap.kind = "fight"
        snap.phase = round.phase.rawValue.uppercased()
        snap.title = "FIGHT"
        snap.remainingSec = round.remainingSec
        snap.roundLabel = "R\(max(round.currentRound, 1))/\(round.prescription.roundCount)"
        snap.nextAction = WatchFightPresentation.nextAction(round.phase)
        snap.heartRateLabel = workout.heartRateLabel
        snap.deepLink = FitDeepLink.martialArts
        GlanceSharedStore.save(snap)
    }
}
