package com.fitconnect.android.wear

import com.fitconnect.shared.wear.CombatRoundGlance
import com.fitconnect.shared.wear.CombatRoundWire
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

/**
 * Phone → watch Fight Mode clock. Offline stays on the last accepted glance.
 * Does not ingest force, HR, or strike counts.
 */
object WearCombatInbox {
    private val _glance = MutableStateFlow<CombatRoundGlance?>(null)
    val glanceFlow: StateFlow<CombatRoundGlance?> = _glance.asStateFlow()

    val glance: CombatRoundGlance?
        get() = _glance.value

    @Volatile
    var acceptedCount: Int = 0
        private set

    @Volatile
    var rejectedCount: Int = 0
        private set

    fun clear() {
        _glance.value = null
        acceptedCount = 0
        rejectedCount = 0
    }

    fun ingest(wire: String): Boolean {
        val parsed = CombatRoundWire.decode(wire) ?: run {
            rejectedCount += 1
            return false
        }
        _glance.value = parsed
        acceptedCount += 1
        return true
    }
}
