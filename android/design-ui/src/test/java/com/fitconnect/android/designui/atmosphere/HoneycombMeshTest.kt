package com.fitconnect.android.designui.atmosphere

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class HoneycombMeshTest {
    @Test
    fun cellCountStaysUnderBudgetOnPhoneAndTablet() {
        val phone = HoneycombMesh.layout(1080f, 2340f, 84f)
        val midRange = HoneycombMesh.layout(1080f, 1920f, 72f)
        val tablet = HoneycombMesh.layout(1600f, 2560f, 84f)
        assertTrue(phone.centers.size <= HoneycombMesh.maxCells)
        assertTrue(midRange.centers.size <= HoneycombMesh.maxCells)
        assertTrue(tablet.centers.size <= HoneycombMesh.maxCells)
        assertTrue(HoneycombMesh.passesCellBudget(phone))
        assertTrue(HoneycombMesh.passesCellBudget(midRange))
        assertTrue(HoneycombMesh.passesCellBudget(tablet))
    }

    @Test
    fun perFrameWorkIsTiledShaderPlusPulses() {
        assertEquals(2, HoneycombMesh.perFrameDrawOps(animated = false))
        assertEquals(2 + HoneycombMesh.pulseCells, HoneycombMesh.perFrameDrawOps(animated = true))
        assertTrue(HoneycombMesh.perFrameDrawOps(animated = true) <= 5)
        val (w, h) = HoneycombMesh.tilePeriod(28f)
        assertTrue(w > 0f && h > 0f)
    }

    @Test
    fun layoutMedianStaysUnderFrameBudget() {
        val medianNs = HoneycombMesh.medianLayoutNs(1080f, 2340f, 84f)
        assertTrue(
            "median layout ${medianNs / 1_000_000.0}ms exceeds ${HoneycombMesh.budgetNs / 1_000_000.0}ms",
            medianNs <= HoneycombMesh.budgetNs,
        )
    }

    @Test
    fun hexHasSixVertices() {
        val verts = HoneycombMesh.hexVertices(0f, 0f, 10f)
        assertEquals(12, verts.size)
        assertFalse(verts.all { it == 0f })
    }

    @Test
    fun emptySizeYieldsNoCells() {
        assertEquals(0, HoneycombMesh.estimateCellCount(0f, 100f, 28f))
        assertEquals(0, HoneycombMesh.layout(0f, 0f, 28f).centers.size)
    }
}
