import Foundation

enum TrainPhase: String, Equatable {
    case idle
    case prep
    case warmup
    case active
    case rest
    case paused
    case substituting
    case interrupted
    case completing
    case complete
}

struct TrainPlanSummary: Identifiable, Equatable {
    let id: String
    let title: String
    let purpose: String
    let durationMin: Int
    let trainingType: String
}

struct TrainSessionSnapshot: Equatable {
    var phase: TrainPhase
    var plan: TrainPlanSummary?
    var elapsedSec: Int
    var lastError: String?

    static let idle = TrainSessionSnapshot(phase: .idle, plan: nil, elapsedSec: 0, lastError: nil)
}

enum TrainCommand {
    case select(TrainPlanSummary)
    case start
    case interrupt
    case resume
    case finish
    case reset
}

enum TrainReducer {
    static let catalog: [TrainPlanSummary] = [
        TrainPlanSummary(
            id: "plan_upper_push_v2",
            title: "Upper push",
            purpose: "Press, row support, and rest. No invented calories.",
            durationMin: 32,
            trainingType: "strength"
        ),
        TrainPlanSummary(
            id: "plan_warmup_v1",
            title: "Prime the session",
            purpose: "Raise temperature before main work.",
            durationMin: 8,
            trainingType: "warm-up"
        ),
        TrainPlanSummary(
            id: "plan_boxing_bag_v1",
            title: "Boxing bag — 5×3",
            purpose: "Fight-mode rounds. Punch force is not invented from Apple Watch IMU.",
            durationMin: 24,
            trainingType: "combat-rounds"
        ),
        TrainPlanSummary(
            id: "plan_capoeira_roda_v1",
            title: "Capoeira roda",
            purpose: "Ginga and community rhythm — not strikes per minute.",
            durationMin: 20,
            trainingType: "combat-cultural"
        )
    ]

    static func reduce(_ state: TrainSessionSnapshot, _ command: TrainCommand) -> TrainSessionSnapshot {
        switch command {
        case .select(let plan):
            return TrainSessionSnapshot(phase: .prep, plan: plan, elapsedSec: 0, lastError: nil)
        case .start:
            guard state.phase == .prep, let plan = state.plan else {
                return state.with(error: "Preview a session before starting.")
            }
            let phase: TrainPhase = plan.trainingType == "warm-up" ? .warmup : .active
            return TrainSessionSnapshot(phase: phase, plan: plan, elapsedSec: 0, lastError: nil)
        case .interrupt:
            guard state.phase == .active || state.phase == .warmup || state.phase == .rest else { return state }
            return TrainSessionSnapshot(
                phase: .interrupted,
                plan: state.plan,
                elapsedSec: state.elapsedSec,
                lastError: "Session interrupted. Resume to continue."
            )
        case .resume:
            guard state.phase == .paused || state.phase == .interrupted else { return state }
            let phase: TrainPhase = state.plan?.trainingType == "warm-up" ? .warmup : .active
            return TrainSessionSnapshot(phase: phase, plan: state.plan, elapsedSec: state.elapsedSec, lastError: nil)
        case .finish:
            return TrainSessionSnapshot(phase: .completing, plan: state.plan, elapsedSec: state.elapsedSec, lastError: nil)
        case .reset:
            return .idle
        }
    }
}

private extension TrainSessionSnapshot {
    func with(error: String) -> TrainSessionSnapshot {
        TrainSessionSnapshot(phase: phase, plan: plan, elapsedSec: elapsedSec, lastError: error)
    }
}
