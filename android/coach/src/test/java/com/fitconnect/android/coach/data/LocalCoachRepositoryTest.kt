package com.fitconnect.android.coach.data

import com.fitconnect.android.coach.domain.AthleteStatus
import com.fitconnect.android.coach.domain.BookingStatus
import com.fitconnect.android.coach.domain.ProgramPublishState
import com.fitconnect.android.foundation.common.AppResult
import com.fitconnect.android.foundation.common.Logger
import com.fitconnect.android.foundation.flags.FeatureFlag
import com.fitconnect.android.foundation.flags.FeatureFlagStore
import com.fitconnect.android.foundation.network.ConnectivityMonitor
import com.fitconnect.android.foundation.offline.DefaultOfflineCoordinator
import com.fitconnect.android.foundation.offline.InMemorySyncQueue
import com.fitconnect.android.geo.di.DefaultGeoContainer
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.flowOf
import kotlinx.coroutines.runBlocking
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class LocalCoachRepositoryTest {
    private val online = MutableStateFlow(true)
    private val connectivity = object : ConnectivityMonitor {
        override val online: StateFlow<Boolean> = this@LocalCoachRepositoryTest.online
        override fun start() = Unit
    }
    private val logger = object : Logger {
        override fun d(tag: String, message: String) = Unit
        override fun i(tag: String, message: String) = Unit
        override fun w(tag: String, message: String, throwable: Throwable?) = Unit
        override fun e(tag: String, message: String, throwable: Throwable?) = Unit
    }
    private val flags = object : FeatureFlagStore {
        override fun isEnabled(flag: FeatureFlag): Boolean = flag.defaultEnabled
        override fun observe(flag: FeatureFlag): Flow<Boolean> = flowOf(flag.defaultEnabled)
        override suspend fun setLocal(flag: FeatureFlag, enabled: Boolean) = Unit
        override suspend fun applyRemote(overrides: Map<String, Boolean>) = Unit
    }
    private val offline = DefaultOfflineCoordinator(
        queue = InMemorySyncQueue(),
        connectivity = connectivity,
        featureFlags = flags,
        logger = logger,
    )
    private val geo = DefaultGeoContainer()
    private val repo = LocalCoachRepository(connectivity, offline, geo.booking, geo.availability)

    @Test
    fun overviewLoadsAttentionAthletes() = runBlocking {
        val overview = repo.overview()
        assertTrue(overview is AppResult.Ok)
        assertTrue((overview as AppResult.Ok).value.athletesNeedingAttention.isNotEmpty())
    }

    @Test
    fun rosterFiltersAtRisk() = runBlocking {
        val atRisk = (repo.roster(status = AthleteStatus.AT_RISK) as AppResult.Ok).value
        assertTrue(atRisk.all { it.status == AthleteStatus.AT_RISK })
    }

    @Test
    fun cloneAndPublishProgram() = runBlocking {
        val programs = (repo.programs() as AppResult.Ok).value
        val source = programs.first()
        val clone = (repo.cloneProgram(source.id) as AppResult.Ok).value
        assertEquals(ProgramPublishState.DRAFT, clone.state)
        repo.publishProgram(clone.id)
        val published = (repo.program(clone.id) as AppResult.Ok).value
        assertEquals(ProgramPublishState.PUBLISHED, published.state)
    }

    @Test
    fun offlineBookingApproveQueuesSync() = runBlocking {
        online.value = false
        val before = offline.pendingCount()
        val booking = (repo.bookings() as AppResult.Ok).value.first { it.status == BookingStatus.PENDING }
        repo.approveBooking(booking.id)
        assertEquals(before + 1, offline.pendingCount())
    }
}
