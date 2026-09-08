package com.fitconnect.android.designui.atmosphere

import org.junit.Assert.assertTrue
import org.junit.Test

class EosMarkMeshTest {
    @Test
    fun markTileIsSparseNotHoneycombDense() {
        val (w, h) = EosMarkMesh.tilePeriod(28f)
        val hex = HoneycombMesh.tilePeriod(28f)
        assertTrue(w > 0f && h > 0f)
        assertTrue("mark tile should be larger/sparser than hex cell", w * h > hex.first * hex.second)
    }
}
