package com.fitconnect.android.wear

import com.fitconnect.android.capture.LiveActivityEngine
import com.fitconnect.ascend.engine.AscendEngine
import com.fitconnect.shared.wear.SessionControlCommand

/** Process-wide watch session handle. Set from [WearMainActivity]. */
object WearRuntime {
    @Volatile var engine: LiveActivityEngine? = null
    @Volatile var sessionId: String = "wear-local"
    @Volatile var sequence: Long = 0L
    val ascend: AscendEngine = AscendEngine(demoLabeledUsers = setOf("wear-local"))

    fun applyControl(command: SessionControlCommand) {
        val target = engine ?: return
        when (command.op) {
            SessionControlCommand.START -> {
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
