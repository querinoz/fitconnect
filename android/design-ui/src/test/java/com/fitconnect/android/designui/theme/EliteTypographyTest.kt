package com.fitconnect.android.designui.theme

import androidx.compose.ui.text.font.FontFamily
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotEquals
import org.junit.Test

class EliteTypographyTest {

    @Test
    fun headlineSmall_usesBundledFont_notPlatformDefault() {
        val bodyFamily = EliteTypographyStyles.bodySmall.fontFamily
        assertNotEquals(FontFamily.Default, bodyFamily)
        assertEquals(bodyFamily, EliteTypographyStyles.headlineSmall.fontFamily)
        assertEquals(bodyFamily, EliteTypographyStyles.titleSmall.fontFamily)
    }

    @Test
    fun metricStyles_useMonoFamily() {
        assertEquals(EliteMonoTextStyle.fontFamily, EliteMetricTextStyle.fontFamily)
    }
}
