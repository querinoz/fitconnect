package com.fitconnect.android.ai.adapters

import kotlinx.coroutines.runBlocking
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * Path A AI: no insight HTTP API → Unavailable* must stay fail-closed.
 * Never invent program/sports/session/community model facts for non-demo.
 */
class UnavailableAiAdaptersTest {
    @Test
    fun programPortReturnsEmptyFacts() = runBlocking {
        val sheet = UnavailableProgramAiAdapter().progress("ath-1")
        assertNull(sheet.programId)
        assertNull(sheet.title)
        assertNull(sheet.week)
        assertNull(sheet.completionPercent)
        assertNull(sheet.nextSessionTitle)
        assertEquals(0, sheet.missedSessions)
        assertTrue(sheet.toEvidence().isEmpty())
    }

    @Test
    fun sportsPortReturnsEmptyFacts() = runBlocking {
        val sheet = UnavailableSportsAiAdapter().profile("ath-1")
        assertNull(sheet.primarySportKey)
        assertNull(sheet.goalSummary)
        assertNull(sheet.phase)
        assertTrue(sheet.toEvidence().isEmpty())
    }

    @Test
    fun sessionPortReturnsEmptyFacts() = runBlocking {
        val sheet = UnavailableSessionAiAdapter().sessions("ath-1")
        assertTrue(sheet.upcomingTitles.isEmpty())
        assertEquals(0, sheet.recentCompleted)
    }

    @Test
    fun communityPortReturnsNoSnippets() = runBlocking {
        val snippets = UnavailableCommunityAiAdapter().relevantPublic("ath-1")
        assertTrue(snippets.isEmpty())
    }

    @Test
    fun externalBlockerCopyDocumentsMissingInsightApi() {
        assertTrue(
            AI_INSIGHT_HTTP_EXTERNAL.contains("EXTERNAL"),
        )
        assertTrue(
            AI_INSIGHT_HTTP_EXTERNAL.contains("/api/v1/ai/insights"),
        )
    }
}

/** Documented blocker — wire HttpAi* only when this route exists. */
const val AI_INSIGHT_HTTP_EXTERNAL =
    "EXTERNAL: no /api/v1/ai/insights — Unavailable* ports; do not invent model responses"
