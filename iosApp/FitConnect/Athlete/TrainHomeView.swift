import SwiftUI

struct AthleteTrainHomeView: View {
    var onNavigate: (AthleteRoute) -> Void
    @State private var snapshot = TrainSessionSnapshot.idle
    @State private var ticker = Timer.publish(every: 1, on: .main, in: .common).autoconnect()
    @StateObject private var workout = LiveWorkoutController()
    @StateObject private var motion = CoreMotionSession()

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 18) {
                GlassCard(accent: .voltline) {
                    Text("TRAIN")
                        .font(.system(size: 11, weight: .medium, design: .monospaced))
                        .foregroundStyle(EosColors.textSecondary)
                    Text(TrainReducer.productState(snapshot))
                        .font(.system(size: 13, weight: .semibold, design: .monospaced))
                        .foregroundStyle(EosColors.voltline)
                    Text(snapshot.plan?.title ?? "Select a session")
                        .font(.system(size: 32, weight: .bold, design: .rounded))
                        .foregroundStyle(EosColors.textPrimary)
                    Text(snapshot.plan?.purpose ?? "Catalog → briefing → start → warm-up / active / rest → save. Heart rate stays missing without HealthKit.")
                        .foregroundStyle(EosColors.textSecondary)

                    if snapshot.phase == .active || snapshot.phase == .warmup || snapshot.phase == .warning || snapshot.phase == .rest {
                        FitTimer(remainingSec: snapshot.phase == .rest ? snapshot.restRemainingSec : snapshot.workRemainingSec, warning: snapshot.phase == .warning)
                            .accessibilityIdentifier("train-clock")
                        FitMetric(title: "Heart rate", value: workout.heartRateLabel, accent: .alert)
                    }

                    if let err = snapshot.lastError {
                        Text(err)
                            .foregroundStyle(EosColors.alert)
                    }

                    controls
                }

                if snapshot.phase == .idle {
                    NeoControl(title: "Martial Arts OS", subtitle: "33 disciplines. Fight Mode on iPhone and Apple Watch.", systemImage: "figure.martial.arts", accent: .alert) {
                        onNavigate(.martialArts)
                    }
                    ForEach(TrainReducer.catalog) { plan in
                        Button {
                            snapshot = TrainReducer.reduce(snapshot, .select(plan))
                        } label: {
                            VStack(alignment: .leading, spacing: 6) {
                                Text(plan.title)
                                    .font(.headline)
                                    .foregroundStyle(EosColors.textPrimary)
                                Text(plan.purpose)
                                    .font(.subheadline)
                                    .foregroundStyle(EosColors.textSecondary)
                            }
                            .padding(16)
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .background(RoundedRectangle(cornerRadius: 18, style: .continuous).fill(EosColors.surfaceRaised))
                        }
                        .buttonStyle(.plain)
                        .accessibilityIdentifier("train-plan-\(plan.id)")
                    }
                }
            }
            .padding(20)
        }
        .onReceive(ticker) { _ in
            let live: Set<TrainPhase> = [.active, .warmup, .rest, .warning]
            if live.contains(snapshot.phase) {
                snapshot = TrainReducer.reduce(snapshot, .tick)
            }
        }
        .onChange(of: snapshot.phase) { _, phase in
            if phase == .completing {
                persistLocalThenFailClosed()
            }
        }
        .accessibilityIdentifier("athlete-train")
    }

    @ViewBuilder
    private var controls: some View {
        switch snapshot.phase {
        case .idle:
            EmptyView()
        case .prep:
            primary("Start") {
                snapshot = TrainReducer.reduce(snapshot, .start)
                workout.start(activity: snapshot.plan?.combat != nil ? .martialArts : .traditional)
                motion.start()
            }
            if snapshot.plan?.combat != nil {
                Button("Open Fight Mode") {
                    onNavigate(.fightMode(snapshot.plan?.combat?.disciplineId ?? "boxing"))
                }
                .foregroundStyle(EosColors.voltline)
            }
        case .active, .warmup, .warning:
            HStack {
                secondary("Pause") {
                    snapshot = TrainReducer.reduce(snapshot, .pause)
                    workout.pause()
                }
                secondary("Interrupt") { snapshot = TrainReducer.reduce(snapshot, .interrupt) }
            }
            primary("Finish") {
                snapshot = TrainReducer.reduce(snapshot, .finish)
                workout.end()
                motion.stop()
            }
        case .rest:
            HStack {
                secondary("Skip rest") { snapshot = TrainReducer.reduce(snapshot, .skipRest) }
                secondary("Pause") {
                    snapshot = TrainReducer.reduce(snapshot, .pause)
                    workout.pause()
                }
            }
        case .paused, .interrupted:
            primary("Resume") {
                snapshot = TrainReducer.reduce(snapshot, .resume)
                workout.resume()
            }
            secondary("Finish") {
                snapshot = TrainReducer.reduce(snapshot, .finish)
                workout.end()
                motion.stop()
            }
        case .substituting:
            Text("Substitution requested. Continue or finish.")
                .foregroundStyle(EosColors.textSecondary)
        case .completing, .complete:
            Text("Save: \(snapshot.saveStatus.rawValue.replacingOccurrences(of: "_", with: " "))")
                .foregroundStyle(EosColors.textSecondary)
            primary("Back to catalog") { snapshot = TrainReducer.reduce(snapshot, .reset) }
        }
    }

    private func persistLocalThenFailClosed() {
        let row = PersistedTrainSession(
            sessionId: UUID().uuidString,
            planId: snapshot.plan?.id ?? "unknown",
            phase: snapshot.phase.rawValue,
            elapsedSec: snapshot.elapsedSec,
            sets: snapshot.sets.count,
            saveStatus: SaveStatus.localOnly.rawValue,
            updatedAt: Date().timeIntervalSince1970
        )
        TrainLocalStore.upsert(row)
        snapshot = TrainReducer.reduce(snapshot, .markSave(.localOnly))
        workout.end()
        motion.stop()
    }

    private func primary(_ title: String, action: @escaping () -> Void) -> some View {
        Button(title, action: action)
            .font(.headline)
            .foregroundStyle(EosColors.floor)
            .padding(.vertical, 12)
            .frame(maxWidth: .infinity)
            .background(Capsule().fill(EosColors.trainGradient))
            .buttonStyle(.plain)
    }

    private func secondary(_ title: String, action: @escaping () -> Void) -> some View {
        Button(title, action: action)
            .font(.headline)
            .foregroundStyle(EosColors.textPrimary)
            .padding(.vertical, 12)
            .frame(maxWidth: .infinity)
            .background(Capsule().stroke(EosColors.stroke, lineWidth: 1))
            .buttonStyle(.plain)
    }
}
