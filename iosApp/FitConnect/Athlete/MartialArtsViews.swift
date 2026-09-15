import SwiftUI
#if canImport(UIKit)
import UIKit
#endif

struct MartialArtsCatalogView: View {
    var onSelect: (String) -> Void

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 14) {
                GlassCard(accent: .alert) {
                    Text("MARTIAL ARTS OS")
                        .font(.system(size: 11, weight: .medium, design: .monospaced))
                        .foregroundStyle(EosColors.textSecondary)
                    Text("33 disciplines. Not a dropdown skin.")
                        .font(.system(size: 28, weight: .bold, design: .rounded))
                        .foregroundStyle(EosColors.textPrimary)
                    Text("Core Motion and Apple Watch IMU report acceleration and rotation. They never become DIRECT force.")
                        .foregroundStyle(EosColors.textSecondary)
                }

                ForEach(CombatRoundReducer.requiredDisciplineIds, id: \.self) { id in
                    Button {
                        onSelect(id)
                    } label: {
                        HStack {
                            Text(id.replacingOccurrences(of: "_", with: " ").capitalized)
                                .foregroundStyle(EosColors.textPrimary)
                            Spacer()
                            Text("Fight Mode")
                                .font(.system(size: 11, weight: .medium, design: .monospaced))
                                .foregroundStyle(EosColors.voltline)
                        }
                        .padding(14)
                        .background(RoundedRectangle(cornerRadius: 16, style: .continuous).fill(EosColors.surfaceRaised))
                    }
                    .buttonStyle(.plain)
                    .accessibilityIdentifier("discipline-\(id)")
                }
            }
            .padding(20)
        }
        .navigationTitle("Martial Arts")
    }
}

struct FightModeView: View {
    let disciplineId: String
    @State private var round = CombatRoundSnapshot.idle
    @State private var muted = false
    @State private var ticker = Timer.publish(every: 1, on: .main, in: .common).autoconnect()
    @StateObject private var workout = LiveWorkoutController()
    @StateObject private var motion = CoreMotionSession()

    var body: some View {
        VStack(spacing: 18) {
            Text(disciplineId.replacingOccurrences(of: "_", with: " ").uppercased())
                .font(.system(size: 12, weight: .medium, design: .monospaced))
                .foregroundStyle(EosColors.textSecondary)
            Text(round.phase.rawValue.uppercased())
                .font(.system(size: 13, weight: .semibold, design: .monospaced))
                .foregroundStyle(round.phase == .warning ? EosColors.alert : EosColors.voltline)
            Text(WatchFightPresentation.clock(round.remainingSec))
                .font(.system(size: 72, weight: .bold, design: .monospaced))
                .foregroundStyle(round.phase == .warning ? EosColors.alert : EosColors.textPrimary)
                .accessibilityIdentifier("fight-clock")
                .accessibilityLabel("\(round.remainingSec) seconds remaining")
            Text("R\(max(round.currentRound, 1)) / \(round.prescription.roundCount)")
                .font(.title3)
                .foregroundStyle(EosColors.textSecondary)

            HStack(spacing: 12) {
                missingChip("HR", workout.heartRateLabel)
                missingChip("Force", "DATA UNAVAILABLE")
                missingChip("Strikes", "0")
            }

            Text("Watch IMU ≠ punch force. \(CombatRoundReducer.forceFromWatchImuIsInvalid() ? "Contract enforced." : "BUG")")
                .font(.footnote)
                .foregroundStyle(EosColors.muted)
                .multilineTextAlignment(.center)

            controls
            Spacer()
        }
        .padding(20)
        .background(EosColors.floor.ignoresSafeArea())
        .onAppear {
            var next = CombatRoundSnapshot.idle
            next.disciplineId = disciplineId
            round = next
        }
        .onReceive(ticker) { _ in
            let live: Set<CombatRoundPhase> = [.countdown, .work, .warning, .rest]
            if live.contains(round.phase) {
                let previous = round.phase
                round = CombatRoundReducer.reduce(round, .tick)
                if round.phase == .warning && previous != .warning && !muted {
                    #if canImport(UIKit)
                    UINotificationFeedbackGenerator().notificationOccurred(.warning)
                    #endif
                }
            }
        }
        .navigationTitle("Fight Mode")
    }

    @ViewBuilder
    private var controls: some View {
        if round.phase == .idle || round.phase == .complete {
            Button("Start") {
                round = CombatRoundReducer.reduce(round, .start)
                workout.start(activity: .martialArts)
                motion.start()
            }
                .buttonStyle(FightPrimary())
        }
        if round.phase == .work || round.phase == .warning || round.phase == .countdown {
            HStack {
                Button("Pause") {
                    round = CombatRoundReducer.reduce(round, .pause)
                    workout.pause()
                }
                Button("Finish") {
                    round = CombatRoundReducer.reduce(round, .finish)
                    workout.end()
                    motion.stop()
                }
            }
        }
        if round.phase == .rest {
            HStack {
                Button("Skip rest") { round = CombatRoundReducer.reduce(round, .skipRest) }
                Button(muted ? "Unmute" : "Mute") { muted.toggle() }
            }
        }
        if round.phase == .paused {
            Button("Resume") {
                round = CombatRoundReducer.reduce(round, .resume)
                workout.resume()
            }
                .buttonStyle(FightPrimary())
        }
    }

    private func missingChip(_ title: String, _ value: String) -> some View {
        VStack(spacing: 4) {
            Text(title)
                .font(.system(size: 10, weight: .medium, design: .monospaced))
                .foregroundStyle(EosColors.textSecondary)
            Text(value)
                .font(.headline)
                .foregroundStyle(EosColors.textPrimary)
        }
        .padding(12)
        .frame(maxWidth: .infinity)
        .background(RoundedRectangle(cornerRadius: 14, style: .continuous).fill(EosColors.surfaceRaised))
    }
}

private struct FightPrimary: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.headline)
            .foregroundStyle(EosColors.floor)
            .padding(.vertical, 12)
            .frame(maxWidth: .infinity)
            .background(Capsule().fill(EosColors.voltline).opacity(configuration.isPressed ? 0.7 : 1))
    }
}
