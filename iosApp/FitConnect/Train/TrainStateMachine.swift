import Foundation

enum TrainPhase: String, Equatable, CaseIterable {
    case idle
    case prep
    case warmup
    case active
    case rest
    case warning
    case paused
    case substituting
    case interrupted
    case completing
    case complete
}

enum SaveStatus: String, Equatable, CaseIterable {
    case idle
    case savePending = "save_pending"
    case saved
    case localOnly = "local_only"
    case failed
}

struct CombatPlanMeta: Equatable {
    var disciplineId: String
    var sessionMode: String
    var roundCount: Int
    var roundDurationSec: Int
    var restDurationSec: Int
    var warningSec: Int
    var focus: String
}

struct TrainPlanSummary: Identifiable, Equatable {
    let id: String
    let title: String
    let purpose: String
    let durationMin: Int
    let trainingType: String
    var combat: CombatPlanMeta?
}

struct LoggedTrainSet: Equatable {
    var name: String
    var setNumber: Int
    var timeSec: Int?
    var skipped: Bool
}

struct TrainSessionSnapshot: Equatable {
    var phase: TrainPhase
    var resumePhase: TrainPhase?
    var plan: TrainPlanSummary?
    var elapsedSec: Int
    var workRemainingSec: Int
    var restRemainingSec: Int
    var sets: [LoggedTrainSet]
    var saveStatus: SaveStatus
    var lastError: String?

    static let idle = TrainSessionSnapshot(
        phase: .idle,
        resumePhase: nil,
        plan: nil,
        elapsedSec: 0,
        workRemainingSec: 0,
        restRemainingSec: 0,
        sets: [],
        saveStatus: .idle,
        lastError: nil
    )
}

enum TrainCommand {
    case select(TrainPlanSummary)
    case start
    case tick
    case pause
    case resume
    case interrupt
    case skipRest
    case finish
    case markSave(SaveStatus)
    case reset
}

enum TrainReducer {
    static let catalog: [TrainPlanSummary] = [
        TrainPlanSummary(
            id: "plan_upper_push_v2",
            title: "Upper push",
            purpose: "Press and rest. No invented calories.",
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
            trainingType: "combat-rounds",
            combat: CombatPlanMeta(
                disciplineId: "boxing",
                sessionMode: "bag_work",
                roundCount: 5,
                roundDurationSec: 180,
                restDurationSec: 60,
                warningSec: 10,
                focus: "Combinations. Dominant hand stays unknown until logged."
            )
        ),
        TrainPlanSummary(
            id: "plan_muay_thai_v1",
            title: "Muay Thai rounds",
            purpose: "Kicks, knees and clinch — not boxing with a different skin.",
            durationMin: 24,
            trainingType: "combat-rounds",
            combat: CombatPlanMeta(
                disciplineId: "muay_thai",
                sessionMode: "pad_work",
                roundCount: 5,
                roundDurationSec: 180,
                restDurationSec: 60,
                warningSec: 10,
                focus: "Teep and round kick. Scoring is not inferred from a watch."
            )
        ),
        TrainPlanSummary(
            id: "plan_bjj_rolls_v1",
            title: "BJJ rolls",
            purpose: "Five-minute rolls. Positions are logged by you or a coach.",
            durationMin: 30,
            trainingType: "combat-rounds",
            combat: CombatPlanMeta(
                disciplineId: "bjj",
                sessionMode: "rolling",
                roundCount: 5,
                roundDurationSec: 300,
                restDurationSec: 60,
                warningSec: 15,
                focus: "Control time. Belts are never auto-awarded."
            )
        ),
        TrainPlanSummary(
            id: "plan_judo_randori_v1",
            title: "Judo randori",
            purpose: "Landing events are not Ippon.",
            durationMin: 22,
            trainingType: "combat-rounds",
            combat: CombatPlanMeta(
                disciplineId: "judo",
                sessionMode: "randori",
                roundCount: 4,
                roundDurationSec: 240,
                restDurationSec: 60,
                warningSec: 10,
                focus: "Kuzushi and grip. Official scores require a referee."
            )
        ),
        TrainPlanSummary(
            id: "plan_capoeira_roda_v1",
            title: "Capoeira roda",
            purpose: "Ginga and community rhythm — not strikes per minute.",
            durationMin: 20,
            trainingType: "combat-cultural",
            combat: CombatPlanMeta(
                disciplineId: "capoeira",
                sessionMode: "roda",
                roundCount: 1,
                roundDurationSec: 1200,
                restDurationSec: 0,
                warningSec: 20,
                focus: "UNESCO ICH 00892. Do not lead with strike rate."
            )
        )
    ]

