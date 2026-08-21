package com.fitconnect.android.fitness.healthconnect

import android.content.Context
import androidx.health.connect.client.HealthConnectClient
import com.fitconnect.android.fitness.domain.FitnessProvider
import com.fitconnect.android.fitness.domain.FitnessSyncPage
import com.fitconnect.android.fitness.domain.HealthConnectSdkState
import com.fitconnect.android.fitness.mapping.ExerciseSessionDto
import com.fitconnect.android.fitness.mapping.ExerciseSessionMapper
import com.fitconnect.android.fitness.store.WorkoutSessionStore
import com.fitconnect.shared.fitness.ProviderConstraints
import com.fitconnect.shared.fitness.ProviderId

interface ChangeTokenStore {
    suspend fun get(): String?
    suspend fun set(token: String)
}

class InMemoryChangeTokenStore : ChangeTokenStore {
    @Volatile
    private var token: String? = null
    override suspend fun get(): String? = token
    override suspend fun set(token: String) {
        this.token = token
    }
}

fun interface ExerciseSessionReader {
    suspend fun read(changeToken: String?): Pair<List<ExerciseSessionDto>, String>
}

/**
 * Health Connect adapter. Changes API cursor is persisted — a live token
 * never triggers a full history reread.
 */
class HealthConnectSource(
    private val store: WorkoutSessionStore,
    private val tokens: ChangeTokenStore,
    private val reader: ExerciseSessionReader,
    private val sdkState: () -> HealthConnectSdkState,
) : FitnessProvider {
    override val providerId: ProviderId = ProviderId.HEALTH_CONNECT
    override val constraints: ProviderConstraints = ProviderConstraints(providerId)

    fun availability(): HealthConnectSdkState = sdkState()

    override suspend fun syncSince(cursor: String?): FitnessSyncPage {
        if (sdkState() != HealthConnectSdkState.AVAILABLE) {
            return FitnessSyncPage(emptyList(), tokens.get(), fullReread = false)
        }
        val persisted = tokens.get()
        val effective = cursor ?: persisted
        val fullReread = effective == null
        val (dtos, next) = reader.read(effective)
        val upserted = dtos.map { dto ->
            store.upsert(ExerciseSessionMapper.toDomain(dto, ProviderId.HEALTH_CONNECT))
        }
        tokens.set(next)
        return FitnessSyncPage(upserted, next, fullReread)
    }
}

object HealthConnectSdkMapper {
    const val SDK_AVAILABLE = 1
    const val SDK_UNAVAILABLE = 2
    const val SDK_UNAVAILABLE_PROVIDER_UPDATE_REQUIRED = 3

    fun fromSdkStatus(status: Int): HealthConnectSdkState = when (status) {
        SDK_AVAILABLE -> HealthConnectSdkState.AVAILABLE
        SDK_UNAVAILABLE_PROVIDER_UPDATE_REQUIRED -> HealthConnectSdkState.NEEDS_UPDATE
        else -> HealthConnectSdkState.UNAVAILABLE
    }

    fun probe(context: Context): HealthConnectSdkState = try {
        fromSdkStatus(HealthConnectClient.getSdkStatus(context))
    } catch (_: Throwable) {
        HealthConnectSdkState.UNAVAILABLE
    }
}
