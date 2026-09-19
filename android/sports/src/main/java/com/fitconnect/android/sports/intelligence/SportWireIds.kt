package com.fitconnect.android.sports.intelligence

import com.fitconnect.android.sports.domain.SportId

/**
 * Maps Android catalog SportIds (lowercase) ↔ web SPORT_REGISTRY wire ids (UPPER_SNAKE).
 * API payloads use wire form; local engines use [SportId].
 */
object SportWireIds {
    fun toWire(id: SportId): String = id.value.trim().uppercase()

    fun fromWire(raw: String): SportId {
        val normalized = raw.trim().lowercase().replace(' ', '_')
        return SportId(normalized)
    }

    /** Resolve catalog profile even when wire/local casing differs. */
    fun catalogKey(id: SportId): String = id.value.trim().lowercase()
}
