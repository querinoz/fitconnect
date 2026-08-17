package com.fitconnect.shared.wear

data class SessionControlCommand(
    val op: String,
    val sportKey: String,
    val schemaVersion: String = SCHEMA,
) {
    fun toWire(): String =
        "v=$schemaVersion;op=$op;sport=$sportKey"

    companion object {
        const val SCHEMA = "session.v1"
        const val START = "START"
        const val START_WORKOUT = "START_WORKOUT"
        const val PAUSE = "PAUSE"
        const val PAUSE_WORKOUT = "PAUSE_WORKOUT"
        const val RESUME = "RESUME"
        const val RESUME_WORKOUT = "RESUME_WORKOUT"
        const val END = "END"
        const val STOP_WORKOUT = "STOP_WORKOUT"
        const val SYNC_METRICS = "SYNC_METRICS"

        fun normalizeOp(op: String): String = when (op) {
            START_WORKOUT -> START
            PAUSE_WORKOUT -> PAUSE
            RESUME_WORKOUT -> RESUME
            STOP_WORKOUT -> END
            else -> op
        }

        fun parse(wire: String): SessionControlCommand {
            val header = wire.split(';').associate { token ->
                val eq = token.indexOf('=')
                require(eq > 0) { "Malformed session control" }
                token.substring(0, eq) to token.substring(eq + 1)
            }
            return SessionControlCommand(
                op = normalizeOp(header.getValue("op")),
                sportKey = header["sport"] ?: "Run",
                schemaVersion = header.getValue("v"),
            )
        }
    }
}
