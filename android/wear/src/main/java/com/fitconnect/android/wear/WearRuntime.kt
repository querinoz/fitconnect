package com.fitconnect.android.wear

import com.fitconnect.android.capture.LiveActivityEngine
import com.fitconnect.ascend.engine.AscendEngine
import com.fitconnect.shared.identity.LocalDemoIdentity
import com.fitconnect.shared.session.OwnershipResult
import com.fitconnect.shared.session.SessionLease
import com.fitconnect.shared.session.SessionOwnership
import com.fitconnect.shared.wear.SessionControlCommand
import com.fitconnect.shared.workout.WorkoutSport

/** Process-wide watch session handle. Set from [WearMainActivity]. */
object WearRuntime {
    @Volatile var engine: LiveActivityEngine? = null
    @Volatile var sessionId: String = "wear-local"
    @Volatile var deviceId: String = "wear"
    @Volatile var sequence: Long = 0L
    @Volatile var lease: SessionLease? = null
    @Volatile var lastBlockCode: String? = null
    val ascend: AscendEngine = AscendEngine(demoLabeledUsers = setOf(LocalDemoIdentity.ATHLETE_ID))

    fun claimLocalStart(sportKey: String = WorkoutSport.RUN.wireKey): Boolean {
        val now = System.currentTimeMillis()
        val result = SessionOwnership.claimStart(
            current = lease,
            sessionId = sessionId,
            deviceId = deviceId,
            sportKey = sportKey,
            nowEpochMs = now,
        )
        return when (result) {
            is OwnershipResult.Ok -> {
                lease = result.lease
                lastBlockCode = null
                true
            }
            is OwnershipResult.Blocked -> {
                lastBlockCode = result.code
                false
            }
        }
    }

    fun applyControl(command: SessionControlCommand) {
        val target = engine ?: return
        when (command.op) {
            SessionControlCommand.START -> {
                if (!claimLocalStart(command.sportKey)) return
                target.start(command.sportKey)
                sessionId = target.state.value.sessionId.ifBlank { sessionId }
            }
            SessionControlCommand.PAUSE -> target.pause()
            SessionControlCommand.RESUME -> target.resume()
            SessionControlCommand.END -> target.end()
        }
    }

    fun nextSequence(): Long {
        sequence += 1L
        return sequence
    }
}
