package com.fitconnect.android.athlete.di

import android.content.Context
import com.fitconnect.android.fitness.domain.FitnessSyncPage
import com.fitconnect.android.fitness.healthconnect.AndroidHealthConnectPermissionGateway
import com.fitconnect.android.fitness.healthconnect.HealthConnectExerciseSessionReader
import com.fitconnect.android.fitness.healthconnect.HealthConnectPermissionGateway
import com.fitconnect.android.fitness.healthconnect.HealthConnectSource
import com.fitconnect.android.fitness.healthconnect.InMemoryChangeTokenStore
import com.fitconnect.android.fitness.store.InMemoryWorkoutSessionStore
import com.fitconnect.android.fitness.store.WorkoutSessionStore
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

interface FitnessContainer {
    val workoutStore: WorkoutSessionStore
    val healthConnect: HealthConnectSource
    val healthConnectPermissions: HealthConnectPermissionGateway
    suspend fun syncHealthConnect(): FitnessSyncPage
}

class DefaultFitnessContainer(
    context: Context,
    private val userId: () -> String,
) : FitnessContainer {
    private val appContext = context.applicationContext

    override val workoutStore: WorkoutSessionStore = InMemoryWorkoutSessionStore()
    override val healthConnectPermissions: HealthConnectPermissionGateway =
        AndroidHealthConnectPermissionGateway(appContext)

    override val healthConnect: HealthConnectSource = HealthConnectSource(
        store = workoutStore,
        tokens = InMemoryChangeTokenStore(),
        reader = HealthConnectExerciseSessionReader(
            context = appContext,
            userId = userId,
            permissionGateway = healthConnectPermissions,
        ),
        sdkState = { com.fitconnect.android.fitness.healthconnect.HealthConnectSdkMapper.probe(appContext) },
    )

    override suspend fun syncHealthConnect(): FitnessSyncPage =
        withContext(Dispatchers.IO) { healthConnect.syncSince(null) }
}
