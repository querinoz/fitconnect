package com.fitconnect.shared.wear

/**
 * Phone → Wear Fight Mode glance. No force, HR, or invented strike counts.
 * Hardware BLE gloves/bags are a separate path and must not use this wire.
 */
data class CombatRoundGlance(
    val phase: String,
    val round: Int,
    val remainingSec: Int,
    val disciplineId: String,
    val syncedAtEpochMs: Long,
    val connected: Boolean,
)

object CombatRoundWire {
    const val SCHEMA = "combat.v1"

    fun encode(
        phase: String,
        round: Int,
        remainingSec: Int,
        disciplineId: String,
        syncedAtEpochMs: Long,
        connected: Boolean = true,
    ): String =
        "v=$SCHEMA;phase=$phase;round=$round;remaining=$remainingSec;discipline=$disciplineId;ts=$syncedAtEpochMs;connected=${if (connected) "1" else "0"}"

    fun decode(wire: String): CombatRoundGlance? {
        if (wire.isBlank()) return null
        val header = runCatching {
            wire.split(';').associate { token ->
                val eq = token.indexOf('=')
                require(eq > 0) { "Malformed combat round wire" }
                token.substring(0, eq) to token.substring(eq + 1)
            }
        }.getOrNull() ?: return null
        if (header["v"] != SCHEMA) return null
        val phase = header["phase"]?.lowercase() ?: return null
        val round = header["round"]?.toIntOrNull()?.coerceAtLeast(0) ?: return null
        val remaining = header["remaining"]?.toIntOrNull()?.coerceAtLeast(0) ?: return null
        val discipline = header["discipline"]?.ifBlank { null } ?: return null
        val ts = header["ts"]?.toLongOrNull() ?: return null
        if (header.containsKey("force") || header.containsKey("hr") || header.containsKey("hrv")) return null
        return CombatRoundGlance(
            phase = phase,
            round = round,
            remainingSec = remaining,
            disciplineId = discipline,
            syncedAtEpochMs = ts,
            connected = header["connected"] != "0",
        )
    }
}
