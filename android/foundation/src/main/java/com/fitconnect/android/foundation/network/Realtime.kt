package com.fitconnect.android.foundation.network

import com.fitconnect.android.foundation.common.AppResult
import kotlinx.coroutines.flow.Flow

/**
 * Realtime transport port (Convex / Supabase Realtime / LiveKit signaling).
 * Production uses SupabaseRealtimeClient or FailClosedRealtimeClient;
 * debug/tests use InProcessRealtimeClient.
 */
interface RealtimeClient {
    suspend fun connect(): AppResult<Unit>
    suspend fun disconnect()
    fun subscribe(topic: String): Flow<String>
    suspend fun publish(topic: String, payload: String): AppResult<Unit>
}

/**
 * tRPC port — typed procedures attach later. Phase 02 defines the transport
 * boundary so feature modules never invent a second HTTP stack.
 */
interface TrpcPort {
    suspend fun query(path: String, inputJson: String = "{}"): AppResult<String>
    suspend fun mutation(path: String, inputJson: String): AppResult<String>
}

class HttpTrpcPort(
    private val apiClient: ApiClient,
) : TrpcPort {
    override suspend fun query(path: String, inputJson: String): AppResult<String> =
        apiClient.get("api/trpc/$path")

    override suspend fun mutation(path: String, inputJson: String): AppResult<String> =
        apiClient.post("api/trpc/$path", inputJson)
}
