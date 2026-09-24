package com.fitconnect.android.sports.guided.completion

import com.fitconnect.android.sports.guided.domain.GuidedSessionSnapshot

/**
 * Optional side-effect after a guided session is completed and queued for sync.
 * Used for Health Connect write, analytics, etc. — never blocks Room persistence.
 */
fun interface GuidedCompletionSideEffect {
    suspend fun onSessionCompleted(snapshot: GuidedSessionSnapshot)
}

object NoOpGuidedCompletionSideEffect : GuidedCompletionSideEffect {
    override suspend fun onSessionCompleted(snapshot: GuidedSessionSnapshot) = Unit
}
