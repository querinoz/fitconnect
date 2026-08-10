package com.fitconnect.android.foundation.network

import com.fitconnect.android.foundation.common.AppError
import com.fitconnect.android.foundation.common.AppResult
import com.fitconnect.android.foundation.common.Logger
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.emptyFlow

/**
 * Production path when realtime provider is not configured.
 * connect() fails — never Ok(Unit) pretending to be live.
 */
class FailClosedRealtimeClient(
    private val logger: Logger,
) : RealtimeClient {
    override suspend fun connect(): AppResult<Unit> {
        logger.e("Realtime", "Realtime provider not configured — connect refused (fail-closed)")
        return AppResult.Err(AppError.Network(AppError.NetworkKind.UNKNOWN))
    }

    override suspend fun disconnect() = Unit

    override fun subscribe(topic: String): Flow<String> = emptyFlow()

    override suspend fun publish(topic: String, payload: String): AppResult<Unit> {
        logger.e("Realtime", "Realtime provider not configured — publish refused")
        return AppResult.Err(AppError.Network(AppError.NetworkKind.UNKNOWN))
    }
}