    static func reduce(_ state: TrainSessionSnapshot, _ command: TrainCommand) -> TrainSessionSnapshot {
        switch command {
        case .select(let plan):
            return TrainSessionSnapshot(
                phase: .prep,
                resumePhase: nil,
                plan: plan,
                elapsedSec: 0,
                workRemainingSec: 0,
                restRemainingSec: 0,
                sets: [],
                saveStatus: .idle,
                lastError: nil
            )
        case .start:
            guard state.phase == .prep, let plan = state.plan else {
                return withError(state, "Preview a session before starting.")
            }
            let work = plan.combat?.roundDurationSec ?? (plan.trainingType == "warm-up" ? 480 : 90)
            return TrainSessionSnapshot(
                phase: plan.trainingType == "warm-up" ? .warmup : .active,
                resumePhase: nil,
                plan: plan,
                elapsedSec: 0,
                workRemainingSec: work,
                restRemainingSec: 0,
                sets: [],
                saveStatus: .idle,
                lastError: nil
            )
        case .tick:
            return tick(state)
        case .pause:
            guard state.phase == .active || state.phase == .warmup || state.phase == .rest || state.phase == .warning else {
                return state
            }
            var next = state
            next.resumePhase = state.phase
            next.phase = .paused
            return next
        case .interrupt:
            guard state.phase == .active || state.phase == .warmup || state.phase == .rest || state.phase == .warning else {
                return state
            }
            var next = state
            next.resumePhase = state.phase == .warning ? .active : state.phase
            next.phase = .interrupted
            next.lastError = "Session interrupted. Nothing uploaded."
            return next
        case .resume:
            guard state.phase == .paused || state.phase == .interrupted else { return state }
            var next = state
            next.phase = state.resumePhase ?? (state.plan?.trainingType == "warm-up" ? .warmup : .active)
            next.resumePhase = nil
            next.lastError = nil
            return next
        case .skipRest:
            guard state.phase == .rest else { return state }
            return beginNextWork(state)
        case .finish:
            return completing(logPartialRound(state))
        case .markSave(let status):
            var next = state
            next.saveStatus = status
            if status == .saved || status == .failed || status == .localOnly {
                next.phase = .complete
            }
            if status == .failed {
                next.lastError = "Cloud save failed. Session stays on this device."
            }
            return next
        case .reset:
            return .idle
        }
    }

    static func productState(_ snapshot: TrainSessionSnapshot) -> String {
        if snapshot.phase == .complete {
            switch snapshot.saveStatus {
            case .savePending: return "SAVE_PENDING"
            case .saved: return "SAVED"
            case .failed: return "SAVE_FAILED"
            case .localOnly: return "LOCAL_ONLY"
            case .idle: return "COMPLETED"
            }
        }
        if snapshot.phase == .completing {
            return snapshot.saveStatus == .savePending ? "SAVE_PENDING" : "COMPLETING"
        }
        if snapshot.phase == .active || snapshot.phase == .warmup,
           let warning = snapshot.plan?.combat?.warningSec,
           snapshot.workRemainingSec > 0,
           snapshot.workRemainingSec <= warning {
            return "WARNING"
        }
        return snapshot.phase.rawValue.uppercased()
    }

    private static func tick(_ state: TrainSessionSnapshot) -> TrainSessionSnapshot {
        var next = state
        next.elapsedSec += 1
        if state.phase == .active || state.phase == .warmup || state.phase == .warning {
            if state.workRemainingSec <= 1, state.plan?.combat != nil {
                return finishRound(next)
            }
            if state.workRemainingSec > 0 {
                next.workRemainingSec -= 1
                if let warning = state.plan?.combat?.warningSec, next.workRemainingSec <= warning {
                    next.phase = .warning
                }
            }
            return next
        }
        if state.phase == .rest {
            if state.restRemainingSec <= 1 {
                return beginNextWork(next)
            }
            next.restRemainingSec -= 1
            return next
        }
        return state
    }

    private static func finishRound(_ state: TrainSessionSnapshot) -> TrainSessionSnapshot {
        var next = logPartialRound(state)
        let combat = state.plan?.combat
        let completed = next.sets.filter { !$0.skipped }.count
        if let combat, completed < combat.roundCount, combat.restDurationSec > 0 {
            next.phase = .rest
            next.restRemainingSec = combat.restDurationSec
            next.workRemainingSec = 0
            return next
        }
        return completing(next)
    }

    private static func beginNextWork(_ state: TrainSessionSnapshot) -> TrainSessionSnapshot {
        var next = state
        guard let combat = state.plan?.combat else { return completing(state) }
        let completed = state.sets.filter { !$0.skipped }.count
        if completed >= combat.roundCount {
            return completing(state)
        }
        next.phase = .active
        next.workRemainingSec = combat.roundDurationSec
        next.restRemainingSec = 0
        return next
    }

    private static func logPartialRound(_ state: TrainSessionSnapshot) -> TrainSessionSnapshot {
        guard let plan = state.plan, plan.combat != nil else { return state }
        let number = state.sets.filter { !$0.skipped }.count + 1
        let already = state.sets.contains { $0.setNumber == number && !$0.skipped }
        guard !already else { return state }
        let elapsed = max(1, (plan.combat?.roundDurationSec ?? 0) - state.workRemainingSec)
        var next = state
        next.sets.append(LoggedTrainSet(name: plan.title, setNumber: number, timeSec: elapsed, skipped: false))
        return next
    }

    private static func completing(_ state: TrainSessionSnapshot) -> TrainSessionSnapshot {
        var next = state
        next.phase = .completing
        next.workRemainingSec = 0
        next.restRemainingSec = 0
        next.saveStatus = .savePending
        next.lastError = nil
        return next
    }

    private static func withError(_ state: TrainSessionSnapshot, _ message: String) -> TrainSessionSnapshot {
        var next = state
        next.lastError = message
        return next
    }
}
