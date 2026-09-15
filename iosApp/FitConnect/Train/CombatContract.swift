import Foundation

/// Martial Arts OS contract. IDs match `apps/web/lib/combat/taxonomy.ts`.
/// IMU acceleration is never presented as force. Missing stays missing.
enum CombatMeasurementType: String {
    case direct = "DIRECT"
    case estimated = "ESTIMATED"
    case proxy = "PROXY"
}

enum CombatRoundPhase: String {
    case idle, countdown, work, warning, rest, paused, complete
}

struct CombatRoundPrescription: Equatable {
    var roundCount: Int
    var workSec: Int
    var restSec: Int
    var warningSec: Int
    var countdownSec: Int
}

struct CombatRoundSnapshot: Equatable {
    var phase: CombatRoundPhase
    var resumePhase: CombatRoundPhase?
    var prescription: CombatRoundPrescription
    var disciplineId: String
    var currentRound: Int
    var remainingSec: Int
    var completedRounds: Int

    static let idle = CombatRoundSnapshot(
        phase: .idle,
        resumePhase: nil,
        prescription: CombatRoundPrescription(roundCount: 3, workSec: 180, restSec: 60, warningSec: 10, countdownSec: 10),
        disciplineId: "boxing",
        currentRound: 0,
        remainingSec: 0,
        completedRounds: 0
    )
}

enum CombatRoundCommand {
    case start
    case tick
    case pause
    case resume
    case skipRest
    case finish
}

enum CombatRoundReducer {
    static let requiredDisciplineIds: [String] = [
        "boxing", "muay_thai", "kickboxing", "mma", "bjj", "judo", "karate", "taekwondo",
        "wrestling", "sambo", "sanda", "wushu", "savate", "capoeira", "silat", "pencak_silat",
        "lethwei", "hapkido", "aikido", "kung_fu", "taijiquan", "kendo", "iaido", "taekkyeon",
        "kun_lbokator", "chidaoba", "kalaripayattu", "krav_maga", "wing_chun", "jeet_kune_do", "sumo",
        "catch_wrestling", "luta_livre"
    ]

    static func reduce(_ state: CombatRoundSnapshot, _ command: CombatRoundCommand) -> CombatRoundSnapshot {
        switch command {
        case .start:
            guard state.phase == .idle || state.phase == .complete else { return state }
            if state.prescription.countdownSec > 0 {
                var next = state
                next.phase = .countdown
                next.remainingSec = state.prescription.countdownSec
                next.currentRound = 0
                next.completedRounds = 0
                return next
            }
            return beginWork(state, round: 1)
        case .pause:
            guard state.phase != .idle && state.phase != .complete && state.phase != .paused else { return state }
            var next = state
            next.resumePhase = state.phase
            next.phase = .paused
            return next
        case .resume:
            guard state.phase == .paused, let resume = state.resumePhase else { return state }
            var next = state
            next.phase = resume
            next.resumePhase = nil
            return next
        case .skipRest:
            guard state.phase == .rest else { return state }
            return beginWork(state, round: state.currentRound + 1)
        case .finish:
            var next = state
            next.phase = .complete
            next.remainingSec = 0
            return next
        case .tick:
            return tick(state)
        }
    }

    static func forceFromWatchImuIsInvalid() -> Bool { true }

    private static func tick(_ state: CombatRoundSnapshot) -> CombatRoundSnapshot {
        guard state.phase == .countdown || state.phase == .work || state.phase == .warning || state.phase == .rest else {
            return state
        }
        if state.remainingSec <= 1 {
            if state.phase == .countdown { return beginWork(state, round: 1) }
            if state.phase == .rest { return beginWork(state, round: state.currentRound + 1) }
            return beginRest(state)
        }
        var next = state
        next.remainingSec -= 1
        if (state.phase == .work || state.phase == .warning) && next.remainingSec <= state.prescription.warningSec {
            next.phase = .warning
        }
        return next
    }

    private static func beginWork(_ state: CombatRoundSnapshot, round: Int) -> CombatRoundSnapshot {
        var next = state
        next.currentRound = round
        next.remainingSec = state.prescription.workSec
        next.phase = state.prescription.workSec <= state.prescription.warningSec ? .warning : .work
        next.resumePhase = nil
        return next
    }

    private static func beginRest(_ state: CombatRoundSnapshot) -> CombatRoundSnapshot {
        var next = state
        if state.currentRound >= state.prescription.roundCount || state.prescription.restSec <= 0 {
            next.phase = .complete
            next.remainingSec = 0
            next.completedRounds = state.currentRound
            return next
        }
        next.phase = .rest
        next.remainingSec = state.prescription.restSec
        next.completedRounds = state.currentRound
        return next
    }
}
