package com.fitconnect.android.designui.brand

import org.junit.Assert.assertTrue
import org.junit.Test

class EosBoltGeometryTest {
    @Test
    fun topAndBottomPathsAreNonEmpty() {
        val top = EosBoltGeometry.extents(EosBoltGeometry.TOP_POINTS, 100f)
        val bottom = EosBoltGeometry.extents(EosBoltGeometry.BOTTOM_POINTS, 100f)
        val topW = top[2] - top[0]
        val topH = top[3] - top[1]
        val bottomW = bottom[2] - bottom[0]
        val bottomH = bottom[3] - bottom[1]
        assertTrue(topW > 8f)
        assertTrue(topH > 8f)
        assertTrue(bottomW > 8f)
        assertTrue(bottomH > 8f)
        assertTrue("top sits above bottom", top[1] < bottom[1])
    }
}
