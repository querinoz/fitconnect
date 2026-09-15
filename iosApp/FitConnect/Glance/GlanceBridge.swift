import Foundation

enum GlanceBridge {
    static func fromTrain(_ snapshot: TrainSessionSnapshot, heartRate: String, sessionId: String) -> GlanceSnapshot {
        var snap = GlanceSnapshot.idle
        snap.sessionId = sessionId
        snap.kind = snapshot.plan?.combat == nil ? "train" : "fight"
        snap.phase = snapshot.phase.rawValue.uppercased()
        snap.title = snapshot.plan?.title ?? "TRAIN"
        snap.remainingSec = snapshot.phase == .rest ? snapshot.restRemainingSec : snapshot.workRemainingSec
        if let combat = snapshot.plan?.combat {
            snap.roundLabel = "ROUND \(max(snapshot.sets.filter { !$0.skipped }.count, 1))/\(combat.roundCount)"
        }
        snap.nextAction = nextAction(snapshot)
        snap.heartRateLabel = heartRate.isEmpty ? "DATA UNAVAILABLE" : heartRate
        snap.sport = snapshot.plan?.trainingType.capitalized ?? "Strength"
        snap.durationMin = snapshot.plan?.durationMin ?? 45
        snap.syncStatus = snapshot.saveStatus.rawValue.uppercased()
        snap.deepLink = snapshot.plan?.combat == nil ? FitDeepLink.train : FitDeepLink.martialArts
        return snap
    }

    static func fromFight(_ round: CombatRoundSnapshot, heartRate: String, sessionId: String) -> GlanceSnapshot {
        var snap = GlanceSnapshot.idle
        snap.sessionId = sessionId
        snap.kind = "fight"
        snap.phase = mappedFightPhase(round.phase)
        snap.title = round.disciplineId.replacingOccurrences(of: "_", with: " ").uppercased()
        snap.remainingSec = round.remainingSec
        snap.roundLabel = "ROUND \(max(round.currentRound, 1))/\(round.prescription.roundCount)"
        snap.nextAction = WatchFightPresentation.nextAction(round.phase)
        snap.heartRateLabel = heartRate.isEmpty ? "DATA UNAVAILABLE" : heartRate
        snap.sport = "Martial arts"
        snap.durationMin = (round.prescription.workSec * round.prescription.roundCount) / 60
        snap.deepLink = FitDeepLink.martialArts
        return snap
    }

    static func dailyCatalog() -> GlanceSnapshot {
        var snap = GlanceSnapshot.idle
        if let plan = TrainReducer.catalog.first {
            snap.title = plan.title
            snap.sport = plan.trainingType.capitalized
            snap.durationMin = plan.durationMin
            snap.nextAction = plan.title
            snap.kind = plan.combat == nil ? "train" : "fight"
        }
        snap.phase = "IDLE"
        snap.deepLink = FitDeepLink.train
        return snap
    }

    static func apply(_ command: GlanceCommand, to snapshot: TrainSessionSnapshot) -> TrainSessionSnapshot {
        switch command {
        case .pause: return TrainReducer.reduce(snapshot, .pause)
        case .resume: return TrainReducer.reduce(snapshot, .resume)
        case .skipRest: return TrainReducer.reduce(snapshot, .skipRest)
        case .none: return snapshot
        }
    }

    private static func nextAction(_ snapshot: TrainSessionSnapshot) -> String {
        switch snapshot.phase {
        case .rest: return snapshot.plan?.title ?? "Resume work"
        case .warning: return "Rest next"
        case .paused, .interrupted: return "Resume"
        case .completing, .complete: return "Save"
        default: return snapshot.plan?.purpose ?? "Train"
        }
    }

    private static func mappedFightPhase(_ phase: CombatRoundPhase) -> String {
        switch phase {
        case .work: return "ACTIVE"
        case .rest: return "REST"
        case .warning: return "WARNING"
        case .paused: return "PAUSED"
        case .countdown: return "PREP"
        case .complete: return "COMPLETED"
        case .idle: return "IDLE"
        }
    }
}
