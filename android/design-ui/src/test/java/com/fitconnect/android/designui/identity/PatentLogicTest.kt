package com.fitconnect.android.designui.identity

import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotEquals
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

class StableHashTest {
    @Test
    fun sameInputSameHash() {
        assertEquals(StableHash.of("athlete-ines"), StableHash.of("athlete-ines"))
    }

    @Test
    fun differentInputDifferentHash() {
        assertNotEquals(StableHash.of("ines"), StableHash.of("marina"))
    }

    @Test
    fun bitsStayInRange() {
        val h = StableHash.of("seed")
        assertTrue(StableHash.bits(h, 0, 3) in 0..7)
        assertTrue(StableHash.bits(h, 9, 1) in 0..1)
    }
}

class HexatarFactoryTest {
    @Test
    fun sameUserSameSpec() {
        assertEquals(HexatarFactory.of("u1"), HexatarFactory.of("u1"))
    }

    @Test
    fun comboSpaceIs576NotGloballyUnique() {
        val combos = HexatarPattern.entries.size * HexatarPalette.entries.size * 6 * 2
        assertEquals(576, combos)
    }
}

class PatentLogicTest {
    @Test
    fun twoSessionsEarnIniciadoGradeOneNotElite() {
        val rank = PatentLogic.evaluate(PatentSignals(sessionCount = 2, streakDays = 18))
        assertEquals(Patent.INICIADO, rank?.patent)
        assertEquals(1, rank?.grade)
    }

    @Test
    fun neverDemotesStoredFloor() {
        val earned = PatentLogic.evaluate(PatentSignals(sessionCount = 2, streakDays = 0))
        val floor = PatentRank(Patent.ATIVO, 3)
        val shown = PatentLogic.applyFloor(earned, floor)
        assertEquals(floor, shown)
    }

    @Test
    fun earnedCanRaiseFloor() {
        val earned = PatentRank(Patent.FORTE, 2)
        val floor = PatentRank(Patent.ATIVO, 5)
        assertEquals(earned, PatentLogic.applyFloor(earned, floor))
    }

    @Test
    fun constanteRequiresMeasuredConsistency() {
        val rank = PatentLogic.evaluate(
            PatentSignals(sessionCount = 40, streakDays = 30, consistencyPct = null, monthsActive = 6),
        )
        assertTrue(rank == null || rank.patent.ordinal < Patent.CONSTANTE.ordinal)
    }

    @Test
    fun parseAndEncodeFloor() {
        val rank = PatentRank(Patent.ELITE, 3)
        assertEquals(rank, PatentLogic.parseFloor(PatentLogic.encodeFloor(rank)))
        assertNull(PatentLogic.parseFloor("nope"))
    }

    @Test
    fun ativoNeedsIniciadoComplete() {
        val early = PatentLogic.evaluate(PatentSignals(sessionCount = 4, streakDays = 40))
        assertEquals(Patent.INICIADO, early?.patent)
        val ready = PatentLogic.evaluate(PatentSignals(sessionCount = 12, streakDays = 21))
        assertEquals(Patent.ATIVO, ready?.patent)
        assertEquals(5, ready?.grade)
    }
}
