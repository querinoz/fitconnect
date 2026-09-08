package com.fitconnect.android.designui.components

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class EliteFeedLogicTest {
    @Test
    fun likeCountPrefersLikeBucket() {
        val reactions = listOf(
            EliteFeedReaction("FIRE", "Fire", 9),
            EliteFeedReaction("LIKE", "Like", 324, selected = true),
        )
        assertEquals(324, EliteFeedLogic.likeCount(reactions))
        assertTrue(EliteFeedLogic.liked(reactions))
    }

    @Test
    fun likeCountFallsBackToSumWhenLikeMissing() {
        val reactions = listOf(
            EliteFeedReaction("FIRE", "Fire", 9),
            EliteFeedReaction("STRONG", "Strong", 2),
        )
        assertEquals(11, EliteFeedLogic.likeCount(reactions))
        assertFalse(EliteFeedLogic.liked(reactions))
    }
}
