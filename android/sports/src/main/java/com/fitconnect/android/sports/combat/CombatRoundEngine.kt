package com.fitconnect.android.sports.combat

enum class CombatRoundPhase {
    IDLE, COUNTDOWN, WORK, WARNING, REST, PAUSED, COMPLETE
}

data class CombatRoundPrescription(
    val roundCount: Int,
    val workSec: Int,
    val restSec: Int,
    val warningSec: Int,
    val countdownSec: Int,
)

data class CombatRoundSnapshot(
    val phase: CombatRoundPhase = CombatRoundPhase.IDLE,
    val resumePhase: CombatRoundPhase? = null,
    val prescription: CombatRoundPrescription = CombatRoundPrescription(3, 180, 60, 10, 10),
    val disciplineId: String = "boxing",
    val currentRound: Int = 0,
    val remainingSec: Int = 0,
    val completedRounds: Int = 0,
    val muted: Boolean = false,
)

sealed interface CombatRoundCommand {
    data class Configure(val prescription: CombatRoundPrescription, val disciplineId: String) : CombatRoundCommand
    data object Start : CombatRoundCommand
    data object Tick : CombatRoundCommand
    data object Pause : CombatRoundCommand
    data object Resume : CombatRoundCommand
    data object SkipRest : CombatRoundCommand
    data object Finish : CombatRoundCommand
}

object CombatRoundEngine {
    fun reduce(snapshot: CombatRoundSnapshot, command: CombatRoundCommand): CombatRoundSnapshot = when (command) {
        is CombatRoundCommand.Configure ->
            if (snapshot.phase == CombatRoundPhase.IDLE || snapshot.phase == CombatRoundPhase.COMPLETE) {
                CombatRoundSnapshot(prescription = command.prescription, disciplineId = command.disciplineId, muted = snapshot.muted)
            } else snapshot
        CombatRoundCommand.Start -> {
            if (snapshot.phase != CombatRoundPhase.IDLE && snapshot.phase != CombatRoundPhase.COMPLETE) snapshot
            else if (snapshot.prescription.countdownSec > 0) {
                snapshot.copy(phase = CombatRoundPhase.COUNTDOWN, currentRound = 0, remainingSec = snapshot.prescription.countdownSec, completedRounds = 0)
            } else beginWork(snapshot, 1)
        }
        CombatRoundCommand.Pause ->
            if (snapshot.phase == CombatRoundPhase.IDLE || snapshot.phase == CombatRoundPhase.COMPLETE || snapshot.phase == CombatRoundPhase.PAUSED) snapshot
            else snapshot.copy(phase = CombatRoundPhase.PAUSED, resumePhase = snapshot.phase)
        CombatRoundCommand.Resume ->
            if (snapshot.phase != CombatRoundPhase.PAUSED || snapshot.resumePhase == null) snapshot
            else snapshot.copy(phase = snapshot.resumePhase, resumePhase = null)
        CombatRoundCommand.SkipRest ->
            if (snapshot.phase != CombatRoundPhase.REST) snapshot else beginWork(snapshot, snapshot.currentRound + 1)
        CombatRoundCommand.Finish ->
            if (snapshot.phase == CombatRoundPhase.IDLE) snapshot else snapshot.copy(phase = CombatRoundPhase.COMPLETE, remainingSec = 0)
        CombatRoundCommand.Tick -> tick(snapshot)
    }

    fun formatClock(totalSec: Int): String {
        val sec = totalSec.coerceAtLeast(0)
        return "%02d:%02d".format(sec / 60, sec % 60)
    }

    private fun tick(snapshot: CombatRoundSnapshot): CombatRoundSnapshot {
        val live = snapshot.phase == CombatRoundPhase.COUNTDOWN ||
            snapshot.phase == CombatRoundPhase.WORK ||
            snapshot.phase == CombatRoundPhase.WARNING ||
            snapshot.phase == CombatRoundPhase.REST
        if (!live) return snapshot
        if (snapshot.remainingSec <= 1) {
            return when (snapshot.phase) {
                CombatRoundPhase.COUNTDOWN -> beginWork(snapshot, 1)
                CombatRoundPhase.REST -> beginWork(snapshot, snapshot.currentRound + 1)
                else -> beginRest(snapshot)
            }
        }
        val remaining = snapshot.remainingSec - 1
        val warning = (snapshot.phase == CombatRoundPhase.WORK || snapshot.phase == CombatRoundPhase.WARNING) &&
            remaining <= snapshot.prescription.warningSec
        return snapshot.copy(
            remainingSec = remaining,
            phase = if (warning) CombatRoundPhase.WARNING else snapshot.phase,
        )
    }

    private fun beginWork(snapshot: CombatRoundSnapshot, round: Int): CombatRoundSnapshot {
        val work = snapshot.prescription.workSec
        val warning = snapshot.prescription.warningSec
        return snapshot.copy(
            phase = if (warning > 0 && work <= warning) CombatRoundPhase.WARNING else CombatRoundPhase.WORK,
            currentRound = round,
            remainingSec = work,
            resumePhase = null,
        )
    }

    private fun beginRest(snapshot: CombatRoundSnapshot): CombatRoundSnapshot {
        if (snapshot.currentRound >= snapshot.prescription.roundCount || snapshot.prescription.restSec <= 0) {
            return snapshot.copy(phase = CombatRoundPhase.COMPLETE, remainingSec = 0, completedRounds = snapshot.currentRound)
        }
        return snapshot.copy(
            phase = CombatRoundPhase.REST,
            remainingSec = snapshot.prescription.restSec,
            completedRounds = snapshot.currentRound,
        )
    }
}
