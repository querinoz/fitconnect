package com.fitconnect.android.foundation.common

import com.fitconnect.android.foundation.network.OkHttpApiClient
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class AppResultTest {
    @Test
    fun mapTransformsOk() {
        val result: AppResult<Int> = AppResult.Ok(2).map { it * 3 }
        assertEquals(AppResult.Ok(6), result)
    }

    @Test
    fun mapLeavesErrUntouched() {
        val err: AppResult<Int> = AppResult.Err(AppError.Network(AppError.NetworkKind.OFFLINE))
        val mapped = err.map { 1 }
        assertTrue(mapped is AppResult.Err)
    }

    @Test
    fun joinBuildsUrl() {
        val url = OkHttpApiClient.join(
            "https://api.example.com/",
            "v1/health",
        )
        assertEquals("https://api.example.com/v1/health", url)
    }
}
